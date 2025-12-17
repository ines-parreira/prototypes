import { history } from '@repo/routing'
import MockAdapter from 'axios-mock-adapter'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import _pick from 'lodash/pick'
import moment from 'moment'
import { dismissNotification } from 'reapop'
import type { MockStoreEnhanced } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { ListSatisfactionSurveys200, Tag } from '@gorgias/helpdesk-types'

import { agents } from 'fixtures/agents'
import { teams } from 'fixtures/teams'
import client from 'models/api/resources'
import type { ApiListResponseCursorPagination } from 'models/api/types'
import {
    ecommerceStoreFixture,
    shopperAddressFixture,
    shopperFixture,
    shopperOrderFixture,
} from 'models/customerEcommerceData/fixtures'
import type { Event } from 'models/event/types'
import {
    EventObjectType,
    SATISFACTION_SURVEY_EVENT_TYPES,
    TICKET_EVENT_TYPES,
} from 'models/event/types'
import type { Ticket, TicketMessage } from 'models/ticket/types'
import { ViewType } from 'models/view/types'
import socketManager from 'services/socketManager/socketManager'
import type { TicketMessageFailedEvent } from 'services/socketManager/types'
import { SocketEventType } from 'services/socketManager/types'
import { initialState as newMessageState } from 'state/newMessage/reducers'
import { notify } from 'state/notifications/actions'
import type { AlertNotification } from 'state/notifications/types'
import { NotificationStatus } from 'state/notifications/types'
import {
    MERGE_CUSTOMER_ECOMMERCE_DATA_ORDER,
    MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER,
    MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER_ADDRESS,
} from 'state/ticket/constants'
import type { StoreDispatch } from 'state/types'

import * as actions from '../actions'
import { initialState } from '../reducers'

type MockedRootState = {
    ticket: Map<any, any>
    newMessage?: Map<any, any>
    currentUser?: Map<any, any>
    views?: Map<any, any>
}

const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares,
)

jest.mock('reapop', () => {
    const reapop: Record<string, unknown> = jest.requireActual('reapop')
    return {
        ...reapop,
        dismissNotification: jest.fn(() => (args: unknown) => args),
    }
})
jest.mock('push.js', () => {
    return {
        create: jest.fn(),
    }
})

jest.mock('utils', () => {
    const utils = jest.requireActual('utils')

    return {
        ...utils,
        isTabActive: jest.fn(() => false),
        isCurrentlyOnTicket: jest.fn((ticketId: string) => ticketId === '1'),
    } as {
        isTabActive: jest.MockedFunction<typeof utils.isTabActive>
        isCurrentlyOnTicket: jest.MockedFunction<
            typeof utils.isCurrentlyOnTicket
        >
    }
})

jest.mock('services/socketManager/socketManager', () => {
    return {
        join: jest.fn(),
        send: jest.fn(),
    }
})

