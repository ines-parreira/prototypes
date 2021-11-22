import {fromJS, List, Map} from 'immutable'

import {createImmutableSelector} from '../../utils'
import {RootState} from '../types'

import {InfobarState} from './types'

export const getInfobarState = (state: RootState) => state.infobar || fromJS({})

export const getPendingActionsCallbacks = createImmutableSelector<
    RootState,
    List<any>,
    InfobarState
>(
    getInfobarState,
    (state) => (state.get('pendingActionsCallbacks') as List<any>) || fromJS([])
)

export const getPendingActionCallbacks = (id: string) =>
    createImmutableSelector<RootState, Map<any, any>, List<any>>(
        getPendingActionsCallbacks,
        (state) =>
            state.find(
                (action: Map<any, any>) => action.get('id') === id
            ) as Map<any, any>
    )

export const makeGetPendingActionCallbacks =
    (state: RootState) => (id: string) =>
        getPendingActionCallbacks(id)(state)
