import {act, fireEvent, render, waitFor} from '@testing-library/react'

import {fromJS, Map} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {logEvent, SegmentEvent} from 'common/segment'
import {mockSearchRank} from 'fixtures/searchRank'
import {view as viewFixture} from 'fixtures/views'
import {JobType} from 'models/job/types'

import {EntityType, View, ViewCategory} from 'models/view/types'
import SearchRankScenarioContext from 'pages/common/components/SearchRankScenarioProvider/SearchRankScenarioContext'
import history from 'pages/history'
import {viewCreated, viewUpdated} from 'state/entities/views/actions'
import {RootState, StoreDispatch} from 'state/types'
import {initialState as ticketNavbarInitialState} from 'state/ui/ticketNavbar/reducer'
import * as viewsActions from 'state/ui/views/actions'
import {
    addFieldFilter,
    createJob,
    deleteView,
    fetchViewItems,
    resetView,
    submitView,
} from 'state/views/actions'
import {
    SUBMIT_NEW_VIEW_ERROR,
    SUBMIT_UPDATE_VIEW_ERROR,
} from 'state/views/constants'
import * as viewSelectors from 'state/views/selectors'
import * as utils from 'utils'
import {FilterTopbar} from 'pages/common/components/ViewTable/FilterTopbar'
import {useSplitTicketView} from 'split-ticket-view-toggle'
import {useFlag} from 'common/flags'

const ticketChannelEqualsEmailFilter = "eq('ticket.channel', 'email')"

jest.spyOn(viewsActions, 'activeViewIdSet')
jest.mock('state/entities/views/actions')
jest.mock('state/views/actions')
jest.mock('common/segment')

jest.mock('split-ticket-view-toggle/hooks/useSplitTicketView')
const mockUseSplitTicketViewMock = useSplitTicketView as jest.Mock

