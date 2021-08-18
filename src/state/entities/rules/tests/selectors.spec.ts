import {emptyRule} from '../../../../fixtures/rule'
import {RuleLimitStatus} from '../../../rules/types'
import {RootState} from '../../../types'
import {
    getSortedRules,
    getRulesLimitStatus,
    RULE_MAX_NUMBER,
    RULE_MAX_NUMBER_WARNING,
} from '../selectors'
import {RulesState} from '../types'

describe('rules selectors', () => {
    describe('getSortedRules', () => {
        const rulesFixturesState = {
            '1': {...emptyRule, name: 'foo', priority: 1},
            '2': {...emptyRule, name: 'baz', priority: 100},
            '3': {...emptyRule, name: 'bar', priority: 100},
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
                rules[i.toString()] = {...emptyRule, id: i}
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
