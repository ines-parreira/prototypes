// sort-imports-ignore
import mockedVirtuoso from 'tests/mockedVirtuoso'

import React, { ComponentProps, ReactPortal } from 'react'
import { userEvent } from '@testing-library/user-event'

import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { createBrowserHistory } from 'history'
import { fromJS } from 'immutable'
import { stringify } from 'qs'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from 'common/segment'
import { customer } from 'fixtures/customer'
import { mockSearchRank } from 'fixtures/searchRank'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { voiceCall } from 'fixtures/voiceCalls'
import { RecentItems } from 'hooks/useRecentItems/constants'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import useSearchRankScenario from 'hooks/useSearchRankScenario'
import useSelectedIndex from 'hooks/useSelectedIndex'
import { searchCustomersWithHighlights } from 'models/customer/resources'
import { SearchEngine } from 'models/search/types'
import { searchTicketsWithHighlights } from 'models/ticket/resources'
import { searchVoiceCallsWithHighlights } from 'models/voiceCall/resources'
import {
    CALLS_LABEL,
    CUSTOMERS_LABEL,
    TICKETS_LABEL,
} from 'pages/common/components/Spotlight/constants'
import SpotlightCallRow from 'pages/common/components/Spotlight/SpotlightCallRow'
import SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import SpotlightModal, {
    CUSTOMERS_ADVANCED_SEARCH_PATH,
    FEDERATED_SEARCH_TAB_LABEL,
    TICKETS_ADVANCED_SEARCH_PATH,
} from 'pages/common/components/Spotlight/SpotlightModal'
import SpotlightTicketRow from 'pages/common/components/Spotlight/SpotlightTicketRow'
import history from 'pages/history'
import * as billingSelectors from 'state/billing/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import * as platform from 'utils/platform'
import { assumeMock, flushPromises, renderWithRouter } from 'utils/testing'

const TICKET_SPOTLIGHT_ROW_TEST_ID = 'spotlight-ticket-row'
const CUSTOMER_SPOTLIGHT_ROW_TEST_ID = 'spotlight-customer-row'
const CALL_SPOTLIGHT_ROW_TEST_ID = 'spotlight-call-row'

jest.mock('pages/history')
jest.mock('state/notifications/actions')

jest.mock('pages/common/components/SkeletonLoader', () => () => (
    <div>SkeletonLoader</div>
))

jest.mock(
    'pages/common/components/Spotlight/SpotlightTicketRow',
    () =>
        ({ onClick, onHover }: ComponentProps<typeof SpotlightTicketRow>) => (
            <div
                onClick={onClick}
                onMouseEnter={onHover}
                data-testid={TICKET_SPOTLIGHT_ROW_TEST_ID}
            >
                MockedSpotlightTicketRow
            </div>
        ),
)

jest.mock(
    'pages/common/components/Spotlight/SpotlightCustomerRow',
    () =>
        ({ onClick, onHover }: ComponentProps<typeof SpotlightCustomerRow>) => (
            <div
                onClick={onClick}
                onMouseEnter={onHover}
                data-testid={CUSTOMER_SPOTLIGHT_ROW_TEST_ID}
            >
                MockedSpotlightCustomerRow
            </div>
        ),
)
jest.mock(
    'pages/common/components/Spotlight/SpotlightCallRow',
    () =>
        ({ onClick, onHover }: ComponentProps<typeof SpotlightCallRow>) => (
            <div
                onClick={onClick}
                onMouseEnter={onHover}
                data-testid={CALL_SPOTLIGHT_ROW_TEST_ID}
            >
                MockedSpotlightCallRow
            </div>
        ),
)

jest.spyOn(ReactDOM, 'createPortal').mockImplementation(
    (element) => element as ReactPortal,
)

jest.mock('models/customer/resources')
const searchCustomersWithHighlightsMock = assumeMock(
    searchCustomersWithHighlights,
)

jest.mock('models/voiceCall/resources')
const searchCallsWithHighlightsMock = assumeMock(searchVoiceCallsWithHighlights)

jest.mock('models/ticket/resources')
const searchTicketsWithHighlightsMock = assumeMock(searchTicketsWithHighlights)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock('hooks/useSearchRankScenario')
const mockUseSearchRankScenario = assumeMock(useSearchRankScenario)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mockStore = configureMockStore([thunk])

const WrappedSpotlightModal = (
    props: ComponentProps<typeof SpotlightModal>,
) => (
    <Provider store={mockStore({ currentUser: fromJS(user) })}>
        <SpotlightModal {...props} />
    </Provider>
)

jest.mock('react-virtuoso', () => mockedVirtuoso)

jest.mock('hooks/useRecentItems/useRecentItems')
const mockUseRecentItems = assumeMock(useRecentItems)

jest.mock(
    'focus-trap-react',
    () =>
        ({ children }: { children: React.ReactNode }) => {
            return <>{children}</>
        },
)

jest.mock('hooks/useSelectedIndex')
const mockUseSelectedIndex = assumeMock(useSelectedIndex)

jest.mock('hooks/useLocalStorageWithExpiry', () => () => {
    const {
        useState,
    }: { useState: (value: unknown) => [string, (value: string) => void] } =
        jest.requireActual('react')
    const [state, setState] = useState('')
    return { state, setState, remove: jest.fn(), refreshTimestamp: jest.fn() }
})

