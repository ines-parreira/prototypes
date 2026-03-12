import { assumeMock } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _range from 'lodash/range'
import moment from 'moment'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { JobType } from '@gorgias/helpdesk-queries'

import { baseView, getExpirationTimeForCount } from 'config/views'
import { customer } from 'fixtures/customer'
import { mockSearchRank } from 'fixtures/searchRank'
import { ticket } from 'fixtures/ticket'
import client from 'models/api/resources'
import { OrderDirection } from 'models/api/types'
import {
    searchCustomers,
    searchCustomersWithHighlights,
} from 'models/customer/resources'
import { SEARCH_ENDPOINT } from 'models/search/resources'
import {
    CUSTOMER_SEARCH_ORDERING,
    TicketSearchSortableProperties,
} from 'models/search/types'
import {
    searchTickets,
    searchTicketsWithHighlights,
} from 'models/ticket/resources'
import { ViewType, ViewVisibility } from 'models/view/types'
import { MoveIndexDirection } from 'pages/common/utils/keyboard'
import socketManager from 'services/socketManager/socketManager'
import { SocketEventType } from 'services/socketManager/types'
import type { RootState, StoreDispatch } from 'state/types'
import * as actions from 'state/views/actions'
import {
    FETCH_LIST_VIEW_START,
    FETCH_LIST_VIEW_SUCCESS,
} from 'state/views/constants'
import * as types from 'state/views/constants'
import { initialState } from 'state/views/reducers'
import * as viewsSelectors from 'state/views/selectors'
import { ViewNavDirection } from 'state/views/types'
import { Cancel, CancelToken } from 'tests/axiosRuntime'
import { getAST } from 'utils'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('state/notifications/actions.ts', () => {
    return {
        notify: jest.fn((args: unknown) => () => ({ payload: args })),
    }
})

jest.mock('reapop', () => {
    const reapop: Record<string, unknown> = jest.requireActual('reapop')
    return {
        ...reapop,
        notify: jest.fn(() => (args: unknown) => args),
    }
})

jest.mock('models/ticket/resources')
const searchTicketsMock = searchTickets as jest.Mock
const searchTicketsWithHighlightsMock = assumeMock(searchTicketsWithHighlights)

jest.mock('models/customer/resources')
const searchCustomersMock = searchCustomers as jest.Mock
const searchCustomersWithHighlightsMock = assumeMock(
    searchCustomersWithHighlights,
)

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

const store = mockStore({
    views: initialState,
})
const mockServer = new MockAdapter(client)

let dateNowSpy: jest.SpiedFunction<typeof Date.now>
const defaultDateNowValue = 1487076708000

beforeEach(() => {
    store.clearActions()
    mockServer.reset()
    dateNowSpy = jest
        .spyOn(Date, 'now')
        .mockImplementation(() => defaultDateNowValue)
    variationMock.mockImplementation(() => false)
    searchTicketsMock.mockResolvedValue({
        data: {
            data: [ticket],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
        },
    })
    searchTicketsWithHighlightsMock.mockResolvedValue({
        data: {
            data: [{ ...ticket, highlights: {} }],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
        },
    } as any)
    searchCustomersMock.mockResolvedValue({
        data: {
            data: [customer],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
        },
    })
    searchCustomersWithHighlightsMock.mockResolvedValue({
        data: {
            data: [{ ...customer, highlights: {} }],
            meta: {
                next_cursor: null,
                prev_cursor: null,
            },
        },
    } as any)
})

afterEach(() => {
    dateNowSpy.mockRestore()
})

