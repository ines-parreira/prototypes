import React, {ComponentProps} from 'react'
import {fromJS, Map} from 'immutable'
import {render, fireEvent, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {view as viewFixture} from '../../../../../fixtures/views'
import {RootState, StoreDispatch} from '../../../../../state/types'
import * as utils from '../../../../../utils'
import {
    viewCreated,
    viewUpdated,
} from '../../../../../state/entities/views/actions'
import {activeViewIdSet} from '../../../../../state/ui/views/actions'
import {
    SUBMIT_NEW_VIEW_ERROR,
    SUBMIT_UPDATE_VIEW_ERROR,
} from '../../../../../state/views/constants'
import {
    addFieldFilter,
    createJob,
    deleteView,
    fetchViewItems,
    resetView,
    submitView,
} from '../../../../../state/views/actions'
import * as viewSelectors from '../../../../../state/views/selectors'
import {FilterTopbar} from '../FilterTopbar'
import {JobType} from '../../../../../models/job/types'

const ticketChannelEqualsEmailFilter = "eq('ticket.channel', 'email')"

jest.mock('../../../../../state/entities/views/actions')
jest.mock('../../../../../state/ui/views/actions')
jest.mock('../../../../../state/views/actions')

const createViewWithFilters = (filters: string) =>
    fromJS({
        ...viewFixture,
        editMode: true,
        filters,
        filters_ast: utils.getAST(filters),
    }) as Map<any, any>

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    agents: fromJS({}),
    currentUser: fromJS({first_name: 'Steve', id: 2}),
    schemas: fromJS({}),
    teams: fromJS({}),
    views: fromJS({
        active: createViewWithFilters(ticketChannelEqualsEmailFilter),
        items: [createViewWithFilters(ticketChannelEqualsEmailFilter)],
    }),
    tickets: fromJS({
        items: [{id: 1}],
    }),
}

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

jest.mock(
    'pages/common/components/button/ConfirmButton',
    () =>
        ({onConfirm}: ComponentProps<typeof ConfirmButton>) =>
            <div onClick={onConfirm} />
)

beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(utils, 'getDefaultOperator').mockImplementation(() => 'foo')
    jest.spyOn(global.Date, 'now').mockImplementation(() => 0) // ConfirmButton generates ids based on the date
    submitViewMock.mockImplementation(() => () => Promise.resolve(viewFixture))
    deleteViewMock.mockImplementation(
        () => () => fromJS({...viewFixture, id: 8}) as Map<any, any>
    )
    fetchViewItemsMock.mockImplementation(() => () => ({}))
    createJobMock.mockImplementation(() => () => Promise.resolve())
})

afterEach(() => {
    ;(utils.getDefaultOperator as unknown as jest.SpyInstance).mockRestore()
    ;(global.Date.now as unknown as jest.SpyInstance).mockRestore()
    fetchViewItemsMock.mockRestore()
})

