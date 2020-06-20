import React from 'react'
import {shallow} from 'enzyme'
import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS} from 'immutable'
import _identity from 'lodash/identity'
import _merge from 'lodash/merge'
import {browserHistory} from 'react-router'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {TICKET_LIST_VIEW_TYPE} from '../../../../../constants/view'
import * as ticketFixtures from '../../../../../fixtures/ticket'
import * as viewsActions from '../../../../../state/views/actions'
import * as viewsConfig from '../../../../../config/views'
import * as viewsFixtures from '../../../../../fixtures/views'
import ViewTable, {ViewTableContainer} from '../ViewTable'

const mockStore = configureMockStore([thunk])

jest.addMatchers(immutableMatchers)

jest.mock('../../../../../state/views/actions', () => {
    const _identity = require('lodash/identity')

    return {
        fetchViewItems: jest.fn(() => _identity),
        setViewActive: jest.fn(() => _identity),
        updateView: jest.fn(() => _identity),
    }
})

browserHistory.push = jest.fn()

describe('ViewTable::ViewTable', () => {
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
                    fetchList: false
                }
            }
        })
    }

    const minContainerProps = {
        activeView: fromJS({}),
        config: fromJS({}),
        fetchViewItems: jest.fn(),
        getViewIdToDisplay: jest.fn(),
        getView: jest.fn(),
        location: {query: {}},
        setViewActive: jest.fn(),
    }

    const minProps = {
        type: 'ticket',
        items: fromJS([ticketFixtures.ticket]),
        isUpdate: true,
        isSearch: false,
        urlViewId: fixtureView.id.toString(), // id of view coming from url
        store: mockStore(minStore),
        location: {query: {}},
        config: fromJS({
            type: TICKET_LIST_VIEW_TYPE
        }),
        navigation: fromJS({}),
        isLoading: () => false
    }

    beforeEach(() => {
        jest.clearAllMocks()
        minProps.store = mockStore(minStore)
    })

    describe('component', () => {
        it('empty view', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                    store={mockStore({
                        ...minStore,
                        views: fromJS({}),
                    })}
                    isUpdate={false}
                />
            ).dive().dive()
            expect(component).toMatchSnapshot()
        })

        it('default view', () => {
            const component = shallow(<ViewTable {...minProps} />).dive().dive()
            expect(component).toMatchSnapshot()
        })

        describe('on mount', () => {
            it('should update the active view with a search view and fetch the view\'s items with the URL cursor ' +
                'because there is both a cursor and a search query in the URL', () => {
                const cursor = '15234'
                const searchQuery = 'foo'
                const ticketListConfig = viewsConfig.getConfigByName('ticket')

                shallow(
                    <ViewTable
                        {...minProps}
                        isSearch={true}
                        location={{query: {cursor, q: searchQuery}}}
                    />
                ).dive().dive()

                expect(viewsActions.updateView).toBeCalledWith(ticketListConfig.get('searchView')(searchQuery), false)
                expect(viewsActions.fetchViewItems).toBeCalledWith(null, cursor)
            })

            it('should set the active view to the first view of the list because there is no view ID in the URL and ' +
                'there is no active view', () => {
                shallow(
                    <ViewTable
                        {...minProps}
                        store={mockStore({views: minStore.views.delete('active')})}
                        isSearch={false}
                        urlViewId={null}
                    />
                ).dive().dive()

                expect(viewsActions.setViewActive).toBeCalledWith(minStore.views.get('items').first())
                expect(viewsActions.fetchViewItems).toBeCalledWith(null, undefined)
            })

            it('should set the active view to the suggested view because there is a view ID in the URL and ' +
                'there is no active view', () => {
                const suggestedViewIndex = 1

                shallow(
                    <ViewTable
                        {...minProps}
                        store={mockStore({views: minStore.views.delete('active')})}
                        isSearch={false}
                        urlViewId={minStore.views.getIn(['items', suggestedViewIndex, 'id'])}
                    />
                ).dive().dive()

                expect(viewsActions.setViewActive).toBeCalledWith(minStore.views.getIn(['items', suggestedViewIndex]))
                expect(viewsActions.fetchViewItems).toBeCalledWith(null, undefined)
            })

            it('should set the active view to the suggested view even though there is an active view because there ' +
                'is a view ID in the URL', () => {
                const suggestedViewIndex = 1

                shallow(
                    <ViewTable
                        {...minProps}
                        isSearch={false}
                        urlViewId={minStore.views.getIn(['items', suggestedViewIndex, 'id'])}
                    />
                ).dive().dive()

                expect(viewsActions.setViewActive).toBeCalledWith(minStore.views.getIn(['items', suggestedViewIndex]))
                expect(viewsActions.fetchViewItems).toBeCalledWith(null, undefined)
            })

            it('should not set the active view because there is already an active view and there is no view ID in ' +
                'the URL', () => {
                shallow(
                    <ViewTable
                        {...minProps}
                        isSearch={false}
                        urlViewId={null}
                    />
                ).dive().dive()

                expect(viewsActions.updateView).not.toBeCalled()
                expect(viewsActions.setViewActive).not.toBeCalled()
                expect(viewsActions.fetchViewItems).toBeCalledWith(null, undefined)
            })
        })

        it('should set stored cursor in the URL if loading of the page just finished, stored cursor is different ' +
            'of URL cursor, and we are not on the first page', () => {
            const cursor = '1234'
            const component = shallow(<ViewTable {...minProps}/>).dive().dive()

            component.setProps({
                location: {query: {cursor: '789456'}},
                navigation: fromJS({current_cursor: cursor}),
                isLoading: () => true,
                isOnFirstPage: false
            })

            // Only start tracking once props have been set above
            jest.clearAllMocks()

            component.setProps({
                location: {query: {cursor: '1256'}},
                navigation: fromJS({current_cursor: cursor, prev_items: 'foo'}),
                isLoading: () => false,
                isOnFirstPage: false
            })

            expect(browserHistory.push).toBeCalledWith({...minProps.location, query: {cursor}})
        })

        it('should remove cursor from the URL if loading of the page just finished, stored cursor is different ' +
            'of URL cursor, and there is no previous items', () => {
            const cursor = '1234'
            const component = shallow(<ViewTable {...minProps}/>).dive().dive()

            component.setProps({
                location: {query: {cursor: '789456'}},
                navigation: fromJS({current_cursor: cursor}),
                isLoading: () => true,
            })

            component.setProps({
                location: {query: {cursor: '1256'}},
                navigation: fromJS({current_cursor: cursor}),
                isLoading: () => false
            })

            expect(browserHistory.push).toBeCalledWith({...minProps.location, query: {}})
        })

        it('should call fetchViewItems with the URL cursor when URL cursor changes', () => {
            const component = shallow(<ViewTable {...minProps} />).dive().dive()
            const cursor = '1523467'
            component.setProps({location: {query: {cursor}}})
            expect(viewsActions.fetchViewItems).toBeCalledWith(null, cursor)
        })

        it('should call fetchViewItems with default parameters when there is a stored cursor and no URL cursor ' +
            'and we are not currently on the first page', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                />
            ).dive().dive()

            jest.clearAllMocks()

            component.setProps({
                navigation: fromJS({current_cursor: '12345678'}),
                isOnFirstPage: false
            })
            expect(viewsActions.fetchViewItems).toBeCalledWith(null, null)
        })

        it('should not call fetchViewItems when there is a stored cursor and no URL cursor and we are not currently ' +
            'on the first page because a request is currently loading', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                />
            ).dive().dive()

            jest.clearAllMocks()

            component.setProps({
                navigation: fromJS({current_cursor: '12345678'}),
                isOnFirstPage: false,
                isLoading: () => true
            })
            expect(viewsActions.fetchViewItems).not.toBeCalled()
        })

        it('should not call fetchViewItems when the stored cursor and URL cursor are different and we are not ' +
            'currently on the first page because a request is currently loading', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                    location={{query: {cursor: '1256'}}}
                    navigation={fromJS({current_cursor: '1256'})}
                />
            ).dive().dive()

            jest.clearAllMocks()

            component.setProps({
                location: {query: {cursor: '12345678'}},
                isOnFirstPage: false,
                isLoading: () => true
            })
            expect(viewsActions.fetchViewItems).not.toBeCalled()
        })

        it('should update the view and call fetchViewItems with default parameters when entering "search" mode', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                    isSearch={false}
                />
            ).dive().dive()
            component.setProps({
                isSearch: true,
            })
            expect(viewsActions.updateView).toBeCalled()
            expect(viewsActions.fetchViewItems).toBeCalledWith()
        })

        it('should set the new view as active and call fetchViewItems with default parameters when entering "add new" ' +
            'mode', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                    isUpdate
                />
            ).dive().dive()
            component.setProps({
                isUpdate: false,
            })
            expect(viewsActions.updateView).toBeCalled()
            expect(viewsActions.fetchViewItems).toBeCalledWith()
        })

        it('should update the view and call fetchViewItems with default parameters because the search query changed ' +
            'while in search mode', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                    isSearch={true}
                    location={_merge({}, minProps.location, {
                        query: {
                            q: 'term1',
                        }
                    })}
                />
            ).dive().dive()
            component.setProps({
                location: _merge({}, minProps.location, {
                    query: {
                        q: 'term2',
                    }
                })
            })
            expect(viewsActions.updateView).toBeCalled()
            expect(viewsActions.fetchViewItems).toBeCalledWith()
        })

        it('should set the suggested view as active and call fetchViewItems with default parameters when leaving ' +
            '"search" mode', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                    isSearch
                />
            ).dive().dive()
            component.setProps({
                isSearch: false,
            })
            expect(viewsActions.setViewActive).toBeCalled()
            expect(viewsActions.fetchViewItems).toBeCalledWith()
        })

        it('should set the suggested view as active and call fetchViewItems with default parameters when leaving ' +
            '"add new" mode', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                    isUpdate={false}
                />
            ).dive().dive()
            component.setProps({
                isUpdate: true,
            })
            expect(viewsActions.setViewActive).toBeCalled()
            expect(viewsActions.fetchViewItems).toBeCalledWith()
        })

        it('should set the suggested view as active and call fetchViewItems with default parameters when suggested ' +
            'view changed', () => {
            const component = shallow(
                <ViewTable
                    {...minProps}
                    urlViewId={'1'}
                />
            ).dive().dive()
            component.setProps({
                urlViewId: '2',
            })
            expect(viewsActions.setViewActive).toBeCalled()
            expect(viewsActions.fetchViewItems).toBeCalledWith()
        })

        it('should call fetchViewItems when the user fixes filters of deactivated view', () => {
            const store = {
                views: minStore.views.setIn(['active', 'deactivated_datetime'], '2020-06-15 22:56:32.708038')
            }

            const component = shallow(
                <ViewTable
                    {...minProps}
                    store={mockStore(store)}
                />
            ).dive().dive()

            expect(viewsActions.fetchViewItems).toBeCalledTimes(1)

            component.setProps({
                activeView: store.views.get('active').set('deactivated_datetime', null),
            })

            expect(viewsActions.fetchViewItems).toBeCalledTimes(2)
        })

        it('should not call fetchViewItems when the user goes from a deactivated view to a valid one', () => {
            const store = {
                views: minStore.views
                    .setIn(['active', 'id'], 10)
                    .setIn(['active', 'deactivated_datetime'], '2020-06-15 22:56:32.708038')
            }

            const component = shallow(
                <ViewTable
                    {...minProps}
                    store={mockStore(store)}
                />
            ).dive().dive()

            expect(viewsActions.fetchViewItems).toBeCalledTimes(1)

            component.setProps({
                activeView: store.views.get('active')
                    .set('id', 20)
                    .set('deactivated_datetime', null),
            })

            expect(viewsActions.fetchViewItems).toBeCalledTimes(1)
        })

        it('should handle /app/customers selecting the right view and without redirecting', () => {
            shallow(
                <ViewTableContainer
                    {...minContainerProps}
                    getViewIdToDisplay={jest.fn(() => 42)}
                    getView={jest.fn(_identity)}
                />
            )

            expect(browserHistory.push).not.toHaveBeenCalled()
            expect(minContainerProps.setViewActive).toHaveBeenCalledWith(42)
        })

        describe('render()', () => {
            it('should render a warning because the view is deactivated', () => {
                const store = {
                    views: minStore.views.setIn(['active', 'deactivated_datetime'], '2020-06-15 22:56:32.708038')
                }

                const component = shallow(
                    <ViewTable
                        {...minProps}
                        store={mockStore(store)}
                    />
                ).dive().dive()

                expect(component).toMatchSnapshot()
            })
        })
    })
})
