/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import io from 'socket.io-client';
import {RootState} from './index';
import {ThunkMiddleware} from 'redux-thunk';
import {Action, Dispatch} from 'redux';
import {BACKEND_ADDR} from '../../config';
import {actionsAfterAuth} from './actions';
import {logout} from './auth/actions';

export interface JwtData {
  message: string;
  code: string;
  type: string;
}

export interface SocketEmitAction {
  type: 'SOCKET_EMIT';
  event: string;
  payload: unknown;
  typeOnFailure: string;
  opHash?: string;
}

export interface SocketOnAction {
  type: 'SOCKET_ON';
  event: string;
  typeOnSuccess: string;
}

export interface SocketOffAction {
  type: 'SOCKET_OFF';
}
/**
 * An Error Object used by the package.
 */
interface UnauthorizedError {
  message: string;
  inner: Error;
  data: JwtData;
}

type resolver = (value?: SocketIOClient.Socket | undefined) => void;

export function createSocketMiddleware(): ThunkMiddleware<
  RootState,
  Action<string>,
  Action<string>
> {
  let socketAuth: SocketIOClient.Socket | undefined = undefined;
  let isConnecting: boolean = false;
  let waitingPromises: resolver[] = [];

  /*
   * getNamespace returns promise for connected and authentificated namespace
   */
  const getNamespace: (
    jwtToken: string,
    dispatch: Dispatch,
  ) => Promise<SocketIOClient.Socket> = (jwtToken, dispatch) => {
    return new Promise<SocketIOClient.Socket>((resolve, reject) => {
      if (socketAuth !== undefined) {
        resolve(socketAuth);
        return;
      }

      // If connection in progress we add resolver in queue
      if (isConnecting || jwtToken === undefined) {
        waitingPromises.push(resolve);
        return;
      } else {
        isConnecting = true;
        waitingPromises = [];
      }

      console.log(`[SOCKET]: Connected to ${BACKEND_ADDR}`);
      let socket = io(BACKEND_ADDR + '/mobile', {
        reconnection: true,
        reconnectionDelay: 500,
        jsonp: false,
        reconnectionAttempts: Infinity,
        transports: ['websocket'],
      });

      socket.on('connect_error', (err: string) => {
        console.log(err);
      });

      socket
        .emit('authenticate', {token: jwtToken}) //send the jwt
        .on('authenticated', () => {
          socketAuth = socket;
          isConnecting = false;
          console.log('CONNECTED', socketAuth);
          dispatch((actionsAfterAuth() as unknown) as Action<string>);
          resolve(socket);

          for (const f of waitingPromises) {
            f(socket);
          }
        })
        .on('unauthorized', (msg: UnauthorizedError) => {
          console.log(`ERROR unauthorized: ${JSON.stringify(msg.data)}`);

          // Logout user if token is not valid
          dispatch((logout() as unknown) as Action<string>);
          reject(msg.data.code);
        })
        .on('disconnect', () => {
          if (socketAuth) socketAuth = undefined;
        });
    });
  };

  /*
   ** Middleware gets connection and emits new request or start to listen on
   */

  return ({dispatch, getState}) => {
    return (next: Dispatch) => (
      action: SocketEmitAction | SocketOnAction | SocketOffAction,
    ) => {
      const jwt = getState().auth.access?.token;

      switch (action.type) {
        case 'SOCKET_EMIT':
          if (jwt) {
            getNamespace(jwt, dispatch).then((socket) => {
              socket.emit(action.event, action.payload, action.opHash);
              console.log(
                `[SOCKET.IO] : EMIT : ${action.event} with opHash ${action.opHash}`,
              );
            });
          } else {
            dispatch({type: action.typeOnFailure});
          }

          return next(action);

        case 'SOCKET_ON':
          if (jwt) {
            getNamespace(jwt, dispatch).then((socket) => {
              if (socket.hasListeners(action.event)) return;
              socket.on(action.event, (payload: any) => {
                console.log('[SOCKET.IО] : GET NEW INFO : ', payload);
                dispatch({
                  type: action.typeOnSuccess,
                  payload: payload,
                });
              });
              console.log('[SOCKET.IO] : LISTENER ADDED : ', action.event);
            });
          } else {
            console.log('Cant connect');
          }
          return next(action);

        case 'SOCKET_OFF':
          socketAuth = undefined;
          isConnecting = false;
          waitingPromises = [];
          return next(action);

        default:
          return next(action);
      }
    };
  };
}

export default createSocketMiddleware();
