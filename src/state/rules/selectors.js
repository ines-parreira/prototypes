import {createSelector} from 'reselect'
import {fromJS} from 'immutable'

import {toJS} from '../../utils'

export const getRulesState = (state) => state.rules || fromJS({})

export const getRules = createSelector(
    [getRulesState],
    state => state.get('rules') || fromJS({})
)

export const getRule = id => createSelector(
    [getRules],
    state => state.get(id.toString()) || fromJS({})
)

export const getInternal = createSelector(
    [getRulesState],
    state => state.get('_internal') || fromJS({})
)

export const makeIsDirty = globalState => id => createSelector(
    [getInternal],
    state => state.get('dirtyList', fromJS([])).contains(id.toString())
)(globalState)

// return operator of first test operator
// '&&' if first operator is an AND, '||' if it is a OR and null if there is no operator (test with only one condition)
export const getIfStatementOperator = (ruleId, ifStatementPath) => createSelector(
    [getRule(ruleId)],
    (rule) => {
        const condition = rule.getIn(['code_ast'].concat(toJS(ifStatementPath))) || fromJS({})
        return condition.get('operator') || null
    }
)
