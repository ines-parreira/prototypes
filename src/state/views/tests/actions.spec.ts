import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {fromJS, Map, List} from 'immutable'
import _range from 'lodash/range'

import {baseView, getExpirationTimeForCount} from 'config/views'
import socketManager from 'services/socketManager/socketManager'
import {ViewType, ViewVisibility} from 'models/view/types'
import * as socketConstants from 'config/socketConstants'
import {RootState, StoreDispatch} from 'state/types'
import client from 'models/api/resources'
import {JobType} from 'models/job/types'
import {MoveIndexDirection} from 'pages/common/utils/keyboard'
import {getAST} from 'utils'
import {SEARCH_ENDPOINT} from 'models/search/resources'

import {ViewNavDirection} from '../types'
import * as viewsSelectors from '../selectors'
import * as actions from '../actions'
import {initialState} from '../reducers'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('../../notifications/actions.ts', () => {
    return {
        notify: jest.fn((args: unknown) => () => ({payload: args})),
    }
})

jest.mock('reapop', () => {
    const reapop: Record<string, unknown> = require.requireActual('reapop')
    return {
        ...reapop,
        notify: jest.fn(() => (args: unknown) => args),
    }
})

const store = mockStore({
    views: initialState,
})
const mockServer = new MockAdapter(client)

beforeEach(() => {
    store.clearActions()
    mockServer.reset()
    jest.clearAllMocks()
})

