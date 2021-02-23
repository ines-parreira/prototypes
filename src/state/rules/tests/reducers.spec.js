import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'
import _identity from 'lodash/identity'

import {rule} from '../../../fixtures/rule.ts'
import {ruleUpdated} from '../actions.ts'
import reducer, {initialState} from '../reducers.ts'

jest.addMatchers(immutableMatchers)

describe('rules reducer', () => {
    it('should return the initial state', () => {
        expect(reducer(undefined, {})).toEqualImmutable(initialState)
    })

    describe('ruleUpdated action', () => {
        it('should update an existing rule', () => {
            const newState = reducer(
                initialState,
                ruleUpdated(fromJS(rule))(_identity)
            )
            expect(newState).toMatchSnapshot()
        })
    })
})
