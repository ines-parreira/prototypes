import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map, List} from 'immutable'

import {TopRankMacroState} from 'state/newMessage/ticketReplyCache'
import {TicketVia} from 'business/types/ticket'
import {RootState} from 'state/types'
import {MacroActionName} from 'models/macroAction/types'
import {ACTION_TEMPLATES} from 'config'
import {shouldMessagesBeGrouped} from 'models/ticket/predicates'
import {assumeMock} from 'utils/testing'
import * as LDUtils from 'utils/launchDarkly'

import {CUSTOMER_EXTERNAL_DATA_KEY} from 'state/widgets/constants'
import * as phoneEvents from 'constants/event'
import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.mock('models/ticket/predicates', () => {
    const originalModule = jest.requireActual('models/ticket/predicates')
    return {
        ...originalModule,
        shouldMessagesBeGrouped: jest.fn(() => false),
    } as Record<any, any>
})

jest.mock(
    'state/queries/selectors',
    () =>
        ({
            ...jest.requireActual('state/queries/selectors'),
            getQueryTimestamp: jest.fn(() => jest.fn()),
        } as Record<string, unknown>)
)

const getLDClientSpy = jest.spyOn(LDUtils, 'getLDClient')

const mockShouldMessagesBeGrouped = assumeMock(shouldMessagesBeGrouped)