const mockCurrentAccountHasProduct = jest.spyOn(
    billingSelectors,
    'currentAccountHasProduct',
)

const getCustomersTab = () => screen.getByRole('tab', { name: CUSTOMERS_LABEL })
const getTicketsTab = () => screen.getByRole('tab', { name: TICKETS_LABEL })
const getCallsTab = () => screen.getByRole('tab', { name: CALLS_LABEL })
const getFederatedTab = () =>
    screen.getByRole('tab', {
        name: FEDERATED_SEARCH_TAB_LABEL,
    })

export function fireEnterShortcutUsingKeyboardEvent(
    input: HTMLElement,
    combo: string,
) {
    const options: KeyboardEventInit & { which?: number; keyCode?: number } = {
        key: 'Enter',
        bubbles: true,
        code: 'Enter',
        which: 13,
        keyCode: 13,
    }

    if (combo.includes('{meta}')) {
        options.metaKey = true
    }
    if (combo.includes('{ctrl}')) {
        options.ctrlKey = true
    }
    if (combo.includes('{shift}')) {
        options.shiftKey = true
    }

    const eventDown = new KeyboardEvent('keydown', options)
    const eventUp = new KeyboardEvent('keyup', options)

    input.dispatchEvent(eventDown)
    input.dispatchEvent(eventUp)
}