describe('actions', () => {
    const view = {
        id: 1,
        type: ViewType.TicketList,
        filters: 'eq(ticket.channel, "chat")',
        filters_ast: getAST('eq(ticket.channel, "chat")'),
    }

    describe('fieldEnumSearch()', () => {
        it('should dispatch results', async () => {
            const response = {
                data: [
                    { id: 1, name: 'Name 1', email: 'name1@foo.bar' },
                    { id: 2, name: 'Name 2', email: 'name2@foo.bar' },
                    { id: 3, name: 'Name 3', email: 'name3@foo.bar' },
                ],
                object: 'list',
                uri: '',
                meta: {},
            }

            mockServer.onPost(SEARCH_ENDPOINT).reply(200, response)

            const field = fromJS({ filter: { type: 'customer' } })
            const query = 'foo'

            const res = await store.dispatch(
                actions.fieldEnumSearch(field, query),
            )
            expect(res).toMatchSnapshot()
        })

        it('should dispatch error', async () => {
            mockServer.onPost(SEARCH_ENDPOINT).reply(500)

            const field = fromJS({ filter: { type: 'customer' } })
            const query = 'xyz'

            try {
                await store.dispatch(actions.fieldEnumSearch(field, query))
            } catch (e) {
                expect(e).toEqual(
                    new Error('Request failed with status code 500'),
                )
            }
        })

        it('should reject when cancelled', async () => {
            mockServer.onPost(SEARCH_ENDPOINT).reply(200, {})
            const source = CancelToken.source()
            source.cancel()

            await expect(
                store.dispatch(
                    actions.fieldEnumSearch(
                        fromJS({ filter: { type: 'customer' } }),
                        'foo',
                        source.token,
                    ),
                ),
            ).rejects.toEqual(new Cancel())
        })
    })

    describe('fetchActiveViewTickets', () => {
        const shouldFetchActiveViewTicketsMock = jest.spyOn(
            viewsSelectors,
            'shouldFetchActiveViewTickets',
        )
        beforeEach(() => {
            shouldFetchActiveViewTicketsMock.mockReturnValue(false)
        })
        it('should not fetch (no active view)', () => {
            expect(store.dispatch(actions.fetchActiveViewTickets())).toBe(
                undefined,
            )
            expect(store.getActions()).toEqual([])
        })

        it('should fetch tickets', async () => {
            shouldFetchActiveViewTicketsMock.mockReturnValue(true)
            const state = initialState.set(
                'active',
                fromJS({ id: 1, type: ViewType.TicketList }),
            )

            const store = mockStore({ views: state })
            expect(
                store.dispatch(actions.fetchActiveViewTickets()),
            ).not.toEqual(undefined)

            await waitFor(() => {
                expect(store.getActions()).toMatchObject([
                    {
                        discreet: true,
                        type: FETCH_LIST_VIEW_START,
                        viewId: 1,
                    },
                ])
            })
        })

        it('should include orderBy params when view is dirty', () => {
            shouldFetchActiveViewTicketsMock.mockReturnValue(true)
            const viewOrderBy = 'created_datetime'
            const viewOrderDir = OrderDirection.Desc
            const store = mockStore({
                views: fromJS({
                    active: {
                        ...view,
                        dirty: true,
                        order_by: viewOrderBy,
                        order_dir: viewOrderDir,
                    },
                }),
            })

            store.dispatch(actions.fetchActiveViewTickets())
            expect(mockServer.history.get[0].params.order_by).toEqual(
                `${viewOrderBy}:${viewOrderDir}`,
            )
        })

        it('should not include orderBy params when view is not dirty', () => {
            shouldFetchActiveViewTicketsMock.mockReturnValue(true)
            const viewOrderBy = 'created_datetime'
            const viewOrderDir = OrderDirection.Desc
            const store = mockStore({
                views: fromJS({
                    active: {
                        ...view,
                        dirty: false,
                        order_by: viewOrderBy,
                        order_dir: viewOrderDir,
                    },
                }),
            })

            store.dispatch(actions.fetchActiveViewTickets())
            expect(mockServer.history.get[0].params).toBeUndefined()
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
            const store = mockStore({ views: initialState })
            expect(store.dispatch(actions.fetchRecentViewsCounts())).toBe(
                undefined,
            )
            expect(sendSpy.mock.calls.length).toEqual(0)
        })

        it('should not fetch views counts (counts not expired)', () => {
            window.location.pathname = '/app/tickets/1/'
            const state = initialState.mergeDeep(
                fromJS({
                    active: { id: 1 },
                    recent: {
                        2: { updated_datetime: moment.utc().toISOString() },
                    },
                }),
            )
            const store = mockStore({ views: state })

            expect(store.dispatch(actions.fetchRecentViewsCounts())).toBe(
                undefined,
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
                2: { updated_datetime: moment().utc().toISOString() },
            }
            const state = initialState.mergeDeep(
                fromJS({
                    counts,
                    active: { id: 1 },
                    recent: recentViews,
                }),
            )

            const store = mockStore({ views: state })
            store.dispatch(actions.fetchRecentViewsCounts())
            expect(sendSpy).toHaveBeenNthCalledWith(
                1,
                SocketEventType.ViewsCountExpired,
                { viewIds: [1] },
            )
        })
    })

    describe('updateRecentViews', () => {
        it('should update updated datetime of recent views', () => {
            const state = initialState.mergeDeep(
                fromJS({
                    active: { id: 1 },
                    recent: {
                        1: {},
                    },
                }),
            )
            const store = mockStore({ views: state })
            expect(
                store.dispatch(actions.updateRecentViews([1])),
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
            data: [{ id: 1 }, { id: 2 }],
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
                    expect(store.getActions()).toContainEqual({
                        type: FETCH_LIST_VIEW_SUCCESS,
                        viewType: view.type,
                        fetched: expect.objectContaining({
                            data: baseReply.data,
                            meta: baseReply.meta,
                        }),
                    })
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

        it('should use the elasticsearch endpoint while the view is dirty and in edit mode', () => {
            const store = mockStore({
                views: fromJS({
                    active: {
                        ...view,
                        dirty: true,
                        editMode: true,
                    },
                }),
            })

            return store
                .dispatch(
                    actions.fetchViewItems(null, null, null, null, {
                        orderBy: 'closed_datetime:asc',
                    }),
                )
                .then(() => {
                    expect(
                        searchTicketsWithHighlightsMock,
                    ).toHaveBeenCalledWith({
                        filters: "eq(ticket.channel, 'chat')",
                        search: '',
                        orderBy: 'closed_datetime:asc',
                    })
                })
        })

        it.each([
            [
                'current cursor',
                {
                    expected: 'current_cursor',
                    direction: null,
                    cursor: 'current_cursor',
                },
            ],
            [
                'next cursor',
                {
                    expected: 'next_cursor',
                    direction: ViewNavDirection.NextView,
                    cursor: null,
                },
            ],
            [
                'previous cursor',
                {
                    expected: 'prev_cursor',
                    direction: ViewNavDirection.PrevView,
                    cursor: null,
                },
            ],
        ])(
            'should set the %s of the requested direction when using elasticsearch ticket endpoint',
            async (_, args) => {
                const cancelToken = CancelToken.source().token

                const store = mockStore({
                    views: fromJS({
                        active: {
                            ...view,
                            dirty: true,
                            editMode: true,
                        },
                        _internal: {
                            navigation: {
                                next_cursor: 'next_cursor',
                                prev_cursor: 'prev_cursor',
                            },
                        },
                    }),
                })

                return store
                    .dispatch(
                        actions.fetchViewItems(
                            args.direction,
                            args.cursor,
                            null,
                            null,
                            undefined,
                            cancelToken,
                        ),
                    )
                    .then(() => {
                        expect(
                            searchTicketsWithHighlightsMock,
                        ).toHaveBeenCalledWith({
                            filters: "eq(ticket.channel, 'chat')",
                            search: '',
                            orderBy: 'last_message_datetime:desc',
                            cancelToken,
                            cursor: args.expected,
                        })
                    })
            },
        )

        it('should pass the view because it is dirty and in edit mode', () => {
            const store = mockStore({
                views: fromJS({
                    active: {
                        ...view,
                        dirty: true,
                        editMode: true,
                    },
                }),
            })

            return store.dispatch(actions.fetchViewItems()).then(() => {
                expect(store.getActions()).toContainEqual({
                    type: types.FETCH_LIST_VIEW_START,
                    viewId,
                    discreet: false,
                })
                expect(searchTicketsWithHighlightsMock).toHaveBeenCalledWith({
                    cancelToken: undefined,
                    cursor: undefined,
                    filters: view.filters,
                    orderBy: 'last_message_datetime:desc',
                    search: '',
                })
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
                    hasRequestBeenCalled ? postRequestState : preRequestState,
                )

                mockServer.onGet(`/api/views/${viewId}/items/`).reply(() => {
                    hasRequestBeenCalled = true
                    return [200, baseReply]
                })

                return store.dispatch(actions.fetchViewItems()).then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(mockServer.history).toMatchSnapshot()
                })
            },
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
            },
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
                        'bar',
                    ),
                }
                let hasRequestBeenCalled = false

                const store = mockStore(() =>
                    hasRequestBeenCalled ? postRequestState : preRequestState,
                )

                mockServer.onGet(`/api/views/${viewId}/items/`).reply(() => {
                    hasRequestBeenCalled = true
                    return [200, baseReply]
                })

                return store.dispatch(actions.fetchViewItems()).then(() => {
                    expect(store.getActions()).toMatchSnapshot()
                    expect(mockServer.history).toMatchSnapshot()
                })
            },
        )

        it('should not fetch because active view is deactivated', () => {
            const store = mockStore({
                views: fromJS({
                    active: baseView()
                        .set(
                            'deactivated_datetime',
                            '2020-06-15 22:56:32.708038',
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
                        dirty: false,
                        editMode: false,
                    },
                }),
            })
            const source = CancelToken.source()
            mockServer
                .onPut(`/api/views/${viewId}/items/`)
                .reply(200, baseReply)
            void store.dispatch(
                actions.fetchViewItems(
                    null,
                    null,
                    null,
                    null,
                    undefined,
                    source.token,
                ),
            )
            source.cancel()

            setImmediate(() => {
                expect(store.getActions()).toMatchSnapshot()
                done()
            })
        })

        it('should end the search rank scenario', async () => {
            const store = mockStore({
                views: fromJS({
                    active: view,
                }),
            })

            mockServer
                .onGet(`/api/views/${viewId}/items/`)
                .reply(200, baseReply)

            await store.dispatch(
                actions.fetchViewItems(null, null, null, mockSearchRank),
            )

            expect(mockSearchRank.endScenario).toHaveBeenLastCalledWith()
        })

        it('should register the rank scenario request and response', async () => {
            const store = mockStore({
                views: fromJS({
                    active: view,
                }),
            })

            mockServer
                .onGet(`/api/views/${viewId}/items/`)
                .reply(200, baseReply)

            await store.dispatch(
                actions.fetchViewItems(null, null, null, mockSearchRank),
            )

            expect(mockSearchRank.registerResultsRequest).toMatchSnapshot()
            expect(mockSearchRank.registerResultsResponse).toMatchSnapshot()
        })

        it.each<[string, Parameters<typeof actions.fetchViewItems>]>([
            [
                'fetching next page',
                [ViewNavDirection.NextView, null, null, mockSearchRank],
            ],
            [
                'fetching prev page',
                [ViewNavDirection.PrevView, null, null, mockSearchRank],
            ],
            ['fetching cursor', [null, 'foo_cursor', null, mockSearchRank]],
        ])(
            'should end the scenario but not register request nor response when %s',
            async (testName, args) => {
                const store = mockStore({
                    views: fromJS({
                        active: view,
                    }),
                })

                mockServer
                    .onGet(`/api/views/${viewId}/items/`)
                    .reply(200, baseReply)

                await store.dispatch(actions.fetchViewItems(...args))

                expect(mockSearchRank.endScenario).toHaveBeenLastCalledWith()
                expect(mockSearchRank.registerResultsRequest).not.toBeCalled()
                expect(
                    mockSearchRank.registerResultsResponse,
                ).not.toHaveBeenCalled()
            },
        )

        describe('elasticsearch search', () => {
            const ticketSearchView = {
                ...view,
                search: 'foo',
                type: ViewType.TicketList,
                dirty: true,
            }

            beforeEach(() => {
                mockServer
                    .onPut(`/api/views/${viewId}/items/`)
                    .reply(200, baseReply)
            })

            it('should search tickets', async () => {
                const cursor = 'test_cursor'
                const cancelToken = CancelToken.source().token
                const store = mockStore({
                    views: fromJS({
                        active: ticketSearchView,
                    }),
                })

                await store.dispatch(
                    actions.fetchViewItems(
                        null,
                        cursor,
                        null,
                        null,
                        undefined,
                        cancelToken,
                    ),
                )

                expect(
                    searchTicketsWithHighlightsMock,
                ).toHaveBeenLastCalledWith({
                    search: ticketSearchView.search,
                    filters: ticketSearchView.filters,
                    cursor,
                    cancelToken,
                    trackTotalHits: true,
                })
            })

            it('should search tickets with next_cursor when ViewNavDirection is next', async () => {
                const cursor = 'next_cursor'
                const store = mockStore({
                    views: fromJS({
                        active: ticketSearchView,
                        _internal: {
                            navigation: {
                                next_cursor: cursor,
                                prev_cursor: null,
                            },
                        },
                    }),
                })

                await store.dispatch(
                    actions.fetchViewItems(ViewNavDirection.NextView),
                )

                expect(
                    searchTicketsWithHighlightsMock,
                ).toHaveBeenLastCalledWith({
                    cancelToken: undefined,
                    search: ticketSearchView.search,
                    filters: ticketSearchView.filters,
                    cursor,
                    trackTotalHits: true,
                })
            })

            it('should search tickets with prev_cursor when ViewNavDirection is prev', async () => {
                const cursor = 'prev_cursor'
                const store = mockStore({
                    views: fromJS({
                        active: ticketSearchView,
                        _internal: {
                            navigation: {
                                next_cursor: null,
                                prev_cursor: cursor,
                            },
                        },
                    }),
                })

                await store.dispatch(
                    actions.fetchViewItems(ViewNavDirection.PrevView),
                )

                expect(
                    searchTicketsWithHighlightsMock,
                ).toHaveBeenLastCalledWith({
                    cancelToken: undefined,
                    search: ticketSearchView.search,
                    filters: ticketSearchView.filters,
                    cursor,
                    trackTotalHits: true,
                })
            })

            it('should search customers with next_cursor when ViewNavDirection is next', async () => {
                const customerSearchView = {
                    ...view,
                    search: 'foo',
                    type: ViewType.CustomerList,
                    dirty: true,
                }
                const cursor = 'next_cursor'
                const store = mockStore({
                    views: fromJS({
                        active: customerSearchView,
                        _internal: {
                            navigation: {
                                next_cursor: cursor,
                                prev_cursor: null,
                            },
                        },
                    }),
                })

                await store.dispatch(
                    actions.fetchViewItems(ViewNavDirection.NextView),
                )

                expect(
                    searchCustomersWithHighlightsMock,
                ).toHaveBeenLastCalledWith({
                    cancelToken: undefined,
                    search: customerSearchView.search,
                    orderBy: CUSTOMER_SEARCH_ORDERING,
                    cursor,
                })
            })

            it('should include search params', async () => {
                const store = mockStore({
                    views: fromJS({
                        active: ticketSearchView,
                    }),
                })
                const orderByParam = `${TicketSearchSortableProperties.CreatedDatetime}:${OrderDirection.Desc}`

                await store.dispatch(
                    actions.fetchViewItems(null, undefined, null, null, {
                        orderBy: orderByParam,
                    }),
                )

                expect(
                    searchTicketsWithHighlightsMock,
                ).toHaveBeenLastCalledWith({
                    search: ticketSearchView.search,
                    filters: ticketSearchView.filters,
                    cursor: undefined,
                    orderBy: orderByParam,
                    trackTotalHits: true,
                })
            })
        })

        it('should not use elasticsearch endpoint when view is dirty but not in edit mode', () => {
            const store = mockStore({
                views: fromJS({
                    active: {
                        ...view,
                        dirty: true,
                        editMode: false,
                    },
                }),
            })

            return store
                .dispatch(
                    actions.fetchViewItems(null, null, null, null, {
                        orderBy: 'closed_datetime:asc',
                    }),
                )
                .then(() => {
                    expect(
                        searchTicketsWithHighlightsMock,
                    ).not.toHaveBeenCalled()
                    expect(mockServer.history.get[0].params).toEqual({
                        order_by: 'closed_datetime:asc',
                    })
                })
        })
    })

    describe('createJob()', () => {
        const viewId = 1

        it("should call the job API with the view id in it's params because the view is not dirty", () => {
            const store = mockStore()
            mockServer.onAny().reply(200)
            const view = fromJS({
                id: viewId,
                type: ViewType.TicketList,
                dirty: false,
                foo: 'bar',
            })
            const jobType = 'jobTypeValue'
            const jobPartialParams = { exampleVar: 'exampleValue' }

            return store
                .dispatch(
                    actions.createJob(
                        view,
                        jobType as unknown as JobType,
                        jobPartialParams,
                    ),
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
                uri: null,
                filters: {},
                shared_with_users: [],
                shared_with_teams: [],
                foo: 'bar',
            })
            const jobType = 'jobTypeValue'
            const jobPartialParams = { exampleVar: 'exampleValue' }

            return store
                .dispatch(
                    actions.createJob(
                        view,
                        jobType as unknown as JobType,
                        jobPartialParams,
                    ),
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
            const store = mockStore({ views })

            await store.dispatch(actions.deleteView(view))

            expect(mockServer.history).toMatchSnapshot()
            expect(store.getActions()).toMatchSnapshot()
        })

        it('should update the active view with the same type when deletion succeeds', async () => {
            const views = initialState.set(
                'items',
                fromJS([view, view.set('id', 2)]),
            )
            const store = mockStore({ views })

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

        it('should update the active view with the same type if deleted view was active', () => {
            const views = initialState
                .set('items', fromJS([view, view.set('id', 2)]))
                .set('active', view)
            const store = mockStore({ views })

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
                .reply(() => [200, { id: 1, slug: 'my-tickets' }])

            const store = mockStore({
                views: initialState,
                currentUser: fromJS({ id: 1 }),
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
                .reply(() => [200, { id: 1, slug: 'my-tickets' }])

            await store.dispatch(actions.submitView(viewToCreate))

            const { post } = mockServer.history
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

            const { put } = mockServer.history
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
                'getViewIdsOrderedByCollapsedSections',
            ).mockReturnValue(
                (() =>
                    fromJS(
                        _range(101),
                    ) as unknown as List<any>) as unknown as ReturnType<
                    typeof viewsSelectors.getViewIdsOrderedByCollapsedSections
                >,
            )
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

    describe('updateFieldFilter', () => {
        it('should create an action to update a field filter', () => {
            const index = 1
            const value = 'new value'
            const expectedAction = {
                type: types.UPDATE_VIEW_FIELD_FILTER,
                index,
                value,
            }

            expect(actions.updateFieldFilter(index, value)).toEqual(
                expectedAction,
            )
        })
    })

    describe('updateCustomFieldFilterId', () => {
        it('should create an action to update a custom field filter id', () => {
            const index = 1
            const customFieldId = 2
            const customFieldOperator = 'eq'
            const expectedAction = {
                type: types.UPDATE_VIEW_CUSTOM_FIELD_FILTER_ID,
                index,
                customFieldId,
                customFieldOperator,
            }

            expect(
                actions.updateCustomFieldFilterId(index, customFieldId, 'eq'),
            ).toEqual(expectedAction)
        })
    })

    describe('updateFieldFilterOperator', () => {
        it('should create an action to update a field filter operator', () => {
            const index = 1
            const operator = 'eq'
            const expectedAction = {
                type: types.UPDATE_VIEW_FIELD_FILTER_OPERATOR,
                index,
                operator,
            }

            expect(actions.updateFieldFilterOperator(index, operator)).toEqual(
                expectedAction,
            )
        })
    })

    describe('setOrderDirection', () => {
        it.each([
            [true, 'in edit mode'],
            [false, 'not in edit mode'],
        ])(
            'should dispatch SET_ORDER_DIRECTION and updateView with isEditable=%s when %s',
            (isEditable) => {
                const store = mockStore()
                const fieldPath = 'created_datetime'
                const direction = OrderDirection.Desc

                store.dispatch(
                    actions.setOrderDirection({
                        direction,
                        fieldPath,
                        isEditable,
                    }),
                )

                expect(store.getActions()).toEqual([
                    {
                        type: types.SET_ORDER_DIRECTION,
                        fieldPath,
                        direction,
                    },
                    {
                        type: types.UPDATE_VIEW,
                        edit: isEditable,
                        view: undefined,
                    },
                ])
            },
        )
    })
})
