import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import {getActiveUser} from '../users/selectors'

export const getWidgetsState = state => state.widgets || fromJS({})

export const getSources = state => {
    return fromJS({
        ticket: state.ticket,
        user: getActiveUser(state)
    })
}

export const isEditing = createSelector(
    [getWidgetsState],
    state => state.getIn(['_internal', 'isEditing'], false) || false
)
