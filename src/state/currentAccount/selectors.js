import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

export const getCurrentAccountState = state => state.currentAccount || fromJS({})

export const getChannels = createSelector(
    [getCurrentAccountState],
    state => state.get('channels') || fromJS([])
)
