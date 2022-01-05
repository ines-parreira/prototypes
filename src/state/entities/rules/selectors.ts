import {createSelector} from 'reselect'

import {RootState} from '../../types'
import {Rule} from '../../../models/rule/types'
import {RuleLimitStatus} from '../../rules/types'

import {RulesState} from './types'

export const RULE_MAX_NUMBER_WARNING = 65
export const RULE_MAX_NUMBER = 70

export const rulesSelector = (state: RootState): RulesState =>
    state.entities.rules || {}

export const getSortedRules = createSelector<RootState, Rule[], RulesState>(
    rulesSelector,
    (rules) =>
        Object.values(rules)
            .sort((left, right) => (left.name < right.name ? -1 : 1))
            .sort((left, right) => right.priority - left.priority)
            .filter((rule) => rule.type !== 'system')
)

export const getRulesLimitStatus = createSelector(getSortedRules, (rules) => {
    const numRules = rules.length
    if (numRules < RULE_MAX_NUMBER_WARNING) {
        return RuleLimitStatus.NonReaching
    } else if (numRules < RULE_MAX_NUMBER) {
        return RuleLimitStatus.Reaching
    }
    return RuleLimitStatus.Reached
})
