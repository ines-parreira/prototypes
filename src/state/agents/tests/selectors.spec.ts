import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map, List} from 'immutable'
import {UserRole} from 'config/types/user'

import * as selectors from 'state/agents/selectors'
import {AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS} from 'state/agents/constants'
import {initialState} from 'state/agents/reducers'
import {initialState as currentUserInitialState} from 'state/currentUser/reducers'
import * as agentFixtures from 'fixtures/agents'
import * as userFixtures from 'fixtures/users'
import {getDisplayName} from 'state/customers/helpers'
import {RootState} from 'state/types'

describe('agents selectors', () => {
    const automationBotAgent = {
        id: 3,
        role: {name: UserRole.Bot},
        email: AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS,
    }
    const allAgents = [{id: 1}, {id: 2}, automationBotAgent]
    let state: RootState

    beforeEach(() => {
        expect.extend(immutableMatchers)

        state = {
            currentUser: (currentUserInitialState as Map<any, any>).mergeDeep(
                (fromJS(userFixtures.user) as Map<any, any>).set('id', 2)
            ),

            agents: initialState.mergeDeep({
                pagination: {
                    data: [{id: 1}, {id: 2}],
                    meta: {next_cursor: null, prev_cursor: null},
                },
                all: allAgents,
                locations: agentFixtures.locations,
                typingStatuses: agentFixtures.typingStatuses,
            }),
        } as RootState
    })

    it('getState()', () => {
        expect(selectors.getState(state)).toEqualImmutable(state.agents)
        expect(selectors.getState({} as RootState)).toEqualImmutable(fromJS({}))
    })

    describe('getHumanAgents()', () => {
        it('should return a list of all human agents', () => {
            expect(selectors.getHumanAgents(state)).toEqualImmutable(
                (state.agents.get('all') as List<any>).filter(
                    selectors.isHumanAgent
                )
            )
        })

        it('should return an empty list when state is empty', () => {
            expect(selectors.getHumanAgents({} as RootState)).toEqualImmutable(
                fromJS([])
            )
        })

        it('should return the same reference on agents state change when change is not in "all" part of the state', () => {
            const newState = {
                ...state,
                agents: state.agents.set(
                    'locations',
                    fromJS({
                        ...agentFixtures.locations['1'],
                    })
                ),
            }
            expect(selectors.getHumanAgents(state)).toBe(
                selectors.getHumanAgents(newState)
            )
        })
    })

    describe('getHumanAndAutomationBotAgents', () => {
        it('should return a list of all human and automation bot agents', () => {
            expect(
                selectors.getHumanAndAutomationBotAgents(state)
            ).toEqualImmutable(state.agents.get('all'))
        })

        it('should return an empty list when state is empty', () => {
            expect(
                selectors.getHumanAndAutomationBotAgents({} as RootState)
            ).toEqualImmutable(fromJS([]))
        })

        it('should return the same reference on agents state change when change is not in "all" part of the state', () => {
            const newState = {
                ...state,
                agents: state.agents.set(
                    'locations',
                    fromJS({
                        ...agentFixtures.locations['1'],
                    })
                ),
            }
            expect(selectors.getHumanAndAutomationBotAgents(state)).toBe(
                selectors.getHumanAndAutomationBotAgents(newState)
            )
        })
    })

    it('getHumanAndAutomationBotAgentsJS', () => {
        expect(selectors.getHumanAndAutomationBotAgentsJS(state)).toEqual(
            allAgents
        )
        expect(
            selectors.getHumanAndAutomationBotAgentsJS({} as RootState)
        ).toEqual([])
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

    it('getLabelledHumanAndBotAgents()', () => {
        expect(selectors.getLabelledHumanAndBotAgents(state)).toEqual(
            List([
                {id: allAgents[0].id, label: 'Customer #1'},
                {id: allAgents[1].id, label: 'Customer #2'},
                {id: allAgents[2].id, label: automationBotAgent.email},
            ])
        )
        expect(
            selectors.getLabelledHumanAndBotAgents({} as RootState)
        ).toEqualImmutable(fromJS([]))
    })

    describe('getLabelledAgentsJS', () => {
        it('should return labelled agents from the state', () => {
            expect(
                selectors.getLabelledHumanAndAutomationBotAgentsJS(state)
            ).toEqual([
                {id: allAgents[0].id, label: getDisplayName(Map(allAgents[0]))},
                {id: allAgents[1].id, label: getDisplayName(Map(allAgents[1]))},
                {id: allAgents[2].id, label: getDisplayName(Map(allAgents[2]))},
            ])
        })

        it('should return an empty array when no agents in the state', () => {
            expect(
                selectors.getLabelledHumanAndAutomationBotAgentsJS(
                    {} as RootState
                )
            ).toEqual([])
        })
    })
})
