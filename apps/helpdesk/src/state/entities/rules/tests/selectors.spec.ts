import { fromJS } from 'immutable'

import { emptyRule } from '../../../../fixtures/rule'
import { RuleLimitStatus } from '../../../rules/types'
import type { RootState } from '../../../types'
import {
    getMaxRuleLimit,
    getRulesLimitStatus,
    getSortedRules,
    RULE_MAX_NUMBER,
} from '../selectors'
import type { RulesState } from '../types'

const RULE_MAX_NUMBER_WARNING = RULE_MAX_NUMBER - 5

describe('rules selectors', () => {
    describe('getMaxRuleLimit', () => {
        it('should return the default limit if the limits setting does not exist', () => {
            const state = {
                currentAccount: fromJS({ settings: [] }),
            } as unknown as RootState
            expect(getMaxRuleLimit(state)).toBe(RULE_MAX_NUMBER)
        })

        it('should return the default limit if the limits setting does not include data', () => {
            const state = {
                currentAccount: fromJS({
                    settings: [{ type: 'limits' }],
                }),
            } as unknown as RootState
            expect(getMaxRuleLimit(state)).toBe(RULE_MAX_NUMBER)
        })

        it('should return the default limit if the limits setting does not include the max_active_rules property', () => {
            const state = {
                currentAccount: fromJS({
                    settings: [{ type: 'limits', data: {} }],
                }),
            } as unknown as RootState
            expect(getMaxRuleLimit(state)).toBe(RULE_MAX_NUMBER)
        })

        it('should return the max_active_rules from the limits setting if it exists', () => {
            const state = {
                currentAccount: fromJS({
                    settings: [
                        { type: 'limits', data: { max_active_rules: 100 } },
                    ],
                }),
            } as unknown as RootState
            expect(getMaxRuleLimit(state)).toBe(100)
        })
    })

    describe('getSortedRules', () => {
        const rulesFixturesState = {
            '1': { ...emptyRule, name: 'foo', priority: 1 },
            '2': { ...emptyRule, name: 'baz', priority: 100 },
            '3': { ...emptyRule, name: 'bar', priority: 100 },
        }

        const state: RootState = {
            entities: {
                rules: rulesFixturesState,
            },
        } as any
        it('should return the sorted list of rules by priority', () => {
            expect(getSortedRules(state)).toMatchSnapshot()
        })
    })
    describe('getRulesLimitStatus', () => {
        const createRules = (n: number) => {
            const rules: RulesState = {}
            for (let i = 1; i <= n; i++) {
                rules[i.toString()] = { ...emptyRule, id: i }
            }
            return rules
        }
        it('should return RuleLimitStatus.NonReaching when number of rules < 65', () => {
            const state: RootState = {
                entities: {
                    rules: createRules(RULE_MAX_NUMBER_WARNING - 1),
                },
            } as any
            expect(getRulesLimitStatus(state)).toBe(RuleLimitStatus.NonReaching)
        })
        it('should return RuleLimitStatus.Reaching when 65 >= number of rules > 70', () => {
            const state: RootState = {
                entities: {
                    rules: createRules(RULE_MAX_NUMBER_WARNING),
                },
            } as any
            expect(getRulesLimitStatus(state)).toBe(RuleLimitStatus.Reaching)
        })
        it('should return RuleLimitStatus.Reached when number of rules > 70', () => {
            const state: RootState = {
                entities: {
                    rules: createRules(RULE_MAX_NUMBER),
                },
            } as any
            expect(getRulesLimitStatus(state)).toBe(RuleLimitStatus.Reached)
        })
    })
})
