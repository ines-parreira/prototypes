import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'
import {initialState as currentUserInitialState} from '../../currentUser/reducers'
import * as userFixtures from '../../../fixtures/users'

jest.addMatchers(immutableMatchers)

describe('users selectors', () => {
    let state

    beforeEach(() => {
        state = {
            currentUser: currentUserInitialState
                .mergeDeep(
                    fromJS(userFixtures.currentUser)
                        .set('id', 2)
                ),
            users: initialState
                .mergeDeep({
                    active: {id: 1},
                    items: [{id: 1}, {id: 2}],
                    agents: [{id: 1}, {id: 2}],
                    agentsLocation: userFixtures.agentsLocation,
                    agentsTypingStatus: userFixtures.agentsTypingStatus,
                    _internal: {
                        loading: {
                            loader1: true,
                            loader2: false,
                        },
                    },
                })
        }
    })

    it('getUsersState', () => {
        expect(selectors.getUsersState(state)).toEqualImmutable(state.users)
        expect(selectors.getUsersState({})).toEqualImmutable(fromJS({}))
    })

    it('getLoading', () => {
        expect(selectors.getLoading(state)).toEqualImmutable(state.users.getIn(['_internal', 'loading']))
        expect(selectors.getLoading({})).toEqualImmutable(fromJS({}))
    })

    it('isLoading', () => {
        expect(selectors.isLoading('loader1')(state)).toBe(true)
        expect(selectors.isLoading('loader2')(state)).toBe(false)
        expect(selectors.isLoading('unknown')(state)).toBe(false)
    })

    it('getUsers', () => {
        expect(selectors.getUsers(state)).toEqualImmutable(state.users.get('items'))
        expect(selectors.getUsers({})).toEqualImmutable(fromJS([]))
    })

    it('getActiveUser', () => {
        expect(selectors.getActiveUser(state)).toEqualImmutable(state.users.get('active'))
        expect(selectors.getActiveUser({})).toEqualImmutable(fromJS({}))
    })

    it('getActiveUserId', () => {
        expect(selectors.getActiveUserId(state)).toEqualImmutable(state.users.getIn(['active', 'id']))
        expect(selectors.getActiveUserId({})).toBe(undefined)
    })

    it('getAgents', () => {
        expect(selectors.getAgents(state)).toEqualImmutable(state.users.get('agents'))
        expect(selectors.getAgents({})).toEqualImmutable(fromJS([]))
    })

    it('getOtherAgents', () => {
        const expected = fromJS([
            {id: 1}
        ])
        expect(selectors.getOtherAgents(state)).toEqualImmutable(expected)
    })

    it('getAgent', () => {
        expect(selectors.getAgent(1)(state)).toEqualImmutable(state.users.get('agents').first())
        expect(selectors.getAgent('1')(state)).toEqualImmutable(state.users.get('agents').first())
        expect(selectors.getAgent(12345)(state)).toEqualImmutable(fromJS({}))
        expect(selectors.getAgent()({})).toEqualImmutable(fromJS({}))
    })

    it('getAgentsIdsLocation', () => {
        expect(selectors.getAgentsIdsLocation(state)).toEqualImmutable(state.users.get('agentsLocation'))
        expect(selectors.getAgentsIdsLocation({})).toEqualImmutable(fromJS({}))
    })

    it('getAgentsIdsOnTicket', () => {
        expect(selectors.getAgentsIdsOnTicket(1)(state)).toEqualImmutable(fromJS(['1', '2']))
        expect(selectors.getAgentsIdsOnTicket(2)(state)).toEqualImmutable(fromJS(['1']))
        expect(selectors.getAgentsIdsOnTicket()(state)).toEqualImmutable(fromJS([]))
        expect(selectors.getAgentsIdsOnTicket()({})).toEqualImmutable(fromJS([]))
    })

    it('getAgentsOnTicket', () => {
        const expected = fromJS([
            {
                users: [{id: 1}, {id: 2}],
                ticket: '1'
            },
            {
                users: [{id: 1}],
                ticket: '2'
            }
        ])
        expect(selectors.getAgentsOnTicket(1)(state)).toEqualImmutable(expected.first().get('users'))
        expect(selectors.getAgentsOnTicket('2')(state)).toEqualImmutable(expected.last().get('users'))
        expect(selectors.getAgentsOnTicket()(state)).toEqualImmutable(fromJS([]))
        expect(selectors.getAgentsOnTicket()({})).toEqualImmutable(fromJS([]))
    })

    it('getOtherAgentsOnTicket', () => {
        const expected = fromJS([
            {
                users: [{id: 1}],
                ticket: '1'
            },
            {
                users: [{id: 1}],
                ticket: '2'
            }
        ])
        expect(selectors.getOtherAgentsOnTicket(1)(state)).toEqualImmutable(expected.first().get('users'))
        expect(selectors.getOtherAgentsOnTicket('2')(state)).toEqualImmutable(expected.last().get('users'))
        expect(selectors.getOtherAgentsOnTicket()(state)).toEqualImmutable(fromJS([]))
        expect(selectors.getOtherAgentsOnTicket()({})).toEqualImmutable(fromJS([]))
    })

    it('getAgentsIdsTypingStatus', () => {
        expect(selectors.getAgentsIdsTypingStatus(state)).toEqualImmutable(state.users.get('agentsTypingStatus'))
        expect(selectors.getAgentsIdsTypingStatus({})).toEqualImmutable(fromJS({}))
    })

    it('getAgentsIdsTypingStatusOnTicket', () => {
        const expected = fromJS([
            {
                users: ['1', '2'],
                ticket: '1'
            },
            {
                users: ['1'],
                ticket: '2'
            }
        ])
        expect(selectors.getAgentsIdsTypingStatusOnTicket(1)(state)).toEqualImmutable(expected.first().get('users'))
        expect(selectors.getAgentsIdsTypingStatusOnTicket('2')(state)).toEqualImmutable(expected.last().get('users'))
        expect(selectors.getAgentsIdsTypingStatusOnTicket()(state)).toEqualImmutable(fromJS([]))
        expect(selectors.getAgentsIdsTypingStatusOnTicket()({})).toEqualImmutable(fromJS([]))
    })

    it('getAgentsTypingOnTicket', () => {
        const expected = fromJS([
            {
                users: [{id: 1}, {id: 2}],
                ticket: '1'
            },
            {
                users: [{id: 1}],
                ticket: '2'
            }
        ])
        expect(selectors.getAgentsTypingOnTicket(1)(state)).toEqualImmutable(expected.first().get('users'))
        expect(selectors.getAgentsTypingOnTicket('2')(state)).toEqualImmutable(expected.last().get('users'))
        expect(selectors.getAgentsTypingOnTicket()(state)).toEqualImmutable(fromJS([]))
        expect(selectors.getAgentsTypingOnTicket()({})).toEqualImmutable(fromJS([]))
    })

    it('getOtherAgentsTypingOnTicket', () => {
        const expected = fromJS([
            {
                users: [{id: 1}],
                ticket: '1'
            },
            {
                users: [{id: 1}],
                ticket: '2'
            }
        ])
        expect(selectors.getOtherAgentsTypingOnTicket(1)(state)).toEqualImmutable(expected.first().get('users'))
        expect(selectors.getOtherAgentsTypingOnTicket('2')(state)).toEqualImmutable(expected.last().get('users'))
        expect(selectors.getOtherAgentsTypingOnTicket()(state)).toEqualImmutable(fromJS([]))
        expect(selectors.getOtherAgentsTypingOnTicket()({})).toEqualImmutable(fromJS([]))
    })

    it('isAgentTypingOnTicket', () => {
        expect(selectors.isAgentTypingOnTicket(1)(state)).toBe(true)
        expect(selectors.isAgentTypingOnTicket('1')(state)).toBe(true)
        expect(selectors.isAgentTypingOnTicket('2')(state)).toBe(false)
        expect(selectors.isAgentTypingOnTicket()(state)).toBe(false)
        expect(selectors.isAgentTypingOnTicket()({})).toBe(false)
    })
})
