import {fromJS} from 'immutable'
import * as immutableMatchers from 'jest-immutable-matchers'
import {getInternal, getRule, getRules} from '../selectors'

jest.addMatchers(immutableMatchers)

describe('rules selectors', () => {
    describe('getRules', () => {
        it('should return an empty immutable Map when there is no rules in the state', () => {
            expect(getRules({})).toEqualImmutable(fromJS({}))
            expect(getRules({state: {}})).toEqualImmutable(fromJS({}))
            expect(getRules({state: {rules: fromJS({})}})).toEqualImmutable(fromJS({}))
            expect(getRules({state: {rules: fromJS({rules: {}})}})).toEqualImmutable(fromJS({}))
        })

        it('should return rules from the state when there is some', () => {
            const state = {
                rules: fromJS({
                    rules: {
                        '1': {foo: 'bar'}
                    }
                })
            }

            expect(getRules(state)).toEqualImmutable(state.rules.get('rules'))
        })
    })

    describe('getRule', () => {
        it('should return an empty immutable Map when there is no matching rule in the state', () => {
            expect(getRule(1)({})).toEqualImmutable(fromJS({}))
            expect(getRule(1)({state: {}})).toEqualImmutable(fromJS({}))
            expect(getRule(1)({state: {rules: fromJS({})}})).toEqualImmutable(fromJS({}))
            expect(getRule(1)({state: {rules: fromJS({rules: {}})}})).toEqualImmutable(fromJS({}))
        })

        it('should return the matching rule from the state when there is one', () => {
            const state = {
                rules: fromJS({
                    rules: {
                        '1': {foo: 'bar'}
                    }
                })
            }

            expect(getRule(1)(state)).toEqualImmutable(state.rules.getIn(['rules', '1']))
        })
    })

    describe('getInternal', () => {
        it('should return an empty immutable Map when there is no internal in the state', () => {
            expect(getInternal({})).toEqualImmutable(fromJS({}))
            expect(getInternal({state: {}})).toEqualImmutable(fromJS({}))
            expect(getInternal({state: {rules: fromJS({})}})).toEqualImmutable(fromJS({}))
            expect(getInternal({state: {rules: fromJS({rules: {}})}})).toEqualImmutable(fromJS({}))
        })

        it('should return the state\'s internal when there is one', () => {
            const state = {
                rules: fromJS({
                    _internal: {foo: 'bar'}
                })
            }

            expect(getInternal(state)).toEqualImmutable(state.rules.get('_internal'))
        })
    })
})
