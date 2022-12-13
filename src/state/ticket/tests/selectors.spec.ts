import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map, List} from 'immutable'

import {TopRankMacroState} from 'state/newMessage/ticketReplyCache'
import {TicketVia} from 'business/types/ticket'
import {RootState} from 'state/types'
import {MacroActionName} from 'models/macroAction/types'
import {ACTION_TEMPLATES} from 'config'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('ticket selectors', () => {
    let state: RootState

    beforeEach(() => {
        state = {
            ticket: initialState.mergeDeep({
                customer: {
                    data: {id: 1},
                    integrations: {
                        1: {name: 'integration 1'},
                        2: {name: 'integration 2'},
                    },
                },
                messages: [
                    // deliberately not ordered
                    {
                        id: 2,
                        opened_datetime: '2017-07-29T22:00:00',
                        sent_datetime: '2017-07-29T21:01:00',
                        created_datetime: '2017-07-29T21:00:00',
                    },
                    {
                        // last message
                        id: 3,
                        opened_datetime: null,
                        sent_datetime: '2017-07-31T21:01:00',
                        created_datetime: '2017-07-31T21:00:00',
                    },
                    {
                        // first message
                        id: 1,
                        opened_datetime: '2017-07-25T22:00:00',
                        sent_datetime: '2017-07-25T21:01:00',
                        created_datetime: '2017-07-24T21:00:00',
                    },
                ],
                events: [
                    // deliberately not ordered
                    {
                        id: 2,
                        created_datetime: '2017-06-29T21:00:00',
                    },
                    {
                        id: 1,
                        created_datetime: '2017-06-31T21:00:00',
                    },
                ],
                _internal: {
                    loading: {
                        loader1: true,
                        loader2: false,
                    },
                    pendingMessages: [
                        {
                            created_datetime: '2017-08-31T21:00:00',
                        },
                        {
                            created_datetime: '2017-08-29T21:00:00',
                            failed_datetime: '2017-08-29T21:01:00',
                        },
                    ],
                },
                state: {
                    dirty: false,
                    appliedMacro: {},
                },
                via: TicketVia.Email,
                meta: {
                    rule_suggestion: {
                        id: 1,
                    },
                },
            }),
        } as RootState
    })

    it('getTicketState', () => {
        expect(selectors.getTicketState(state)).toEqualImmutable(state.ticket)
        expect(selectors.getTicketState({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('getLoading', () => {
        expect(selectors.getLoading(state)).toEqualImmutable(
            state.ticket.getIn(['_internal', 'loading'])
        )
        expect(selectors.getLoading({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('isLoading', () => {
        expect(selectors.isLoading('loader1')(state)).toBe(true)
        expect(selectors.isLoading('loader2')(state)).toBe(false)
        expect(selectors.isLoading('unknown')(state)).toBe(false)
    })

    it('getProperty', () => {
        const properties = state.ticket.keySeq()
        properties.forEach((property) => {
            expect(selectors.getProperty(property)(state)).toEqualImmutable(
                state.ticket.get(property)
            )
        })
        expect(selectors.getProperty('unknown')(state)).toEqual(undefined)
    })

    it('getTicket', () => {
        const expected = state.ticket.delete('_internal').delete('state').toJS()
        expect(selectors.getTicket(state)).toEqual(expected)
        expect(selectors.getTicket(fromJS({}))).toEqual({})
    })

    it('DEPRECATED_getTicket', () => {
        const expected = state.ticket.delete('_internal').delete('state')
        expect(selectors.DEPRECATED_getTicket(state)).toEqualImmutable(expected)
        expect(
            selectors.DEPRECATED_getTicket({} as RootState)
        ).toEqualImmutable(fromJS({}))
    })

    it('getIntegrationsData', () => {
        expect(selectors.getIntegrationsData(state)).toEqualImmutable(
            state.ticket.getIn(['customer', 'integrations'])
        )
        expect(selectors.getIntegrationsData({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('getIntegrationDataByIntegrationId', () => {
        expect(
            selectors.getIntegrationDataByIntegrationId(1)(state)
        ).toEqualImmutable(
            state.ticket.getIn(['customer', 'integrations', '1'])
        )
    })

    it('getMessages', () => {
        expect(selectors.getMessages(state)).toEqualImmutable(
            state.ticket.get('messages')
        )
        expect(selectors.getMessages({} as RootState)).toEqualImmutable(
            fromJS([])
        )

        // Should not return hidden message
        state.ticket = state.ticket.set(
            'messages',
            fromJS([
                {
                    id: 1,
                    opened_datetime: '2017-07-25T22:00:00',
                    sent_datetime: '2017-07-25T21:01:00',
                    created_datetime: '2017-07-24T21:00:00',
                    meta: {hidden: true},
                },
            ])
        )
        expect(selectors.getMessages(state)).toEqualImmutable(fromJS([]))
    })

    it('getVia', () => {
        expect(selectors.getVia(state)).toEqualImmutable(
            state.ticket.get('via')
        )
    })

    it('getPendingMessages', () => {
        expect(selectors.getPendingMessages(state)).toEqualImmutable(
            state.ticket.getIn(['_internal', 'pendingMessages'])
        )
        expect(selectors.getPendingMessages({} as RootState)).toEqualImmutable(
            fromJS([])
        )
    })

    it('getLastMessage', () => {
        expect(selectors.getLastMessage({} as RootState)).toEqualImmutable(
            fromJS({})
        )

        const lastMessage = selectors.getLastMessage(state)
        expect(lastMessage).toBeInstanceOf(Map)
        expect(lastMessage.get('id')).toBe(3)
        expect(lastMessage).toMatchSnapshot()
    })

    it('getReadMessages', () => {
        const expected = (state.ticket.get('messages') as List<any>).delete(1)
        expect(selectors.getReadMessages(state)).toEqualImmutable(expected)
        expect(selectors.getReadMessages({} as RootState)).toEqualImmutable(
            fromJS([])
        )
    })

    it('getLastReadMessage', () => {
        const expected = (state.ticket.get('messages') as List<any>).first()
        expect(selectors.getLastReadMessage(state)).toEqualImmutable(expected)
        expect(selectors.getLastReadMessage({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it('getEvents', () => {
        const expected = state.ticket.get('events')
        expect(selectors.getEvents(state)).toEqualImmutable(expected)
        expect(selectors.getEvents({} as RootState)).toEqualImmutable(
            fromJS([])
        )
    })

    it('getRuleSuggestion', () => {
        expect(selectors.getRuleSuggestion(state)).toEqualImmutable(
            state.ticket.getIn(['meta', 'rule_suggestion'])
        )
    })

    describe('getBody', () => {
        it('should get body', () => {
            expect(selectors.getBody({} as RootState)).toEqualImmutable(
                fromJS([])
            )

            const body = selectors.getBody(state)
            expect(body).toBeInstanceOf(List)
            expect(body.size).toBe(8)

            body.take(2).forEach((element: Map<any, any>) => {
                expect(element.get('isEvent')).toBe(true)
            })

            body.slice(2, 6).forEach((element: Map<any, any>) => {
                expect(element.get('isMessage')).toBe(true)
            })

            expect((body.get(5) as Map<any, any>).get('isPending')).toBe(false)
            expect((body.get(6) as Map<any, any>).get('isPending')).toBe(true)
            expect((body.get(7) as Map<any, any>).get('isRuleSuggestion')).toBe(
                true
            )
            expect(body).toMatchSnapshot()
        })

        it.each([
            [
                [
                    {
                        id: 1,
                        sent_datetime: '2017-07-25T21:01:00',
                        created_datetime: '2017-07-24T21:00:00',
                        from_agent: true,
                    },
                    {
                        id: 2,
                        sent_datetime: '2017-07-29T21:01:00',
                        created_datetime: '2017-07-29T21:00:00',
                        from_agent: true,
                    },
                    {
                        id: 3,
                        sent_datetime: '2017-07-31T21:01:00',
                        created_datetime: '2017-07-31T21:00:00',
                        from_agent: false,
                    },
                ],
                2,
            ],
            [
                [
                    {
                        id: 1,
                        sent_datetime: '2017-07-25T21:01:00',
                        created_datetime: '2017-07-24T21:00:00',
                        from_agent: false,
                    },
                    {
                        id: 2,
                        sent_datetime: '2017-07-29T21:01:00',
                        created_datetime: '2017-07-29T21:00:00',
                        from_agent: false,
                    },
                    {
                        id: 3,
                        sent_datetime: '2017-07-31T21:01:00',
                        created_datetime: '2017-07-31T21:00:00',
                        from_agent: false,
                    },
                ],
                7,
            ],
            [
                [
                    {
                        id: 1,
                        sent_datetime: '2017-07-25T21:01:00',
                        created_datetime: '2017-07-24T21:00:00',
                        from_agent: false,
                    },
                    {
                        id: 2,
                        sent_datetime: '2017-07-29T21:01:00',
                        created_datetime: '2017-07-29T21:00:00',
                        from_agent: false,
                    },
                    {
                        id: 3,
                        sent_datetime: '2017-07-31T21:01:00',
                        created_datetime: '2017-07-31T21:00:00',
                        from_agent: false,
                        meta: {rule_suggestion_slug: 'rule_suggestion_slug'},
                    },
                ],
                -1,
            ],
        ])(
            'should set rule suggestion above the first message of any agent or at the end of the thread if suggestion not applied',
            (messages, expectedIndex) => {
                const newState = {
                    ...state,
                    ticket: state.ticket.setIn(['messages'], fromJS(messages)),
                }
                const body = selectors.getBody(newState)
                const ruleSuggestionIndex = body.findIndex(
                    (element: Map<any, any>) =>
                        element.get('isRuleSuggestion') as boolean
                )
                expect(ruleSuggestionIndex).toBe(expectedIndex)
            }
        )
    })

    it('getAppliedMacro', () => {
        expect(selectors.getAppliedMacro({} as RootState)).toEqualImmutable(
            fromJS({})
        )
    })

    it.each([
        [{state: {}}, null],
        [
            {
                state: {
                    topRankMacroState: {
                        macroId: 10,
                        state: 'pending',
                    } as TopRankMacroState,
                },
            },
            {macroId: 10, state: 'pending'} as TopRankMacroState,
        ],
    ])('getTopRankMacroState', (ticketState, expected) => {
        state.ticket = fromJS(ticketState)
        const topRankMacroState = selectors.getTopRankMacroState(state)
        expected?.constructor === Object
            ? expect(topRankMacroState).toMatchObject(expected)
            : expect(topRankMacroState).toBe(expected)
    })

    describe('hasContentlessAction', () => {
        it('should return false when no actions applied', () => {
            expect(selectors.hasContentlessAction(state)).toBe(false)
        })

        it.each([
            MacroActionName.SetResponseText,
            MacroActionName.AddAttachments,
        ])(
            'should return false when only %s action is applied',
            (actionName) => {
                const ticket = state.ticket.setIn(
                    ['state', 'appliedMacro'],
                    fromJS({
                        actions: [
                            ACTION_TEMPLATES.find(
                                (action) => action.name === actionName
                            ),
                        ],
                    })
                )
                expect(selectors.hasContentlessAction({...state, ticket})).toBe(
                    false
                )
            }
        )

        it('should return true when contentless action is applied', () => {
            const ticket = state.ticket.setIn(
                ['state', 'appliedMacro'],
                fromJS({
                    actions: [
                        ACTION_TEMPLATES.find(
                            (action) =>
                                action.name === MacroActionName.SetResponseText
                        ),
                        ACTION_TEMPLATES.find(
                            (action) => action.name === MacroActionName.AddTags
                        ),
                    ],
                })
            )
            expect(selectors.hasContentlessAction({...state, ticket})).toBe(
                true
            )
        })
    })
})
