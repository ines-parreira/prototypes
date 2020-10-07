import axios from 'axios'
import React, {ComponentProps, ComponentType} from 'react'
import {shallow, ShallowWrapper} from 'enzyme'
import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map, List} from 'immutable'
import {browserHistory, InjectedRouter} from 'react-router'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Location} from 'history'
import _identity from 'lodash/identity'

import {TICKET_LIST_VIEW_TYPE} from '../../../../../constants/view.js'
import * as ticketFixtures from '../../../../../fixtures/ticket.js'
import * as viewsActions from '../../../../../state/views/actions'
import * as viewsConfig from '../../../../../config/views'
import * as viewsFixtures from '../../../../../fixtures/views.js'
import ViewTable, {ViewTableContainer} from '../ViewTable'
import {View} from '../../../../../state/views/types'

const mockStore = configureMockStore([thunk])

jest.addMatchers(immutableMatchers)

jest.mock('../../../../../state/views/actions', () => {
    const {updateView} = require.requireActual(
        '../../../../../state/views/actions'
    )
    return {
        fetchViewItems: jest.fn().mockReturnValue(() => Promise.resolve()),
        setViewActive: jest.fn().mockReturnValue(() => Promise.resolve()),
        updateView: jest.fn(updateView),
    }
})

const mockToken = axios.CancelToken.source().token

const ViewTableMock = (ViewTable as unknown) as ComponentType<
    ComponentProps<typeof ViewTable> & {
        store?: any
        location?: any
        navigation?: any
    }
>

const fixtureView = viewsFixtures.view

const minStore = {
    views: fromJS({
        active: fixtureView,
        items: [
            {id: 1, type: TICKET_LIST_VIEW_TYPE},
            {id: 2, type: TICKET_LIST_VIEW_TYPE},
            fixtureView,
        ],
        _internal: {
            loading: {
                fetchList: false,
            },
        },
    }) as Map<any, any>,
}

const minContainerProps = {
    updateView: viewsActions.updateView,
    activeView: fromJS({}),
    config: fromJS({}),
    fetchViewItems: jest.fn(),
    getViewIdToDisplay: jest.fn(),
    getView: jest.fn(),
    location: {query: {}} as Location<any>,
    setViewActive: jest.fn(),
    params: {},
    router: {} as InjectedRouter,
    routes: [],
    isOnFirstPage: true,
    navigation: fromJS({}),
    hasActiveView: true,
    selectedItemsIds: fromJS([]),
    fetchViewItemsCancellable: jest.fn(),
    cancelFetchViewItemsCancellable: jest.fn(),
    urlSearchView: fromJS({}),
}

const minProps = {
    type: 'ticket',
    items: fromJS([ticketFixtures.ticket]),
    isUpdate: true,
    isSearch: false,
    urlViewId: fixtureView.id.toString(), // id of view coming from url
    ActionsComponent: null,
    viewButtons: null,
    fetchViewItemsCancellable: () => Promise.resolve(null),
    cancelFetchViewItemsCancellable: () => null,
    store: mockStore(minStore),
    location: {query: {}} as Location<any>,
    config: fromJS({
        type: TICKET_LIST_VIEW_TYPE,
    }),
    navigation: fromJS({}),
    isLoading: () => false,
}

beforeEach(() => {
    jest.clearAllMocks()
    minProps.store = mockStore(minStore)
})

browserHistory.push = jest.fn()

