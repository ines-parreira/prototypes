import {render} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import * as immutableMatchers from 'jest-immutable-matchers'
import {fromJS, Map} from 'immutable'
import {Location} from 'history'
import _identity from 'lodash/identity'
import {stringify} from 'query-string'

import * as ticketFixtures from '../../../../../fixtures/ticket'
import {ViewVisibility} from '../../../../../models/view/types'
import * as viewsActions from '../../../../../state/views/actions'
import {view as fixtureView} from '../../../../../fixtures/views'
import {activeViewIdSet} from '../../../../../state/ui/views/actions'
import history from '../../../../history'
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

jest.mock('../../../../../state/ui/views/actions')
;(activeViewIdSet as jest.MockedFunction<
    typeof activeViewIdSet
>).mockImplementation((() => _identity) as any)

jest.mock('../Header', () => () => <div>Header mock</div>)
jest.mock('../Table', () => () => <div>Table mock</div>)
jest.mock('../FilterTopbar', () => () => <div>FilterTopbar mock</div>)

const minProps = ({
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
    location: {search: '', pathname: ''},
    setViewActive: jest.fn(),
    match: {params: {}},
    isOnFirstPage: true,
    navigation: fromJS({}),
    hasActiveView: true,
    selectedItemsIds: fromJS([]),
    fetchViewItemsCancellable: jest.fn(),
    cancelFetchViewItemsCancellable: jest.fn(),
    urlSearchView: fromJS({}),
    ActionsComponent: null,
    viewButtons: null,
    activeViewIdSet,
} as unknown) as ComponentProps<typeof ViewTableContainer>

beforeEach(() => {
    jest.clearAllMocks()
    history.push = jest.fn()
    ;(minProps.getViewIdToDisplay as jest.MockedFunction<
        typeof minProps.getViewIdToDisplay
    >).mockReturnValue(minProps.activeView.get('id'))
    ;(minProps.getView as jest.MockedFunction<
        typeof minProps.getView
    >).mockReturnValue(minProps.activeView)
    ;(minProps.isLoading as jest.MockedFunction<
        typeof minProps.isLoading
    >).mockReturnValue(false)
})

afterEach(() => {
    ;((history.push as unknown) as jest.SpyInstance).mockRestore()
})

