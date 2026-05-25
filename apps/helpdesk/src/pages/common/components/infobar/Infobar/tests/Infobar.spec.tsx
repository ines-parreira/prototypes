import type { ComponentProps } from 'react'
import { useState as mockUseState } from 'react'

import { useHelpdeskV2MS2Flag } from '@repo/feature-flags'
import { SegmentEvent, useSearchRankScenario } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { InfobarTicketDetails } from '@repo/tickets'
import {
    useHelpdeskV2MS1Flag,
    useHelpdeskV2MS3Flag,
} from '@repo/tickets/feature-flags'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { agents } from 'fixtures/agents'
import { mockSearchRank } from 'fixtures/searchRank'
import { Infobar } from 'pages/common/components/infobar/Infobar/Infobar'
import type InfobarCustomerInfo from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'
import { InfobarSearchResultsList } from 'pages/common/components/infobar/Infobar/InfobarSearchResultsList'
import type InfobarLayout from 'pages/common/components/infobar/InfobarLayout'
import type Modal from 'pages/common/components/modal/Modal'
import type ModalHeader from 'pages/common/components/modal/ModalHeader'
import type Search from 'pages/common/components/Search'
import {
    fetchPreviewCustomer,
    searchWithHighlights,
    similarCustomer,
} from 'state/infobar/actions'
import { FETCH_PREVIEW_CUSTOMER_SUCCESS } from 'state/infobar/constants'
import { setActiveCustomerAsReceiver } from 'state/newMessage/actions'
import { setCustomer, setCustomerInTicketState } from 'state/ticket/actions'
import { startEditionMode, stopEditionMode } from 'state/widgets/actions'
import { WidgetEnvironment } from 'state/widgets/types'
import { isCurrentlyOnCustomerPage } from 'utils'

const mockStore = configureMockStore()

jest.mock('state/infobar/actions')
jest.mock('state/widgets/actions')
const mockedSearch = assumeMock(searchWithHighlights)
const mockedSimilarCustomer = assumeMock(similarCustomer)
const mockedFetchPreviewCustomer = assumeMock(fetchPreviewCustomer)
const mockedStartEditionMode = assumeMock(startEditionMode)
const mockedStopEditionMode = assumeMock(stopEditionMode)

jest.mock(
    '@repo/logging',
    () =>
        ({
            ...jest.requireActual('@repo/logging'),
            logEvent: jest.fn(),
            useSearchRankScenario: jest.fn(),
        }) as Record<string, unknown>,
)

const { logEvent } = jest.requireMock('@repo/logging') as {
    logEvent: jest.Mock
}

jest.mock('@repo/tickets', () => ({
    InfobarTicketDetails: jest.fn(() => <div>InfobarTicketDetails</div>),
    InfobarTicketCustomerInstagramSection: jest.fn(() => (
        <div>InfobarTicketCustomerInstagramSection</div>
    )),
}))

const InfobarTicketDetailsMock = assumeMock(InfobarTicketDetails)

const store = mockStore({
    currentUser: fromJS(agents[1]),
})
// @ts-ignore
store.dispatch = jest.fn((param: () => unknown) =>
    typeof param === 'function' ? param() : param,
)

jest.mock(
    'pages/common/components/Search.tsx',
    () =>
        ({ onChange, onKeyDown, ...other }: ComponentProps<typeof Search>) => {
            const [value, setValue] = mockUseState('')

            return (
                <input
                    data-testid="Search"
                    {...other}
                    onChange={(e) => {
                        setValue(e.target.value)
                        onChange && onChange(e.target.value)
                    }}
                    onKeyDown={(e) => onKeyDown && onKeyDown(e, value)}
                />
            )
        },
)

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo.tsx',
    () =>
        ({
            customer,
            onEditCustomer,
        }: ComponentProps<typeof InfobarCustomerInfo>) => (
            <div data-testid="InfobarCustomerInfo">
                InfobarCustomerInfo
                <div>customer: {JSON.stringify(customer)}</div>
                {onEditCustomer && (
                    <button
                        data-testid="edit-customer-button"
                        onClick={() => {
                            const customerData = customer?.toJS?.() || customer
                            onEditCustomer(customerData as any)
                        }}
                    >
                        Edit Customer
                    </button>
                )}
            </div>
        ),
)