describe('<ViewTable />', () => {
    describe('on mount', () => {
        it("should fetch the view's items with the URL cursor because there is both a cursor and a search query in the URL", () => {
            const cursor = '15234'
            const searchQuery = 'foo'

            shallow(
                <ViewTableMock
                    {...minProps}
                    isSearch={true}
                    location={{query: {cursor, q: searchQuery}}}
                />
            )
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()

            const ticketListConfig = viewsConfig.getConfigByName('ticket')
            expect(viewsActions.updateView).toBeCalledWith(
                (ticketListConfig.get('searchView') as (name: string) => View)(
                    searchQuery
                ),
                false
            )
            expect(viewsActions.fetchViewItems).toBeCalledWith(null, cursor)
        })

        it(
            'should set the active view to the first view of the list because there is no view ID in the URL and ' +
                'there is no active view',
            () => {
                shallow(
                    <ViewTableMock
                        {...minProps}
                        store={mockStore({
                            views: minStore.views.delete('active'),
                        })}
                        isSearch={false}
                        urlViewId={null}
                    />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()

                expect(viewsActions.setViewActive).toBeCalledWith(
                    (minStore.views.get('items') as List<any>).first()
                )
                expect(viewsActions.fetchViewItems).toBeCalledWith(
                    null,
                    undefined
                )
            }
        )

        it(
            'should set the active view to the suggested view because there is a view ID in the URL and ' +
                'there is no active view',
            () => {
                const suggestedViewIndex = 1

                shallow(
                    <ViewTableMock
                        {...minProps}
                        store={mockStore({
                            views: minStore.views.delete('active'),
                        })}
                        isSearch={false}
                        urlViewId={minStore.views.getIn([
                            'items',
                            suggestedViewIndex,
                            'id',
                        ])}
                    />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()

                expect(viewsActions.setViewActive).toBeCalledWith(
                    minStore.views.getIn(['items', suggestedViewIndex])
                )
                expect(viewsActions.fetchViewItems).toBeCalledWith(
                    null,
                    undefined
                )
            }
        )

        it(
            'should set the active view to the suggested view even though there is an active view because there ' +
                'is a view ID in the URL',
            () => {
                const suggestedViewIndex = 1

                shallow(
                    <ViewTableMock
                        {...minProps}
                        isSearch={false}
                        urlViewId={minStore.views.getIn([
                            'items',
                            suggestedViewIndex,
                            'id',
                        ])}
                    />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()

                expect(viewsActions.setViewActive).toBeCalledWith(
                    minStore.views.getIn(['items', suggestedViewIndex])
                )
                expect(viewsActions.fetchViewItems).toBeCalledWith(
                    null,
                    undefined
                )
            }
        )

        it(
            'should not set the active view because there is already an active view and there is no view ID in ' +
                'the URL',
            () => {
                shallow(
                    <ViewTableMock
                        {...minProps}
                        isSearch={false}
                        urlViewId={null}
                    />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()

                expect(viewsActions.updateView).not.toBeCalled()
                expect(viewsActions.setViewActive).not.toBeCalled()
                expect(viewsActions.fetchViewItems).toBeCalledWith(
                    null,
                    undefined
                )
            }
        )

        it('should handle /app/customers selecting the right view and without redirecting', () => {
            shallow(
                <ViewTableContainer
                    {...minProps}
                    {...minContainerProps}
                    urlViewId="42"
                    getViewIdToDisplay={jest.fn(() => 42)}
                    getView={jest.fn(_identity) as any}
                />
            )

            expect(browserHistory.push).not.toHaveBeenCalled()
            expect(minContainerProps.setViewActive).toHaveBeenCalledWith(42)
        })
    })

    describe('on update', () => {
        it(
            'should set stored cursor in the URL if loading of the page just finished, stored cursor is different ' +
                'of URL cursor, and we are not on the first page',
            () => {
                const cursor = '1234'
                const component: ShallowWrapper<
                    typeof minProps & typeof minContainerProps
                > = shallow(<ViewTableMock {...minProps} />)
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()

                component.setProps({
                    location: {query: {cursor: '789456'}} as Location<any>,
                    navigation: fromJS({current_cursor: cursor}),
                    isLoading: () => true,
                    isOnFirstPage: false,
                })

                // Only start tracking once props have been set above
                jest.clearAllMocks()

                component.setProps({
                    location: {query: {cursor: '1256'}} as Location<any>,
                    navigation: fromJS({
                        current_cursor: cursor,
                        prev_items: 'foo',
                    }),
                    isLoading: () => false,
                    isOnFirstPage: false,
                })

                expect(browserHistory.push).toBeCalledWith({
                    ...minProps.location,
                    query: {cursor},
                })
            }
        )

        it(
            'should remove cursor from the URL if loading of the page just finished, stored cursor is different ' +
                'of URL cursor, and there is no previous items',
            () => {
                const cursor = '1234'
                const component: ShallowWrapper<typeof minProps> = shallow(
                    <ViewTableMock {...minProps} />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()

                component.setProps({
                    location: {query: {cursor: '789456'}} as Location<any>,
                    navigation: fromJS({current_cursor: cursor}),
                    isLoading: () => true,
                })

                component.setProps({
                    location: {query: {cursor: '1256'}} as Location<any>,
                    navigation: fromJS({current_cursor: cursor}),
                    isLoading: () => false,
                })

                expect(browserHistory.push).toBeCalledWith({
                    ...minProps.location,
                    query: {},
                })
            }
        )

        it('should call fetchViewItems with the URL cursor when URL cursor changes', () => {
            const component: ShallowWrapper<typeof minProps> = shallow(
                <ViewTableMock {...minProps} />
            )
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
            const cursor = '1523467'
            component.setProps({
                location: {query: {cursor}} as Location<any>,
            })
            expect(viewsActions.fetchViewItems).toBeCalledWith(
                null,
                cursor,
                null,
                mockToken
            )
        })

        it(
            'should call fetchViewItems with default parameters when there is a stored cursor and no URL cursor ' +
                'and we are not currently on the first page',
            () => {
                const component: ShallowWrapper<typeof minContainerProps> = shallow(
                    <ViewTableMock {...minProps} />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()

                jest.clearAllMocks()

                component.setProps({
                    navigation: fromJS({current_cursor: '12345678'}),
                    isOnFirstPage: false,
                })
                expect(viewsActions.fetchViewItems).toBeCalledWith(
                    null,
                    null,
                    null,
                    mockToken
                )
            }
        )

        it('should update the view and call fetchViewItems with default parameters when entering "search" mode', () => {
            const component: ShallowWrapper<typeof minProps> = shallow(
                <ViewTableMock {...minProps} isSearch={false} />
            )
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
            component.setProps({
                isSearch: true,
            })
            expect(viewsActions.updateView).toBeCalled()
            expect(viewsActions.fetchViewItems).toBeCalledWith(
                null,
                null,
                null,
                mockToken
            )
        })

        it(
            'should set the new view as active and call fetchViewItems with default parameters when entering "add new" ' +
                'mode',
            () => {
                const component: ShallowWrapper<typeof minProps> = shallow(
                    <ViewTableMock {...minProps} isUpdate />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                component.setProps({
                    isUpdate: false,
                })
                expect(viewsActions.updateView).toBeCalled()
                expect(viewsActions.fetchViewItems).toBeCalledWith(
                    null,
                    null,
                    null,
                    mockToken
                )
            }
        )

        it(
            'should set the suggested view as active and call fetchViewItems with default parameters when leaving ' +
                '"search" mode',
            () => {
                const component: ShallowWrapper<typeof minProps> = shallow(
                    <ViewTableMock {...minProps} isSearch />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                component.setProps({
                    isSearch: false,
                })
                expect(viewsActions.setViewActive).toBeCalled()
                expect(viewsActions.fetchViewItems).toBeCalledWith(
                    null,
                    null,
                    null,
                    mockToken
                )
            }
        )

        it(
            'should set the suggested view as active and call fetchViewItems with default parameters when leaving ' +
                '"add new" mode',
            () => {
                const component: ShallowWrapper<typeof minProps> = shallow(
                    <ViewTableMock {...minProps} isUpdate={false} />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                component.setProps({
                    isUpdate: true,
                })
                expect(viewsActions.setViewActive).toBeCalled()
                expect(viewsActions.fetchViewItems).toBeCalledWith(
                    null,
                    null,
                    null,
                    mockToken
                )
            }
        )

        it(
            'should set the suggested view as active and call fetchViewItems with default parameters when suggested ' +
                'view changed',
            () => {
                const component: ShallowWrapper<typeof minProps> = shallow(
                    <ViewTableMock {...minProps} urlViewId={'1'} />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                component.setProps({
                    urlViewId: '2',
                })
                expect(viewsActions.setViewActive).toBeCalled()
                expect(viewsActions.fetchViewItems).toBeCalledWith(
                    null,
                    null,
                    null,
                    mockToken
                )
            }
        )

        it('should call fetchViewItems when the user fixes filters of deactivated view', () => {
            const store = {
                views: minStore.views.setIn(
                    ['active', 'deactivated_datetime'],
                    '2020-06-15 22:56:32.708038'
                ),
            }

            const component: ShallowWrapper<typeof minContainerProps> = shallow(
                <ViewTableMock {...minProps} store={mockStore(store)} />
            )
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()

            expect(viewsActions.fetchViewItems).toBeCalledTimes(1)

            component.setProps({
                activeView: (store.views.get('active') as Map<any, any>).set(
                    'deactivated_datetime',
                    null
                ),
            })

            expect(viewsActions.fetchViewItems).toBeCalledTimes(2)
        })

        it('should not call fetchViewItems when the user goes from a deactivated view to a valid one', () => {
            const store = {
                views: minStore.views
                    .setIn(['active', 'id'], 10)
                    .setIn(
                        ['active', 'deactivated_datetime'],
                        '2020-06-15 22:56:32.708038'
                    ),
            }

            const component: ShallowWrapper<typeof minContainerProps> = shallow(
                <ViewTableMock {...minProps} store={mockStore(store)} />
            )
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()

            expect(viewsActions.fetchViewItems).toBeCalledTimes(1)

            component.setProps({
                activeView: (store.views.get('active') as Map<any, any>)
                    .set('id', 20)
                    .set('deactivated_datetime', null),
            })

            expect(viewsActions.fetchViewItems).toBeCalledTimes(1)
        })

        it(
            'should not call fetchViewItems when there is a stored cursor and no URL cursor and we are not currently ' +
                'on the first page because a request is currently loading',
            () => {
                const component: ShallowWrapper<
                    typeof minContainerProps & typeof minProps
                > = shallow(<ViewTableMock {...minProps} />)
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()

                jest.clearAllMocks()

                component.setProps({
                    navigation: fromJS({current_cursor: '12345678'}),
                    isOnFirstPage: false,
                    isLoading: () => true,
                })
                expect(viewsActions.fetchViewItems).not.toBeCalled()
            }
        )

        it(
            'should not call fetchViewItems when the stored cursor and URL cursor are different and we are not ' +
                'currently on the first page because a request is currently loading',
            () => {
                const component: ShallowWrapper<
                    typeof minProps & typeof minContainerProps
                > = shallow(
                    <ViewTableMock
                        {...minProps}
                        location={{query: {cursor: '1256'}}}
                        navigation={fromJS({current_cursor: '1256'})}
                    />
                )
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()
                    .dive()

                jest.clearAllMocks()

                component.setProps({
                    location: {query: {cursor: '12345678'}} as Location<any>,
                    isOnFirstPage: false,
                    isLoading: () => true,
                })
                expect(viewsActions.fetchViewItems).not.toBeCalled()
            }
        )
    })

    describe('render', () => {
        it('empty view', () => {
            const component = shallow(
                <ViewTableMock
                    {...minProps}
                    store={mockStore({
                        ...minStore,
                        views: fromJS({}),
                    })}
                    isUpdate={false}
                />
            )
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
            expect(component).toMatchSnapshot()
        })

        it('default view', () => {
            const component = shallow(<ViewTableMock {...minProps} />)
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
            expect(component).toMatchSnapshot()
        })

        it('should render a warning because the view is deactivated', () => {
            const store = {
                views: minStore.views.setIn(
                    ['active', 'deactivated_datetime'],
                    '2020-06-15 22:56:32.708038'
                ),
            }

            const component = shallow(
                <ViewTableMock {...minProps} store={mockStore(store)} />
            )
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()
                .dive()

            expect(component).toMatchSnapshot()
        })
    })
})
