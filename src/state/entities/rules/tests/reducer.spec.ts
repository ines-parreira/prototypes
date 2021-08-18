import {fromJS} from 'immutable'

import {
    ruleCreated,
    ruleDeleted,
    ruleFetched,
    ruleUpdated,
    rulesFetched,
    rulesReordered,
    ruleAstUpdated,
} from '../actions'
import reducer from '../reducer'
import _schemas from '../../../../fixtures/openapi.json'
import {RuleOperation} from '../../../rules/types'

import {
    rules as rulesFixtures,
    emptyRule as ruleFixture,
} from '../../../../fixtures/rule'

import _codeAST from '../../../../pages/common/components/ast/tests/fixtures/astCodeContains.json'

describe('rule reducer', () => {
    describe('createRule action', () => {
        it('should add a new rule to the state', () => {
            const newState = reducer({}, ruleCreated(rulesFixtures[0]))
            expect(newState).toStrictEqual({
                [rulesFixtures[0].id]: rulesFixtures[0],
            })
        })
    })

    describe('deleteRule action', () => {
        it('should remove a rule from the state', () => {
            const newState = reducer(
                {'1': rulesFixtures[0], '2': rulesFixtures[1]},
                ruleDeleted(1)
            )
            expect(newState).toStrictEqual({'2': rulesFixtures[1]})
        })
    })

    describe('updateRule action', () => {
        it('should replace an existing rule in the state', () => {
            const updatedRule = {...rulesFixtures[0], name: 'my awesome rule'}
            const newState = reducer(
                {[rulesFixtures[0].id]: rulesFixtures[0]},
                ruleUpdated(updatedRule)
            )
            expect(newState).toStrictEqual({[rulesFixtures[0].id]: updatedRule})
        })
    })

    describe('fetchRule action', () => {
        it('should add a new rule to the state', () => {
            const newState = reducer({}, ruleFetched(rulesFixtures[0]))
            expect(newState).toStrictEqual({
                [rulesFixtures[0].id]: rulesFixtures[0],
            })
        })
    })

    describe('fetchRules action', () => {
        it('should add a new rule to the state', () => {
            const newState = reducer({}, rulesFetched(rulesFixtures))
            expect(newState).toMatchSnapshot()
        })
    })

    describe('reorderRules actions', () => {
        it('should reorder rules in the state', () => {
            const newState = reducer(
                {[rulesFixtures[0].id]: rulesFixtures[0]},
                rulesReordered([{id: rulesFixtures[0].id, priority: 200}])
            )
            expect(newState[rulesFixtures[0].id].priority).toBe(200)
        })
    })

    describe('updateCodeAst action', () => {
        it('should update the code and code ast of a rule', () => {
            const rule = {...ruleFixture, code_ast: _codeAST, id: 1}
            const path = fromJS(['body', 0, 'test', 'callee', 'name'])
            const state = {'1': rule}
            const newState = reducer(
                state,
                ruleAstUpdated({
                    id: 1,
                    schemas: fromJS(_schemas),
                    path,
                    value: 'notContainsAll',
                    operation: 'UPDATE' as RuleOperation,
                })
            )
            expect(newState['1']).toMatchSnapshot()
        })
    })
})
