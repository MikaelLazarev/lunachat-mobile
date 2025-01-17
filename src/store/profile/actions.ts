/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {ThunkAction} from 'redux-thunk';
import {Action} from 'redux';
import {RootState} from '../index';
import {namespace} from './index';
import {Profile} from '../../core/profile';
import {SocketEmitAction} from '../socketMiddleware';

export const connectSocket = (): ThunkAction<
  void,
  RootState,
  unknown,
  Action<string>
> => async (dispatch) => {
  dispatch({
    type: 'SOCKET_ON',
    namespace,
    event: 'profile:updateDetails',
    typeOnSuccess: 'PROFILE_SUCCESS',
  });
};

export const getProfile: (opHash: string) => SocketEmitAction = (opHash) => ({
  type: 'SOCKET_EMIT',
  namespace,
  event: 'profile:retrieve',
  typeOnFailure: 'PROFILE_FAILURE',
  payload: undefined,
  opHash,
});

export const updateProfile: (
  profile: Profile,
  opHash?: string,
) => SocketEmitAction = (profile, opHash) => ({
  type: 'SOCKET_EMIT',
  namespace,
  event: 'profile:update',
  typeOnFailure: 'PROFILE_FAILURE',
  payload: profile,
  opHash,
});

export const addContract: (id: string, opHash?: string) => SocketEmitAction = (
  id,
  opHash,
) => ({
  type: 'SOCKET_EMIT',
  namespace,
  event: 'profile:new_contact',
  typeOnFailure: 'PROFILE_FAILURE',
  payload: {id},
  opHash,
});
