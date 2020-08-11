import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map, List} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import {initialState as currentUserInitialState} from '../../currentUser/reducers.js'
import * as agentFixtures from '../../../fixtures/agents.js'
import * as userFixtures from '../../../fixtures/users.js'
import {RootState} from '../../types'

jest.addMatchers(immutableMatchers)

describe('agents selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            currentUser: (currentUserInitialState as Map<any, any>).mergeDeep(
                (fromJS(userFixtures.currentUser) as Map<any, any>).set('id', 2)
            ),

            agents: initialState.mergeDeep({
                pagination: {
                    data: [{id: 1}, {id: 2}],
                    meta: {page: 1},
                },
                all: [{id: 1}, {id: 2}],
                locations: agentFixtures.locations,
                typingStatuses: agentFixtures.typingStatuses,
            }),
        } as RootState
    })

    it('getState()', () => {
        expect(selectors.getState(state)).toEqualImmutable(state.agents)
        expect(selectors.getState({} as RootState)).toEqualImmutable(fromJS({}))
    })

    it('getPaginatedAgents()', () => {
        expect(selectors.getPaginatedAgents(state)).toEqualImmutable(
            state.agents.getIn(['pagination', 'data'])
        )
        expect(selectors.getPaginatedAgents({} as RootState)).toEqualImmutable(
            fromJS([])
        )
    })

    it('getPagination()', () => {
        expect(selectors.getPagination(state)).toEqualImmutable(
            state.agents.getIn(['pagination', 'meta'])
        )
        expect(selectors.getPagination({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('getAgents()', () => {
        expect(selectors.getAgents(state)).toEqualImmutable(
            state.agents.get('all')
        )
        expect(selectors.getAgents({} as RootState)).toEqualImmutable(
            fromJS([])
        )
    })

    it('getOtherAgents()', () => {
        const expected = fromJS([{id: 1}])
        expect(selectors.getOtherAgents(state)).toEqualImmutable(expected)
    })

    it('getAgent()', () => {
        expect(selectors.getAgent(1)(state)).toEqualImmutable(
            (state.agents.get('all') as List<any>).first()
        )
        expect(selectors.getAgent(1)(state)).toEqualImmutable(
            (state.agents.get('all') as List<any>).first()
        )
        expect(selectors.getAgent(12345)(state)).toEqualImmutable(fromJS({}))
        expect(selectors.getAgent()({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('getAgentsIdsLocation()', () => {
        expect(selectors.getAgentsIdsLocation(state)).toEqualImmutable(
            state.agents.get('locations')
        )
        expect(
            selectors.getAgentsIdsLocation({} as RootState)
        ).toEqualImmutable(fromJS({}))
    })

    it('getAgentsIdsOnTicket()', () => {
        expect(selectors.getAgentsIdsOnTicket('1')(state)).toEqualImmutable(
            fromJS(['1', '2'])
        )
        expect(selectors.getAgentsIdsOnTicket('2')(state)).toEqualImmutable(
            fromJS(['1'])
        )
        expect(selectors.getAgentsIdsOnTicket()(state)).toEqualImmutable(
            fromJS([])
        )
        expect(
            selectors.getAgentsIdsOnTicket()({} as RootState)
        ).toEqualImmutable(fromJS([]))
    })

    it('getAgentsOnTicket()', () => {
        const expected = fromJS([
            {
                customers: [{id: 1}, {id: 2}],
                ticket: '1',
            },
            {
                customers: [{id: 1}],
                ticket: '2',
            },
        ]) as List<any>
        expect(selectors.getAgentsOnTicket('1')(state)).toEqualImmutable(
            (expected.first() as Map<any, any>).get('customers')
        )
        expect(selectors.getAgentsOnTicket('2')(state)).toEqualImmutable(
            (expected.last() as Map<any, any>).get('customers')
        )
        expect(selectors.getAgentsOnTicket()(state)).toEqualImmutable(
            fromJS([])
        )
        expect(selectors.getAgentsOnTicket()({} as RootState)).toEqualImmutable(
            fromJS([])
        )
    })

    it('getOtherAgentsOnTicket()', () => {
        const expected = fromJS([
            {
                customers: [{id: 1}],
                ticket: '1',
            },
            {
                customers: [{id: 1}],
                ticket: '2',
            },
        ]) as List<any>
        expect(selectors.getOtherAgentsOnTicket('1')(state)).toEqualImmutable(
            (expected.first() as Map<any, any>).get('customers')
        )
        expect(selectors.getOtherAgentsOnTicket('2')(state)).toEqualImmutable(
            (expected.last() as Map<any, any>).get('customers')
        )
        expect(selectors.getOtherAgentsOnTicket()(state)).toEqualImmutable(
            fromJS([])
        )
        expect(
            selectors.getOtherAgentsOnTicket()({} as RootState)
        ).toEqualImmutable(fromJS([]))
    })

    it('getAgentsIdsTypingStatus()', () => {
        expect(selectors.getAgentsIdsTypingStatus(state)).toEqualImmutable(
            state.agents.get('typingStatuses')
        )
        expect(
            selectors.getAgentsIdsTypingStatus({} as RootState)
        ).toEqualImmutable(fromJS({}))
    })

    it('getAgentsIdsTypingStatusOnTicket()', () => {
        const expected = fromJS([
            {
                customers: ['1', '2'],
                ticket: '1',
            },
            {
                customers: ['1'],
                ticket: '2',
            },
        ]) as List<any>
        expect(
            selectors.getAgentsIdsTypingStatusOnTicket('1')(state)
        ).toEqualImmutable((expected.first() as Map<any, any>).get('customers'))
        expect(
            selectors.getAgentsIdsTypingStatusOnTicket('2')(state)
        ).toEqualImmutable((expected.last() as Map<any, any>).get('customers'))
        expect(
            selectors.getAgentsIdsTypingStatusOnTicket()(state)
        ).toEqualImmutable(fromJS([]))
        expect(
            selectors.getAgentsIdsTypingStatusOnTicket()({} as RootState)
        ).toEqualImmutable(fromJS([]))
    })

    it('getAgentsTypingOnTicket()', () => {
        const expected = fromJS([
            {
                customers: [{id: 1}, {id: 2}],
                ticket: '1',
            },
            {
                customers: [{id: 1}],
                ticket: '2',
            },
        ]) as List<any>
        expect(selectors.getAgentsTypingOnTicket('1')(state)).toEqualImmutable(
            (expected.first() as Map<any, any>).get('customers')
        )
        expect(selectors.getAgentsTypingOnTicket('2')(state)).toEqualImmutable(
            (expected.last() as Map<any, any>).get('customers')
        )
        expect(selectors.getAgentsTypingOnTicket()(state)).toEqualImmutable(
            fromJS([])
        )
        expect(
            selectors.getAgentsTypingOnTicket()({} as RootState)
        ).toEqualImmutable(fromJS([]))
    })

    it('getOtherAgentsTypingOnTicket()', () => {
        const expected = fromJS([
            {
                customers: [{id: 1}],
                ticket: '1',
            },
            {
                customers: [{id: 1}],
                ticket: '2',
            },
        ]) as List<any>
        expect(
            selectors.getOtherAgentsTypingOnTicket('1')(state)
        ).toEqualImmutable((expected.first() as Map<any, any>).get('customers'))
        expect(
            selectors.getOtherAgentsTypingOnTicket('2')(state)
        ).toEqualImmutable((expected.last() as Map<any, any>).get('customers'))
        expect(
            selectors.getOtherAgentsTypingOnTicket()(state)
        ).toEqualImmutable(fromJS([]))
        expect(
            selectors.getOtherAgentsTypingOnTicket()({} as RootState)
        ).toEqualImmutable(fromJS([]))
    })

    it('isAgentTypingOnTicket()', () => {
        expect(selectors.isAgentTypingOnTicket('1')(state)).toBe(true)
        expect(selectors.isAgentTypingOnTicket('2')(state)).toBe(false)
        expect(selectors.isAgentTypingOnTicket()(state)).toBe(false)
        expect(selectors.isAgentTypingOnTicket()({} as RootState)).toBe(false)
    })
})