describe('actions', () => {
    describe('fieldEnumSearch()', () => {
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

            mockServer.onPost(SEARCH_ENDPOINT).reply(200, response)

            const field = fromJS({filter: {type: 'customer'}})
            const query = 'foo'

            const res = await store.dispatch(
                actions.fieldEnumSearch(field, query)
            )
            expect(res).toMatchSnapshot()
        })

        it('should dispatch error', async () => {
            mockServer.onPost(SEARCH_ENDPOINT).reply(500)

            const field = fromJS({filter: {type: 'customer'}})
            const query = 'xyz'

            try {
                await store.dispatch(actions.fieldEnumSearch(field, query))
            } catch (e) {
                expect(e).toEqual(
                    new Error('Request failed with status code 500')
                )
            }
        })

        it('should reject when cancelled', async () => {
            mockServer.onPost(SEARCH_ENDPOINT).reply(200, {})
            const source = axios.CancelToken.source()
            source.cancel()

            await expect(
                store.dispatch(
                    actions.fieldEnumSearch(
                        fromJS({filter: {type: 'customer'}}),
                        'foo',
                        source.token
                    )
                )
            ).rejects.toEqual(new axios.Cancel())
        })
    })

    describe('fetchActiveViewTickets', () => {
        it('should not fetch (no active view)', () => {
            const store = mockStore({views: initialState})
            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(
                undefined
            )
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch (not on a view)', () => {
            window.location.pathname = '/app/ticket/12/'
            const store = mockStore({views: initialState})

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
                    type: ViewType.TicketList,
                })
            )
            const store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(
                undefined
            )
            expect(store.getActions()).toEqual([])
        })

        it('should not fetch tickets (already fetching tickets)', () => {
            window.location.pathname = '/app/tickets/12/'
            const state = initialState.mergeDeep(
                fromJS({
                    active: {id: 1, type: ViewType.TicketList},
                    _internal: {
                        loading: {
                            fetchList: true,
                        },
                    },
                })
            )
            const store = mockStore({views: state})

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
            const store = mockStore({views: state})

            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(
                undefined
            )
            expect(store.getActions()).toEqual([])
        })

        it('should fetch tickets', () => {
            const state = initialState.set(
                'active',
                fromJS({id: 1, type: ViewType.TicketList})
            )
            window.location.pathname = '/app/tickets/12/'

            const store = mockStore({views: state})
            expect(
                store.dispatch(actions.fetchActiveViewTickets())
            ).not.toEqual(undefined)
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('fetchRecentViewsCounts', () => {
        const _send = socketManager.send
        const sendSpy = jest.fn()
        beforeEach(() => {
            socketManager.send = sendSpy
        })

        afterAll(() => {
            socketManager.send = _send
        })

        it('should not fetch views counts (not on a ticket and not on a view)', () => {
            window.location.pathname = '/app/rules/'
            const store = mockStore({views: initialState})
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
            const store = mockStore({views: state})

            expect(store.dispatch(actions.fetchRecentViewsCounts())).toBe(
                undefined
            )
            expect(sendSpy.mock.calls.length).toEqual(0)
        })

        it('should fetch views counts', () => {
            window.location.pathname = '/app/tickets/1/'
            const counts = {
                1: 50,
                2: 300,
            }
            const recentViews = {
                1: {
                    updated_datetime: moment()
                        .utc()
                        .subtract(getExpirationTimeForCount(counts[1]) + 1, 's')
                        .toISOString(),
                },
                2: {updated_datetime: moment().utc().toISOString()},
            }
            const state = initialState.mergeDeep(
                fromJS({
                    counts,
                    active: {id: 1},
                    recent: recentViews,
                })
            )

            const store = mockStore({views: state})
            store.dispatch(actions.fetchRecentViewsCounts())
            expect(sendSpy).toHaveBeenNthCalledWith(
                1,
                socketConstants.VIEWS_COUNTS_EXPIRED,
                {viewIds: [1]}
            )
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
            const store = mockStore({views: state})
            expect(
                store.dispatch(actions.updateRecentViews([1]))
            ).toMatchSnapshot()
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('fetchViewItems', () => {
        const viewId = 1
        const filtersCode = "eq(ticket.channel, 'chat')"
        const view = {
            id: viewId,
            type: ViewType.TicketList,
            filters: filtersCode,
            filters_ast: getAST(filtersCode),
        }
        const baseReply = {
            data: [{id: 1}, {id: 2}],
            meta: {
                current_cursor: 123,
                prev_items: `/api/views/${viewId}/items?direction=${MoveIndexDirection.Prev}`,
                next_items: `/api/views/${viewId}/items?direction=${MoveIndexDirection.Next}`,
            },
        }

        it('should not fetch because there is no active view', () => {
            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should not fetch because the view is not dirty and this is a new view', () => {
            const store = mockStore({
                views: fromJS({
                    active: baseView().set('type', ViewType.TicketList),
                }),
            })

            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(store.getActions()).toEqual([])
            })
        })

        it('should fetch current page without cursor', () => {
            const store = mockStore({
                views: fromJS({
                    active: view,
                }),
            })

            mockServer
                .onGet(`/api/views/${viewId}/items/`)
                .reply(200, baseReply)

            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(mockServer.history).toMatchSnapshot()
            })
        })

        it('should fetch current page with cursor', () => {
            const cursor = '1234'
            const store = mockStore({
                views: fromJS({
                    active: view,
                }),
            })

            const url = `/api/views/${viewId}/items/?cursor=${cursor}`

            mockServer.onGet(url).reply(200, baseReply)

            return store
                .dispatch(actions.fetchViewItems(null, cursor))
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(mockServer.history).toMatchSnapshot()
                })
        })

        it('should fetch next page', () => {
            const nextPageUrl = `/api/views/${viewId}/items?direction=${MoveIndexDirection.Next}&cursor=123&ignored_item=7`
            const store = mockStore({
                views: fromJS({
                    active: view,
                    _internal: {
                        navigation: {
                            next_items: nextPageUrl,
                        },
                    },
                }),
            })

            mockServer.onGet(nextPageUrl).reply(200, baseReply)

            return store
                .dispatch(actions.fetchViewItems(ViewNavDirection.NextView))
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(mockServer.history).toMatchSnapshot()
                })
        })

        it('should fetch prev page', () => {
            const prevPageUrl = `/api/views/${viewId}/items?direction=${MoveIndexDirection.Prev}cursor=123&ignored_item=7`
            const store = mockStore({
                views: fromJS({
                    active: view,
                    _internal: {
                        navigation: {
                            prev_items: prevPageUrl,
                        },
                    },
                }),
            })

            mockServer.onGet(prevPageUrl).reply(200, baseReply)

            return store
                .dispatch(actions.fetchViewItems(ViewNavDirection.PrevView))
                .then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(mockServer.history).toMatchSnapshot()
                })
        })

        it('should pass the view because it is dirty', () => {
            const store = mockStore({
                views: fromJS({
                    active: {
                        ...view,
                        dirty: true,
                        editMode: false,
                    },
                }),
            })

            mockServer
                .onPut(`/api/views/${viewId}/items/`)
                .reply(200, baseReply)

            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(store.getActions()).toMatchSnapshot()
                expect(mockServer.history).toMatchSnapshot()
            })
        })

        it(
            'should not dispatch FETCH_LIST_VIEW_SUCCESS because the view for which we fetched items is not the ' +
                'current view',
            () => {
                const preRequestState = {
                    views: fromJS({
                        active: view,
                    }) as Map<any, any>,
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
                    expect(store.getActions()).toMatchSnapshot()
                    expect(mockServer.history).toMatchSnapshot()
                })
            }
        )

        it(
            'should not dispatch FETCH_LIST_VIEW_SUCCESS because this fetch was caused by the polling, and the user ' +
                'is not currently on the first page',
            () => {
                const store = mockStore({
                    views: fromJS({
                        active: view,
                        _internal: {
                            navigation: {
                                prev_items: `/api/views/1/items?direction=${MoveIndexDirection.Prev}`,
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
                        expect(store.getActions()).toMatchSnapshot()
                        expect(mockServer.history).toMatchSnapshot()
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
                            ...view,
                            filters: 'foo',
                        },
                    }) as Map<any, any>,
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
                    expect(store.getActions()).toMatchSnapshot()
                    expect(mockServer.history).toMatchSnapshot()
                })
            }
        )

        it('should not fetch because active view is deactivated', () => {
            const store = mockStore({
                views: fromJS({
                    active: baseView()
                        .set(
                            'deactivated_datetime',
                            '2020-06-15 22:56:32.708038'
                        )
                        .set('type', ViewType.TicketList),
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
                        ...view,
                        dirty: true,
                        editMode: false,
                    },
                }),
            })
            const source = axios.CancelToken.source()
            mockServer
                .onPut(`/api/views/${viewId}/items/`)
                .reply(200, baseReply)
            void store.dispatch(
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
        const viewId = 1

        it("should call the job API with the view id in it's params because the view is not dirty", () => {
            const store = mockStore()
            mockServer.onAny().reply(200)
            const view = fromJS({
                id: viewId,
                type: ViewType.TicketList,
                dirty: false,
            })
            const jobType = 'jobTypeValue'
            const jobPartialParams = {exampleVar: 'exampleValue'}

            return store
                .dispatch(
                    actions.createJob(
                        view,
                        jobType as unknown as JobType,
                        jobPartialParams
                    )
                )
                .then(() => {
                    expect(mockServer.history).toMatchSnapshot()
                })
        })

        it("should call the job API with the view JSON in it's params because the view is dirty", () => {
            const store = mockStore()
            mockServer.onAny().reply(200)
            const view = fromJS({
                id: viewId,
                type: ViewType.TicketList,
                dirty: true,
                editMode: true,
                allItemsSelected: true,
                slug: 'random view slug',
                filters: {},
            })
            const jobType = 'jobTypeValue'
            const jobPartialParams = {exampleVar: 'exampleValue'}

            return store
                .dispatch(
                    actions.createJob(
                        view,
                        jobType as unknown as JobType,
                        jobPartialParams
                    )
                )
                .then(() => {
                    expect(mockServer.history).toMatchSnapshot()
                })
        })
    })

    describe('deleteView()', () => {
        const view = fromJS({
            id: 1,
            type: ViewType.TicketList,
        }) as Map<any, any>

        beforeEach(() => {
            mockServer
                .onDelete(`/api/views/${view.get('id') as string}/`)
                .reply(() => [200, {}])
        })

        it('should prevent deletion of last view of same type', async () => {
            const views = initialState.set('items', fromJS([view]))
            const store = mockStore({views})

            await store.dispatch(actions.deleteView(view))

            expect(mockServer.history).toMatchSnapshot()
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should redirect to other view of same type when delete succeeds', async () => {
            const views = initialState.set(
                'items',
                fromJS([view, view.set('id', 2)])
            )
            const store = mockStore({views})

            await store.dispatch(actions.deleteView(view))

            expect(mockServer.history).toMatchSnapshot()
            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('deleteViewSuccess()', () => {
        const view = fromJS({
            id: 1,
            type: ViewType.TicketList,
        }) as Map<any, any>

        it('should redirect to other view of same type when view is active', () => {
            const views = initialState
                .set('items', fromJS([view, view.set('id', 2)]))
                .set('active', view)
            const store = mockStore({views})

            store.dispatch(actions.deleteViewSuccess(view.get('id')))

            expect(store.getActions()).toMatchSnapshot()
        })
    })

    describe('submitView()', () => {
        const currentUserId = 1
        const ticketChannelEqualChatFilter = 'eq(ticket.channel, "chat")'
        const view = fromJS({
            id: 0,
            type: ViewType.TicketList,
            name: 'My Tickets',
            shared_with_users: [currentUserId],
            visibility: ViewVisibility.Private,
            filters: ticketChannelEqualChatFilter,
            filters_ast: getAST(ticketChannelEqualChatFilter),
        }) as Map<any, any>

        it('should create view when id is 0', async () => {
            const mockServer = new MockAdapter(client)
                .onPost('/api/views/')
                .reply(() => [200, {id: 1, slug: 'my-tickets'}])

            const store = mockStore({
                views: initialState,
                currentUser: fromJS({id: 1}),
            })
            await store.dispatch(actions.submitView(view))

            expect(mockServer.history).toMatchSnapshot()
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should update view', async () => {
            const viewToUpdate = view.set('id', 99)
            const mockServer = new MockAdapter(client)
                .onPut('/api/views/99/')
                .reply(() => [
                    200,
                    viewToUpdate.toJS() as Record<string, unknown>,
                ])
            await store.dispatch(actions.submitView(viewToUpdate))
            expect(mockServer.history).toMatchSnapshot()
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should clean up the view before sending a creation call', async () => {
            const propsToRemove = {
                dirty: true,
                editMode: true,
                allItemsSelected: true,
                filters_ast: 'foo filters',
                search: 'foo search',
            }
            const viewToCreate = view.merge(propsToRemove)
            const mockServer = new MockAdapter(client)
                .onPost('/api/views/')
                .reply(() => [200, {id: 1, slug: 'my-tickets'}])

            await store.dispatch(actions.submitView(viewToCreate))

            const {post} = mockServer.history
            const viewSent = JSON.parse(post[0].data)
            for (const prop of Object.keys(propsToRemove)) {
                expect(viewSent).not.toHaveProperty(prop)
            }
        })

        it('should clean up the view before sending an update call', async () => {
            const propsToRemove = {
                dirty: true,
                editMode: true,
                allItemsSelected: true,
                visibility: ViewVisibility.Public,
                shared_with_teams: [1],
                shared_with_users: [1],
                filters_ast: 'foo filters',
                search: 'foo search',
            }
            const viewToUpdate = view.set('id', 1).merge(propsToRemove)
            const mockServer = new MockAdapter(client)
                .onPut('/api/views/99/')
                .reply(200)

            await store.dispatch(actions.submitView(viewToUpdate))

            const {put} = mockServer.history
            const viewSent = JSON.parse(put[0].data)
            for (const prop of Object.keys(propsToRemove)) {
                expect(viewSent).not.toHaveProperty(prop)
            }
        })
    })

    describe('fetchVisibleViewsCounts()', () => {
        jest.useFakeTimers()
        beforeEach(() => {
            socketManager.send = jest.fn()
            jest.spyOn(
                viewsSelectors,
                'getViewIdsOrderedByCollapsedSections'
            ).mockReturnValue(() => fromJS(_range(101)) as List<any>)
        })

        it('should fetch the views count', () => {
            const store = mockStore({
                views: initialState,
            })
            store.dispatch(actions.fetchVisibleViewsCounts())
            jest.runAllTimers()

            expect(socketManager.send).toHaveBeenCalledTimes(11)
        })
    })
})
