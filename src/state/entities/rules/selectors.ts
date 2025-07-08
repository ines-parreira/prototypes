import { createSelector } from 'reselect'

import { getLimitsSetting } from 'state/currentAccount/selectors'

import { RuleLimitStatus } from '../../rules/types'
import { RootState } from '../../types'
import { RulesState } from './types'

export const RULE_MAX_NUMBER_WARNING = 65
export const RULE_MAX_NUMBER = 70

type LimitsSetting = {
    id: number
    type: 'limits'
    data?: {
        max_active_rules?: number
    }
}

export const getMaxRuleLimit = createSelector(getLimitsSetting, (limitsMap) => {
    const limits = limitsMap.toJS() as LimitsSetting | object
    if (!('type' in limits) || limits.type !== 'limits') {
        return RULE_MAX_NUMBER
    }

    return limits.data?.max_active_rules ?? RULE_MAX_NUMBER
})

export const rulesSelector = (state: RootState): RulesState =>
    state.entities.rules || {}

export const getSortedRules = createSelector(rulesSelector, (rules) =>
    Object.values(rules)
        .sort((left, right) => (left.name < right.name ? -1 : 1))
        .sort((left, right) => right.priority - left.priority)
        .filter((rule) => rule.type !== 'system'),
)

export const getRulesLimitStatus = createSelector(
    getSortedRules,
    getMaxRuleLimit,
    (rules, maxRuleLimit) => {
        const numRules = rules.length
        if (numRules < maxRuleLimit - 5) {
            return RuleLimitStatus.NonReaching
        } else if (numRules < maxRuleLimit) {
            return RuleLimitStatus.Reaching
        }
        return RuleLimitStatus.Reached
    },
)
