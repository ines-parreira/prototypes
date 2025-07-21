import { fromJS, List, Map } from 'immutable'

import { createImmutableSelector } from '../../utils'
import { RootState } from '../types'

export const getInfobarState = (state: RootState) => state.infobar || fromJS({})

export const getPendingActionsCallbacks = createImmutableSelector(
    getInfobarState,
    (state) =>
        (state.get('pendingActionsCallbacks') as List<any>) || fromJS([]),
)

export const getPendingActionCallbacks = createImmutableSelector(
    getPendingActionsCallbacks,
    (state) => (id: string) =>
        state.find((action: Map<any, any>) => action.get('id') === id) as Map<
            any,
            any
        >,
)
