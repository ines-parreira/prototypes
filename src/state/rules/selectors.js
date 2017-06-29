import {createSelector} from 'reselect'
import {fromJS} from 'immutable'

export const getRulesState = (state) => state.rules || fromJS({})

export const getRules = createSelector(
    [getRulesState],
    state => state.get('rules') || fromJS({})
)

export const getRule = id => createSelector(
    [getRules],
    state => {
        if (!id) {
            return fromJS({})
        }

        return state.get(id.toString()) || fromJS({})
    }
)

export const getInternal = createSelector(
    [getRulesState],
    state => state.get('_internal') || fromJS({})
)