describe('<ViewTable />', () => {
    describe('on mount', () => {
        it('should update view and fetch items in search mode', () => {
            const cursor = '15234'
            const searchView = minProps.activeView.set('search', 'foo')
            render(
                <ViewTableContainer
                    {...minProps}
                    isSearch={true}
                    urlSearchView={searchView}
                    location={
                        {search: stringify({cursor}), pathname: ''} as Location<
                            any
                        >
                    }
                />
            )
            expect(minProps.updateView).toHaveBeenLastCalledWith(
                searchView,
                false
            )
            expect(minProps.fetchViewItems).toHaveBeenLastCalledWith(
                null,
                cursor
            )
        })

        it('should set the active view as fetch items to the suggested view when no urlViewId and no active view', () => {
            render(
                <ViewTableContainer
                    {...minProps}
                    activeView={fromJS({})}
                    urlViewId={null}
                />
            )
            expect(minProps.setViewActive).toHaveBeenLastCalledWith(
                minProps.activeView
            )
            expect(minProps.fetchViewItems).toHaveBeenLastCalledWith(
                null,
                undefined
            )
        })

        it('should set the active view and fetch items to the suggested view when there is urlViewId and active view', () => {
            render(
                <ViewTableContainer
                    {...minProps}
                    urlViewId={minProps.activeView.get('id')}
                />
            )
            expect(minProps.setViewActive).toBeCalledWith(minProps.activeView)
            expect(minProps.fetchViewItems).toBeCalledWith(null, undefined)
        })

        it('should fetch items and not set the active view when active view is not empty and no urlViewId', () => {
            render(<ViewTableContainer {...minProps} urlViewId={null} />)
            expect(minProps.updateView).not.toBeCalled()
            expect(minProps.setViewActive).not.toBeCalled()
            expect(minProps.fetchViewItems).toBeCalledWith(null, undefined)
        })

        it('should redirect to the app when suggested view id does not match urlViewId', () => {
            render(<ViewTableContainer {...minProps} urlViewId="42" />)
            expect(history.push).toHaveBeenLastCalledWith('/app')
        })

        it('should not redirect to the app when suggested view id match urlViewId', () => {
            render(<ViewTableContainer {...minProps} />)
            expect(history.push).not.toHaveBeenCalled()
        })

        it('should set the new active view based on visibility params and fetch the view items when the url is a creation one', () => {
            render(
                <ViewTableContainer
                    {...minProps}
                    config={fromJS({newView: () => 'foo'})}
                    location={
                        {
                            search: '',
                            pathname: `/app/tickets/new/${ViewVisibility.Private}`,
                        } as Location<any>
                    }
                    match={
                        {params: {visibility: ViewVisibility.Private}} as any
                    }
                />
            )

            expect(minProps.updateView).toHaveBeenCalledWith('foo')
            expect(minProps.fetchViewItemsCancellable).toHaveBeenCalledTimes(1)
        })

        it('should set the new active view based on passed view name and filter state and fetch the view items when the url is a creation one', () => {
            const state = {
                viewName: 'Assigned to: Acme Support',
                filters: 'eq(ticket.assignee_user.id, 8)',
            }
            render(
                <ViewTableContainer
                    {...minProps}
                    config={fromJS({
                        newView: (
                            visibility: ViewVisibility,
                            viewName: string,
                            filters: string
                        ) => ({
                            visibility,
                            viewName,
                            filters,
                        }),
                    })}
                    location={
                        {
                            pathname: `/app/tickets/new/${ViewVisibility.Private}`,
                            state,
                        } as Location<any>
                    }
                    match={
                        {params: {visibility: ViewVisibility.Private}} as any
                    }
                />
            )

            expect(minProps.updateView).toHaveBeenCalledWith({
                visibility: ViewVisibility.Private,
                ...state,
            })
            expect(minProps.fetchViewItemsCancellable).toHaveBeenCalledTimes(1)
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
                        {...minProps}
                        location={
                            {
                                search: stringify({cursor: '789456'}),
                                pathname: '',
                            } as Location<any>
                        }
                        navigation={fromJS({current_cursor: cursor})}
                        isLoading={() => true}
                        isOnFirstPage={false}
                    />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...minProps}
                        location={
                            {
                                search: stringify({cursor: '1256'}),
                                pathname: '',
                            } as Location<any>
                        }
                        navigation={fromJS({
                            current_cursor: cursor,
                            prev_items: 'foo',
                        })}
                        isLoading={() => false}
                        isOnFirstPage={false}
                    />
                )
                expect(history.push).toBeCalledWith({
                    ...minProps.location,
                    search: 'cursor=1234',
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
                        {...minProps}
                        location={
                            {
                                search: stringify({cursor: '789456'}),
                                pathname: '',
                            } as Location<any>
                        }
                        navigation={fromJS({current_cursor: cursor})}
                        isLoading={() => true}
                    />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...minProps}
                        location={
                            {
                                search: stringify({cursor: '1256'}),
                                pathname: '',
                            } as Location<any>
                        }
                        navigation={fromJS({current_cursor: cursor})}
                        isLoading={() => false}
                    />
                )
                expect(history.push).toBeCalledWith({
                    ...minProps.location,
                    search: '',
                })
            }
        )

        it('should call fetchViewItems with the URL cursor when URL cursor changes', () => {
            const cursor = '1523467'
            const {rerender} = render(<ViewTableContainer {...minProps} />)
            jest.clearAllMocks()
            rerender(
                <ViewTableContainer
                    {...minProps}
                    location={
                        {search: stringify({cursor}), pathname: ''} as Location<
                            any
                        >
                    }
                />
            )
            expect(minProps.fetchViewItemsCancellable).toHaveBeenLastCalledWith(
                null,
                cursor,
                null
            )
        })

        it(
            'should call fetchViewItems with default parameters when there is a stored cursor and no URL cursor ' +
                'and we are not currently on the first page',
            () => {
                const {rerender} = render(<ViewTableContainer {...minProps} />)
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...minProps}
                        navigation={fromJS({current_cursor: '12345678'})}
                        isOnFirstPage={false}
                    />
                )
                expect(minProps.fetchViewItemsCancellable).toBeCalledWith(
                    null,
                    null,
                    null
                )
            }
        )

        it('should update the view and call fetchViewItems with default parameters when entering "search" mode', () => {
            const {rerender} = render(
                <ViewTableContainer {...minProps} isSearch={false} />
            )
            jest.clearAllMocks()
            rerender(<ViewTableContainer {...minProps} isSearch={true} />)

            expect(minProps.updateView).toHaveBeenLastCalledWith(
                minProps.urlSearchView,
                false
            )
            expect(minProps.fetchViewItemsCancellable).toHaveBeenLastCalledWith(
                null,
                null,
                null
            )
        })

        it(
            'should set the new view as active and call fetchViewItems with default parameters when entering "add new" ' +
                'mode',
            () => {
                const newView = fromJS({}) as Map<any, any>
                const {rerender} = render(
                    <ViewTableContainer {...minProps} isUpdate />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...minProps}
                        config={fromJS({
                            newView: () => newView,
                        })}
                        isUpdate={false}
                    />
                )

                expect(minProps.updateView).toHaveBeenLastCalledWith(newView)
                expect(
                    minProps.fetchViewItemsCancellable
                ).toHaveBeenLastCalledWith(null, null, null)
            }
        )

        it(
            'should set the suggested view as active and call fetchViewItems with default parameters when leaving ' +
                '"search" mode',
            () => {
                const someView = fromJS({}) as Map<any, any>
                ;(minProps.getView as jest.MockedFunction<
                    typeof minProps.getView
                >).mockReturnValue(someView)

                const {rerender} = render(
                    <ViewTableContainer {...minProps} isSearch />
                )
                jest.clearAllMocks()
                rerender(<ViewTableContainer {...minProps} isSearch={false} />)

                expect(minProps.setViewActive).toHaveBeenLastCalledWith(
                    someView
                )
                expect(
                    minProps.fetchViewItemsCancellable
                ).toHaveBeenLastCalledWith(null, null, null)
            }
        )

        it(
            'should set the suggested view as active and call fetchViewItems with default parameters when leaving ' +
                '"add new" mode',
            () => {
                const someView = fromJS({}) as Map<any, any>
                ;(minProps.getView as jest.MockedFunction<
                    typeof minProps.getView
                >).mockReturnValue(someView)

                const {rerender} = render(
                    <ViewTableContainer {...minProps} isUpdate={false} />
                )
                jest.clearAllMocks()
                rerender(<ViewTableContainer {...minProps} isUpdate />)

                expect(minProps.setViewActive).toHaveBeenLastCalledWith(
                    someView
                )
                expect(
                    minProps.fetchViewItemsCancellable
                ).toHaveBeenLastCalledWith(null, null, null)
            }
        )

        it(
            'should set the suggested view as active and call fetchViewItems with default parameters when suggested ' +
                'view changed',
            () => {
                const {rerender} = render(<ViewTableContainer {...minProps} />)

                jest.clearAllMocks()
                ;(minProps.getViewIdToDisplay as jest.MockedFunction<
                    typeof minProps.getViewIdToDisplay
                >)
                    .mockReturnValueOnce('1' as any)
                    .mockReturnValueOnce('2' as any)
                rerender(<ViewTableContainer {...minProps} />)

                expect(minProps.setViewActive).toHaveBeenCalledTimes(1)
                expect(
                    minProps.fetchViewItemsCancellable
                ).toHaveBeenLastCalledWith(null, null, null)
            }
        )

        it('should call fetchViewItems when view gets activated', () => {
            const {rerender} = render(
                <ViewTableContainer
                    {...minProps}
                    activeView={minProps.activeView.set(
                        'deactivated_datetime',
                        '2020-06-15 22:56:32.708038'
                    )}
                />
            )
            jest.clearAllMocks()
            rerender(
                <ViewTableContainer
                    {...minProps}
                    activeView={minProps.activeView.set(
                        'deactivated_datetime',
                        null
                    )}
                />
            )
            expect(minProps.fetchViewItemsCancellable).toHaveBeenLastCalledWith(
                null,
                null,
                null
            )
        })

        it('should not call fetchViewItems when the user goes from a deactivated view to a valid one', () => {
            const {rerender} = render(
                <ViewTableContainer
                    {...minProps}
                    activeView={minProps.activeView.set(
                        'deactivated_datetime',
                        '2020-06-15 22:56:32.708038'
                    )}
                />
            )
            jest.clearAllMocks()
            rerender(
                <ViewTableContainer
                    {...minProps}
                    activeView={minProps.activeView
                        .set('id', 10)
                        .set('deactivated_datetime', null)}
                />
            )
            expect(minProps.fetchViewItemsCancellable).not.toHaveBeenCalled()
        })

        it(
            'should not call fetchViewItems when there is a stored cursor and no URL cursor and we are not currently ' +
                'on the first page because a request is currently loading',
            () => {
                const {rerender} = render(<ViewTableContainer {...minProps} />)
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...minProps}
                        navigation={fromJS({current_cursor: '12345678'})}
                        isOnFirstPage={false}
                        isLoading={() => true}
                    />
                )
                expect(
                    minProps.fetchViewItemsCancellable
                ).not.toHaveBeenCalled()
            }
        )

        it(
            'should not call fetchViewItems when the stored cursor and URL cursor are different and we are not ' +
                'currently on the first page because a request is currently loading',
            () => {
                const {rerender} = render(
                    <ViewTableContainer
                        {...minProps}
                        location={
                            {
                                search: stringify({cursor: '1256'}),
                                pathname: '',
                            } as Location<any>
                        }
                        navigation={fromJS({current_cursor: '1256'})}
                    />
                )
                jest.clearAllMocks()
                rerender(
                    <ViewTableContainer
                        {...minProps}
                        location={
                            {
                                search: stringify({cursor: '12345678'}),
                                pathname: '',
                            } as Location<any>
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
                <ViewTableContainer {...minProps} isSearch={true} />
            )
            jest.clearAllMocks()
            rerender(
                <ViewTableContainer
                    {...minProps}
                    isSearch={true}
                    activeView={minProps.activeView.set(
                        'search',
                        'foo search query'
                    )}
                />
            )
            expect(minProps.fetchViewItemsCancellable).toHaveBeenLastCalledWith(
                null,
                null,
                null
            )
        })
    })

    describe('render', () => {
        it('empty view', () => {
            const {container} = render(
                <ViewTableContainer
                    {...minProps}
                    activeView={fromJS({})}
                    isUpdate={false}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('default view', () => {
            const {container} = render(<ViewTableContainer {...minProps} />)
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a warning because the view is deactivated', () => {
            const {container} = render(
                <ViewTableContainer
                    {...minProps}
                    activeView={minProps.activeView.set(
                        'deactivated_datetime',
                        '2020-06-15 22:56:32.708038'
                    )}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        })
    })
})
