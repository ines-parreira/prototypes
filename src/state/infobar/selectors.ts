import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'

import {createImmutableSelector} from '../../utils.js'
import {RootState} from '../types'

import {InfobarState} from './types'

//$TsFixMe remove once state/utils are migrated
const typeSafeCreateImmutableCreator = createImmutableSelector as typeof createSelector

export const getInfobarState = (state: RootState) => state.infobar || fromJS({})

export const getPendingActionsCallbacks = typeSafeCreateImmutableCreator<
    RootState,
    List<any>,
    InfobarState
>(
    getInfobarState,
    (state) => (state.get('pendingActionsCallbacks') as List<any>) || fromJS([])
)

export const getPendingActionCallbacks = (id: string) =>
    typeSafeCreateImmutableCreator<RootState, Map<any, any>, List<any>>(
        getPendingActionsCallbacks,
        (state) =>
            state.find(
                (action: Map<any, any>) => action.get('id') === id
            ) as Map<any, any>
    )

export const makeGetPendingActionCallbacks = (state: RootState) => (
    id: string
) => getPendingActionCallbacks(id)(state)