jest.mock(
    'pages/common/components/infobar/InfobarLayout',
    () =>
        ({ children }: ComponentProps<typeof InfobarLayout>) => (
            <div data-testid="InfobarLayout">{children}</div>
        ),
)

jest.mock('pages/common/components/modal/ModalHeader', () => {
    return ({ title }: ComponentProps<typeof ModalHeader>) => (
        <header>
            <h2>{title}</h2>
        </header>
    )
})

jest.mock('pages/common/components/modal/Modal', () => {
    return ({ isOpen, onClose, children }: ComponentProps<typeof Modal>) =>
        isOpen ? (
            <div role="dialog" aria-modal="true">
                <button onClick={onClose}>Close</button>
                {children}
            </div>
        ) : null
})

jest.mock('pages/customers/common/components/CustomerForm', () => {
    return () => <div data-testid="CustomerForm">CustomerForm</div>
})

jest.mock(
    'pages/common/components/MergeCustomers/MergeCustomersContainer',
    () =>
        ({
            display,
            onClose,
            onSuccess,
        }: {
            display: boolean
            onClose: () => void
            onSuccess?: () => void
        }) =>
            display ? (
                <div data-testid="MergeCustomersContainer">
                    MergeCustomersContainer
                    <button onClick={onClose}>CloseMerge</button>
                    {onSuccess && (
                        <button onClick={onSuccess}>MergeSuccess</button>
                    )}
                </div>
            ) : null,
)

jest.mock('pages/common/components/infobar/Infobar/InfobarSearchResultsList')
const InfobarSearchResultsListMock = assumeMock(InfobarSearchResultsList)

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerActions',
    () => ({
        __esModule: true,
        default: ({
            setCustomer,
            toggleMergeCustomerModal,
        }: {
            setCustomer: () => void
            toggleMergeCustomerModal: (show: boolean) => void
        }) => (
            <div>
                <button onClick={setCustomer}>Set Customer</button>
                <button onClick={() => toggleMergeCustomerModal(true)}>
                    ToggleMerge
                </button>
            </div>
        ),
    }),
)

jest.mock(
    'pages/common/components/infobar/Infobar/TicketTimelineWidget/CurrentTicketTimelineWidgetContainer',
    () => ({
        CurrentTicketTimelineWidgetContainer: () => (
            <div>CurrentTicketTimelineWidgetContainer</div>
        ),
    }),
)

jest.mock('state/integrations/selectors', () => ({
    ...jest.requireActual('state/integrations/selectors'),
    makeHasIntegrationOfTypes: jest.fn(),
}))
const makeHasIntegrationOfTypesMock = jest.mocked(
    require('state/integrations/selectors').makeHasIntegrationOfTypes,
)

const useSearchRankScenarioMock = assumeMock(useSearchRankScenario)

jest.mock('@repo/tickets/feature-flags', () => ({
    ...jest.requireActual('@repo/tickets/feature-flags'),
    useHelpdeskV2MS1Flag: jest.fn(),
    useHelpdeskV2MS3Flag: jest.fn(),
}))
const useHelpdeskV2MS1FlagMock = assumeMock(useHelpdeskV2MS1Flag)
const useHelpdeskV2MS3FlagMock = assumeMock(useHelpdeskV2MS3Flag)

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2MS2Flag: jest.fn(),
}))
const useHelpdeskV2MS2FlagMock = assumeMock(useHelpdeskV2MS2Flag)

jest.mock('utils', () => ({
    ...jest.requireActual('utils'),
    isCurrentlyOnCustomerPage: jest.fn(() => false),
}))
const isCurrentlyOnCustomerPageMock = assumeMock(isCurrentlyOnCustomerPage)

jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useGetTicket: jest.fn(() => ({
        data: null,
        isLoading: false,
        isError: false,
    })),
}))

jest.mock('state/ticket/actions', () => ({
    ...jest.requireActual('state/ticket/actions'),
    setCustomer: jest.fn(() => () => Promise.resolve()),
    setCustomerInTicketState: jest.fn((customer) => ({
        type: 'setCustomer',
        args: { customer },
    })),
}))

jest.mock('state/newMessage/actions', () => ({
    setActiveCustomerAsReceiver: jest.fn(() => () => Promise.resolve()),
}))

const commonProps: ComponentProps<typeof Infobar> = {
    context: WidgetEnvironment.Ticket,
    customer: fromJS({
        id: 2,
    }),
    identifier: '1',
    isRouteEditingWidgets: false,
    sources: fromJS({
        ticket: {
            customer: {
                id: 2,
            },
        },
        customer: {
            id: 2,
            data: { name: 'Marie Curie' },
        },
    }),
    widgets: fromJS({
        currentContext: 'customer',
        _internal: {
            isEditing: false,
            hasFetchedWidgets: true,
        },
    }),
}

let dateNowSpy: jest.SpiedFunction<typeof Date.now>
const defaultDateNowValue = 1487076708000
const customerId = 7

describe('<Infobar/>', () => {
    beforeEach(() => {
        useHelpdeskV2MS1FlagMock.mockReturnValue(false)
        useHelpdeskV2MS3FlagMock.mockReturnValue(false)
        useHelpdeskV2MS2FlagMock.mockReturnValue(false)
        makeHasIntegrationOfTypesMock.mockReturnValue(() => false)
        useSearchRankScenarioMock.mockImplementation(() => mockSearchRank)
        InfobarTicketDetailsMock.mockImplementation(() => (
            <div>InfobarTicketDetails</div>
        ))
        dateNowSpy = jest
            .spyOn(Date, 'now')
            .mockImplementation(() => defaultDateNowValue)
        mockedSimilarCustomer.mockReset()
        mockedFetchPreviewCustomer.mockReset()
        InfobarSearchResultsListMock.mockImplementation(
            ({
                errorMessage,
                defaultCustomerId,
                onCustomerClick,
                searchResults,
            }: ComponentProps<typeof InfobarSearchResultsList>) => (
                <div
                    data-testid="InfobarSearchResultsList"
                    onClick={() => {
                        void onCustomerClick(customerId, 0)
                    }}
                >
                    <div>errorMessage: {errorMessage}</div>
                    <div>defaultCustomerId: {defaultCustomerId}</div>
                    <div>searchResults: {JSON.stringify(searchResults)}</div>
                </div>
            ),
        )
    })

    afterEach(() => {
        dateNowSpy.mockRestore()
    })

    it('should render the error when loading error', async () => {
        mockedSearch.mockImplementation(
            () => () =>
                Promise.resolve({
                    error: 'generic_error',
                    resp: {
                        data: {
                            data: [],
                        },
                    },
                }),
        )

        const { container, getByTestId, findByText } = render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        fireEvent.change(getByTestId('Search'), { target: { value: 'query' } })
        fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

        await findByText(/Failed to do the search/i)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render ticket context', () => {
        const { container } = render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should sync switched customers from the new ticket details panel to the reply editor state', () => {
        const switchedCustomer = {
            id: 9,
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            channels: [],
        }
        const mockedSetCustomerInTicketState = jest.mocked(
            setCustomerInTicketState,
        )
        const mockedSetActiveCustomerAsReceiver = jest.mocked(
            setActiveCustomerAsReceiver,
        )

        useHelpdeskV2MS1FlagMock.mockReturnValue(true)
        InfobarTicketDetailsMock.mockImplementation(
            ({
                onSwitchCustomer,
            }: ComponentProps<typeof InfobarTicketDetails>) => (
                <button
                    onClick={() => {
                        onSwitchCustomer?.(switchedCustomer as any)
                    }}
                >
                    Switch customer in details
                </button>
            ),
        )

        render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        fireEvent.click(screen.getByText('Switch customer in details'))

        expect(mockedSetCustomerInTicketState).toHaveBeenCalledWith(
            fromJS(switchedCustomer),
        )
        expect(mockedSetActiveCustomerAsReceiver).toHaveBeenCalled()
    })

    it('should render customer context', () => {
        const { container } = render(
            <Provider store={store}>
                <Infobar
                    {...commonProps}
                    context={WidgetEnvironment.Customer}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render loading state because the search is in progress', () => {
        const { container, getByTestId } = render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        act(() => {
            fireEvent.change(getByTestId('Search'), {
                target: { value: 'query' },
            })
            fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })
        })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should ignore other keys', () => {
        const { container, getByTestId } = render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        act(() => {
            fireEvent.change(getByTestId('Search'), {
                target: { value: 'query' },
            })
            fireEvent.keyDown(getByTestId('Search'), { key: '{Backspace}' })
        })

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render loading state because the customer is being fetched', async () => {
        mockedSearch.mockImplementation(
            () => () =>
                Promise.resolve({
                    resp: { data: { data: [{ id: 7 }, { id: 8 }, { id: 9 }] } },
                }),
        )
        const { container, getByTestId } = render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )
        fireEvent.change(getByTestId('Search'), { target: { value: 'query' } })
        fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

        const InfobarSearchResultsList = await waitFor(() =>
            getByTestId('InfobarSearchResultsList'),
        )
        fireEvent.click(InfobarSearchResultsList)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render selected customer', async () => {
        mockedFetchPreviewCustomer.mockImplementation(
            (id) => () =>
                Promise.resolve({
                    type: FETCH_PREVIEW_CUSTOMER_SUCCESS,
                    resp: {
                        id,
                    },
                }),
        )
        mockedSearch.mockImplementation(
            () => () =>
                Promise.resolve({
                    resp: {
                        data: {
                            data: [
                                { entity: { id: 7 }, highlights: {} },
                                {
                                    entity: { id: 8 },
                                    highlights: {},
                                },
                                { entity: { id: 9 }, highlights: {} },
                            ],
                        },
                    },
                }),
        )
        const { container, getByTestId } = render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )
        fireEvent.change(getByTestId('Search'), { target: { value: 'query' } })
        fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

        const InfobarSearchResultsList = await waitFor(() =>
            getByTestId('InfobarSearchResultsList'),
        )
        fireEvent.click(InfobarSearchResultsList)
        await waitFor(() => getByTestId('InfobarCustomerInfo'))

        expect(container).toMatchSnapshot()
    })

    it('should render search results', async () => {
        mockedSearch.mockImplementation(
            () => () =>
                Promise.resolve({
                    resp: {
                        data: {
                            data: [
                                { entity: { id: 8 }, highlights: {} },
                                {
                                    entity: {
                                        id: 9,
                                    },
                                    highlights: {},
                                },
                            ],
                        },
                    },
                }),
        )
        const { container, getByTestId } = render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )
        fireEvent.change(getByTestId('Search'), { target: { value: 'query' } })
        fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

        await waitFor(() => getByTestId('InfobarSearchResultsList'))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render current customer with suggested customer', async () => {
        mockedSimilarCustomer.mockImplementation(
            () => () =>
                Promise.resolve({
                    customer: fromJS({ id: 10 }),
                }),
        )

        const { container, getByText } = render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        await waitFor(() => getByText(/Another customer profile/))
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render widgets edition mode', () => {
        const { container } = render(
            <Provider store={store}>
                <Infobar
                    {...commonProps}
                    widgets={fromJS({
                        _internal: {
                            isEditing: true,
                        },
                    })}
                    isRouteEditingWidgets={true}
                />
            </Provider>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    describe('onSearchResultClick()', () => {
        it('should reset spinner and keep customer empty on fetch customer failure', async () => {
            mockedSearch.mockImplementation(
                () => () =>
                    Promise.resolve({
                        resp: {
                            data: {
                                data: [{ entity: { id: 7 }, highlights: {} }],
                            },
                        },
                    }),
            )

            mockedSimilarCustomer.mockImplementation(
                () => () =>
                    Promise.resolve({
                        customer: fromJS({}),
                    }),
            )

            const { container, getByTestId } = render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )
            fireEvent.change(getByTestId('Search'), {
                target: { value: 'query' },
            })
            fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

            await waitFor(() =>
                fireEvent.click(getByTestId('InfobarSearchResultsList')),
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should register search rank scenario event when user clicks the result', async () => {
            const results: { id: number }[] = []
            for (let i = 0; i < 20; i++) {
                results.push({ id: i })
            }

            mockedSearch.mockImplementation(() => () => {
                dateNowSpy.mockReturnValue(defaultDateNowValue + 11)
                return Promise.resolve({
                    resp: {
                        data: { data: results },
                        // searchEngine: SearchEngine.ES,
                    },
                })
            })

            const { getByTestId } = render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            fireEvent.change(getByTestId('Search'), {
                target: { value: 'query' },
            })
            fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

            await waitFor(() =>
                fireEvent.click(getByTestId('InfobarSearchResultsList')),
            )

            expect(
                (mockSearchRank.registerResultsRequest as jest.Mock).mock.calls,
            ).toMatchSnapshot()
            expect(
                (mockSearchRank.registerResultsResponse as jest.Mock).mock
                    .calls,
            ).toMatchSnapshot()
            expect(
                (mockSearchRank.registerResultSelection as jest.Mock).mock
                    .calls,
            ).toMatchSnapshot()
        })
    })

    it('should not show widget edition button', () => {
        const store = configureMockStore()({
            currentUser: fromJS(agents[0]),
        })
        // @ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents,@typescript-eslint/no-redundant-type-constituents
        store.dispatch = jest.fn((param: () => unknown | unknown) =>
            typeof param === 'function' ? param() : param,
        )
        render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        expect(
            screen.queryByRole('button', {
                name: /settings/,
            }),
        ).toBeNull()
    })

    it('should start edition mode, because it is mounting in edition mode and the widgets state is not in edit mode', () => {
        render(
            <Provider store={store}>
                <Infobar {...commonProps} isRouteEditingWidgets={true} />
            </Provider>,
        )

        expect(mockedStartEditionMode).toHaveBeenNthCalledWith(
            1,
            commonProps.context,
        )
    })

    it('should stop edition mode, because it is mounting in read mode and the widgets state is in edit mode', () => {
        render(
            <Provider store={store}>
                <Infobar
                    {...commonProps}
                    widgets={fromJS({
                        _internal: {
                            isEditing: true,
                        },
                    })}
                />
            </Provider>,
        )

        expect(mockedStopEditionMode).toHaveBeenNthCalledWith(1)
    })

    it('should end the search rank scenario when user click Back button', async () => {
        mockedSearch.mockImplementation(() => () => {
            dateNowSpy.mockReturnValue(defaultDateNowValue + 11)
            return Promise.resolve({ resp: { data: { data: [{ id: 1 }] } } })
        })
        const { getByPlaceholderText, getByText, getByTestId } = render(
            <Provider store={store}>
                <Infobar {...commonProps} customer={fromJS({})} />
            </Provider>,
        )

        fireEvent.change(getByTestId('Search'), { target: { value: 'query' } })
        fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

        await waitFor(() => fireEvent.click(getByText('Back')))

        expect(mockSearchRank.endScenario).toHaveBeenCalledWith()
        await waitFor(() =>
            expect(
                getByPlaceholderText(
                    'Search for customers by email, order number, etc.',
                ),
            ),
        )
    })

    it('should end the search rank scenario when user performs the second search', async () => {
        mockedSearch.mockImplementation(() => () => {
            dateNowSpy.mockReturnValue(defaultDateNowValue + 11)
            return Promise.resolve({ resp: { data: { data: [{ id: 1 }] } } })
        })

        const { getByTestId, findByTestId } = render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        fireEvent.change(getByTestId('Search'), { target: { value: 'query' } })
        fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

        await waitFor(() => findByTestId('InfobarSearchResultsList'))
        fireEvent.change(getByTestId('Search'), { target: { value: 'query' } })
        fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

        expect(mockSearchRank.endScenario).toHaveBeenCalledWith()
    })

    it('should reset search and return to current customer profile after setting customer', async () => {
        const mockedSetCustomer = jest.mocked(setCustomer)
        const mockedSetActiveCustomerAsReceiver = jest.mocked(
            setActiveCustomerAsReceiver,
        )

        // Mock search response
        mockedSearch.mockImplementation(
            () => () =>
                Promise.resolve({
                    resp: {
                        data: {
                            data: [{ entity: { id: 7 }, highlights: {} }],
                        },
                    },
                }),
        )

        // Mock fetchPreviewCustomer response
        mockedFetchPreviewCustomer.mockImplementation(
            (id) => () =>
                Promise.resolve({
                    type: FETCH_PREVIEW_CUSTOMER_SUCCESS,
                    resp: {
                        id,
                        data: { name: 'Test Customer' },
                    },
                }),
        )

        const testStore = mockStore({
            currentUser: fromJS(agents[1]),
            ticket: fromJS({}),
        })
        // @ts-ignore
        testStore.dispatch = jest.fn((param: () => unknown) =>
            typeof param === 'function' ? param() : param,
        )

        const { getByTestId, getByText, queryByText } = render(
            <Provider store={testStore}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        // Start search
        const searchInput = getByTestId('Search')
        fireEvent.change(searchInput, {
            target: { value: 'query' },
        })
        fireEvent.keyDown(searchInput, { key: 'Enter' })

        // Wait for search results to appear
        const searchResults = await waitFor(() =>
            getByTestId('InfobarSearchResultsList'),
        )

        // Click on the search results container
        fireEvent.click(searchResults)

        // Wait for the selected customer view to render and verify Set Customer button
        await waitFor(() => {
            expect(getByText('Set Customer')).toBeInTheDocument()
        })

        // Click Set Customer
        fireEvent.click(getByText('Set Customer'))

        // Wait for async actions to complete
        await waitFor(() => {
            expect(mockedSetCustomer).toHaveBeenCalled()
            expect(mockedSetActiveCustomerAsReceiver).toHaveBeenCalled()
        })

        // Verify that we return to the search view with empty input
        await waitFor(() => {
            const searchInput = getByTestId('Search')
            expect(searchInput).toHaveValue('')
            expect(queryByText('Set Customer')).not.toBeInTheDocument()
        })
    })

    it('should log InfobarEditWidgetsClicked segment event when edit widgets button is clicked', () => {
        render(
            <Provider store={store}>
                <Infobar {...commonProps} />
            </Provider>,
        )

        const settingsButton = screen.getByRole('button', { name: /settings/i })
        fireEvent.click(settingsButton)

        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.InfobarEditWidgetsClicked,
        )
    })

    describe('modal title', () => {
        it('should display "Update customer" when customer name is null', async () => {
            const customerWithoutName = fromJS({
                id: 123,
                email: 'test@example.com',
            })

            const { getByRole, findByRole } = render(
                <Provider store={store}>
                    <Infobar {...commonProps} customer={customerWithoutName} />
                </Provider>,
            )

            const editButton = await waitFor(() =>
                getByRole('button', { name: /edit customer/i }),
            )
            fireEvent.click(editButton)

            const modalTitle = await findByRole('heading', {
                name: 'Update customer',
            })
            expect(modalTitle).toBeInTheDocument()
        })

        it('should display "Update customer: {name}" when customer name is not null', async () => {
            const customerWithName = fromJS({
                id: 123,
                name: 'John Doe',
                email: 'john@example.com',
            })

            const { getByRole, findByRole } = render(
                <Provider store={store}>
                    <Infobar {...commonProps} customer={customerWithName} />
                </Provider>,
            )

            const editButton = await waitFor(() =>
                getByRole('button', { name: /edit customer/i }),
            )
            fireEvent.click(editButton)

            const modalTitle = await findByRole('heading', {
                name: 'Update customer: John Doe',
            })
            expect(modalTitle).toBeInTheDocument()
        })
    })

    describe('setShowMergeCustomerModal', () => {
        it('should show merge modal when handleMergeClick is called from suggested customer', async () => {
            mockedSimilarCustomer.mockImplementation(
                () => () =>
                    Promise.resolve({
                        customer: fromJS({ id: 10 }),
                    }),
            )

            const { getByText, queryByTestId } = render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            await waitFor(() => getByText(/Merge customer profiles/))

            expect(
                queryByTestId('MergeCustomersContainer'),
            ).not.toBeInTheDocument()

            fireEvent.click(getByText('Merge'))

            expect(queryByTestId('MergeCustomersContainer')).toBeInTheDocument()
        })

        it('should hide merge modal when onClose is called from suggested customer merge', async () => {
            mockedSimilarCustomer.mockImplementation(
                () => () =>
                    Promise.resolve({
                        customer: fromJS({ id: 10 }),
                    }),
            )

            const { getByText, queryByTestId } = render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            await waitFor(() => getByText(/Merge customer profiles/))
            fireEvent.click(getByText('Merge'))

            expect(queryByTestId('MergeCustomersContainer')).toBeInTheDocument()

            fireEvent.click(getByText('CloseMerge'))

            expect(
                queryByTestId('MergeCustomersContainer'),
            ).not.toBeInTheDocument()
        })

        it('should show merge modal via toggleMergeCustomerModal from selected customer actions', async () => {
            mockedFetchPreviewCustomer.mockImplementation(
                (id) => () =>
                    Promise.resolve({
                        type: FETCH_PREVIEW_CUSTOMER_SUCCESS,
                        resp: { id },
                    }),
            )
            mockedSearch.mockImplementation(
                () => () =>
                    Promise.resolve({
                        resp: {
                            data: {
                                data: [{ entity: { id: 7 }, highlights: {} }],
                            },
                        },
                    }),
            )

            const { getByTestId, getByText, queryByTestId } = render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            fireEvent.change(getByTestId('Search'), {
                target: { value: 'query' },
            })
            fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

            const searchResults = await waitFor(() =>
                getByTestId('InfobarSearchResultsList'),
            )
            fireEvent.click(searchResults)

            await waitFor(() => getByText('ToggleMerge'))

            fireEvent.click(getByText('ToggleMerge'))

            expect(queryByTestId('MergeCustomersContainer')).toBeInTheDocument()
        })

        it('should hide merge modal when onClose is called from selected customer merge', async () => {
            mockedFetchPreviewCustomer.mockImplementation(
                (id) => () =>
                    Promise.resolve({
                        type: FETCH_PREVIEW_CUSTOMER_SUCCESS,
                        resp: { id },
                    }),
            )
            mockedSearch.mockImplementation(
                () => () =>
                    Promise.resolve({
                        resp: {
                            data: {
                                data: [{ entity: { id: 7 }, highlights: {} }],
                            },
                        },
                    }),
            )

            const { getByTestId, getByText, queryByTestId } = render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            fireEvent.change(getByTestId('Search'), {
                target: { value: 'query' },
            })
            fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

            const searchResults = await waitFor(() =>
                getByTestId('InfobarSearchResultsList'),
            )
            fireEvent.click(searchResults)

            await waitFor(() => getByText('ToggleMerge'))
            fireEvent.click(getByText('ToggleMerge'))

            expect(queryByTestId('MergeCustomersContainer')).toBeInTheDocument()

            fireEvent.click(getByText('CloseMerge'))

            expect(
                queryByTestId('MergeCustomersContainer'),
            ).not.toBeInTheDocument()
        })

        it('should reset to current customer profile on merge success from selected customer', async () => {
            mockedFetchPreviewCustomer.mockImplementation(
                (id) => () =>
                    Promise.resolve({
                        type: FETCH_PREVIEW_CUSTOMER_SUCCESS,
                        resp: { id },
                    }),
            )
            mockedSearch.mockImplementation(
                () => () =>
                    Promise.resolve({
                        resp: {
                            data: {
                                data: [{ entity: { id: 7 }, highlights: {} }],
                            },
                        },
                    }),
            )

            const { getByTestId, getByText, queryByText } = render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            fireEvent.change(getByTestId('Search'), {
                target: { value: 'query' },
            })
            fireEvent.keyDown(getByTestId('Search'), { key: 'Enter' })

            const searchResults = await waitFor(() =>
                getByTestId('InfobarSearchResultsList'),
            )
            fireEvent.click(searchResults)

            await waitFor(() => getByText('ToggleMerge'))
            fireEvent.click(getByText('ToggleMerge'))
            fireEvent.click(getByText('MergeSuccess'))

            await waitFor(() => {
                expect(queryByText('ToggleMerge')).not.toBeInTheDocument()
            })
        })
    })

    describe('V2 MS2 flag - legacy infobar content', () => {
        it('should render legacy infobar content when MS2 flag is off', () => {
            useHelpdeskV2MS2FlagMock.mockReturnValue(false)
            isCurrentlyOnCustomerPageMock.mockReturnValue(false)

            render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            expect(screen.getByText('InfobarCustomerInfo')).toBeInTheDocument()
        })

        it('should not render legacy infobar content when MS2 flag is on and not on customer page', () => {
            useHelpdeskV2MS2FlagMock.mockReturnValue(true)
            isCurrentlyOnCustomerPageMock.mockReturnValue(false)

            render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            expect(
                screen.queryByText('InfobarCustomerInfo'),
            ).not.toBeInTheDocument()
        })

        it('should render legacy infobar content when MS2 flag is on and on customer page', () => {
            useHelpdeskV2MS2FlagMock.mockReturnValue(true)
            isCurrentlyOnCustomerPageMock.mockReturnValue(true)

            render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            expect(screen.getByText('InfobarCustomerInfo')).toBeInTheDocument()
        })
    })

    describe('new ticket page', () => {
        it('should render legacy infobar content when MS2 flag is on and on new ticket page', () => {
            useHelpdeskV2MS2FlagMock.mockReturnValue(true)
            isCurrentlyOnCustomerPageMock.mockReturnValue(false)

            render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
                { initialEntries: ['/app/ticket/new'] },
            )

            expect(screen.getByText('InfobarCustomerInfo')).toBeInTheDocument()
        })
    })

    describe('V2 MS1 flag on customer page', () => {
        it('should render search bar when V2 flag is on and on customer page', () => {
            useHelpdeskV2MS1FlagMock.mockReturnValue(true)
            isCurrentlyOnCustomerPageMock.mockReturnValue(true)

            render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            expect(
                screen.getByPlaceholderText(
                    'Search for customers by email, order number, etc.',
                ),
            ).toBeInTheDocument()
        })

        it('should not render search bar when V2 flag is on and not on customer page', () => {
            useHelpdeskV2MS1FlagMock.mockReturnValue(true)
            isCurrentlyOnCustomerPageMock.mockReturnValue(false)

            render(
                <Provider store={store}>
                    <Infobar {...commonProps} />
                </Provider>,
            )

            expect(
                screen.queryByPlaceholderText(
                    'Search for customers by email, order number, etc.',
                ),
            ).not.toBeInTheDocument()
        })
    })
})
