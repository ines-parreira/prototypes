import {fromJS} from 'immutable'
import {createImmutableSelector} from '../../utils'

export const getInfobarState = state => state.infobar || fromJS({})

export const getPendingActionsCallbacks = createImmutableSelector(
    [getInfobarState],
    state => state.get('pendingActionsCallbacks') || fromJS([])
)

export const getPendingActionCallbacks = id => createImmutableSelector(
    [getPendingActionsCallbacks],
    state => state.find(action => action.get('id') === id)
)

export const makeGetPendingActionCallbacks = state => id => getPendingActionCallbacks(id)(state)
