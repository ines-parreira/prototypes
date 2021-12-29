import MockAdapter from 'axios-mock-adapter'
import thunk from 'redux-thunk'
import configureMockStore, {MockStoreEnhanced} from 'redux-mock-store'
import {fromJS} from 'immutable'

import {
    BASE_VIEW_ID,
    NEXT_VIEW_NAV_DIRECTION,
    PREV_VIEW_NAV_DIRECTION,
} from '../../../constants/view'
import client from '../../../models/api/resources'
import {Ticket} from '../../../models/ticket/types'
import {StoreDispatch} from '../../types'
import {mergeTickets, searchTickets} from '../actions'

type MockedRootState = Record<string, unknown>
const middlewares = [thunk]
const mockStore = configureMockStore<MockedRootState, StoreDispatch>(
    middlewares
)

// mock Math.random used for `reapop` notifications
global.Math.random = jest.fn(() => 0.123456789)

describe('mergeTickets actions', () => {
    let store: MockStoreEnhanced<MockedRootState, StoreDispatch>
    let mockServer: MockAdapter

    beforeEach(() => {
        store = mockStore({})
        mockServer = new MockAdapter(client)
    })

    describe('search', () => {
        it('should search the tickets of the customer because we passed a customer id', () => {
            mockServer
                .onPut(`/api/views/${BASE_VIEW_ID}/items/`)
                .reply((data) => {
                    expect(data.data).toMatchSnapshot()
                    return [200, [1, 2, 3]]
                })

            return store
                .dispatch(searchTickets('', 1, 118, null, fromJS({})))
                .then((data) => {
                    expect(data).toMatchSnapshot()
                })
        })

        it('should search the tickets using the search query because we did not pass a customer id', () => {
            mockServer
                .onPut(`/api/views/${BASE_VIEW_ID}/items/`)
                .reply((data) => {
                    expect(data.data).toMatchSnapshot()
                    return [200, [1, 2, 3]]
                })

            return store
                .dispatch(searchTickets('foo', 1, null, null, fromJS({})))
                .then((data) => {
                    expect(data).toMatchSnapshot()
                })
        })

        it('should dispatch an error notification if the search failed', () => {
            mockServer
                .onPut(`/api/views/${BASE_VIEW_ID}/items/`)
                .reply(500, {error: 'this does not work'})

            return store
                .dispatch(searchTickets('foo', 1, null, null, fromJS({})))
                .then(
                    () => null,
                    () => {
                        expect(store.getActions()).toMatchSnapshot()
                    }
                )
        })

        it('should search the tickets using the next url because we passed direction = next', () => {
            const url = 'some-url.com/foo'
            mockServer.onPut(url).reply((data) => {
                expect(data.data).toMatchSnapshot()
                return [200, [1, 2, 3]]
            })

            return store
                .dispatch(
                    searchTickets(
                        '',
                        1,
                        null,
                        NEXT_VIEW_NAV_DIRECTION,
                        fromJS({next_items: url})
                    )
                )
                .then((data) => {
                    expect(data).toMatchSnapshot()
                })
        })

        it('should search the tickets using the previous url because we passed direction = prev', () => {
            const url = 'some-url.com/foo'
            mockServer.onPut(url).reply((data) => {
                expect(data.data).toMatchSnapshot()
                return [200, [1, 2, 3]]
            })

            return store
                .dispatch(
                    searchTickets(
                        '',
                        1,
                        null,
                        PREV_VIEW_NAV_DIRECTION,
                        fromJS({prev_items: url})
                    )
                )
                .then((data) => {
                    expect(data).toMatchSnapshot()
                })
        })
    })

    describe('mergeTickets', () => {
        it(
            'should dispatch a success notification and resolve the promise with the new ticket ' +
                'because the merge succeeded',
            () => {
                const sourceTicketId = 1
                const targetTicketId = 2
                const subject = 'new ticket!'

                mockServer
                    .onPut(
                        `/api/tickets/merge?target_id=${targetTicketId}&source_id=${sourceTicketId}`
                    )
                    .reply(200, {
                        id: 2,
                        subject,
                    })

                return store
                    .dispatch(
                        mergeTickets(sourceTicketId, targetTicketId, {
                            subject,
                        } as Ticket)
                    )
                    .then((data) => {
                        expect(store.getActions()).toMatchSnapshot()
                        expect(data).toMatchSnapshot()
                    })
            }
        )

        it(
            'should dispatch an error notification and reject the promise with the error message ' +
                'because the merge failed',
            () => {
                const sourceTicketId = 1
                const targetTicketId = 2
                const subject = 'new ticket!'

                mockServer
                    .onPut(
                        `/api/tickets/merge?target_id=${targetTicketId}&source_id=${sourceTicketId}`
                    )
                    .reply(500, {
                        error: 'this does not work',
                    })

                return store
                    .dispatch(
                        mergeTickets(sourceTicketId, targetTicketId, {
                            subject,
                        } as Ticket)
                    )
                    .then(
                        () => null,
                        (data) => {
                            expect(store.getActions()).toMatchSnapshot()
                            expect(data).toMatchSnapshot()
                        }
                    )
            }
        )
    })
})