describe('<SpotlightModal/>', () => {
    const mockCloseModal = jest.fn()
    const minProps: ComponentProps<typeof SpotlightModal> = {
        isOpen: true,
        onCloseModal: mockCloseModal,
    }

    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
            value: jest.fn(),
            writable: true,
        })
    })

    beforeEach(() => {
        jest.useRealTimers()
        jest.clearAllTimers()
        jest.clearAllMocks()

        mockUseRecentItems.mockReturnValue({
            items: [],
            setRecentItem: jest.fn() as any,
            isGettingItems: false,
        })
        mockUseSelectedIndex.mockReturnValue({
            index: 0,
            setIndex: jest.fn(),
            next: jest.fn(),
            previous: jest.fn(),
            reset: jest.fn(),
        })
        mockUseSearchRankScenario.mockReturnValue(mockSearchRank)
        mockCurrentAccountHasProduct.mockReturnValue((() => true) as any)
    })

    afterEach(() => {
        jest.useRealTimers()
        jest.clearAllTimers()
        jest.clearAllMocks()
    })

    describe('Tabs', () => {
        it('should render with Federated Search tab as default', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)

            await waitFor(() => {
                expect(getFederatedTab()).toHaveClass('activeTab')
            })
        })

        it('should set All tab on click', () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const customersTab = getCustomersTab()
            customersTab?.focus()
            const federatedTab = getFederatedTab()
            federatedTab?.focus()

            expect(federatedTab).toHaveClass('activeTab')
        })

        it('should set customers tab on click', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)

            const customersTab = getCustomersTab()
            await userEvent.click(customersTab)

            expect(customersTab).toHaveClass('activeTab')
        })

        it('should render & set calls tab if available', async () => {
            mockCurrentAccountHasProduct.mockReturnValue((() => true) as any)

            renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)

            const callsTab = getCallsTab()
            expect(callsTab).toBeInTheDocument()

            await userEvent.click(callsTab)
            expect(callsTab).toHaveClass('activeTab')
        })

        it('should not render calls tab if voice product is disabled', async () => {
            mockCurrentAccountHasProduct.mockReturnValue((() => false) as any)

            renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)

            expect(screen.queryByRole('tab', { name: CALLS_LABEL })).toBeNull()
            expect(getFederatedTab()).toHaveClass('activeTab')
            expect(getCustomersTab()).toBeInTheDocument()
            expect(getTicketsTab()).toBeInTheDocument()
        })
    })

    describe('Navigate to Advanced Search', () => {
        beforeEach(() => {
            searchTicketsWithHighlightsMock.mockClear()
            jest.clearAllTimers()
        })

        it('should not navigate to advanced search on calls tab', async () => {
            mockCurrentAccountHasProduct.mockReturnValue((() => true) as any)

            const { queryByText } = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />,
            )

            const callsTab = getCallsTab()
            await userEvent.click(callsTab)

            const advancedSearchButton = queryByText('Advanced Search')

            expect(advancedSearchButton).not.toBeInTheDocument()
        })

        it('should navigate to tickets advanced search on click when modal is opened and log event', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const ticketsTab = getTicketsTab()
            ticketsTab?.focus()
            const advancedSearchButton = screen.getByText('Advanced Search')
            userEvent.click(advancedSearchButton)

            await waitFor(() => {
                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.GlobalSearchAdvancedButtonClick,
                )
            })
        })

        it('should navigate to tickets advanced search on Federated Search', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const advancedSearchButton = screen.getByText('Advanced Search')
            userEvent.click(advancedSearchButton)

            await waitFor(() => {
                expect(history.push).toHaveBeenCalledWith({
                    pathname: TICKETS_ADVANCED_SEARCH_PATH,
                })
                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.GlobalSearchAdvancedButtonClick,
                )
            })
        })

        it('should navigate to customers advanced search on click when modal is opened on the customers tab and log event', async () => {
            const { getByText } = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />,
            )
            await act(flushPromises)
            const customersTab = getCustomersTab()
            customersTab?.focus()
            const advancedSearchButton = getByText('Advanced Search')
            userEvent.click(advancedSearchButton)

            await waitFor(() => {
                expect(history.push).toHaveBeenCalledWith({
                    pathname: CUSTOMERS_ADVANCED_SEARCH_PATH,
                })
            })
        })

        it('should close the modal when navigating to advanced search ', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const ticketsTab = getTicketsTab()
            ticketsTab?.focus()
            const advancedSearchButton = screen.getByText('Advanced Search')
            userEvent.click(advancedSearchButton)

            await waitFor(() => {
                expect(mockCloseModal).toHaveBeenCalled()
            })
        })

        it('should not navigate to advanced search on keypress when modal is closed', async () => {
            renderWithRouter(
                <WrappedSpotlightModal {...minProps} isOpen={false} />,
            )
            await act(flushPromises)
            fireEnterShortcutUsingKeyboardEvent(document.body, '{shift}{enter}')

            expect(history.push).not.toHaveBeenCalled()
        })

        it('should navigate to tickets advanced search on keypress when modal is opened and log event', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const ticketsTab = getTicketsTab()
            ticketsTab?.focus()

            fireEnterShortcutUsingKeyboardEvent(document.body, '{shift}{enter}')

            expect(history.push).toHaveBeenCalledWith({
                pathname: TICKETS_ADVANCED_SEARCH_PATH,
            })
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.GlobalSearchAdvancedShortcut,
            )
        })

        it('should navigate to customers advanced search on keypress when modal is opened on a ticket tab ', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const customersTab = getCustomersTab()
            await userEvent.click(customersTab)
            fireEnterShortcutUsingKeyboardEvent(customersTab, '{shift}{enter}')

            expect(history.push).toHaveBeenCalledWith({
                pathname: CUSTOMERS_ADVANCED_SEARCH_PATH,
            })
        })

        it('should handle shift + enter shortcut after key input when search input is focused and navigate to advanced search', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />, {
                history,
            })
            const ticketsTab = getTicketsTab()
            await userEvent.click(ticketsTab)
            const searchInput = screen.getByPlaceholderText('Search...')

            await act(async () => {
                await userEvent.type(searchInput, 'foo')
            })

            await act(async () => {
                fireEnterShortcutUsingKeyboardEvent(
                    searchInput,
                    '{shift}{enter}',
                )
            })

            await waitFor(
                () => {
                    expect(history.push).toHaveBeenCalledWith({
                        pathname: TICKETS_ADVANCED_SEARCH_PATH,
                        search: stringify({ q: 'foo' }),
                    })
                },
                { timeout: 2000 },
            )
        })

        it('should handle shift + enter shortcut after key input when search input is not focused and navigate to advanced search', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            const ticketsTab = getTicketsTab()
            await userEvent.click(ticketsTab)
            const searchInput = screen.getByPlaceholderText('Search...')

            await act(async () => {
                await userEvent.type(searchInput, 'foo')
            })

            await act(async () => {
                fireEnterShortcutUsingKeyboardEvent(
                    searchInput,
                    '{shift}{enter}',
                )
            })

            await waitFor(
                () => {
                    expect(history.push).toHaveBeenCalledWith({
                        pathname: TICKETS_ADVANCED_SEARCH_PATH,
                        search: stringify({ q: 'foo' }),
                    })
                },
                { timeout: 2000 },
            )
        })

        it('should not set a query string search param when no input was performed', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const ticketsTab = getTicketsTab()
            ticketsTab?.focus()
            const searchInput = screen.getByPlaceholderText('Search...')

            fireEnterShortcutUsingKeyboardEvent(searchInput, '{shift}{enter}')

            expect(history.push).toHaveBeenCalledWith({
                pathname: TICKETS_ADVANCED_SEARCH_PATH,
            })
        })
    })

    it('should not set a query string search param when input was deleted', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')

        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        await act(async () => {
            await userEvent.clear(searchInput)
        })

        await act(async () => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{shift}{enter}')
        })

        await waitFor(
            () => {
                expect(history.push).toHaveBeenCalledWith({
                    pathname: TICKETS_ADVANCED_SEARCH_PATH,
                })
            },
            { timeout: 2000 },
        )
    })

    // TODO(React18): Remove this once we upgrade to React 18
    it.skip('should fetch tickets on enter keypress from the new search endpoint', async () => {
        jest.useFakeTimers()
        const searchQuery = 'foo'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')

        userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        await act(flushPromises)
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')

        await waitFor(() => {
            expect(searchTicketsWithHighlightsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: searchQuery,
                    filters: '',
                }),
            )
        })
    })

    // TODO(React18): Fix this test
    it.skip('should not display calls in federated tab if product is disabled', async () => {
        mockCurrentAccountHasProduct.mockReturnValue((() => false) as any)
        searchCallsWithHighlightsMock.mockResolvedValue({
            data: { data: [voiceCall] },
        } as any)
        jest.useFakeTimers()

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const tab = getFederatedTab()
        const searchInput = screen.getByPlaceholderText('Search...')
        tab?.focus()

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        await act(flushPromises)

        expect(screen.queryByTestId(CALL_SPOTLIGHT_ROW_TEST_ID)).toBeNull()
    })

    it.skip('should end previous searchRank scenario and register a new one on enter keypress', async () => {
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: { data: [{ foo: 'foo' }] },
        } as any)
        jest.useFakeTimers()

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        const ticketsTab = getTicketsTab()
        ticketsTab?.focus()

        const searchInput = screen.getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')

        expect(mockSearchRank.endScenario).toHaveBeenCalled()
        expect(mockSearchRank.registerResultsRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                query: 'foo',
            }),
        )
        await act(flushPromises)
        expect(mockSearchRank.registerResultsResponse).toHaveBeenCalledWith(
            expect.objectContaining({
                numberOfResults: 1,
                searchEngine: SearchEngine.ES,
            }),
        )
    })

    // TODO(React18): Fix this test
    it.skip('should not fetch on enter keypress again it the search term is identical', async () => {
        jest.useFakeTimers()
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const ticketsTab = getTicketsTab()
        ticketsTab?.focus()

        const searchInput = screen.getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        await act(flushPromises)
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        expect(searchTicketsWithHighlightsMock).toHaveBeenCalledTimes(1)
    })

    // TODO(React18): Fix this test
    it.skip('should fetch items for the same search term on tab switch if search was performed', async () => {
        jest.useFakeTimers()
        searchCustomersWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        await act(flushPromises)
        customersTab?.focus()
        await act(flushPromises)

        expect(searchCustomersWithHighlightsMock).toHaveBeenCalledTimes(2)
        expect(searchTicketsWithHighlightsMock).toHaveBeenCalledTimes(1)
        expect(searchCallsWithHighlightsMock).toHaveBeenCalledTimes(1)
    })

    // TODO(React18): Fix this test
    it.skip('should fetch items for the search term on previous tab if search was not triggered for new query', async () => {
        jest.useFakeTimers()
        const searchQuery = 'foo'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        await act(flushPromises)
        userEvent.type(searchInput, 'baz')
        customersTab?.focus()
        await act(flushPromises)

        await waitFor(() => {
            expect(searchTicketsWithHighlightsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: searchQuery,
                    filters: '',
                }),
            )
            expect(searchCustomersWithHighlightsMock).toHaveBeenCalledTimes(2)
            expect(searchCustomersWithHighlightsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: searchQuery,
                }),
            )
            expect(searchCallsWithHighlightsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: searchQuery,
                }),
            )
        })
    })

    // TODO(React18): Fix this test
    it.skip('should not fetch items on tab switch if a search has been performed for that item type', async () => {
        jest.useFakeTimers()

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')
        const ticketsTab = getTicketsTab()
        const customersTab = getCustomersTab()
        const callsTab = getCallsTab()

        ticketsTab?.focus()
        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        await act(flushPromises)
        customersTab?.focus()
        await act(flushPromises)
        ticketsTab?.focus()
        await act(flushPromises)
        callsTab?.focus()
        await act(flushPromises)

        expect(searchCustomersWithHighlightsMock).toHaveBeenCalledTimes(1)
        expect(searchCallsWithHighlightsMock).toHaveBeenCalledTimes(1)
        expect(searchTicketsWithHighlightsMock).toHaveBeenCalledTimes(2)
    })

    // TODO(React18): Fix this test
    it.skip('should not fetch items for any query on tab switch if the search was not submitted', async () => {
        jest.useFakeTimers()

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        customersTab?.focus()
        await act(flushPromises)

        expect(searchTicketsWithHighlightsMock).not.toHaveBeenCalled()
    })

    // TODO(React18): Fix this test
    it.skip('should fetch customers on enter keypress', async () => {
        searchCustomersWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)
        jest.useFakeTimers()
        const searchQuery = 'foo2'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        customersTab?.focus()
        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')

        expect(searchCustomersWithHighlightsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                search: searchQuery,
            }),
        )
    })

    // TODO(React18): Fix this test
    it.skip('should fetch calls on enter keypress', async () => {
        searchCallsWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)
        jest.useFakeTimers()
        const searchQuery = 'foo2'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const callsTab = getCallsTab()

        callsTab?.focus()
        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')

        expect(searchCallsWithHighlightsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                search: searchQuery,
            }),
        )
    })

    // TODO(React18): Fix this test
    it.skip('should show SkeletonLoader component while results are fetched', async () => {
        jest.useFakeTimers()

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        jest.advanceTimersByTime(300)

        expect(screen.getByText('SkeletonLoader')).toBeInTheDocument()
    })

    // TODO(React18): Fix this test
    it.skip('should show SpotlightNoResults component when no results are available ', async () => {
        jest.useFakeTimers()

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )
        const ticketsTab = getTicketsTab()
        ticketsTab?.focus()

        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        await act(flushPromises)

        expect(screen.getByText('No results')).toBeInTheDocument()
    })

    // TODO(React18): Fix this test
    it.skip('should notify when an error occurs and register searchRank scenario', async () => {
        searchTicketsWithHighlightsMock.mockRejectedValue({ message: 'error' })
        jest.useFakeTimers()

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )

        const ticketsTab = getTicketsTab()
        ticketsTab?.focus()
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        await act(flushPromises)

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to fetch search results',
            status: NotificationStatus.Error,
        })
        await act(flushPromises)
        jest.runAllTimers()

        expect(mockSearchRank.registerResultsResponse).toHaveBeenCalledWith(
            expect.objectContaining({
                numberOfResults: 0,
                searchEngine: undefined,
            }),
        )
    })

    // TODO(React18): Fix this test
    it.skip('should cancel previous request when tab is switched and not notify on cancellation error', async () => {
        jest.useFakeTimers()
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)
        const searchQuery = 'foo'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        jest.advanceTimersByTime(500)
        customersTab?.focus()
        await act(flushPromises)

        await waitFor(() => {
            expect(searchTicketsWithHighlightsMock).toHaveBeenCalledWith(
                expect.objectContaining({ search: searchQuery }),
            )
            expect(searchTicketsWithHighlightsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    cancelToken: expect.objectContaining({
                        reason: expect.objectContaining({
                            code: 'ERR_CANCELED',
                            message: 'canceled',
                            name: 'CanceledError',
                        }),
                    }),
                }),
            )
            expect(searchCustomersWithHighlightsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: searchQuery,
                }),
            )
            expect(notify).not.toHaveBeenCalled()
        })
    })

    it.skip.each([
        [TICKETS_LABEL, ticket, TICKET_SPOTLIGHT_ROW_TEST_ID],
        [CUSTOMERS_LABEL, customer, CUSTOMER_SPOTLIGHT_ROW_TEST_ID],
        [CALLS_LABEL, voiceCall, CALL_SPOTLIGHT_ROW_TEST_ID],
    ])(
        'should render the fetched result set with SpotlightRow for %s tab',
        async (_, item, componentName) => {
            searchTicketsWithHighlightsMock.mockResolvedValue({
                data: { data: [item] },
            } as any)
            jest.useFakeTimers()

            const { rerender } = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />,
            )
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = getTicketsTab()
            const searchInput = screen.getByPlaceholderText('Search...')
            tab?.focus()

            await userEvent.type(searchInput, 'foo')
            jest.runOnlyPendingTimers()
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
            await act(flushPromises)

            expect(screen.getByTestId(componentName)).toBeInTheDocument()
        },
    )

    it.skip.each([
        [TICKETS_LABEL, ticket],
        [CUSTOMERS_LABEL, customer],
        [CALLS_LABEL, voiceCall],
    ])(
        'should fetch more from new endpoint on end reached if meta indicates more items are available',
        async (name, item) => {
            const response = {
                data: [item],
                meta: {
                    prev_cursor: null,
                    next_cursor: 'foo',
                },
            }
            searchTicketsWithHighlightsMock.mockResolvedValue({
                data: response,
            } as any)
            searchCustomersWithHighlightsMock.mockResolvedValue({
                data: response,
            } as any)
            searchCallsWithHighlightsMock.mockResolvedValue({
                data: response,
            } as any)
            jest.useFakeTimers()

            const { rerender } = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />,
            )
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = screen.getByRole('tab', { name })
            const searchInput = screen.getByPlaceholderText('Search...')
            tab?.focus()

            await userEvent.type(searchInput, 'foo')
            jest.runOnlyPendingTimers()
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
            await act(flushPromises)

            const endTrigger = screen.getByText('end area')
            userEvent.click(endTrigger)

            await act(flushPromises)

            if (name === TICKETS_LABEL) {
                expect(searchTicketsWithHighlightsMock).toHaveBeenCalledWith(
                    expect.objectContaining({ cursor: 'foo' }),
                )
            } else if (name === CUSTOMERS_LABEL) {
                expect(searchCustomersWithHighlightsMock).toHaveBeenCalledWith(
                    expect.objectContaining({ cursor: 'foo' }),
                )
            } else {
                expect(searchCallsWithHighlightsMock).toHaveBeenCalledWith(
                    expect.objectContaining({ cursor: 'foo' }),
                )
            }
        },
    )

    it.skip('should reset search after closing and end previous searchRank scenario', async () => {
        const searchQuery = 'foo'
        jest.useFakeTimers()
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: { data: [ticket] },
        } as any)

        const { getByPlaceholderText, queryByTestId } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        await userEvent.click(searchInput)

        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        await act(flushPromises)

        await userEvent.keyboard('{enter}')
        await act(flushPromises)

        await waitFor(() => {
            expect(mockSearchRank.endScenario).toHaveBeenCalled()
            expect(
                queryByTestId(TICKET_SPOTLIGHT_ROW_TEST_ID),
            ).not.toBeInTheDocument()
        })
    })

    it.skip('should close modal after pathname change', async () => {
        const history = createBrowserHistory()

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
            { history, route: '/app/tickets' },
        )
        await act(flushPromises)

        await act(() => {
            history.push('/foo/bar')
        })
        rerender(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        expect(mockCloseModal).toHaveBeenCalled()
    })

    it.skip('should log event on tab switch', () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const ticketsTab = getTicketsTab()
        const customersTab = getCustomersTab()
        const callsTab = getCallsTab()

        customersTab?.focus()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchCustomerTabClick,
        )
        ticketsTab?.focus()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchTicketTabClick,
        )
        callsTab?.focus()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchCallTabClick,
        )
    })

    it.skip('should end previous searchRank scenario on tab switch', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const ticketsTab = getTicketsTab()
        const customersTab = getCustomersTab()
        const callsTab = getCallsTab()

        customersTab?.focus()
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(1)
        ticketsTab?.focus()
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(2)
        callsTab?.focus()
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(3)
    })

    describe.skip('Recent items', () => {
        it.each([
            [TICKETS_LABEL, ticket, TICKET_SPOTLIGHT_ROW_TEST_ID],
            [CUSTOMERS_LABEL, customer, CUSTOMER_SPOTLIGHT_ROW_TEST_ID],
            [CALLS_LABEL, voiceCall, CALL_SPOTLIGHT_ROW_TEST_ID],
        ])(
            'should render the recent %s searches with SpotlightRow',
            async (name, item, componentName) => {
                mockUseRecentItems.mockImplementation(
                    (itemType: RecentItems) => {
                        if (itemType.toLowerCase() === name.toLowerCase()) {
                            return {
                                items: [item],
                                setRecentItem: jest.fn() as any,
                                isGettingItems: false,
                            }
                        }
                        return {
                            items: [],
                            setRecentItem: jest.fn() as any,
                            isGettingItems: false,
                        }
                    },
                )

                const { rerender } = renderWithRouter(
                    <WrappedSpotlightModal {...minProps} />,
                )
                const tab = screen.getByRole('tab', {
                    name,
                })
                await userEvent.click(tab)
                await act(flushPromises)
                rerender(<WrappedSpotlightModal {...minProps} />)

                await userEvent.click(tab)
                await act(flushPromises)

                await waitFor(() => {
                    expect(
                        screen.getByText('Recently accessed'),
                    ).toBeInTheDocument()
                    expect(
                        screen.getByTestId(componentName),
                    ).toBeInTheDocument()
                })
            },
        )

        it('should not render the recent calls searches if voice product is disabled', async () => {
            mockCurrentAccountHasProduct.mockReturnValue((() => false) as any)
            mockUseRecentItems.mockImplementation((itemType: RecentItems) => {
                if (itemType.toLowerCase() === CALLS_LABEL.toLowerCase()) {
                    return {
                        items: [voiceCall],
                        setRecentItem: jest.fn() as any,
                        isGettingItems: false,
                    }
                }
                return {
                    items: [ticket],
                    setRecentItem: jest.fn() as any,
                    isGettingItems: false,
                }
            })

            const { rerender } = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />,
            )
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)

            expect(screen.getByText('Recently accessed')).toBeInTheDocument()
            expect(screen.queryByTestId(CALL_SPOTLIGHT_ROW_TEST_ID)).toBeNull()
        })

        it('should ignore recent calls searches if voice product is disabled and no other recent items exist', async () => {
            mockCurrentAccountHasProduct.mockReturnValue((() => false) as any)
            mockUseRecentItems.mockImplementation((itemType: RecentItems) => {
                if (itemType.toLowerCase() === CALLS_LABEL.toLowerCase()) {
                    return {
                        items: [voiceCall],
                        setRecentItem: jest.fn() as any,
                        isGettingItems: false,
                    }
                }
                return {
                    items: [],
                    setRecentItem: jest.fn() as any,
                    isGettingItems: false,
                }
            })

            const { rerender } = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />,
            )
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)

            expect(screen.getByText('No recent results')).toBeInTheDocument()
        })

        it.each([
            [
                TICKETS_LABEL,
                ticket,
                TICKET_SPOTLIGHT_ROW_TEST_ID,
                'spotlight-ticket',
            ],
            [
                CUSTOMERS_LABEL,
                customer,
                CUSTOMER_SPOTLIGHT_ROW_TEST_ID,
                'spotlight-customer',
            ],
            [
                CALLS_LABEL,
                voiceCall,
                CALL_SPOTLIGHT_ROW_TEST_ID,
                'spotlight-call',
            ],
        ])(
            'should log segment event when a recent %s row is clicked',
            async (name, item, componentName, segmentType) => {
                mockUseRecentItems.mockReturnValue({
                    items: [item],
                    setRecentItem: jest.fn() as any,
                    isGettingItems: false,
                })

                const { rerender } = renderWithRouter(
                    <WrappedSpotlightModal {...minProps} />,
                )
                await act(flushPromises)
                rerender(<WrappedSpotlightModal {...minProps} />)

                const tab = screen.getByRole('tab', {
                    name,
                })
                await userEvent.click(tab)

                await screen.findByTestId(componentName)

                await userEvent.click(screen.getByTestId(componentName))

                await waitFor(() => {
                    expect(logEventMock).toHaveBeenNthCalledWith(
                        2,
                        SegmentEvent.RecentItemAccessed,
                        { type: segmentType, user_id: user.id },
                    )
                })

                await userEvent.click(screen.getByTestId(componentName))

                await waitFor(() => {
                    expect(logEventMock).toHaveBeenNthCalledWith(
                        3,
                        SegmentEvent.RecentItemAccessed,
                        { type: segmentType, user_id: user.id },
                    )
                })
            },
        )
    })

    describe.skip('Shortcuts', () => {
        // TODO(React18): Remove this once we upgrade to React 18
        it.skip.each([
            [
                TICKETS_LABEL,
                ticket,
                {
                    KBkey: '{enter}',
                    shouldCall: history.push,
                    expectedResult: [`/app/ticket/${ticket.id}`],
                },
            ],
            [
                CUSTOMERS_LABEL,
                customer,
                {
                    KBkey: '{enter}',
                    shouldCall: history.push,
                    expectedResult: [`/app/customer/${customer.id}`],
                },
            ],
            [
                CALLS_LABEL,
                voiceCall,
                {
                    KBkey: '{enter}',
                    shouldCall: history.push,
                    expectedResult: [
                        `/app/ticket/${voiceCall.ticket_id}?call_id=${voiceCall.id}`,
                    ],
                },
            ],
            [
                TICKETS_LABEL,
                ticket,
                {
                    KBkey: '{ctrl}{enter}',
                    shouldCall: window.open,
                    expectedResult: [
                        `/app/ticket/${ticket.id}`,
                        '_blank',
                        'noopener',
                    ],
                },
            ],
            [
                CUSTOMERS_LABEL,
                customer,
                {
                    KBkey: '{ctrl}{enter}',
                    shouldCall: window.open,
                    expectedResult: [
                        `/app/customer/${customer.id}`,
                        '_blank',
                        'noopener',
                    ],
                },
            ],
            [
                CALLS_LABEL,
                voiceCall,
                {
                    KBkey: '{ctrl}{enter}',
                    shouldCall: window.open,
                    expectedResult: [
                        `/app/ticket/${voiceCall.ticket_id}?call_id=${voiceCall.id}`,
                        '_blank',
                        'noopener',
                    ],
                },
            ],
        ])(
            `should check enter/ctrl+enter hotkeys open searched entry in the same/new tab - platforms other than MacOs $KBkey`,
            async (name, item, { KBkey, shouldCall, expectedResult }) => {
                mockUseSearchRankScenario.mockImplementation((arg) => {
                    return {
                        isRunning: arg === 'spotlight_customer',
                        registerResultsRequest: jest.fn(),
                        registerResultsResponse: jest.fn(),
                        registerResultSelection: jest.fn(),
                        endScenario: jest.fn(),
                    }
                })
                const response = {
                    data: [item],
                    meta: {
                        prev_cursor: 'bar',
                        next_cursor: 'foo',
                    },
                }
                searchTicketsWithHighlightsMock.mockResolvedValue({
                    data: response,
                } as any)
                jest.useFakeTimers()
                searchCustomersWithHighlightsMock.mockResolvedValue({
                    data: response,
                } as any)
                searchCallsWithHighlightsMock.mockResolvedValue({
                    data: response,
                } as any)
                jest.useFakeTimers()

                const { getByPlaceholderText } = renderWithRouter(
                    <WrappedSpotlightModal {...minProps} />,
                )
                const tab = screen.getByRole('tab', { name })
                const searchInput = getByPlaceholderText('Search...')
                await userEvent.click(tab)
                await userEvent.click(searchInput)

                await userEvent.type(searchInput, 'foo')
                jest.runOnlyPendingTimers()
                await act(flushPromises)

                await userEvent.keyboard(KBkey)
                await act(flushPromises)

                await userEvent.type(searchInput, 'bar')
                jest.runOnlyPendingTimers()
                await act(flushPromises)

                await userEvent.keyboard(KBkey)
                await act(flushPromises)

                await waitFor(() => {
                    expect(shouldCall).toHaveBeenCalledWith(...expectedResult)
                })

                await userEvent.type(searchInput, '')
            },
        )

        // TODO(React18): Remove this once we upgrade to React 18
        it.skip.each([
            [
                TICKETS_LABEL,
                ticket,
                {
                    KBkey: '{enter}',
                    shouldCall: history.push,
                    expectedResult: [`/app/ticket/${ticket.id}`],
                },
            ],
            [
                CUSTOMERS_LABEL,
                customer,
                {
                    KBkey: '{enter}',
                    shouldCall: history.push,
                    expectedResult: [`/app/customer/${customer.id}`],
                },
            ],
            [
                CALLS_LABEL,
                voiceCall,
                {
                    KBkey: '{enter}',
                    shouldCall: history.push,
                    expectedResult: [
                        `/app/ticket/${voiceCall.ticket_id}?call_id=${voiceCall.id}`,
                    ],
                },
            ],
            [
                TICKETS_LABEL,
                ticket,
                {
                    KBkey: '{meta}{enter}',
                    shouldCall: window.open,
                    expectedResult: [
                        `/app/ticket/${ticket.id}`,
                        '_blank',
                        'noopener',
                    ],
                },
            ],
            [
                CUSTOMERS_LABEL,
                customer,
                {
                    KBkey: '{meta}{enter}',
                    shouldCall: window.open,
                    expectedResult: [
                        `/app/customer/${customer.id}`,
                        '_blank',
                        'noopener',
                    ],
                },
            ],
            [
                CALLS_LABEL,
                voiceCall,
                {
                    KBkey: '{meta}{enter}',
                    shouldCall: window.open,
                    expectedResult: [
                        `/app/ticket/${voiceCall.ticket_id}?call_id=${voiceCall.id}`,
                        '_blank',
                        'noopener',
                    ],
                },
            ],
        ])(
            'should check enter/ctrl+enter hotkeys open searched entry in the same/new tab - platform is MacOs %name',
            async (name, item, { KBkey, shouldCall, expectedResult }) => {
                Object.defineProperty(platform, 'isMacOs', {
                    value: true,
                    writable: true,
                })
                mockUseSearchRankScenario.mockImplementation((arg) => {
                    return {
                        isRunning: arg === 'spotlight_customer',
                        registerResultsRequest: jest.fn(),
                        registerResultsResponse: jest.fn(),
                        registerResultSelection: jest.fn(),
                        endScenario: jest.fn(),
                    }
                })
                const response = {
                    data: [item],
                    meta: {
                        prev_cursor: 'bar',
                        next_cursor: 'foo',
                    },
                }
                searchTicketsWithHighlightsMock.mockResolvedValue({
                    data: response,
                } as any)
                searchCallsWithHighlightsMock.mockResolvedValue({
                    data: response,
                } as any)
                searchCustomersWithHighlightsMock.mockResolvedValue({
                    data: response,
                } as any)
                jest.useFakeTimers()

                const { rerender, getByPlaceholderText } = renderWithRouter(
                    <WrappedSpotlightModal {...minProps} />,
                )

                await act(flushPromises)
                rerender(<WrappedSpotlightModal {...minProps} />)

                const tab = screen.getByRole('tab', { name })
                const searchInput = getByPlaceholderText('Search...')
                tab?.focus()
                searchInput.focus()

                userEvent.type(searchInput, 'foo')
                jest.runOnlyPendingTimers()
                await userEvent.keyboard(KBkey)
                await act(flushPromises)

                userEvent.type(searchInput, 'bar')
                jest.runOnlyPendingTimers()
                await userEvent.keyboard(KBkey)
                await act(flushPromises)
                rerender(<WrappedSpotlightModal {...minProps} />)

                await waitFor(() => {
                    expect(shouldCall).toHaveBeenCalledWith(...expectedResult)
                })

                userEvent.clear(searchInput)
                rerender(<WrappedSpotlightModal {...minProps} isOpen={false} />)
            },
        )

        it('should check keyboard navigation actions set next and previous actions on useSelectedIndex hook', async () => {
            mockUseSelectedIndex.mockReturnValue({
                index: 0,
                setIndex: jest.fn(),
                next: jest.fn(),
                previous: jest.fn(),
                reset: jest.fn(),
            })
            const { rerender, getByPlaceholderText } = renderWithRouter(
                <WrappedSpotlightModal {...minProps} isOpen={false} />,
            )
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} isOpen={true} />)

            const searchInput = getByPlaceholderText('Search...')

            fireEvent.keyDown(searchInput, { key: 'ArrowUp' })
            expect(
                (
                    mockUseSelectedIndex.mock.results[1].value as ReturnType<
                        typeof useSelectedIndex
                    >
                ).previous,
            ).toHaveBeenCalled()

            fireEvent.keyDown(searchInput, { key: 'ArrowDown' })

            expect(
                (
                    mockUseSelectedIndex.mock.results[1].value as ReturnType<
                        typeof useSelectedIndex
                    >
                ).next,
            ).toHaveBeenCalled()
        })
    })

    it.skip('clearing the input after searching a few times should clear component internals', async () => {
        mockUseSearchRankScenario.mockImplementation((arg) => {
            return {
                isRunning: arg === 'spotlight_customer',
                registerResultsRequest: jest.fn(),
                registerResultsResponse: jest.fn(),
                registerResultSelection: jest.fn(),
                endScenario: jest.fn(),
            }
        })
        jest.useFakeTimers()

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )

        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const tab = getCustomersTab()
        const searchInput = screen.getByPlaceholderText('Search...')
        tab?.focus()

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.keyboard('{enter}')
        await act(flushPromises)

        await userEvent.type(searchInput, 'bar')
        await act(flushPromises)

        userEvent.clear(searchInput)
        await act(flushPromises)
        jest.runOnlyPendingTimers()

        expect(searchInput.textContent).toEqual('')
    })

    it.skip('should change selectedItem on hover when customer row is present in template', async () => {
        mockUseRecentItems.mockImplementation(() => ({
            items: [customer],
            setRecentItem: jest.fn() as any,
            isGettingItems: false,
        }))
        jest.useFakeTimers()

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        jest.runOnlyPendingTimers()
        await act(flushPromises)

        const tab = await screen.findByRole('tab', { name: CUSTOMERS_LABEL })
        await act(async () => {
            await userEvent.click(tab)
        })
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        await act(async () => {
            await userEvent.type(searchInput, 'asdf')
        })

        jest.runOnlyPendingTimers()
        await act(flushPromises)

        await act(async () => {
            await userEvent.keyboard('{enter}')
        })
        await act(flushPromises)

        const spotlightCustomerRow = await screen.findByTestId(
            CUSTOMER_SPOTLIGHT_ROW_TEST_ID,
        )
        await userEvent.hover(spotlightCustomerRow)
        await act(flushPromises)

        await waitFor(() => {
            expect(
                (
                    mockUseSelectedIndex.mock.results[1].value as ReturnType<
                        typeof useSelectedIndex
                    >
                ).setIndex,
            ).toHaveBeenCalledWith(0)
        })
    })
})
