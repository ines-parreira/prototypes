// @flow
import {fromJS} from 'immutable'
import {createImmutableSelector} from '../../utils'

import type {stateType} from '../types'

export const getInfobarState = (state: stateType) => state.infobar || fromJS({})

export const getPendingActionsCallbacks = createImmutableSelector(
    [getInfobarState],
    state => state.get('pendingActionsCallbacks') || fromJS([])
)

export const getPendingActionCallbacks = (id: string) => createImmutableSelector(
    [getPendingActionsCallbacks],
    state => state.find(action => action.get('id') === id)
)

export const makeGetPendingActionCallbacks = (state: stateType) => (id: string) => getPendingActionCallbacks(id)(state)
