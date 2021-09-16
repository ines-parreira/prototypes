import {
    ruleCreated,
    ruleDeleted,
    ruleFetched,
    ruleUpdated,
    rulesFetched,
    rulesReordered,
} from '../actions'
import reducer from '../reducer'

import {rules as rulesFixtures} from '../../../../fixtures/rule'

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
})