jest.mock('state/notifications/actions', () => {
    return {
        notify: jest.fn(() => (args: Record<string, unknown>) => args),
    }
})
jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    getLDClient: jest.fn(() => ({
        variation: jest.fn((flag, defaultValue) => defaultValue),
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))
const variationMock = require('@repo/feature-flags').getLDClient()
    .variation as jest.Mock

jest.mock('api/queryClient', () => {
    return {
        appQueryClient: {
            invalidateQueries: jest.fn(() => Promise.resolve()),
            getQueryData: jest.fn(() => undefined),
            setQueryData: jest.fn(),
            removeQueries: jest.fn(),
            clear: jest.fn(),
        },
    }
})

describe('ticket actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        localStorage.clear()
        store = mockStore({
            ticket: initialState,
            newMessage: newMessageState,
        })
        mockServer = new MockAdapter(client)
        variationMock.mockImplementation(() => true)
    })

    const endpointMatchers = {
        anyTicket: new RegExp('/api/tickets/\\d+'),
        ticket1: new RegExp('/api/tickets/1'),
        ticket2: new RegExp('/api/tickets/2'),
    }

    const ticket = {
        id: 1,
        subject: 'title',
        messages: [
            {
                id: 1,
                body_text: 'hello',
                body_html: '<div>hello</div>',
                channel: 'email',
            },
        ],
        customer: {
            id: 1,
            data: { hello: 'world!' },
        },
    } as unknown as Ticket

    describe('mergeTicket()', () => {
        const testStore = mockStore({
            ticket: fromJS({
                id: 1,
                messages: [],
            }),
            newMessage: newMessageState.setIn(
                ['newMessage', 'source', 'type'],
                undefined,
            ),
        })

        it('fails because not current ticket', () => {
            return store
                .dispatch(actions.mergeTicket(ticket))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success', () => {
            return testStore
                .dispatch(actions.mergeTicket(ticket))
                .then(() => expect(testStore.getActions()).toMatchSnapshot())
        })
    })

    it('mergeCustomer()', () => {
        store.dispatch(actions.mergeCustomer({ id: 1 } as any))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('mergeCustomerExternalData()', () => {
        store.dispatch(
            actions.mergeCustomerExternalData(1, {
                'my-awesome-app-id-1': {
                    badge: 'Best customer',
                    __app_name__: 'foo',
                },
            }),
        )
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('mergeCustomerEcommerceDataShopper()', () => {
        store.dispatch(
            actions.mergeCustomerEcommerceDataShopper(
                1,
                ecommerceStoreFixture,
                shopperFixture,
            ),
        )
        expect(store.getActions()).toMatchObject([
            {
                type: MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER,
                customerId: 1,
                store: ecommerceStoreFixture,
                shopper: shopperFixture,
            },
        ])
    })

    it('mergeCustomerEcommerceDataShopperAddress()', () => {
        store.dispatch(
            actions.mergeCustomerEcommerceDataShopperAddress(
                1,
                ecommerceStoreFixture.uuid,
                shopperAddressFixture,
            ),
        )
        expect(store.getActions()).toMatchObject([
            {
                type: MERGE_CUSTOMER_ECOMMERCE_DATA_SHOPPER_ADDRESS,
                customerId: 1,
                storeUUID: ecommerceStoreFixture.uuid,
                shopperAddress: shopperAddressFixture,
            },
        ])
    })

    it('mergeCustomerEcommerceDataOrder()', () => {
        store.dispatch(
            actions.mergeCustomerEcommerceDataOrder(
                1,
                ecommerceStoreFixture.uuid,
                shopperOrderFixture,
            ),
        )
        expect(store.getActions()).toMatchObject([
            {
                type: MERGE_CUSTOMER_ECOMMERCE_DATA_ORDER,
                customerId: 1,
                storeUUID: ecommerceStoreFixture.uuid,
                shopperOrder: shopperOrderFixture,
            },
        ])
    })

    describe('ticketPartialUpdate()', () => {
        const update = { subject: 'new title' }

        it('fails because new ticket', () => {
            return store
                .dispatch(actions.ticketPartialUpdate(update))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should format custom fields correctly', () => {
            mockServer
                .onPut(endpointMatchers.ticket1)
                .reply(200, { data: { id: 1 } })

            store = mockStore({
                ticket: fromJS({
                    id: 1,
                }),
            })

            const customFields = {
                1: {
                    id: 1,
                    value: 'hello',
                },
            }

            return store
                .dispatch(
                    actions.ticketPartialUpdate({
                        custom_fields: customFields,
                    }),
                )
                .then(() =>
                    expect(mockServer.history.put[0].data).toEqual(
                        JSON.stringify({
                            custom_fields: [customFields[1]],
                        }),
                    ),
                )
        })

        it('should handle priority updates correctly', () => {
            mockServer
                .onPut(endpointMatchers.ticket1)
                .reply(200, { data: { id: 1 } })

            store = mockStore({
                ticket: fromJS({
                    id: 1,
                    priority: 'normal',
                }),
            })

            return store
                .dispatch(actions.ticketPartialUpdate({ priority: 'high' }))
                .then(() => {
                    const actions = store.getActions()
                    const setPriorityAction = actions.find(
                        (action) => action.type === 'setPriority',
                    )
                    const partialUpdateStartAction = actions.find(
                        (action) =>
                            action.type === 'TICKET_PARTIAL_UPDATE_START',
                    )

                    expect(setPriorityAction).toBeDefined()
                    expect(setPriorityAction.args.get('priority')).toBe('high')
                    expect(partialUpdateStartAction).toBeDefined()
                })
        })

        it('should handle priority update errors and restore previous priority', () => {
            mockServer
                .onPut(endpointMatchers.ticket1)
                .reply(400, { message: 'Bad request' })

            store = mockStore({
                ticket: fromJS({
                    id: 1,
                    priority: 'normal',
                }),
            })

            return store
                .dispatch(actions.ticketPartialUpdate({ priority: 'high' }))
                .then(() => {
                    const actions = store.getActions()
                    const setPriorityActions = actions.filter(
                        (action) => action.type === 'setPriority',
                    )

                    // Should have two setPriority actions: one for 'high', one for 'normal' (restore)
                    expect(setPriorityActions).toHaveLength(2)
                    expect(setPriorityActions[0].args.get('priority')).toBe(
                        'high',
                    )
                    expect(setPriorityActions[1].args.get('priority')).toBe(
                        'normal',
                    )
                })
        })

        it('success', () => {
            mockServer
                .onPut(endpointMatchers.ticket1)
                .reply(200, { data: { id: 1 } })

            store = mockStore({
                ticket: fromJS({ id: 1 }),
            })

            return store
                .dispatch(actions.ticketPartialUpdate(update))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should update a ticket with the passed id instead of the current one', () => {
            mockServer
                .onPut(endpointMatchers.ticket2)
                .reply(200, { data: { id: 2 } })

            store = mockStore({
                ticket: fromJS({ id: 1 }),
            })

            return store
                .dispatch(actions.ticketPartialUpdate(update, 2))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    it('addTag()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, { data: {} })
        return store
            .dispatch(actions.addTag({ name: 'refund' } as Tag))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('removeTag()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, { data: {} })
        return store
            .dispatch(actions.removeTag('refund'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    describe('setSpam()', () => {
        it('fails because same status', () => {
            store = mockStore({
                ticket: initialState.set('spam', true),
            })
            return store
                .dispatch(actions.setSpam(true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('success', () => {
            store = mockStore({
                ticket: initialState.set('id', 1),
            })
            mockServer
                .onPut(endpointMatchers.anyTicket)
                .reply(202, { data: {} })
            return store
                .dispatch(actions.setSpam(true))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should undo when clicking on notification button', () => {
            store = mockStore({
                ticket: initialState.set('id', 1),
            })
            mockServer
                .onPut(endpointMatchers.anyTicket)
                .reply(202, { data: {} })

            return store.dispatch(actions.setSpam(true)).then(() => {
                const button = (
                    (notify as jest.MockedFunction<typeof notify>).mock
                        .calls[0][0]! as AlertNotification
                ).buttons?.[0] as unknown as {
                    onClick: () => Promise<void>
                }

                if (!button) {
                    throw new Error('property buttons is undefined')
                }
                return button.onClick().then(() => {
                    expect(dismissNotification).toHaveBeenNthCalledWith(
                        1,
                        'spam-1',
                    )
                    expect(store.getActions()).toMatchSnapshot()
                })
            })
        })
    })

    describe('setTrashed()', () => {
        it('should dispatch actions (trash ticket)', () => {
            const date = moment('2017-08-11')
            store = mockStore({ ticket: initialState.set('id', 1) })
            mockServer
                .onPut(endpointMatchers.anyTicket)
                .reply(202, { data: {} })

            return store.dispatch(actions.setTrashed(date)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        it('should dispatch actions (untrash ticket)', () => {
            store = mockStore({
                ticket: initialState
                    .set('id', 1)
                    .set('trashed_datetime', moment.utc()),
            })
            mockServer
                .onPut(endpointMatchers.anyTicket)
                .reply(202, { data: {} })

            return store.dispatch(actions.setTrashed(null)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        it('should not dispatch actions (same status)', () => {
            store = mockStore({
                ticket: initialState.set('trashed_datetime', moment.utc()),
            })

            return store.dispatch(actions.setTrashed(moment.utc())).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should undo when clicking on notification button', () => {
            const date = moment('2017-08-11')
            store = mockStore({ ticket: initialState.set('id', 1) })
            mockServer
                .onPut(endpointMatchers.anyTicket)
                .reply(202, { data: {} })

            return store.dispatch(actions.setTrashed(date)).then(() => {
                const button = (
                    (notify as jest.MockedFunction<typeof notify>).mock
                        .calls[0][0]! as AlertNotification
                ).buttons?.[0] as unknown as {
                    onClick: () => Promise<void>
                }

                if (!button) {
                    throw new Error('property buttons is undefined')
                }
                return button.onClick().then(() => {
                    expect(dismissNotification).toHaveBeenNthCalledWith(
                        1,
                        'trash-1',
                    )
                    expect(store.getActions()).toMatchSnapshot()
                })
            })
        })
    })

    describe('snoozeTicket()', () => {
        it('should snooze ticket', () => {
            store = mockStore({
                ticket: initialState.set('snooze_datetime', null),
            })

            return store
                .dispatch(actions.snoozeTicket(moment('2017-12-21')))
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                })
        })

        it('should snooze ticket and call the callback', () => {
            const callbackSpy = jest.fn()
            store = mockStore({
                ticket: initialState.set('snooze_datetime', null),
            })

            return store
                .dispatch(
                    actions.snoozeTicket(moment('2017-12-21'), callbackSpy),
                )
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(callbackSpy).toHaveBeenCalled()
                })
        })
    })

    it('setAgent()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, { data: {} })
        return store
            .dispatch(
                actions.setAgent({
                    id: agents[0].id,
                    name: agents[0].name,
                    email: agents[0].email,
                    meta: {},
                }),
            )
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setTeam()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, { data: {} })
        return store
            .dispatch(
                actions.setTeam({
                    id: teams[0].id,
                    name: teams[0].name,
                }),
            )
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setCustomer()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, { data: {} })
        return store
            .dispatch(actions.setCustomer(fromJS({ id: 1, custom: true })))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setStatus()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, { data: {} })
        return store
            .dispatch(actions.setStatus('open'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setSubject()', () => {
        mockServer.onPut(endpointMatchers.anyTicket).reply(202, { data: {} })
        return store
            .dispatch(actions.setSubject('new title'))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('setPriority()', () => {
        store.dispatch(actions.setPriority('high'))
        expect(store.getActions()[0].args.get('priority')).toBe('high')
    })

    it('setPriority() with null', () => {
        store.dispatch(actions.setPriority(null))
        expect(store.getActions()[0].args.get('priority')).toBe(null)
    })

    it('deleteMessage()', () => {
        mockServer.onDelete('/api/tickets/1/messages/10/').reply(200)
        return store
            .dispatch(actions.deleteMessage(1, 10))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('deleteActionOnApplied()', () => {
        store.dispatch(actions.deleteActionOnApplied(0, 1))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('updateActionArgsOnApplied()', () => {
        store.dispatch(
            actions.updateActionArgsOnApplied(0, fromJS({ name: 'hello' }), 1),
        )
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('applyMacroAction()', () => {
        const action = fromJS({
            type: 'user',
            name: 'setResponseText',
            arguments: {
                contentState: {},
                selectionState: {},
            },
        })

        store = mockStore({ ticket: initialState.set('id', 1) })
        return expect(
            store.dispatch(actions.applyMacroAction(action)),
        ).toMatchSnapshot()
    })

    describe('applyMacro()', () => {
        const macro = fromJS({
            id: 1,
            actions: [
                {
                    type: 'user',
                    name: 'setResponseText',
                    arguments: {
                        contentState: {},
                        selectionState: {},
                    },
                },
                {
                    type: 'user',
                    name: 'addTags',
                    arguments: {
                        tags: 'refund, billing',
                    },
                },
                {
                    arguments: {
                        tags: '{{ticket.customer.integrations.magento2}}',
                    },
                },
            ],
        })

        it('dispatches actions', () => {
            store = mockStore({
                ticket: initialState.set('id', 1),
                currentUser: fromJS({ id: 1 }),
            })

            return store
                .dispatch(actions.applyMacro(macro, 1))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('notifies a warning', () => {
            void store.dispatch(actions.applyMacro(macro, 1))
            expect(notify).toBeCalledWith({
                type: NotificationStatus.Warning,
                title: 'This customer does not have any Magento2 information',
            })
        })
    })

    it('clearAppliedMacro()', () => {
        store.dispatch(actions.clearAppliedMacro(1))
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('fetchTicket()', () => {
        it('new ticket', () => {
            return store
                .dispatch(actions.fetchTicket('new'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('existing ticket', () => {
            mockServer
                .onGet(endpointMatchers.ticket1)
                .reply(200, { id: 1, messages: [], events: [] })
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({ id: 1 }),
            })
            return store
                .dispatch(
                    actions.fetchTicket('1', { isCurrentlyOnTicket: true }),
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('existing instagram ticket', () => {
            mockServer.onGet(endpointMatchers.ticket1).reply(200, {
                id: 1,
                messages: [{ source: { type: 'instagram-comment' } }],
                events: [],
            })
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({ id: 1 }),
            })
            return store
                .dispatch(
                    actions.fetchTicket('1', { isCurrentlyOnTicket: true }),
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should not dispatch new message when existing new message', () => {
            mockServer.onGet(endpointMatchers.ticket1).reply(200, {
                id: 1,
                messages: [{ source: { type: 'instagram-comment' } }],
                events: [],
            })
            store = mockStore({
                newMessage: newMessageState.mergeDeep({
                    newMessage: {
                        body_text: 'foo',
                    },
                }),
                ticket: initialState.set('id', 1),
                currentUser: fromJS({ id: 1 }),
            })
            return store
                .dispatch(actions.fetchTicket('1'))
                .then(() =>
                    expect(
                        store
                            .getActions()
                            .find(
                                (action: { type: string }) =>
                                    action.type ===
                                    'NEW_MESSAGE_FETCH_TICKET_SUCCESS',
                            ),
                    ).toBeUndefined(),
                )
        })

        it('should send ticket-viewed event when ticket is unread', () => {
            mockServer.onGet(endpointMatchers.ticket1).reply(200, {
                id: 1,
                messages: [],
                is_unread: true,
                events: [],
            })
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({ id: 1 }),
            })
            return store
                .dispatch(
                    actions.fetchTicket('1', { isCurrentlyOnTicket: true }),
                )
                .then(() => {
                    expect(socketManager.send).toHaveBeenCalledWith(
                        SocketEventType.TicketViewed,
                        1,
                    )
                    expect(store.getActions()).toMatchSnapshot()
                })
        })

        it('should not send ticket-viewed event when ticket is read', () => {
            mockServer.onGet(endpointMatchers.ticket1).reply(200, {
                id: 1,
                messages: [],
                is_unread: false,
                events: [],
            })
            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({ id: 1 }),
            })
            return store
                .dispatch(actions.fetchTicket('1'))
                .then(() => expect(socketManager.send).not.toHaveBeenCalled())
        })

        describe('should correctly handle redirects for merged tickets', () => {
            beforeEach(() => {
                mockServer.onGet(endpointMatchers.anyTicket).reply(200, {
                    id: 2,
                    uri: '/api/tickets/2/',
                    messages: [],
                })
            })

            it('should redirect to the merged ticket if the current URL is of the old (merged) ticket', () => {
                return store
                    .dispatch(
                        actions.fetchTicket('1', { isCurrentlyOnTicket: true }),
                    )
                    .finally(() => {
                        expect(history.push).toHaveBeenCalledWith(
                            '/app/ticket/2',
                        )
                    })
            })

            it('should NOT redirect if the current URL is NOT of the merged ticket', () => {
                return store.dispatch(actions.fetchTicket('99')).finally(() => {
                    expect(history.push).not.toHaveBeenCalledWith(
                        '/app/ticket/2',
                    )
                })
            })
        })

        it('should fetch and merge satisfaction survey events when ticket has a satisfaction survey', () => {
            const ticketWithSurvey = {
                id: 1,
                messages: [],
                events: [{ id: 1, type: 'ticket_created' }],
                satisfaction_survey: {
                    id: 456,
                },
            }

            const surveyEvents = [
                { id: 2, type: 'satisfaction_survey_responded' },
                { id: 3, type: 'satisfaction_survey_responded' },
            ]

            mockServer
                .onGet(endpointMatchers.ticket1)
                .reply(200, ticketWithSurvey)

            mockServer.onGet('/api/events/').replyOnce(200, {
                data: surveyEvents,
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                },
                object: 'list',
                uri: 'api/events',
            })

            store = mockStore({
                newMessage: newMessageState,
                ticket: initialState.set('id', 1),
                currentUser: fromJS({ id: 1 }),
            })

            return store
                .dispatch(
                    actions.fetchTicket('1', { isCurrentlyOnTicket: true }),
                )
                .then(() => {
                    expect(
                        (
                            store
                                .getActions()
                                .find(
                                    (action: { type: string }) =>
                                        action.type === 'FETCH_TICKET_SUCCESS',
                                ) as { response: Ticket }
                        ).response.events,
                    ).toEqual([
                        { id: 1, type: 'ticket_created' },
                        { id: 2, type: 'satisfaction_survey_responded' },
                        { id: 3, type: 'satisfaction_survey_responded' },
                    ])
                })
        })
    })

    describe('handleMessageError()', () => {
        it('should fetch the ticket because the user is currently on it and reopen the ticket', (done) => {
            mockServer
                .onGet(endpointMatchers.ticket1)
                .reply(200, { id: 1, messages: [], events: [] })
            mockServer
                .onPut(endpointMatchers.ticket1)
                .reply(200, { id: 1, messages: [], events: [] })
            const json = {
                ticket_id: '1',
                event: {
                    data: {
                        error: {
                            message: 'test handling message error',
                        },
                    },
                },
            } as unknown as TicketMessageFailedEvent

            void store.dispatch(actions.handleMessageError(json))
            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })

        it('should not fetch the ticket because the user is not currently on it and reopen the ticket', (done) => {
            mockServer
                .onPut(endpointMatchers.ticket2)
                .reply(200, { id: 2, messages: [] })

            const json = {
                ticket_id: 2,
                event: {
                    data: {
                        error: {
                            message: 'test handling message error',
                        },
                    },
                },
            } as unknown as TicketMessageFailedEvent

            void store.dispatch(actions.handleMessageError(json))
            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })
    })

    describe('handleMessageActionError()', () => {
        it('should fetch the ticket because the user is currently on it', () => {
            mockServer
                .onGet(endpointMatchers.ticket1)
                .reply(200, { id: 1, messages: [], events: [] })

            return store
                .dispatch(actions.handleMessageActionError('1'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should not fetch the ticket because the user is not currently on it', () => {
            mockServer
                .onGet(endpointMatchers.ticket2)
                .reply(200, { id: 2, messages: [], events: [] })

            return store
                .dispatch(actions.handleMessageActionError('2'))
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })
    })

    describe('updateTicketMessage()', () => {
        it('should update message successfully', () => {
            mockServer
                .onPut('/api/tickets/1/messages/10/')
                .reply(200, { id: 10 })
            return store
                .dispatch(
                    actions.updateTicketMessage('1', 10, {
                        id: 10,
                    } as TicketMessage),
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        it('should handle error when updating message', () => {
            mockServer
                .onPut('/api/tickets/1/messages/10/')
                .reply(400, { message: 'Bad request' })
            return store
                .dispatch(
                    actions.updateTicketMessage('1', 10, {
                        id: 10,
                    } as TicketMessage),
                )
                .then(() => expect(store.getActions()).toMatchSnapshot())
        })

        describe('retry action', () => {
            let invalidateQueriesSpy: jest.SpyInstance

            beforeEach(() => {
                invalidateQueriesSpy = jest.spyOn(
                    require('api/queryClient').appQueryClient,
                    'invalidateQueries',
                )
            })

            afterEach(() => {
                invalidateQueriesSpy.mockRestore()
            })

            it('should retry message and invalidate queries', () => {
                mockServer
                    .onPut('/api/tickets/1/messages/10/?action=retry')
                    .reply(200, { id: 10 })
                return store
                    .dispatch(
                        actions.updateTicketMessage(
                            '1',
                            10,
                            { id: 10 } as TicketMessage,
                            'retry',
                        ),
                    )
                    .then(() => {
                        expect(store.getActions()).toMatchSnapshot()
                        expect(invalidateQueriesSpy).toHaveBeenCalledTimes(3)
                    })
            })

            it('should invalidate specific ticket queries', () => {
                mockServer
                    .onPut('/api/tickets/123/messages/10/?action=retry')
                    .reply(200, { id: 10 })

                return store
                    .dispatch(
                        actions.updateTicketMessage(
                            '123',
                            10,
                            { id: 10 } as TicketMessage,
                            'retry',
                        ),
                    )
                    .then(() => {
                        // Verify specific query invalidations
                        expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(
                            1,
                            {
                                queryKey: expect.arrayContaining([
                                    'tickets',
                                    'getTicket',
                                    123,
                                ]),
                            },
                        )
                        expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(
                            2,
                            {
                                queryKey: ['tickets', 'listTickets'],
                            },
                        )
                        expect(invalidateQueriesSpy).toHaveBeenNthCalledWith(
                            3,
                            {
                                queryKey: ['tickets', 'ticket_ids'],
                                predicate: expect.any(Function),
                            },
                        )
                    })
            })

            it('should use predicate function to match ticket IDs in query invalidation', () => {
                mockServer
                    .onPut('/api/tickets/456/messages/10/?action=retry')
                    .reply(200, { id: 10 })

                return store
                    .dispatch(
                        actions.updateTicketMessage(
                            '456',
                            10,
                            { id: 10 } as TicketMessage,
                            'retry',
                        ),
                    )
                    .then(() => {
                        // Get the predicate function that was passed to invalidateQueries
                        const predicateCall =
                            invalidateQueriesSpy.mock.calls.find(
                                (call) => call[0].predicate,
                            )
                        expect(predicateCall).toBeDefined()

                        const predicate = predicateCall[0].predicate

                        // Test the predicate with various query key structures
                        // Should return true when ticket ID is found in array
                        expect(
                            predicate({
                                queryKey: [
                                    'tickets',
                                    'ticket_ids',
                                    [456, 789, 123],
                                ],
                            }),
                        ).toBe(true)

                        // Should return false when ticket ID is not found
                        expect(
                            predicate({
                                queryKey: ['tickets', 'ticket_ids', [789, 123]],
                            }),
                        ).toBe(false)

                        // Should return false when third element is not an array
                        expect(
                            predicate({
                                queryKey: [
                                    'tickets',
                                    'ticket_ids',
                                    'not-an-array',
                                ],
                            }),
                        ).toBe(false)

                        expect(
                            predicate({
                                queryKey: ['tickets', 'ticket_ids', null],
                            }),
                        ).toBe(false)

                        expect(
                            predicate({
                                queryKey: ['tickets', 'ticket_ids', undefined],
                            }),
                        ).toBe(false)

                        expect(
                            predicate({
                                queryKey: ['tickets', 'ticket_ids', 123],
                            }),
                        ).toBe(false)

                        // Should return false for empty array
                        expect(
                            predicate({
                                queryKey: ['tickets', 'ticket_ids', []],
                            }),
                        ).toBe(false)

                        // Should work with mixed types in array (numbers and nulls)
                        expect(
                            predicate({
                                queryKey: [
                                    'tickets',
                                    'ticket_ids',
                                    [456, null, undefined, 123],
                                ],
                            }),
                        ).toBe(true)

                        // Should handle string ticket IDs that convert to numbers
                        expect(
                            predicate({
                                queryKey: [
                                    'tickets',
                                    'ticket_ids',
                                    ['456', 789, 123],
                                ],
                            }),
                        ).toBe(false) // String '456' !== Number(456)
                    })
            })

            it('should work with numeric ticket ID input', () => {
                mockServer
                    .onPut('/api/tickets/789/messages/10/?action=retry')
                    .reply(200, { id: 10 })

                return store
                    .dispatch(
                        actions.updateTicketMessage(
                            789, // numeric input
                            10,
                            { id: 10 } as TicketMessage,
                            'retry',
                        ),
                    )
                    .then(() => {
                        const predicateCall =
                            invalidateQueriesSpy.mock.calls.find(
                                (call) => call[0].predicate,
                            )
                        const predicate = predicateCall[0].predicate

                        expect(
                            predicate({
                                queryKey: [
                                    'tickets',
                                    'ticket_ids',
                                    [456, 789, 123],
                                ],
                            }),
                        ).toBe(true)
                    })
            })

            it('should not invalidate queries when action is not retry', () => {
                mockServer
                    .onPut('/api/tickets/1/messages/10/?action=send')
                    .reply(200, { id: 10 })

                return store
                    .dispatch(
                        actions.updateTicketMessage(
                            '1',
                            10,
                            { id: 10 } as TicketMessage,
                            'send',
                        ),
                    )
                    .then(() => {
                        expect(invalidateQueriesSpy).not.toHaveBeenCalled()
                    })
            })

            it('should not invalidate queries when no action specified', () => {
                mockServer
                    .onPut('/api/tickets/1/messages/10/')
                    .reply(200, { id: 10 })

                return store
                    .dispatch(
                        actions.updateTicketMessage('1', 10, {
                            id: 10,
                        } as TicketMessage),
                    )
                    .then(() => {
                        expect(invalidateQueriesSpy).not.toHaveBeenCalled()
                    })
            })

            it('should not invalidate queries when retry action fails', () => {
                mockServer
                    .onPut('/api/tickets/1/messages/10/?action=retry')
                    .reply(400, { message: 'Retry failed' })

                return store
                    .dispatch(
                        actions.updateTicketMessage(
                            '1',
                            10,
                            { id: 10 } as TicketMessage,
                            'retry',
                        ),
                    )
                    .then(() => {
                        // Queries should not be invalidated on error
                        expect(invalidateQueriesSpy).not.toHaveBeenCalled()
                        expect(store.getActions()).toMatchSnapshot()
                    })
            })
        })
    })

    describe('updateTicketMessage() query invalidation predicate logic', () => {
        const createPredicateFunction = (ticketId: string | number) => {
            return (query: { queryKey: unknown[] }) => {
                const [, , ticketIds] = query.queryKey
                return (
                    Array.isArray(ticketIds) &&
                    ticketIds.includes(Number(ticketId))
                )
            }
        }

        it('should correctly validate ticket IDs array and inclusion logic', () => {
            const ticketId = '123'
            const predicate = createPredicateFunction(ticketId)

            expect(
                predicate({
                    queryKey: ['tickets', 'ticket_ids', [123, 456, 789]],
                }),
            ).toBe(true)

            expect(
                predicate({
                    queryKey: ['tickets', 'ticket_ids', ['123', 456, 789]],
                }),
            ).toBe(false)

            expect(
                predicate({
                    queryKey: ['tickets', 'ticket_ids', [456, 789]],
                }),
            ).toBe(false)

            expect(
                predicate({
                    queryKey: ['tickets', 'ticket_ids', 'not-an-array'],
                }),
            ).toBe(false)

            expect(
                predicate({
                    queryKey: ['tickets', 'ticket_ids', 123],
                }),
            ).toBe(false)

            expect(
                predicate({
                    queryKey: ['tickets', 'ticket_ids', null],
                }),
            ).toBe(false)

            expect(
                predicate({
                    queryKey: ['tickets', 'ticket_ids', undefined],
                }),
            ).toBe(false)

            expect(
                predicate({
                    queryKey: ['tickets', 'ticket_ids', []],
                }),
            ).toBe(false)

            expect(
                predicate({
                    queryKey: [
                        'tickets',
                        'ticket_ids',
                        [123, 456, null, undefined],
                    ],
                }),
            ).toBe(true)
        })

        it('should handle different ticket ID types correctly', () => {
            const numericPredicate = createPredicateFunction(456)
            expect(
                numericPredicate({
                    queryKey: ['tickets', 'ticket_ids', [123, 456, 789]],
                }),
            ).toBe(true)

            const stringPredicate = createPredicateFunction('789')
            expect(
                stringPredicate({
                    queryKey: ['tickets', 'ticket_ids', [123, 456, 789]],
                }),
            ).toBe(true)
        })
    })

    it('clearTicket()', () => {
        store.dispatch(actions.clearTicket())
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('deleteTicket()', () => {
        mockServer.onDelete('/api/tickets/13/').reply(200)
        return store
            .dispatch(actions.deleteTicket(13))
            .then(() => expect(store.getActions()).toMatchSnapshot())
    })

    it('deleteTicketPendingMessage()', () => {
        store.dispatch(actions.deleteTicketPendingMessage({ id: 1 } as any))
        return expect(store.getActions()).toMatchSnapshot()
    })

    describe('goToNextTicket()', () => {
        const defaultActiveView = { order_by: 'created_datetime' }
        it('should go to first view because there is no active view', (done) => {
            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should go to first view because active view is a customer view', (done) => {
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: {
                        ...defaultActiveView,
                        id: 1,
                        type: ViewType.CustomerList,
                    },
                }),
            })
            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should go to first view because active view is not ordered', (done) => {
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: {
                        id: 1,
                    },
                }),
            })

            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should fetch next ticket and go to the active view because there is no ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/1/next').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
            })

            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/tickets/1')
                done()
            })
        })

        it('should fetch next ticket and go to the search because there is no ticket', (done) => {
            mockServer.onPut('/api/views/0/tickets/1/next').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: { ...defaultActiveView, search: 'foo' },
                }),
            })

            void store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith({
                    pathname: '/app/tickets/search',
                    query: { q: 'foo' },
                })
                done()
            })
        })

        it('should fetch next ticket and go to this ticket', (done) => {
            const ticket = { id: 2, customerId: 1, messages: [], events: [] }
            mockServer
                .onPut('/api/views/1/tickets/1/next')
                .reply(200, _pick(ticket, ['id']))
            mockServer.onGet('/api/tickets/2').reply(200, ticket)

            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
            })

            const fetchTicketPromise = store.dispatch(actions.goToNextTicket(1))

            expect(store.getActions()).not.toEqual([])

            void fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/ticket/2')
                done()
            })
        })

        it(
            'should fetch next ticket and go to this ticket, and prepare new message correctly as the ticket is an ' +
                'instagram ticket',
            (done) => {
                const ticket = {
                    id: 2,
                    customerId: 1,
                    messages: [{ source: { type: 'instagram-comment' } }],
                    events: [],
                }
                mockServer
                    .onPut('/api/views/1/tickets/1/next')
                    .reply(200, _pick(ticket, ['id']))
                mockServer.onGet('/api/tickets/2').reply(200, ticket)

                store = mockStore({
                    ticket: initialState,
                    views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
                })

                const fetchTicketPromise = store.dispatch(
                    actions.goToNextTicket(1),
                )

                void fetchTicketPromise.then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(history.push).toHaveBeenCalledWith('/app/ticket/2')
                    done()
                })
            },
        )

        it('should fetch next ticket and wait for promise to be resolved to go to this ticket', (done) => {
            const ticket = { id: 2, messages: [], events: [] }
            mockServer
                .onPut('/api/views/1/tickets/1/next')
                .reply(200, _pick(ticket, ['id']))
            mockServer.onGet('/api/tickets/2').reply(200, ticket)

            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
            })

            const promise = Promise.resolve()
            const fetchTicketPromise = store.dispatch(
                actions.goToNextTicket(1, promise),
            )

            void fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/ticket/2')
                done()
            })
        })

        it('should send ticket-viewed event when ticket is unread', () => {
            const ticket = {
                id: 2,
                customerId: 1,
                messages: [],
                is_unread: true,
                events: [],
            }
            mockServer
                .onPut('/api/views/1/tickets/1/next')
                .reply(200, _pick(ticket, ['id']))
            mockServer.onGet('/api/tickets/2').reply(200, ticket)

            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
            })

            return store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(socketManager.send).toHaveBeenCalledWith(
                    SocketEventType.TicketViewed,
                    2,
                )
            })
        })

        it('should not send ticket-viewed event when ticket is read', () => {
            const ticket = {
                id: 2,
                customerId: 1,
                messages: [],
                is_unread: false,
                events: [],
            }
            mockServer
                .onPut('/api/views/1/tickets/1/next')
                .reply(200, _pick(ticket, ['id']))
            mockServer.onGet('/api/tickets/2').reply(200, ticket)

            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
            })

            return store.dispatch(actions.goToNextTicket(1)).then(() => {
                expect(socketManager.send).not.toHaveBeenCalled()
            })
        })
    })

    describe('goToPrevTicket()', () => {
        const defaultActiveView = { order_by: 'created_datetime' }

        it('should go to first view because there is no active view', (done) => {
            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should go to first view because active view is not ordered', (done) => {
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: {
                        id: 1,
                    },
                }),
            })

            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(history.push).toHaveBeenCalledWith('/app')
                done()
            })
        })

        it('should fetch previous ticket and go to the active view because there is no ticket', (done) => {
            mockServer.onPut('/api/views/1/tickets/2/prev').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
            })

            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/tickets/1')
                done()
            })
        })

        it('should fetch previous ticket and go to the search because there is no ticket', (done) => {
            mockServer.onPut('/api/views/0/tickets/2/prev').reply(200)
            store = mockStore({
                ticket: initialState,
                views: fromJS({
                    active: { ...defaultActiveView, search: 'foo' },
                }),
            })

            void store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith({
                    pathname: '/app/tickets/search',
                    query: { q: 'foo' },
                })
                done()
            })
        })

        it('should fetch previous ticket and go to this ticket', (done) => {
            const ticket = { id: 1, customerId: 1, messages: [], events: [] }
            mockServer
                .onPut('/api/views/1/tickets/2/prev')
                .reply(200, _pick(ticket, ['id']))
            mockServer.onGet('/api/tickets/1').reply(200, ticket)

            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
            })

            const fetchTicketPromise = store.dispatch(actions.goToPrevTicket(2))

            expect(store.getActions()).not.toEqual([])

            void fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/ticket/1')
                done()
            })
        })

        it(
            'should fetch previous ticket and go to this ticket, and prepare new message correctly as the ticket is ' +
                'an instagram ticket',
            (done) => {
                const ticket = {
                    id: 1,
                    customerId: 1,
                    messages: [{ source: { type: 'instagram-comment' } }],
                    events: [],
                }
                mockServer
                    .onPut('/api/views/1/tickets/2/prev')
                    .reply(200, _pick(ticket, ['id']))
                mockServer.onGet('/api/tickets/1').reply(200, ticket)

                store = mockStore({
                    ticket: initialState,
                    views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
                })

                const fetchTicketPromise = store.dispatch(
                    actions.goToPrevTicket(2),
                )

                expect(store.getActions()).not.toEqual([])

                void fetchTicketPromise.then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(history.push).toHaveBeenCalledWith('/app/ticket/1')
                    done()
                })
            },
        )

        it('should fetch previous ticket and wait for promise to be resolved to go to this ticket', (done) => {
            const ticket = { id: 1, messages: [], events: [] }
            mockServer
                .onPut('/api/views/1/tickets/2/prev')
                .reply(200, _pick(ticket, ['id']))
            mockServer.onGet('/api/tickets/1').reply(200, ticket)

            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
            })

            const promise = Promise.resolve()
            const fetchTicketPromise = store.dispatch(
                actions.goToPrevTicket(2, promise),
            )

            expect(store.getActions()).toEqual([])

            void fetchTicketPromise.then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(history.push).toHaveBeenCalledWith('/app/ticket/1')
                done()
            })
        })

        it('should send ticket-viewed event when ticket is unread', () => {
            const ticket = {
                id: 2,
                customerId: 1,
                messages: [],
                is_unread: true,
                events: [],
            }
            mockServer
                .onPut('/api/views/1/tickets/2/prev')
                .reply(200, _pick(ticket, ['id']))
            mockServer.onGet('/api/tickets/2').reply(200, ticket)

            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { ...defaultActiveView, id: 1 } }),
            })

            return store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(socketManager.send).toHaveBeenCalledWith(
                    SocketEventType.TicketViewed,
                    2,
                )
            })
        })

        it('should not send ticket-viewed event when ticket is read', () => {
            const ticket = {
                id: 2,
                customerId: 1,
                messages: [],
                is_unread: false,
                events: [],
            }
            mockServer
                .onPut('/api/views/1/tickets/2/prev')
                .reply(200, _pick(ticket, ['id']))
            mockServer.onGet('/api/tickets/2').reply(200, ticket)

            store = mockStore({
                ticket: initialState,
                views: fromJS({ active: { id: 1 } }),
            })

            return store.dispatch(actions.goToPrevTicket(2)).then(() => {
                expect(socketManager.send).not.toHaveBeenCalled()
            })
        })
    })

    describe('findAndSetCustomer()', () => {
        it('should not set the customer because we did not find any customer with this id', async () => {
            mockServer
                .onGet('/api/customers/1')
                .reply(404, { message: 'error' })
            store = mockStore({
                ticket: initialState,
            })

            return store.dispatch(actions.findAndSetCustomer(1)).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should set the customer because there is a customer matching this id', async () => {
            mockServer.onGet('/api/customers/1').reply(200, {
                data: { id: 1, name: 'foo', email: 'foo@gorgias.io' },
            })
            store = mockStore({
                ticket: initialState,
            })

            return store.dispatch(actions.findAndSetCustomer(1)).then(() => {
                expect(store.getActions()).toMatchSnapshot()
            })
        })
    })

    describe('displayAuditLogEvents()', () => {
        let mockServerGorgiasApi: MockAdapter
        const getEvent = (id: number): Event => ({
            id,
            user_id: 1,
            object_type: EventObjectType.Ticket,
            object_id: 1,
            data: null,
            context: 'foo',
            type: TICKET_EVENT_TYPES.TicketReopened,
            created_datetime: '2019-11-15 19:00:00.000000',
            uri: '/api/events/',
        })
        const getSurveyEvent = (id: number): Event => ({
            id,
            user_id: 1,
            object_type: EventObjectType.SatisfactionSurvey,
            object_id: 1,
            data: null,
            context: 'bar',
            type: SATISFACTION_SURVEY_EVENT_TYPES.SatisfactionSurveyResponded,
            created_datetime: '2019-11-15 19:00:00.000000',
            uri: '/api/events/',
        })

        beforeEach(() => {
            mockServerGorgiasApi = new MockAdapter(client)
        })

        it('should dispatch audit logs events, page per page', async () => {
            const ticketId = 123
            const surveyId = 456
            const path = '/api/events/'

            const ticketMocks: ApiListResponseCursorPagination<Event[]>[] = [
                {
                    data: [getEvent(1), getEvent(2)],
                    meta: {
                        next_cursor: 'ticket_page_2',
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: 'api/events',
                },
                {
                    data: [getEvent(3), getEvent(4)],
                    meta: {
                        next_cursor: null,
                        prev_cursor: 'ticket_page_1',
                        total_resources: null,
                    },
                    object: 'list',
                    uri: 'api/events',
                },
            ]

            const surveyMocks: ApiListResponseCursorPagination<Event[]>[] = [
                {
                    data: [getSurveyEvent(5), getSurveyEvent(6)],
                    meta: {
                        next_cursor: 'survey_page_2',
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: 'api/events',
                },
                {
                    data: [getSurveyEvent(7), getSurveyEvent(8)],
                    meta: {
                        next_cursor: null,
                        prev_cursor: 'survey_page_1',
                        total_resources: null,
                    },
                    object: 'list',
                    uri: 'api/events',
                },
            ]

            mockServerGorgiasApi
                .onGet(path, {
                    params: {
                        object_type: EventObjectType.Ticket,
                        object_id: ticketId,
                        limit: 30,
                    },
                })
                .replyOnce(200, ticketMocks[0])
                .onGet(path, {
                    params: {
                        object_type: EventObjectType.Ticket,
                        object_id: ticketId,
                        limit: 30,
                        cursor: 'ticket_page_2',
                    },
                })
                .replyOnce(200, ticketMocks[1])
                .onGet(path, {
                    params: {
                        object_type: EventObjectType.SatisfactionSurvey,
                        object_id: surveyId,
                        limit: 30,
                    },
                })
                .replyOnce(200, surveyMocks[0])
                .onGet(path, {
                    params: {
                        object_type: EventObjectType.SatisfactionSurvey,
                        object_id: surveyId,
                        limit: 30,
                        cursor: 'survey_page_2',
                    },
                })
                .replyOnce(200, surveyMocks[1])

            await store.dispatch(
                actions.displayAuditLogEvents(ticketId, surveyId),
            )
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should fetch un-scored satisfaction survey of ticket', async () => {
            const ticketId = 123
            const surveyId = 456
            const satisfactionSurveysPath = 'api/satisfaction-surveys/'
            const eventsPath = '/api/events/'

            const satisfactionSurveyMock: ListSatisfactionSurveys200 = {
                data: [
                    {
                        id: surveyId,
                        ticket_id: ticketId,
                        body_text: null,
                        customer_id: 5,
                        meta: null,
                        score: null,
                        scored_datetime: null,
                        sent_datetime: '2025-02-05T00:00:00+00:00',
                        should_send_datetime: '2025-02-05T00:00:00+00:00',
                        created_datetime: '2025-02-04T00:00:00+00:00',
                    },
                ],
                object: 'list',
                uri: '',
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            }

            const ticketMocks: ApiListResponseCursorPagination<Event[]>[] = [
                {
                    data: [],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: 'api/events',
                },
            ]

            const surveyMocks: ApiListResponseCursorPagination<Event[]>[] = [
                {
                    data: [getSurveyEvent(1), getSurveyEvent(2)],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: 'api/events',
                },
            ]

            mockServerGorgiasApi
                .onGet(satisfactionSurveysPath, {
                    params: {
                        ticket_id: ticketId,
                        limit: 1,
                    },
                })
                .replyOnce(200, satisfactionSurveyMock)
                .onGet(eventsPath, {
                    params: {
                        object_type: EventObjectType.Ticket,
                        object_id: ticketId,
                        limit: 30,
                    },
                })
                .replyOnce(200, ticketMocks[0])
                .onGet(eventsPath, {
                    params: {
                        object_type: EventObjectType.SatisfactionSurvey,
                        object_id: surveyId,
                        limit: 30,
                    },
                })
                .replyOnce(200, surveyMocks[0])

            await store.dispatch(
                actions.displayAuditLogEvents(ticketId, undefined),
            )
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should skip satisfaction survey events if there is no survey', async () => {
            const ticketId = 123
            const satisfactionSurveysPath = 'api/satisfaction-surveys/'
            const eventsPath = '/api/events/'

            const satisfactionSurveyMock: ListSatisfactionSurveys200 = {
                data: [],
                object: 'list',
                uri: '',
                meta: {
                    prev_cursor: null,
                    next_cursor: null,
                },
            }

            const ticketMocks: ApiListResponseCursorPagination<Event[]>[] = [
                {
                    data: [],
                    meta: {
                        next_cursor: null,
                        prev_cursor: null,
                        total_resources: null,
                    },
                    object: 'list',
                    uri: 'api/events',
                },
            ]

            mockServerGorgiasApi
                .onGet(satisfactionSurveysPath, {
                    params: {
                        ticket_id: ticketId,
                        limit: 1,
                    },
                })
                .replyOnce(200, satisfactionSurveyMock)
                .onGet(eventsPath, {
                    params: {
                        object_type: EventObjectType.Ticket,
                        object_id: ticketId,
                        limit: 30,
                    },
                })
                .replyOnce(200, ticketMocks[0])

            await store.dispatch(
                actions.displayAuditLogEvents(ticketId, undefined),
            )
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('hideAuditLogEvents()', () => {
        it('should dispatch REMOVE_TICKET_AUDIT_LOG_EVENTS action', () => {
            store.dispatch(actions.hideAuditLogEvents())
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('messageDeleted()', () => {
        it('should dispatch TICKET_MESSAGE_DELETED action', () => {
            store.dispatch(actions.messageDeleted('123' as any))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('setTypingActivityShopper()', () => {
        it('should dispatch SET_TYPING_ACTIVITY_SHOPPER action', () => {
            const mockTimeoutSpy = jest.spyOn(window, 'setTimeout')
            mockTimeoutSpy.mockReturnValueOnce(1 as unknown as NodeJS.Timeout)
            window.location.pathname = '/app/ticket/1'

            store.dispatch(actions.setTypingActivityShopper(1))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('updateCustomFieldState()', () => {
        it('should dispatch UPDATE_CUSTOM_FIELD_STATE action', () => {
            store.dispatch(
                actions.updateCustomFieldState({ id: 1, value: 'ok' }),
            )
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('updateCustomFieldValue()', () => {
        it('should dispatch UPDATE_CUSTOM_FIELD_VALUE action', () => {
            store.dispatch(actions.updateCustomFieldValue(1, 'ok'))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('updateCustomFieldError()', () => {
        it('should dispatch UPDATE_CUSTOM_FIELD_ERROR action', () => {
            store.dispatch(actions.updateCustomFieldError(1, true))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('triggerTicketFieldsErrors()', () => {
        it('should dispatch SET_INVALID_CUSTOM_FIELDS_TO_ERRORED and notify action', () => {
            store.dispatch(actions.triggerTicketFieldsErrors([1, 2, 3]))
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('restoreTicketDraft()', () => {
        it('should dispatch RESTORE_TICKET_DRAFT action', () => {
            const ticketDraft = {
                assignee_team: null,
                assignee_user: null,
                customer: null,
                subject: '',
                tags: [],
            }
            expect(actions.restoreTicketDraft(ticketDraft)).toMatchSnapshot()
        })
    })

    it('setHasAttemptedToCloseTicket', () => {
        store.dispatch(actions.setHasAttemptedToCloseTicket(true))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('setShouldDisplayAllFollowUps', () => {
        store.dispatch(actions.setShouldDisplayAllFollowUps(true))
        return expect(store.getActions()).toMatchSnapshot()
    })

    it('setShouldDisplayAllFollowUps with false', () => {
        store.dispatch(actions.setShouldDisplayAllFollowUps(false))
        return expect(store.getActions()).toMatchSnapshot()
    })
})
