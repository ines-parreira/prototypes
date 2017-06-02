import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

export const getLayoutState = state => state.layout || fromJS({})

export const getCurrentOpenedPanel = createSelector(
    [getLayoutState],
    state => state.get('openedPanel') || null
)

export const isOpenedPanel = name => createSelector(
    [getCurrentOpenedPanel],
    openedPanel => openedPanel === name
)