const minProps = {
    cancelFetchViewItemsCancellable: jest.fn(),
    fetchViewItemsCancellable: jest.fn(),
    isSearch: false,
    isUpdate: true,
    type: 'ticket',
} as unknown as ComponentProps<typeof FilterTopbar>

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
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} isUpdate={false} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should not render footer when in search mode', () => {
            const {container} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} isSearch={true} />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render view sharing and export tickets buttons when is in update mode', () => {
            const {queryByText, queryByTitle} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            expect(queryByTitle('Export all view tickets')).toBeTruthy()
            expect(queryByText('View Sharing Button')).toBeTruthy()
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
            expect(queryByTitle('Export all view tickets')).toBeNull()
        })

        it('should not render view sharing and export tickets buttons when is not in update mode', () => {
            const {queryByText, queryByTitle} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} isUpdate={false} />
                </Provider>
            )
            expect(queryByTitle('Export all view tickets')).toBeNull()
            expect(queryByText('View Sharing Button')).toBeNull()
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
            expect(queryByText('Export all view tickets')).toBeNull()
            expect(queryByText('View Sharing Button')).toBeNull()
        })

        it('should not render export tickets button on a customer view', () => {
            const {queryByTitle} = render(
                <Provider store={mockStore(defaultState)}>
                    <FilterTopbar {...minProps} type="customer" />
                </Provider>
            )
            expect(queryByTitle('Export all view tickets')).toBeNull()
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
                        views: defaultState.views!.set(
                            'active',
                            createViewWithFilters('')
                        ),
                    })}
                >
                    <FilterTopbar {...minProps} />
                </Provider>
            )
            expect(minProps.fetchViewItemsCancellable).toHaveBeenLastCalledWith(
                undefined,
                undefined,
                undefined
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
                            active: createViewWithFilters(
                                ticketChannelEqualsEmailFilter
                            ).set('name', viewFixture.name + ' foo'),
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
                            active: createViewWithFilters(
                                ticketChannelEqualsEmailFilter
                            ).set('id', viewFixture.id + 1),
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
        const activeViewIdSetMock = activeViewIdSet as jest.MockedFunction<
            typeof activeViewIdSet
        >
        activeViewIdSetMock.mockImplementation(jest.fn())

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

        fireEvent.click(getByText('Update view'))

        await waitFor(() => {
            fireEvent.click(getByText('Confirm'))
            expect(viewUpdatedMock).not.toHaveBeenCalled()
            expect(activeViewIdSetMock).not.toHaveBeenCalled()
        })
    })

    it('should not update the view and not set active view if create view request failed', async () => {
        const isDirtyMock = jest.spyOn(viewSelectors, 'isDirty')
        isDirtyMock.mockReturnValue(true)
        const viewCreatedMock = viewCreated as jest.MockedFunction<
            typeof viewCreated
        >
        viewCreatedMock.mockImplementation(jest.fn())
        const activeViewIdSetMock = activeViewIdSet as jest.MockedFunction<
            typeof activeViewIdSet
        >
        activeViewIdSetMock.mockImplementation(jest.fn())

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
        const {getByText} = render(
            <Provider
                store={mockStore({
                    ...defaultState,
                    views: fromJS({
                        ...defaultState.views,
                        active: createViewWithFilters(
                            ticketChannelEqualsEmailFilter
                        ).delete('id'),
                    }),
                })}
            >
                <FilterTopbar {...minProps} isUpdate={false} />
            </Provider>
        )

        fireEvent.click(getByText('Create view'))
        await waitFor(() => {
            expect(
                (getByText('Create view') as HTMLButtonElement).disabled
            ).toBe(false)
        })

        expect(viewCreatedMock).not.toHaveBeenCalled()
        expect(activeViewIdSetMock).not.toHaveBeenCalled()
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
            getByText('Save as new view')
                .closest('.dropdown-menu')!
                .getAttribute('aria-hidden')
        ).toBe('true')

        fireEvent.click(toggle)
        expect(
            getByText('Save as new view')
                .closest('.dropdown-menu')!
                .getAttribute('aria-hidden')
        ).toBe('false')

        fireEvent.click(toggle)
        expect(
            getByText('Save as new view')
                .closest('.dropdown-menu')!
                .getAttribute('aria-hidden')
        ).toBe('true')
    })

    it('should close popover on view change', async () => {
        const isDirtyMock = jest.spyOn(viewSelectors, 'isDirty')
        isDirtyMock.mockReturnValue(true)
        const {rerender, getByText, queryByText} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText('Update view'))
        await waitFor(() => {
            expect(getByText('Confirm')).toBeTruthy()
        })

        rerender(
            <Provider
                store={mockStore({
                    ...defaultState,
                    views: fromJS({
                        active: fromJS({
                            ...viewFixture,
                            editMode: false,
                            filters: ticketChannelEqualsEmailFilter,
                            filters_ast: utils.getAST(
                                ticketChannelEqualsEmailFilter
                            ),
                        }),
                        items: [
                            createViewWithFilters(
                                ticketChannelEqualsEmailFilter
                            ),
                        ],
                    }),
                })}
            >
                <FilterTopbar {...minProps} />
            </Provider>
        )
        await waitFor(() => {
            expect(queryByText('Confirm')).toBeNull()
        })
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

        fireEvent.click(getByText('Update view'))
        await waitFor(() => {
            expect(getByText('Confirm')).toBeTruthy()
        })
        fireEvent.click(getByText('Cancel'))
        await waitFor(() => {
            expect(queryByText('Confirm')).toBeNull()
        })
    })

    it('should display a temporary message when attempting to save an unchanged view', async () => {
        jest.useFakeTimers()

        const isDirtyMock = jest.spyOn(viewSelectors, 'isDirty')
        isDirtyMock.mockImplementation(() => false)
        const {getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText('Update view'))
        await waitFor(() => {
            expect(
                getByText(/No changes have been made/i).classList.contains(
                    'visible'
                )
            ).toBe(true)
        })
        jest.runOnlyPendingTimers()
        await waitFor(() => {
            expect(
                getByText(/No changes have been made/i).classList.contains(
                    'visible'
                )
            ).toBe(false)
        })

        jest.useRealTimers()
    })

    it('should call export ticket job on export tickets button click, and disable the button during the call', async () => {
        const {getByTitle} = render(
            <Provider store={mockStore(defaultState)}>
                <FilterTopbar {...minProps} isUpdate={true} />
            </Provider>
        )

        expect(
            (getByTitle('Export all view tickets') as HTMLButtonElement)
                .disabled
        ).toBe(false)

        fireEvent.click(getByTitle('Export all view tickets'))
        expect(
            (getByTitle('Export all view tickets') as HTMLButtonElement)
                .disabled
        ).toBe(true)

        expect(createJobMock).toHaveBeenCalledWith(
            createViewWithFilters(ticketChannelEqualsEmailFilter),
            JobType.ExportTicket,
            {}
        )
        await waitFor(() => {
            expect(
                (getByTitle('Export all view tickets') as HTMLButtonElement)
                    .disabled
            ).toBe(false)
        })
    })
})
