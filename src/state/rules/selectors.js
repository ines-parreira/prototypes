import {createSelector} from 'reselect'
import {fromJS} from 'immutable'

export const getRulesState = (state) => state.rules || fromJS({})

export const getRules = createSelector(
    [getRulesState],
    state => state.get('rules') || fromJS({})
)

export const getRule = id => createSelector(
    [getRules],
    state => state.get(id) || fromJS({})
)

export const getInternal = createSelector(
    [getRulesState],
    state => state.get('_internal') || fromJS({})
)

export const createIsDirtySelector = globalState => id => createSelector(
    [getInternal],
    state => state.get('dirtyList', fromJS([])).contains(id.toString())
)(globalState)