jest.mock('common/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

const createViewWithFilters = (filters: string) => ({
    ...viewFixture,
    editMode: true,
    filters,
    filters_ast: utils.getAST(filters) as unknown as Record<string, unknown>,
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const views = [
    createViewWithFilters(ticketChannelEqualsEmailFilter),
    {...createViewWithFilters(ticketChannelEqualsEmailFilter), id: 3},
]

const defaultState = {
    agents: fromJS({}),
    currentUser: fromJS({first_name: 'Steve', id: 2, settings: []}),
    entities: {
        sections: {},
        views: views.reduce((acc, view) => {
            acc[view.id] = view
            return acc
        }, {} as Record<number, View>),
    },
    schemas: fromJS({}),
    teams: fromJS({}),
    views: fromJS({
        active: views[0],
        items: views,
        _internal: {
            lastViewId: 3,
        },
    }),
    tickets: fromJS({
        items: [{id: 1}],
    }),
    ui: {
        ticketNavbar: ticketNavbarInitialState,
    },
} as Partial<RootState>

const submitViewMock: jest.SpyInstance = submitView as jest.MockedFunction<
    typeof submitView
>
const deleteViewMock: jest.SpyInstance = deleteView as jest.MockedFunction<
    typeof deleteView
>
const fetchViewItemsMock: jest.SpyInstance =
    fetchViewItems as jest.MockedFunction<typeof fetchViewItems>

const createJobMock: jest.SpyInstance = createJob as jest.MockedFunction<
    typeof createJob
>

jest.mock('../Filters/ViewFilters', () => {
    return () => <div>ViewFilters</div>
})

jest.mock('../../ViewSharing/ViewSharingButton', () => () => (
    <button>View Sharing Button</button>
))

const globalDataNow = jest.spyOn(global.Date, 'now').mockImplementation(() => 0) // ConfirmButton generates ids based on the date
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>

beforeEach(() => {
    jest.spyOn(utils, 'getDefaultOperator').mockImplementation(() => 'foo')
    submitViewMock.mockImplementation(() => () => Promise.resolve(viewFixture))
    deleteViewMock.mockImplementation(
        () => () => fromJS({...viewFixture, id: 8}) as Map<any, any>
    )
    fetchViewItemsMock.mockImplementation(() => () => ({}))
    createJobMock.mockImplementation(() => () => Promise.resolve())

    mockUseSplitTicketViewMock.mockReturnValue({isEnabled: false})
})

afterEach(() => {
    ;(utils.getDefaultOperator as unknown as jest.SpyInstance).mockRestore()
    globalDataNow.mockRestore()
    fetchViewItemsMock.mockRestore()
})

const minProps = {
    activeView: fromJS(views[0]),
    cancelFetchViewItemsCancellable: jest.fn(),
    fetchViewItemsCancellable: jest.fn(),
    isSearch: false,
    isUpdate: true,
    type: EntityType.Ticket,
}

describe('<FilterTopbar />', () => {
    describe('render', () => {
        it('should render active view filters', () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render delete button when creating new view', () => {
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} isUpdate={false} />
                </Provider>
            )
            expect(queryByText(/delete view/)).not.toBeInTheDocument()
        })

        it('should not render footer when in search mode', () => {
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} isSearch={true} />
                </Provider>
            )
            expect(queryByText(/update view/)).not.toBeInTheDocument()
        })

        it('should render view sharing and export tickets buttons when is in update mode', () => {
            const {queryByText, queryByTitle} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            expect(queryByTitle('Export all view tickets')).toBeInTheDocument()
            expect(queryByText('View Sharing Button')).toBeInTheDocument()
        })

        it('should not render export tickets buttons where there are no tickets available', () => {
            const state = {
                ...defaultState,
                tickets: fromJS({
                    items: [],
                }),
            }

            const {queryByTitle} = render(
                <Provider store={mockStore(state)}>
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            expect(
                queryByTitle('Export all view tickets')
            ).not.toBeInTheDocument()
        })

        it('should not render view sharing and export tickets buttons when is not in update mode', () => {
            const {queryByText, queryByTitle} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} isUpdate={false} />
                </Provider>
            )
            expect(
                queryByTitle('Export all view tickets')
            ).not.toBeInTheDocument()
            expect(queryByText('View Sharing Button')).not.toBeInTheDocument()
        })

        it('not render view sharing and export tickets buttons when is in search mode', () => {
            const {queryByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar
                        {...minProps}
                        isUpdate={true}
                        isSearch={true}
                    />
                </Provider>
            )
            expect(
                queryByText('Export all view tickets')
            ).not.toBeInTheDocument()
            expect(queryByText('View Sharing Button')).not.toBeInTheDocument()
        })

        it('should not render export tickets button on a customer view', () => {
            const {queryByTitle} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} type={EntityType.Customer} />
                </Provider>
            )
            expect(
                queryByTitle('Export all view tickets')
            ).not.toBeInTheDocument()
        })
    })

    describe('updating filters', () => {
        beforeEach(() => {
            ;(
                addFieldFilter as jest.MockedFunction<
                    typeof addFieldFilter
                > as jest.SpyInstance
            ).mockImplementation(() => () => ({}))
        })

        it('should update active view on add field', () => {
            const {getByText} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            fireEvent.click(getByText('Channel'))
            expect(addFieldFilter).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    name: 'channel',
                }),
                {
                    left: 'ticket.channel',
                    operator: 'foo',
                }
            )
        })
    })

    describe('on active view change', () => {
        const defaultActiveView = defaultState.views!.get('active') as Map<
            any,
            any
        >
        const params = {
            orderBy: `${defaultActiveView.get('order_by') as string}:${
                defaultActiveView.get('order_dir') as string
            }`,
        }
        const activeView = fromJS(createViewWithFilters(''))

        it('should fetch view items', () => {
            const {rerender} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} />
                </Provider>
            )

            rerender(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        views: fromJS({
                            ...defaultState.views,
                            active: activeView,
                        }),
                    })}
                >
                    <FilterTopbar {...minProps} activeView={activeView} />
                </Provider>
            )
            expect(minProps.fetchViewItemsCancellable).toHaveBeenLastCalledWith(
                undefined,
                undefined,
                undefined,
                null,
                params
            )
        })

        it('should fetch view items with searchRank from the context', () => {
            const {rerender} = render(
                <SearchRankScenarioContext.Provider value={mockSearchRank}>
                    <Provider store={mockStore(defaultState)}>
                        <FilterTopbar {...minProps} />
                    </Provider>
                </SearchRankScenarioContext.Provider>
            )
            rerender(
                <SearchRankScenarioContext.Provider value={mockSearchRank}>
                    <Provider
                        store={mockStore({
                            ...defaultState,
                            views: fromJS({
                                ...defaultState.views,
                                active: activeView,
                            }),
                        })}
                    >
                        <FilterTopbar {...minProps} activeView={activeView} />
                    </Provider>
                </SearchRankScenarioContext.Provider>
            )
            expect(minProps.fetchViewItemsCancellable).toHaveBeenLastCalledWith(
                undefined,
                undefined,
                undefined,
                mockSearchRank,
                params
            )
        })

        it('should not fetch view items when filters did not change', () => {
            const {rerender} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            rerender(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        views: fromJS({
                            ...defaultState.views,
                            active: {
                                ...createViewWithFilters(
                                    ticketChannelEqualsEmailFilter
                                ),
                                name: `${viewFixture.name} foo`,
                            },
                        }),
                    })}
                >
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            expect(minProps.fetchViewItemsCancellable).not.toHaveBeenCalled()
        })

        it('should not fetch view items when view id changed', () => {
            const {rerender} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            rerender(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        views: fromJS({
                            ...defaultState.views,
                            active: {
                                ...createViewWithFilters(
                                    ticketChannelEqualsEmailFilter
                                ),
                                id: viewFixture.id + 1,
                            },
                        }),
                    })}
                >
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            expect(minProps.fetchViewItemsCancellable).not.toHaveBeenCalled()
        })

        it('should not fetch view items when filters are not valid', () => {
            const {rerender} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            const getAreFiltersValidSpy = jest.spyOn(
                viewSelectors,
                'areFiltersValid'
            )
            getAreFiltersValidSpy.mockImplementationOnce(() => false)

            rerender(
                <Provider
                    store={mockStore({
                        ...defaultState,
                        views: fromJS({
                            ...defaultState.views,
                            active: createViewWithFilters(''),
                        }),
                    })}
                >
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            expect(minProps.fetchViewItemsCancellable).not.toHaveBeenCalled()
        })
    })

    it('should not update the view and not set active view if update view request failed', async () => {
        const isDirtyMock = jest.spyOn(viewSelectors, 'isDirty')
        isDirtyMock.mockReturnValue(true)
        const viewUpdatedMock = viewUpdated as jest.MockedFunction<
            typeof viewUpdated
        >
        viewUpdatedMock.mockImplementation(jest.fn())

        submitViewMock.mockImplementation(
            () => () =>
                Promise.resolve({
                    type: SUBMIT_UPDATE_VIEW_ERROR,
                    error: {
                        message: 'Request failed with status code 403',
                        name: 'Error',
                    },
                    reason: 'Failed to submit view. Please try again',
                })
        )

        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/Update view/i))

        await waitFor(() => {
            fireEvent.click(getByText('Confirm'))
            expect(viewUpdatedMock).not.toHaveBeenCalled()
            expect(viewsActions.activeViewIdSet).not.toHaveBeenCalled()
        })
    })

    it('should not update the view and not set active view if create view request failed', async () => {
        const isDirtyMock = jest.spyOn(viewSelectors, 'isDirty')
        isDirtyMock.mockReturnValue(true)
        const viewCreatedMock = viewCreated as jest.MockedFunction<
            typeof viewCreated
        >
        viewCreatedMock.mockImplementation(jest.fn())

        submitViewMock.mockImplementation(
            () => () =>
                Promise.resolve({
                    type: SUBMIT_NEW_VIEW_ERROR,
                    error: {
                        message: 'Request failed with status code 403',
                        name: 'Error',
                    },
                    reason: 'Failed to submit view. Please try again',
                })
        )
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {id, ...activeView} = createViewWithFilters(
            ticketChannelEqualsEmailFilter
        )
        const {getByText, getByRole} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    views: fromJS({
                        ...defaultState.views,
                        active: activeView,
                    }),
                })}
            >
                <FilterTopbar {...minProps} isUpdate={false} />
            </Provider>
        )

        fireEvent.click(getByText(/Create view/i))
        await waitFor(() => {
            expect(
                getByRole('button', {name: /Create view/i})
            ).toBeAriaEnabled()
        })

        expect(viewCreatedMock).not.toHaveBeenCalled()
        expect(viewsActions.activeViewIdSet).not.toHaveBeenCalled()
    })

    it('should toggle dropdown on update view button dropdown caret click', () => {
        const isDirtyMock = jest.spyOn(viewSelectors, 'isDirty')
        isDirtyMock.mockReturnValue(true)
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} />
            </Provider>
        )
        const toggle = getByText('arrow_drop_down')

        expect(
            getByText(/Save as new view/i)
                .closest('.dropdown-menu')!
                .getAttribute('aria-hidden')
        ).toBe('true')

        fireEvent.click(toggle)
        expect(
            getByText(/Save as new view/i)
                .closest('.dropdown-menu')!
                .getAttribute('aria-hidden')
        ).toBe('false')

        fireEvent.click(toggle)
        expect(
            getByText(/Save as new view/i)
                .closest('.dropdown-menu')!
                .getAttribute('aria-hidden')
        ).toBe('true')
    })

    it('should close popover on cancel', async () => {
        const isDirtyMock = jest.spyOn(viewSelectors, 'isDirty')
        isDirtyMock.mockReturnValue(true)
        const resetViewMock: jest.SpyInstance =
            resetView as jest.MockedFunction<typeof resetView>
        resetViewMock.mockImplementationOnce(() => () => ({}))

        const {getByText, queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/Update view/i))
        await waitFor(() => {
            expect(getByText(/Confirm/i)).toBeInTheDocument()
        })
        fireEvent.click(getByText(/Cancel/i))
        await waitFor(() => {
            expect(queryByText(/Confirm/i)).not.toBeInTheDocument()
        })
    })

    it('should properly redirect to the last view when canceling', async () => {
        const {getByText} = render(
            <Provider store={mockStore({...defaultState})}>
                <FilterTopbar {...minProps} isUpdate={false} />
            </Provider>
        )

        fireEvent.click(getByText('Cancel'))
        await waitFor(() => {
            expect(viewsActions.activeViewIdSet).toHaveBeenCalledWith(3)
            expect(history.push).toHaveBeenCalledWith(
                `/app/tickets/${
                    defaultState.views!.getIn([
                        '_internal',
                        'lastViewId',
                    ]) as number
                }`
            )
        })
    })

    it('should display a temporary message when attempting to save an unchanged view', () => {
        jest.useFakeTimers()

        const isDirtyMock = jest.spyOn(viewSelectors, 'isDirty')
        isDirtyMock.mockImplementation(() => false)
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/Update view/i))
        expect(
            getByText(/No changes have been made/i).classList.contains(
                'visible'
            )
        ).toBe(true)

        act(() => jest.runOnlyPendingTimers())

        expect(
            getByText(/No changes have been made/i).classList.contains(
                'visible'
            )
        ).toBe(false)

        jest.useRealTimers()
    })

    it('should call export ticket job on export tickets button click, and disable the button during the call', async () => {
        const {getByTitle} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} isUpdate={true} />
            </Provider>
        )

        expect(
            getByTitle('Export all view tickets') as HTMLButtonElement
        ).toBeAriaEnabled()

        fireEvent.click(getByTitle('Export all view tickets'))
        expect(
            getByTitle('Export all view tickets') as HTMLButtonElement
        ).toBeAriaDisabled()

        expect(createJobMock).toHaveBeenCalledWith(
            fromJS(createViewWithFilters(ticketChannelEqualsEmailFilter)),
            JobType.ExportTicket,
            {}
        )
        await waitFor(() => {
            expect(
                getByTitle('Export all view tickets') as HTMLButtonElement
            ).toBeAriaEnabled()
        })
    })

    it('should send event to segment on export tickets button click', () => {
        const {getByTitle} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} isUpdate={true} />
            </Provider>
        )

        fireEvent.click(getByTitle('Export all view tickets'))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.TicketExport,
            expect.objectContaining({
                type: 'views-export-button',
            })
        )
    })

    it('should not render save button when view is system', () => {
        const systemView = fromJS({
            ...viewFixture,
            category: ViewCategory.System,
            editMode: true,
        })
        const {queryByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    views: fromJS({
                        active: systemView,
                    }),
                })}
            >
                <FilterTopbar {...minProps} activeView={systemView} />
            </Provider>
        )

        expect(queryByText('Update view')).not.toBeInTheDocument()
        expect(queryByText('This view cannot be saved')).toBeInTheDocument()
    })

    it('should render Ticket Fields filter when FF is enabled and when in search mode', () => {
        mockUseFlag.mockReturnValue(true)
        const {queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} isSearch={true} />
            </Provider>
        )

        expect(queryByText('Ticket Field')).toBeInTheDocument()
    })
})
