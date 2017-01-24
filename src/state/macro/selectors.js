import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

export const getMacrosState = state => state.macros || fromJS({})

export const getMacroSelectedInModal = createSelector(
    [getMacrosState],
    state => state.get('modalSelected') || fromJS({})
)
