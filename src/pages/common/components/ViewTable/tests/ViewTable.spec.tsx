import {render} from '@testing-library/react'
import React from 'react'
import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map} from 'immutable'
import {browserHistory, InjectedRouter} from 'react-router'
import {Location} from 'history'

import * as ticketFixtures from '../../../../../fixtures/ticket.js'
import * as viewsActions from '../../../../../state/views/actions'
import {view as fixtureView} from '../../../../../fixtures/views.js'
import {ViewTableContainer} from '../ViewTable'

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

jest.mock('../Header', () => () => <div>Header mock</div>)
jest.mock('../Table', () => () => <div>Table mock</div>)
jest.mock('../FilterTopbar', () => () => <div>FilterTopbar mock</div>)

const defaultProps = {
    type: 'ticket',
    items: fromJS([ticketFixtures.ticket]),
    isUpdate: true,
    isSearch: false,
    areFiltersValid: true,
    isLoading: jest.fn(),
    urlViewId: fixtureView.id.toString(),
    activeView: fromJS(fixtureView) as Map<any, any>,
    config: fromJS({}),
    updateView: jest.fn(),
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
    ActionsComponent: null,
    viewButtons: null,
}

beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(browserHistory, 'push').mockImplementation()
    defaultProps.getViewIdToDisplay.mockReturnValue(
        defaultProps.activeView.get('id')
    )
    defaultProps.getView.mockReturnValue(defaultProps.activeView)
    defaultProps.isLoading.mockReturnValue(false)
})

afterEach(() => {
    ;((browserHistory.push as unknown) as jest.SpyInstance).mockRestore()
})

