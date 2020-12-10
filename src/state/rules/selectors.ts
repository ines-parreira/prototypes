import {createSelector} from 'reselect'
import {fromJS, Map, Iterable} from 'immutable'

import {RootState} from '../types'

import {RuleLimitStatus, RulesState} from './types'

export const getRulesState = (state: RootState): RulesState =>
    state.rules || fromJS({})

export const getRules = createSelector<RootState, Map<any, any>, RulesState>(
    getRulesState,
    (state) => (state.get('rules') || fromJS({})) as Map<any, any>
)

export const getSortedRules = (state: RootState): Iterable<any, any> => {
    return getRules(state)
        .sortBy((rule: Map<any, any>) => rule.get('name') as string)
        .sortBy((rule: Map<any, any>) => -rule.get('priority'))
        .filter((rule: Map<any, any>) => rule.get('type') !== 'system')
}

export const RULE_MAX_NUMBER_WARNING = 65
export const RULE_MAX_NUMBER = 70

export const getRulesLimitStatus = (
    state: RootState
): Maybe<typeof RuleLimitStatus[keyof typeof RuleLimitStatus]> => {
    const rules = getSortedRules(state)

    if (!rules.isEmpty()) {
        if (rules.size < RULE_MAX_NUMBER_WARNING) {
            return RuleLimitStatus.NonReaching
        } else if (
            RULE_MAX_NUMBER_WARNING <= rules.size &&
            rules.size < RULE_MAX_NUMBER
        ) {
            return RuleLimitStatus.Reaching
        }
        return RuleLimitStatus.Reached
    }
    return
}

export const getRule = (id: string) =>
    createSelector<RootState, Map<any, any>, Map<any, any>>(
        getRules,
        (state) => {
            if (!id) {
                return fromJS({}) as Map<any, any>
            }

            return (state.get(id.toString()) || fromJS({})) as Map<any, any>
        }
    )

export const getInternal = createSelector<
    RootState,
    Map<any, any>,
    Map<any, any>
>(
    getRulesState,
    (state) => (state.get('_internal') || fromJS({})) as Map<any, any>
)
