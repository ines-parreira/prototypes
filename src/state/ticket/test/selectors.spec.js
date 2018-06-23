import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map, List} from 'immutable'

import * as selectors from '../selectors'
import {initialState} from '../reducers'

jest.addMatchers(immutableMatchers)

describe('ticket selectors', () => {
    let state

    beforeEach(() => {
        state = {
            ticket: initialState
                .mergeDeep({
                    requester: {
                        customer: {id: 1},
                        integrations: {
                            '1': {name: 'integration 1'},
                            '2': {name: 'integration 2'}
                        },
                    },
                    messages: [ // deliberately not ordered
                        {
                            id: 2,
                            opened_datetime: '2017-07-29T22:00:00',
                            sent_datetime: '2017-07-29T21:01:00',
                            created_datetime: '2017-07-29T21:00:00',
                        },
                        { // last message
                            id: 3,
                            opened_datetime: null,
                            sent_datetime: '2017-07-31T21:01:00',
                            created_datetime: '2017-07-31T21:00:00',
                        },
                        { // first message
                            id: 1,
                            opened_datetime: '2017-07-25T22:00:00',
                            sent_datetime: '2017-07-25T21:01:00',
                            created_datetime: '2017-07-24T21:00:00',
                        },
                    ],
                    events: [ // deliberately not ordered
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
                            }
                        ]
                    },
                    state: {
                        dirty: false,
                    }
                })
        }
    })

    it('getTicketState', () => {
        expect(selectors.getTicketState(state)).toEqualImmutable(state.ticket)
        expect(selectors.getTicketState({})).toEqualImmutable(fromJS({}))
    })

    it('getLoading', () => {
        expect(selectors.getLoading(state)).toEqualImmutable(state.ticket.getIn(['_internal', 'loading']))
        expect(selectors.getLoading({})).toEqualImmutable(fromJS({}))
    })

    it('isLoading', () => {
        expect(selectors.isLoading('loader1')(state)).toBe(true)
        expect(selectors.isLoading('loader2')(state)).toBe(false)
        expect(selectors.isLoading('unknown')(state)).toBe(false)
    })

    it('getProperty', () => {
        const properties = state.ticket.keySeq()
        properties.forEach((property) => {
            expect(selectors.getProperty(property)(state)).toEqualImmutable(state.ticket.get(property))
        })
        expect(selectors.getProperty('unknown')(state)).toEqual(undefined)
    })

    it('getTicket', () => {
        const expected = state.ticket.delete('_internal').delete('state')
        expect(selectors.getTicket(state)).toEqualImmutable(expected)
        expect(selectors.getTicket({})).toEqualImmutable(fromJS({}))
    })

    it('getCustomer', () => {
        expect(selectors.getCustomer(state)).toEqualImmutable(state.ticket.getIn(['requester', 'customer']))
        expect(selectors.getCustomer({})).toEqualImmutable(fromJS({}))
    })

    it('getIntegrationsData', () => {
        expect(selectors.getIntegrationsData(state)).toEqualImmutable(state.ticket.getIn(['requester', 'integrations']))
        expect(selectors.getIntegrationsData({})).toEqualImmutable(fromJS({}))
    })

    it('getIntegrationDataByIntegrationId', () => {
        expect(selectors.getIntegrationDataByIntegrationId(1)(state)).toEqualImmutable(state.ticket.getIn(['requester', 'integrations', '1']))
        expect(selectors.getIntegrationDataByIntegrationId('1')(state)).toEqualImmutable(state.ticket.getIn(['requester', 'integrations', '1']))
        expect(selectors.getIntegrationDataByIntegrationId('unknown')(state)).toEqualImmutable(fromJS({}))
        expect(selectors.getIntegrationDataByIntegrationId('unknown')({})).toEqualImmutable(fromJS({}))
    })

    it('isDirty', () => {
        expect(selectors.isDirty(state)).toBe(false)
        expect(selectors.isDirty({})).toBe(false)

        const dirtyState = {
            ...state,
            ticket: state.ticket.setIn(['state', 'dirty'], true),
        }

        expect(selectors.isDirty(dirtyState)).toBe(true)
    })

    it('getMessages', () => {
        expect(selectors.getMessages(state)).toEqualImmutable(state.ticket.get('messages'))
        expect(selectors.getMessages({})).toEqualImmutable(fromJS([]))
    })

    it('getPendingMessages', () => {
        expect(selectors.getPendingMessages(state)).toEqualImmutable(state.ticket.getIn(['_internal', 'pendingMessages']))
        expect(selectors.getPendingMessages({})).toEqualImmutable(fromJS([]))
    })

    it('getLastMessage', () => {
        expect(selectors.getLastMessage({})).toEqualImmutable(fromJS({}))

        const lastMessage = selectors.getLastMessage(state)
        expect(lastMessage).toBeInstanceOf(Map)
        expect(lastMessage.get('id')).toBe(3)
        expect(lastMessage).toMatchSnapshot()
    })

    it('getReadMessages', () => {
        const expected = state.ticket.get('messages').delete(1)
        expect(selectors.getReadMessages(state)).toEqualImmutable(expected)
        expect(selectors.getReadMessages({})).toEqualImmutable(fromJS([]))
    })

    it('getLastReadMessage', () => {
        const expected = state.ticket.get('messages').first()
        expect(selectors.getLastReadMessage(state)).toEqualImmutable(expected)
        expect(selectors.getLastReadMessage({})).toEqualImmutable(fromJS({}))
    })

    it('getEvents', () => {
        const expected = state.ticket.get('events')
        expect(selectors.getEvents(state)).toEqualImmutable(expected)
        expect(selectors.getEvents({})).toEqualImmutable(fromJS([]))
    })

    it('getBody', () => {
        expect(selectors.getBody({})).toEqualImmutable(fromJS([]))

        const body = selectors.getBody(state)
        expect(body).toBeInstanceOf(List)
        expect(body.size).toBe(7)

        body.take(2).forEach((element) => {
            expect(element.get('isEvent')).toBe(true)
        })

        body.slice(2).forEach((element) => {
            expect(element.get('isMessage')).toBe(true)
        })

        expect(body.get(5).get('isPending')).toBe(false)
        expect(body.get(6).get('isPending')).toBe(true)
        expect(body).toMatchSnapshot()
    })
})