describe('<ViewTable />', () => {
    describe('on mount', () => {
        it('should update view and fetch items in search mode', () => {
            const cursor = '15234'
            const searchView = defaultProps.activeView.set('search', 'foo')
            render(
                <ViewTableContainer
                    {...defaultProps}
                    isSearch={true}
                    urlSearchView={searchView}
                    location={{query: {cursor}} as Location<any>}
                />
            )
            expect(defaultProps.updateView).toHaveBeenLastCalledWith(
                searchView,
                false
            )
            expect(defaultProps.fetchViewItems).toHaveBeenLastCalledWith(
                null,
                cursor
            )
        })

        it('should set the active view as fetch items to the suggested view when no urlViewId and no active view', () => {
            render(
                <ViewTableContainer
                    {...defaultProps}
                    activeView={fromJS({})}
                    urlViewId={null}
                />
            )
            expect(defaultProps.setViewActive).toHaveBeenLastCalledWith(
                defaultProps.activeView
            )
            expect(defaultProps.fetchViewItems).toHaveBeenLastCalledWith(
                null,
                undefined
            )
        })

        it('should set the active view and fetch items to the suggested view when there is urlViewId and active view', () => {
            render(
                <ViewTableContainer
                    {...defaultProps}
                    urlViewId={defaultProps.activeView.get('id')}
                />
            )
            expect(defaultProps.setViewActive).toBeCalledWith(
                defaultProps.activeView
            )
            expect(defaultProps.fetchViewItems).toBeCalledWith(null, undefined)
        })

        it('should fetch items and not set the active view when active view is not empty and no urlViewId', () => {
            render(<ViewTableContainer {...defaultProps} urlViewId={null} />)
            expect(defaultProps.updateView).not.toBeCalled()
            expect(defaultProps.setViewActive).not.toBeCalled()
            expect(defaultProps.fetchViewItems).toBeCalledWith(null, undefined)
        })

        it('should redirect to the app when suggested view id does not match urlViewId', () => {
            render(<ViewTableContainer {...defaultProps} urlViewId="42" />)
            expect(browserHistory.push).toHaveBeenLastCalledWith('/app')
        })

        it('should not redirect to the app when suggested view id match urlViewId', () => {
            render(<ViewTableContainer {...defaultProps} />)
            expect(browserHistory.push).not.toHaveBeenCalled()
        })
    })

    describe('on update', () => {
        it(
            'should set stored cursor in the URL if loading of the page just finished, stored cursor is different ' +
                'of URL cursor, and we are not on the first page',
            () => {
                const cursor = '1234'
                const {rerender} = render(
                    <ViewTableContainer
                        {...defaultProps}
                        location={{query: {cursor: '789456'}} as Location<any>}
                        navigation={fromJS({current_cursor: cursor})}
                        isLoading={() => true}
                        isOnFirstPage={false}
                    />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...defaultProps}
                        location={{query: {cursor: '1256'}} as Location<any>}
                        navigation={fromJS({
                            current_cursor: cursor,
                            prev_items: 'foo',
                        })}
                        isLoading={() => false}
                        isOnFirstPage={false}
                    />
                )
                expect(browserHistory.push).toBeCalledWith({
                    ...defaultProps.location,
                    query: {cursor},
                })
            }
        )

        it(
            'should remove cursor from the URL if loading of the page just finished, stored cursor is different ' +
                'of URL cursor, and there is no previous items',
            () => {
                const cursor = '1234'
                const {rerender} = render(
                    <ViewTableContainer
                        {...defaultProps}
                        location={{query: {cursor: '789456'}} as Location<any>}
                        navigation={fromJS({current_cursor: cursor})}
                        isLoading={() => true}
                    />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...defaultProps}
                        location={{query: {cursor: '1256'}} as Location<any>}
                        navigation={fromJS({current_cursor: cursor})}
                        isLoading={() => false}
                    />
                )
                expect(browserHistory.push).toBeCalledWith({
                    ...defaultProps.location,
                    query: {},
                })
            }
        )

        it('should call fetchViewItems with the URL cursor when URL cursor changes', () => {
            const cursor = '1523467'
            const {rerender} = render(<ViewTableContainer {...defaultProps} />)
            jest.clearAllMocks()
            rerender(
                <ViewTableContainer
                    {...defaultProps}
                    location={{query: {cursor}} as Location<any>}
                />
            )
            expect(
                defaultProps.fetchViewItemsCancellable
            ).toHaveBeenLastCalledWith(null, cursor, null)
        })

        it(
            'should call fetchViewItems with default parameters when there is a stored cursor and no URL cursor ' +
                'and we are not currently on the first page',
            () => {
                const {rerender} = render(
                    <ViewTableContainer {...defaultProps} />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...defaultProps}
                        navigation={fromJS({current_cursor: '12345678'})}
                        isOnFirstPage={false}
                    />
                )
                expect(defaultProps.fetchViewItemsCancellable).toBeCalledWith(
                    null,
                    null,
                    null
                )
            }
        )

        it('should update the view and call fetchViewItems with default parameters when entering "search" mode', () => {
            const {rerender} = render(
                <ViewTableContainer {...defaultProps} isSearch={false} />
            )
            jest.clearAllMocks()
            rerender(<ViewTableContainer {...defaultProps} isSearch={true} />)

            expect(defaultProps.updateView).toHaveBeenLastCalledWith(
                defaultProps.urlSearchView,
                false
            )
            expect(
                defaultProps.fetchViewItemsCancellable
            ).toHaveBeenLastCalledWith(null, null, null)
        })

        it(
            'should set the new view as active and call fetchViewItems with default parameters when entering "add new" ' +
                'mode',
            () => {
                const newView = fromJS({}) as Map<any, any>
                const {rerender} = render(
                    <ViewTableContainer {...defaultProps} isUpdate />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...defaultProps}
                        config={fromJS({
                            newView: () => newView,
                        })}
                        isUpdate={false}
                    />
                )

                expect(defaultProps.updateView).toHaveBeenLastCalledWith(
                    newView
                )
                expect(
                    defaultProps.fetchViewItemsCancellable
                ).toHaveBeenLastCalledWith(null, null, null)
            }
        )

        it(
            'should set the suggested view as active and call fetchViewItems with default parameters when leaving ' +
                '"search" mode',
            () => {
                const someView = fromJS({}) as Map<any, any>
                defaultProps.getView.mockReturnValue(someView)

                const {rerender} = render(
                    <ViewTableContainer {...defaultProps} isSearch />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer {...defaultProps} isSearch={false} />
                )

                expect(defaultProps.setViewActive).toHaveBeenLastCalledWith(
                    someView
                )
                expect(
                    defaultProps.fetchViewItemsCancellable
                ).toHaveBeenLastCalledWith(null, null, null)
            }
        )

        it(
            'should set the suggested view as active and call fetchViewItems with default parameters when leaving ' +
                '"add new" mode',
            () => {
                const someView = fromJS({}) as Map<any, any>
                defaultProps.getView.mockReturnValue(someView)

                const {rerender} = render(
                    <ViewTableContainer {...defaultProps} isUpdate={false} />
                )
                jest.clearAllMocks()
                rerender(<ViewTableContainer {...defaultProps} isUpdate />)

                expect(defaultProps.setViewActive).toHaveBeenLastCalledWith(
                    someView
                )
                expect(
                    defaultProps.fetchViewItemsCancellable
                ).toHaveBeenLastCalledWith(null, null, null)
            }
        )

        it(
            'should set the suggested view as active and call fetchViewItems with default parameters when suggested ' +
                'view changed',
            () => {
                const {rerender} = render(
                    <ViewTableContainer {...defaultProps} />
                )

                jest.clearAllMocks()
                defaultProps.getViewIdToDisplay
                    .mockReturnValueOnce('1')
                    .mockReturnValueOnce('2')
                rerender(<ViewTableContainer {...defaultProps} />)

                expect(defaultProps.setViewActive).toHaveBeenCalledTimes(1)
                expect(
                    defaultProps.fetchViewItemsCancellable
                ).toHaveBeenLastCalledWith(null, null, null)
            }
        )

        it('should call fetchViewItems when view gets activated', () => {
            const {rerender} = render(
                <ViewTableContainer
                    {...defaultProps}
                    activeView={defaultProps.activeView.set(
                        'deactivated_datetime',
                        '2020-06-15 22:56:32.708038'
                    )}
                />
            )
            jest.clearAllMocks()
            rerender(
                <ViewTableContainer
                    {...defaultProps}
                    activeView={defaultProps.activeView.set(
                        'deactivated_datetime',
                        null
                    )}
                />
            )
            expect(
                defaultProps.fetchViewItemsCancellable
            ).toHaveBeenLastCalledWith(null, null, null)
        })

        it('should not call fetchViewItems when the user goes from a deactivated view to a valid one', () => {
            const {rerender} = render(
                <ViewTableContainer
                    {...defaultProps}
                    activeView={defaultProps.activeView.set(
                        'deactivated_datetime',
                        '2020-06-15 22:56:32.708038'
                    )}
                />
            )
            jest.clearAllMocks()
            rerender(
                <ViewTableContainer
                    {...defaultProps}
                    activeView={defaultProps.activeView
                        .set('id', 10)
                        .set('deactivated_datetime', null)}
                />
            )
            expect(
                defaultProps.fetchViewItemsCancellable
            ).not.toHaveBeenCalled()
        })

        it(
            'should not call fetchViewItems when there is a stored cursor and no URL cursor and we are not currently ' +
                'on the first page because a request is currently loading',
            () => {
                const {rerender} = render(
                    <ViewTableContainer {...defaultProps} />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...defaultProps}
                        navigation={fromJS({current_cursor: '12345678'})}
                        isOnFirstPage={false}
                        isLoading={() => true}
                    />
                )
                expect(
                    defaultProps.fetchViewItemsCancellable
                ).not.toHaveBeenCalled()
            }
        )

        it(
            'should not call fetchViewItems when the stored cursor and URL cursor are different and we are not ' +
                'currently on the first page because a request is currently loading',
            () => {
                const {rerender} = render(
                    <ViewTableContainer
                        {...defaultProps}
                        location={{query: {cursor: '1256'}} as Location<any>}
                        navigation={fromJS({current_cursor: '1256'})}
                    />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...defaultProps}
                        location={
                            {query: {cursor: '12345678'}} as Location<any>
                        }
                        isOnFirstPage={false}
                        isLoading={() => true}
                    />
                )
                expect(viewsActions.fetchViewItems).not.toBeCalled()
            }
        )

        it('should call fetchViewItems on view search change', () => {
            const {rerender} = render(
                <ViewTableContainer {...defaultProps} isSearch={true} />
            )
            jest.clearAllMocks()
            rerender(
                <ViewTableContainer
                    {...defaultProps}
                    isSearch={true}
                    activeView={defaultProps.activeView.set(
                        'search',
                        'foo search query'
                    )}
                />
            )
            expect(
                defaultProps.fetchViewItemsCancellable
            ).toHaveBeenLastCalledWith(null, null, null)
        })
    })

    describe('render', () => {
        it('empty view', () => {
            const {container} = render(
                <ViewTableContainer
                    {...defaultProps}
                    activeView={fromJS({})}
                    isUpdate={false}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('default view', () => {
            const {container} = render(<ViewTableContainer {...defaultProps} />)
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a warning because the view is deactivated', () => {
            const {container} = render(
                <ViewTableContainer
                    {...defaultProps}
                    activeView={defaultProps.activeView.set(
                        'deactivated_datetime',
                        '2020-06-15 22:56:32.708038'
                    )}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