describe('ticket selectors', () => {
    let state: RootState

    beforeEach(() => {
        expect.extend(immutableMatchers)
        state = {
            ticket: initialState.mergeDeep({
                customer: {
                    data: {id: 1},
                    integrations: {
                        1: {name: 'integration 1'},
                        2: {name: 'integration 2'},
                    },
                    external_data: {
                        foo: {
                            peanuts: '_',
                        },
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

    it('getAppDataByAppId', () => {
        expect(selectors.getAppDataByAppId('foo')(state)).toEqual(
            (
                state.ticket.getIn([
                    'customer',
                    CUSTOMER_EXTERNAL_DATA_KEY,
                    'foo',
                ]) as Map<any, any>
            ).toJS()
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

    it('getDisplayableEvents - NewVoiceCallUI FF disabled', () => {
        state.ticket = state.ticket.set(
            'events',
            fromJS([
                {
                    type: phoneEvents.INCOMING_PHONE_CALL,
                },
                {
                    type: phoneEvents.OUTGOING_PHONE_CALL,
                },
                {
                    type: phoneEvents.PHONE_CALL_FORWARDED_TO_GORGIAS_NUMBER,
                },
                {
                    type: phoneEvents.PHONE_CALL_TRANSFERRED_TO_AGENT,
                },
                {
                    type: phoneEvents.COMPLETED_PHONE_CALL,
                },
                {
                    type: 'some-custom-event',
                },
            ])
        )

        expect(selectors.getDisplayableEvents(state)).toEqualImmutable(
            state.ticket.get('events')
        )

        expect(
            selectors.getDisplayableEvents({} as RootState)
        ).toEqualImmutable(fromJS([]))
    })

    it('getDisplayableEvents - NewVoiceCallUI FF enabled', () => {
        state.ticket = state.ticket.set(
            'events',
            fromJS([
                {
                    type: phoneEvents.INCOMING_PHONE_CALL,
                },
                {
                    type: phoneEvents.OUTGOING_PHONE_CALL,
                },
                {
                    type: phoneEvents.PHONE_CALL_FORWARDED_TO_GORGIAS_NUMBER,
                },
                {
                    type: phoneEvents.PHONE_CALL_TRANSFERRED_TO_AGENT,
                },
                {
                    type: phoneEvents.COMPLETED_PHONE_CALL,
                },
                {
                    type: 'some-custom-event',
                },
            ])
        )
        const expected = fromJS([
            {
                type: phoneEvents.PHONE_CALL_FORWARDED_TO_GORGIAS_NUMBER,
            },
            {
                type: phoneEvents.PHONE_CALL_TRANSFERRED_TO_AGENT,
            },
            {
                type: 'some-custom-event',
            },
        ])

        getLDClientSpy.mockReturnValueOnce({
            variation: jest.fn(() => true),
        } as any)
        expect(selectors.getDisplayableEvents(state)).toEqualImmutable(expected)

        expect(
            selectors.getDisplayableEvents({} as RootState)
        ).toEqualImmutable(fromJS([]))
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
                        rule_id: 1,
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
                        rule_id: 1,
                    },
                    {
                        id: 4,
                        sent_datetime: '2017-07-29T21:01:00',
                        created_datetime: '2017-07-29T21:00:00',
                        from_agent: true,
                    },
                ],
                4,
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

        it('should remove ai suggestion if already applied', () => {
            const messages = [
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
                    from_agent: true,
                    meta: {ai_suggestion: true},
                },
            ]
            const newState = {
                ...state,
                ticket: state.ticket
                    .setIn(['messages'], fromJS(messages))
                    .setIn(['meta'], fromJS({ai_suggestion: {}})),
            }
            const body = selectors.getBody(newState)
            const aiSuggestionIndex = body.findIndex(
                (element: Map<any, any>) =>
                    element.get('isAISuggestion') as boolean
            )
            expect(aiSuggestionIndex).toBe(-1)
        })
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

    describe('getTicketBodyElements', () => {
        beforeEach(() => {
            mockShouldMessagesBeGrouped.mockReturnValue(false)
        })

        it('should add the element to the body if it is not a message', () => {
            state = {
                ticket: initialState.mergeDeep({
                    events: [
                        {
                            id: 1,
                            created_datetime: '2023-02-01T12:00:00',
                        },
                    ],
                }),
            } as RootState

            expect(selectors.getTicketBodyElements(state)).toEqual([
                {id: 1, isEvent: true, created_datetime: '2023-02-01T12:00:00'},
            ])
        })

        it('should add the element to the body, in an array, if it is the first item being added', () => {
            state = {
                ticket: initialState.mergeDeep({
                    messages: [
                        {
                            id: 1,
                            created_datetime: '2023-02-02T12:00:00',
                        },
                    ],
                }),
            } as RootState

            expect(selectors.getTicketBodyElements(state)).toEqual([
                [
                    {
                        id: 1,
                        isMessage: true,
                        created_datetime: '2023-02-02T12:00:00',
                    },
                ],
            ])
        })

        it('should add the element to the body, in an array, if the previous item is not an array', () => {
            state = {
                ticket: initialState.mergeDeep({
                    messages: [
                        {
                            id: 1,
                            created_datetime: '2023-02-02T12:00:00',
                        },
                    ],
                    events: [
                        {
                            id: 1,
                            created_datetime: '2023-02-02T11:00:00',
                        },
                    ],
                }),
            } as RootState

            expect(selectors.getTicketBodyElements(state)).toEqual([
                {id: 1, isEvent: true, created_datetime: '2023-02-02T11:00:00'},
                [
                    {
                        id: 1,
                        isMessage: true,
                        created_datetime: '2023-02-02T12:00:00',
                    },
                ],
            ])
        })

        it('should add the element to the body, the previous array, if grouping criteria are met', () => {
            state = {
                ticket: initialState.mergeDeep({
                    messages: [
                        {
                            id: 1,
                            created_datetime: '2023-02-02T12:00:00',
                        },
                        {
                            id: 2,
                            created_datetime: '2023-02-02T12:01:00',
                        },
                    ],
                }),
            } as RootState
            mockShouldMessagesBeGrouped.mockReturnValue(true)

            expect(selectors.getTicketBodyElements(state)).toEqual([
                [
                    {
                        id: 1,
                        isMessage: true,
                        created_datetime: '2023-02-02T12:00:00',
                    },
                    {
                        id: 2,
                        isMessage: true,
                        created_datetime: '2023-02-02T12:01:00',
                    },
                ],
            ])
        })

        it('should add the element to the array, in an array, if the previous element is an array but longer than 5 minutes have passed', () => {
            state = {
                ticket: initialState.mergeDeep({
                    messages: [
                        {
                            id: 1,
                            created_datetime: '2023-02-02T12:00:00',
                        },
                        {
                            id: 2,
                            created_datetime: '2023-02-02T12:10:00',
                        },
                    ],
                }),
            } as RootState

            expect(selectors.getTicketBodyElements(state)).toEqual([
                [
                    {
                        id: 1,
                        isMessage: true,
                        created_datetime: '2023-02-02T12:00:00',
                    },
                ],
                [
                    {
                        id: 2,
                        isMessage: true,
                        created_datetime: '2023-02-02T12:10:00',
                    },
                ],
            ])
        })
    })

    describe('getTicketFieldState', () => {
        it('should return the ticket field state', () => {
            state = {
                ticket: initialState.mergeDeep({
                    custom_fields: {
                        42: {id: 42, value: 'test', hasError: false},
                    },
                }),
            } as RootState

            expect(selectors.getTicketFieldState(state)).toEqual(
                (
                    state.ticket.get('custom_fields') as Map<
                        unknown,
                        Map<unknown, unknown>
                    >
                ).toJS()
            )
        })
    })
})
