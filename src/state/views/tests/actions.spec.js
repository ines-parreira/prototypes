import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios, {Cancel, CancelToken} from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import * as actions from '../actions'
import {initialState} from '../reducers'
import {
    ACTIVE_VIEW_COUNT_TIMEOUT,
    baseView,
    RECENT_VIEWS_COUNTS_TIMEOUT,
} from '../../../config/views'
import socketManager from '../../../services/socketManager'
import * as socketConstants from '../../../config/socketConstants'
import {
    NEXT_VIEW_NAV_DIRECTION,
    PREV_VIEW_NAV_DIRECTION,
    TICKET_LIST_VIEW_TYPE,
    ViewVisibility,
} from '../../../constants/view'

const mockStore = configureMockStore([thunk])

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn(() => (args) => args),
    }
})
jest.mock('reapop', () => {
    const reapop = require.requireActual('reapop')

    return {
        ...reapop,
        updateNotification: jest.fn(() => (args) => args),
    }
})

describe('actions', () => {
    let store

    describe('fieldEnumSearch()', () => {
        let mockServer

        beforeEach(() => {
            store = mockStore({views: initialState})
            mockServer = new MockAdapter(axios)
        })

        it('should dispatch results', async () => {
            const response = {
                data: [
                    {id: 1, name: 'Name 1', email: 'name1@foo.bar'},
                    {id: 2, name: 'Name 2', email: 'name2@foo.bar'},
                    {id: 3, name: 'Name 3', email: 'name3@foo.bar'},
                ],
                object: 'list',
                uri: '',
                meta: {},
            }

            mockServer.onPost('/api/search/').reply(200, response)

            const field = fromJS({filter: {type: 'customer'}})
            const query = 'foo'

            await store.dispatch(actions.fieldEnumSearch(field, query))
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should dispatch error', async () => {
            mockServer.onPost('/api/search/').reply(500)

            const field = fromJS({filter: {type: 'customer'}})
            const query = 'xyz'

            try {
                await store.dispatch(actions.fieldEnumSearch(field, query))
            } catch (e) {
                expect(store.getActions()).toMatchSnapshot()
            }
        })

        it('should reject when cancelled', async () => {
            mockServer.onPost('/api/search/').reply(200, {})
            const source = CancelToken.source()
            source.cancel()

            await expect(
                store.dispatch(
                    actions.fieldEnumSearch(
                        fromJS({filter: {type: 'customer'}}),
                        'foo',
                        source.token
                    )
                )
            ).rejects.toEqual(new Cancel())
        })
    })

    describe('fetchActiveViewTickets', () => {
        it('should not fetch (no active view)', () => {
            store = mockStore({views: initialState})
            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(
                undefined
            )
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch (not on a view)', () => {
            window.location.pathname = '/app/ticket/12/'
            store = mockStore({views: initialState})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(
                undefined
            )
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch tickets (editing view)', () => {
            window.location.pathname = '/app/tickets/12/'
            const state = initialState.set(
                'active',
                fromJS({
                    id: 1,
                    editMode: true,
                })
            )
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(
                undefined
            )
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch tickets (already fetching tickets)', () => {
            window.location.pathname = '/app/tickets/12/'
            const state = initialState.mergeDeep(
                fromJS({
                    active: {id: 1},
                    _internal: {
                        loading: {
                            fetchList: true,
                        },
                    },
                })
            )
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(
                undefined
            )
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch tickets (already fetching tickets)', () => {
            window.location.pathname = '/app/tickets/12/'
            const state = initialState.mergeDeep(
                fromJS({
                    active: {id: 1},
                    _internal: {
                        loading: {
                            fetchListDiscreet: true,
                        },
                    },
                })
            )
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(
                undefined
            )
            expect(store.getActions()).toEqual([])
        })

        it('should fetch tickets', () => {
            const state = initialState.set('active', fromJS({id: 1}))
            window.location.pathname = '/app/tickets/12/'

            store = mockStore({views: state})
            expect(
                store.dispatch(actions.fetchActiveViewTickets())
            ).not.toEqual(undefined)
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('fetchRecentViewsCounts', () => {
        const _send = socketManager.send
        let sendSpy = null
        beforeEach(() => {
            sendSpy = jest.fn()
            socketManager.send = sendSpy
        })

        afterAll(() => {
            socketManager.send = _send
        })

        it('should not fetch views counts (not on a ticket and not on a view)', () => {
            window.location.pathname = '/app/rules/'
            store = mockStore({views: initialState})
            expect(store.dispatch(actions.fetchRecentViewsCounts())).toBe(
                undefined
            )
            expect(sendSpy.mock.calls.length).toEqual(0)
        })

        it('should not fetch views counts (counts not expired)', () => {
            window.location.pathname = '/app/tickets/1/'
            const state = initialState.mergeDeep(
                fromJS({
                    active: {id: 1},
                    recent: {
                        2: {updated_datetime: moment.utc().toISOString()},
                    },
                })
            )
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchRecentViewsCounts())).toBe(
                undefined
            )
            expect(sendSpy.mock.calls.length).toEqual(0)
        })

        it('should not fetch views counts (active view count expired)', () => {
            window.location.pathname = '/app/tickets/1/'

            const expireAt = moment
                .utc()
                .subtract(RECENT_VIEWS_COUNTS_TIMEOUT + 1, 's')
                .toISOString()
            const state = initialState.mergeDeep(
                fromJS({
                    active: {id: 1},
                    recent: {
                        1: {updated_datetime: expireAt},
                    },
                })
            )

            store = mockStore({views: state})

            store.dispatch(actions.fetchRecentViewsCounts())
            expect(sendSpy.mock.calls.length).toEqual(0)
        })

        it('should fetch views counts (active view count expired)', () => {
            window.location.pathname = '/app/tickets/1/'

            const expiredDt = moment
                .utc()
                .subtract(RECENT_VIEWS_COUNTS_TIMEOUT + 1, 's')
                .toISOString()
            const state = initialState.mergeDeep(
                fromJS({
                    active: {id: 1},
                    recent: {
                        2: {updated_datetime: expiredDt},
                        3: {updated_datetime: expiredDt},
                        4: {updated_datetime: moment.utc().toISOString()},
                    },
                })
            )

            store = mockStore({views: state})
            store.dispatch(actions.fetchRecentViewsCounts())
            expect(sendSpy.mock.calls.length).toEqual(1)
            expect(sendSpy.mock.calls[0]).toEqual([
                socketConstants.VIEWS_COUNTS_EXPIRED,
                {viewIds: [2, 3]},
            ])
        })
    })

    describe('fetchActiveViewCount', () => {
        const _send = socketManager.send
        let sendSpy = null

        beforeEach(() => {
            sendSpy = jest.fn()
            socketManager.send = sendSpy
        })

        afterAll(() => {
            socketManager.send = _send
        })

        it('should not fetch views counts (not on a ticket)', () => {
            window.location.pathname = '/app/tickets/'
            store = mockStore({views: initialState})
            expect(store.dispatch(actions.fetchActiveViewCount())).toBe(
                undefined
            )
            expect(sendSpy.mock.calls.length).toEqual(0)
        })

        it('should not fetch views counts (counts not expired)', () => {
            window.location.pathname = '/app/ticket/1/'
            const state = initialState.mergeDeep(
                fromJS({
                    active: {id: 1},
                    recent: {
                        1: {updated_datetime: moment.utc().toISOString()},
                    },
                })
            )
            store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewCount())).toBe(
                undefined
            )
            expect(sendSpy.mock.calls.length).toEqual(0)
        })

        it('should fetch views counts', () => {
            window.location.pathname = '/app/ticket/1/'

            const expiredDt = moment
                .utc()
                .subtract(ACTIVE_VIEW_COUNT_TIMEOUT + 1, 's')
                .toISOString()
            const state = initialState.mergeDeep(
                fromJS({
                    active: {id: 1},
                    recent: {
                        1: {updated_datetime: expiredDt},
                    },
                })
            )

            store = mockStore({views: state})
            store.dispatch(actions.fetchActiveViewCount())
            expect(sendSpy.mock.calls.length).toEqual(1)
            expect(sendSpy.mock.calls[0]).toEqual([
                socketConstants.VIEWS_COUNTS_EXPIRED,
                {viewIds: [1]},
            ])
        })
    })

    describe('updateRecentViews', () => {
        it('should update updated datetime of recent views', () => {
            const state = initialState.mergeDeep(
                fromJS({
                    active: {id: 1},
                    recent: {
                        1: {},
                    },
                })
            )
            store = mockStore({views: state})
            expect(
                store.dispatch(actions.updateRecentViews([1]))
            ).toMatchSnapshot()
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('fetchViewItems', () => {
        let mockServer
        const viewId = 1
        let baseReply = {
            data: [{id: 1}, {id: 2}],
            meta: {
                current_cursor: 123,
                prev_items: `/api/views/${viewId}/items?direction=${PREV_VIEW_NAV_DIRECTION}`,
                next_items: `/api/views/${viewId}/items?direction=${NEXT_VIEW_NAV_DIRECTION}`,
            },
        }

        beforeEach(() => {
            mockServer = new MockAdapter(axios)
        })

        it('should not fetch because there is no active view', () => {
            const store = mockStore({views: fromJS()})

            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should not fetch because the view is not dirty and this is a new view', () => {
            const store = mockStore({
                views: fromJS({
                    active: baseView(),
                }),
            })

            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should fetch current page without cursor', () => {
            const store = mockStore({
                views: fromJS({
                    active: {id: viewId, type: TICKET_LIST_VIEW_TYPE},
                }),
            })

            mockServer
                .onGet(`/api/views/${viewId}/items/`)
                .reply(200, baseReply)

            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(mockServer.history.get.length).toBe(1)
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        it('should fetch current page with cursor', () => {
            const cursor = 1234
            const store = mockStore({
                views: fromJS({
                    active: {id: viewId, type: TICKET_LIST_VIEW_TYPE},
                }),
            })

            const url = `/api/views/${viewId}/items/?cursor=${cursor}`

            mockServer.onGet(url).reply(200, baseReply)

            return store
                .dispatch(actions.fetchViewItems(null, cursor))
                .then(() => {
                    expect(mockServer.history.get.length).toBe(1)
                    expect(mockServer.history.get[0].url).toEqual(url)
                    expect(store.getActions()).toMatchSnapshot()
                })
        })

        it('should fetch next page', () => {
            const nextPageUrl = `/api/views/${viewId}/items?direction=${NEXT_VIEW_NAV_DIRECTION}&cursor=123&ignored_item=7`
            const store = mockStore({
                views: fromJS({
                    active: {id: viewId, type: TICKET_LIST_VIEW_TYPE},
                    _internal: {
                        navigation: {
                            next_items: nextPageUrl,
                        },
                    },
                }),
            })

            mockServer.onGet(nextPageUrl).reply(200, baseReply)

            return store
                .dispatch(actions.fetchViewItems(NEXT_VIEW_NAV_DIRECTION))
                .then(() => {
                    expect(mockServer.history.get.length).toBe(1)
                    expect(mockServer.history.get[0].url).toEqual(nextPageUrl)
                    expect(store.getActions()).toMatchSnapshot()
                })
        })

        it('should fetch prev page', () => {
            const prevPageUrl = `/api/views/${viewId}/items?direction=${PREV_VIEW_NAV_DIRECTION}cursor=123&ignored_item=7`
            const store = mockStore({
                views: fromJS({
                    active: {id: viewId, type: TICKET_LIST_VIEW_TYPE},
                    _internal: {
                        navigation: {
                            prev_items: prevPageUrl,
                        },
                    },
                }),
            })

            mockServer.onGet(prevPageUrl).reply(200, baseReply)

            return store
                .dispatch(actions.fetchViewItems(PREV_VIEW_NAV_DIRECTION))
                .then(() => {
                    expect(mockServer.history.get.length).toBe(1)
                    expect(mockServer.history.get[0].url).toEqual(prevPageUrl)
                    expect(store.getActions()).toMatchSnapshot()
                })
        })

        it('should pass the view because it is dirty', () => {
            const store = mockStore({
                views: fromJS({
                    active: {
                        id: viewId,
                        dirty: true,
                        editMode: false,
                        type: TICKET_LIST_VIEW_TYPE,
                    },
                }),
            })

            mockServer
                .onPut(`/api/views/${viewId}/items/`)
                .reply(200, baseReply)

            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(mockServer.history.put.length).toBe(1)
                expect(mockServer.history.put[0].data).toEqual(
                    JSON.stringify({
                        view: {id: viewId, type: TICKET_LIST_VIEW_TYPE},
                    })
                )
                expect(store.getActions()).toMatchSnapshot()
            })
        })

        it(
            'should not dispatch FETCH_LIST_VIEW_SUCCESS because the view for which we fetched items is not the ' +
                'current view',
            () => {
                const preRequestState = {
                    views: fromJS({
                        active: {id: viewId, type: TICKET_LIST_VIEW_TYPE},
                    }),
                }

                const postRequestState = {
                    views: preRequestState.views.setIn(['active', 'id'], 2),
                }
                let hasRequestBeenCalled = false

                const store = mockStore(() =>
                    hasRequestBeenCalled ? postRequestState : preRequestState
                )

                mockServer.onGet(`/api/views/${viewId}/items/`).reply(() => {
                    hasRequestBeenCalled = true
                    return [200, baseReply]
                })

                return store.dispatch(actions.fetchViewItems()).then(() => {
                    expect(mockServer.history.get.length).toBe(1)
                    expect(store.getActions()).toMatchSnapshot()
                })
            }
        )

        it(
            'should not dispatch FETCH_LIST_VIEW_SUCCESS because this fetch was caused by the polling, and the user ' +
                'is not currently on the first page',
            () => {
                const store = mockStore({
                    views: fromJS({
                        active: {id: viewId, type: TICKET_LIST_VIEW_TYPE},
                        _internal: {
                            navigation: {
                                prev_items: `/api/views/1/items?direction=${PREV_VIEW_NAV_DIRECTION}`,
                            },
                        },
                    }),
                })

                mockServer
                    .onGet(`/api/views/${viewId}/items/`)
                    .reply(200, baseReply)

                return store
                    .dispatch(actions.fetchViewItems(null, null, true))
                    .then(() => {
                        expect(mockServer.history.get.length).toBe(1)
                        expect(store.getActions()).toMatchSnapshot()
                    })
            }
        )

        it(
            'should not dispatch FETCH_LIST_VIEW_SUCCESS because the filters of the view have changed since we ' +
                'started the request',
            () => {
                const preRequestState = {
                    views: fromJS({
                        active: {
                            id: viewId,
                            filters: 'foo',
                            type: TICKET_LIST_VIEW_TYPE,
                        },
                    }),
                }

                const postRequestState = {
                    views: preRequestState.views.setIn(
                        ['active', 'filters'],
                        'bar'
                    ),
                }
                let hasRequestBeenCalled = false

                const store = mockStore(() =>
                    hasRequestBeenCalled ? postRequestState : preRequestState
                )

                mockServer.onGet(`/api/views/${viewId}/items/`).reply(() => {
                    hasRequestBeenCalled = true
                    return [200, baseReply]
                })

                return store.dispatch(actions.fetchViewItems()).then(() => {
                    expect(mockServer.history.get.length).toBe(1)
                    expect(store.getActions()).toMatchSnapshot()
                })
            }
        )

        it('should not fetch because active view is deactivated', () => {
            const store = mockStore({
                views: fromJS({
                    active: baseView().set(
                        'deactivated_datetime',
                        '2020-06-15 22:56:32.708038'
                    ),
                }),
            })

            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should not dispatch results when cancelling the fetch', (done) => {
            const store = mockStore({
                views: fromJS({
                    active: {
                        id: viewId,
                        dirty: true,
                        editMode: false,
                        type: TICKET_LIST_VIEW_TYPE,
                    },
                }),
            })
            const source = CancelToken.source()
            mockServer
                .onPut(`/api/views/${viewId}/items/`)
                .reply(200, baseReply)
            store.dispatch(
                actions.fetchViewItems(null, null, null, source.token)
            )
            source.cancel()

            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })
    })

    describe('bulkUpdate()', () => {
        let mockServer
        const viewId = 1

        beforeEach(() => {
            mockServer = new MockAdapter(axios)
        })

        it("should call the job API with the view id in it's params because the view is not dirty", () => {
            const store = mockStore()
            mockServer.onAny().reply(200)
            const view = fromJS({
                id: viewId,
                dirty: false,
            })
            const jobType = 'jobTypeValue'
            const jobPartialParams = {exampleVar: 'exampleValue'}

            return store
                .dispatch(actions.createJob(view, jobType, jobPartialParams))
                .then(() => {
                    expect(mockServer.history).toMatchSnapshot()
                })
        })

        it("should call the job API with the view JSON in it's params because the view is dirty", () => {
            const store = mockStore()
            mockServer.onAny().reply(200)
            const view = fromJS({
                id: viewId,
                dirty: true,
                editMode: true,
                allItemsSelected: true,
                slug: 'random view slug',
                filters: {},
            })
            const jobType = 'jobTypeValue'
            const jobPartialParams = {exampleVar: 'exampleValue'}

            return store
                .dispatch(actions.createJob(view, jobType, jobPartialParams))
                .then(() => {
                    expect(mockServer.history).toMatchSnapshot()
                })
        })
    })

    describe('deleteView()', () => {
        let view
        let store
        let mockServer

        beforeEach(() => {
            view = fromJS({
                id: 1,
                type: 'ticket-list',
            })
            mockServer = new MockAdapter(axios)
            mockServer
                .onDelete(`/api/views/${view.get('id')}/`)
                .reply(() => [200, {}])
        })

        it('should prevent deletion of last view of same type', async () => {
            const views = initialState.set('items', fromJS([view]))
            store = mockStore({views})

            await store.dispatch(actions.deleteView(view))

            expect(mockServer.history).toMatchSnapshot()
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should redirect to other view of same type when delete succeeds', async () => {
            const views = initialState.set(
                'items',
                fromJS([view, view.set('id', 2)])
            )
            store = mockStore({views})

            await store.dispatch(actions.deleteView(view))

            expect(mockServer.history).toMatchSnapshot()
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('deleteViewSuccess()', () => {
        let view
        let store

        beforeEach(() => {
            view = fromJS({
                id: 1,
                type: TICKET_LIST_VIEW_TYPE,
            })
        })

        it('should redirect to other view of same type when view is active', async () => {
            const views = initialState
                .set('items', fromJS([view, view.set('id', 2)]))
                .set('active', view)
            store = mockStore({views})

            await store.dispatch(actions.deleteViewSuccess(view.get('id')))

            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('submitView()', () => {
        const view = fromJS({
            id: 0,
            type: TICKET_LIST_VIEW_TYPE,
            name: 'My Tickets',
        })

        it('should create view when id is 0', async () => {
            const mockServer = new MockAdapter(axios)
                .onPost('/api/views/')
                .reply(() => [200, {id: 1, slug: 'my-tickets'}])

            const store = mockStore({
                views: initialState,
                currentUser: fromJS({id: 1}),
            })
            const currentUserId = 1
            await store.dispatch(actions.submitView(view))

            expect(JSON.parse(mockServer.history.post[0].data)).toMatchObject({
                visibility: ViewVisibility.PRIVATE,
                shared_with_users: [currentUserId],
                display_order: null,
                type: TICKET_LIST_VIEW_TYPE,
                name: 'My Tickets',
            })

            expect(store.getActions()).toMatchSnapshot()
        })
    })
})
