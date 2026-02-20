// sort-imports-ignore
import mockedVirtuoso from 'tests/mockedVirtuoso'

import type { ComponentProps, ReactPortal } from 'react'
import type React from 'react'

import { useSelectedIndex } from '@repo/hooks'
import { assumeMock, flushPromises } from '@repo/testing'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { createBrowserHistory } from 'history'
import { fromJS } from 'immutable'
import { stringify } from 'qs'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { logEvent, SegmentEvent } from '@repo/logging'
import { customer } from 'fixtures/customer'
import { mockSearchRank } from 'fixtures/searchRank'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { voiceCall } from 'fixtures/voiceCalls'
import type { RecentItems } from 'hooks/useRecentItems/constants'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import useSearchRankScenario from 'hooks/useSearchRankScenario'
import { searchCustomersWithHighlights } from 'models/customer/resources'
import { SearchEngine } from 'models/search/types'
import { searchTicketsWithHighlights } from 'models/ticket/resources'
import { searchVoiceCallsWithHighlights } from 'models/voiceCall/resources'
import {
    CALLS_LABEL,
    CUSTOMERS_LABEL,
    TICKETS_LABEL,
} from 'pages/common/components/Spotlight/constants'
import type SpotlightCallRow from 'pages/common/components/Spotlight/SpotlightCallRow'
import type SpotlightCustomerRow from 'pages/common/components/Spotlight/SpotlightCustomerRow'
import SpotlightModal, {
    CUSTOMERS_ADVANCED_SEARCH_PATH,
    FEDERATED_SEARCH_TAB_LABEL,
    TICKETS_ADVANCED_SEARCH_PATH,
} from 'pages/common/components/Spotlight/SpotlightModal'
import type SpotlightTicketRow from 'pages/common/components/Spotlight/SpotlightTicketRow'
import { history } from '@repo/routing'
import * as billingSelectors from 'state/billing/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import * as platform from '@repo/utils'
import { renderWithRouter } from 'utils/testing'

const TICKET_SPOTLIGHT_ROW_TEST_ID = 'spotlight-ticket-row'
const CUSTOMER_SPOTLIGHT_ROW_TEST_ID = 'spotlight-customer-row'
const CALL_SPOTLIGHT_ROW_TEST_ID = 'spotlight-call-row'

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        ...jest.requireActual('@repo/routing').history,
        push: jest.fn(),
        replace: jest.fn(),
        listen: jest.fn(),
    },
}))
jest.mock('state/notifications/actions')

jest.mock('pages/common/components/SkeletonLoader', () => () => (
    <div>SkeletonLoader</div>
))

jest.mock(
    'pages/common/components/Spotlight/SpotlightTicketRow',
    () =>
        ({ onClick }: ComponentProps<typeof SpotlightTicketRow>) => (
            <div onClick={onClick} data-testid={TICKET_SPOTLIGHT_ROW_TEST_ID}>
                MockedSpotlightTicketRow
            </div>
        ),
)

jest.mock(
    'pages/common/components/Spotlight/SpotlightCustomerRow',
    () =>
        ({ onClick }: ComponentProps<typeof SpotlightCustomerRow>) => (
            <div onClick={onClick} data-testid={CUSTOMER_SPOTLIGHT_ROW_TEST_ID}>
                MockedSpotlightCustomerRow
            </div>
        ),
)
jest.mock(
    'pages/common/components/Spotlight/SpotlightCallRow',
    () =>
        ({ onClick }: ComponentProps<typeof SpotlightCallRow>) => (
            <div onClick={onClick} data-testid={CALL_SPOTLIGHT_ROW_TEST_ID}>
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

jest.mock('@repo/logging')
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

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useSelectedIndex: jest.fn(),
    useLocalStorageWithExpiry: jest.fn().mockImplementation(() => {
        const {
            useState,
        }: { useState: (value: unknown) => [string, (value: string) => void] } =
            jest.requireActual('react')
        const [state, setState] = useState('')
        return {
            state,
            setState,
            remove: jest.fn(),
            refreshTimestamp: jest.fn(),
        }
    }),
    useTextWidth: jest.fn().mockReturnValue(100), // Mock text width measurement
}))

const mockUseSelectedIndex = assumeMock(useSelectedIndex)

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

        it('should set All tab on click', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const customersTab = getCustomersTab()

            await act(async () => {
                customersTab?.focus()
            })

            const federatedTab = getFederatedTab()
            await act(async () => {
                federatedTab?.focus()
            })

            expect(federatedTab).toHaveClass('activeTab')
        })

        it('should set customers tab on click', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)

            const customersTab = getCustomersTab()
            await act(async () => {
                await userEvent.click(customersTab)
            })

            expect(customersTab).toHaveClass('activeTab')
        })

        it('should render & set calls tab if available', async () => {
            mockCurrentAccountHasProduct.mockReturnValue((() => true) as any)

            renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)

            const callsTab = getCallsTab()
            expect(callsTab).toBeInTheDocument()

            await act(async () => {
                await userEvent.click(callsTab)
            })

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
            await act(async () => {
                await userEvent.click(callsTab)
            })

            const advancedSearchButton = queryByText('Advanced Search')

            expect(advancedSearchButton).not.toBeInTheDocument()
        })

        it('should navigate to tickets advanced search on click when modal is opened and log event', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const ticketsTab = getTicketsTab()
            await act(async () => {
                ticketsTab?.focus()
            })
            const advancedSearchButton = screen.getByText('Advanced Search')
            await act(async () => {
                await userEvent.click(advancedSearchButton)
            })

            await waitFor(() => {
                expect(logEventMock).toHaveBeenCalledWith(
                    SegmentEvent.GlobalSearchAdvancedButtonClick,
                )
            })
        })

        it('should navigate to tickets advanced search on Federated Search', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const advancedSearchButton = screen.getByText('Advanced Search')
            await act(async () => {
                await userEvent.click(advancedSearchButton)
            })

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
            await act(async () => {
                customersTab?.focus()
            })

            const advancedSearchButton = getByText('Advanced Search')
            await act(async () => {
                await userEvent.click(advancedSearchButton)
            })

            await waitFor(() => {
                expect(history.push).toHaveBeenCalledWith({
                    pathname: CUSTOMERS_ADVANCED_SEARCH_PATH,
                })
            })
        })

        it('should close the modal when navigating to advanced search ', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const ticketsTab = getTicketsTab()
            await act(async () => {
                ticketsTab?.focus()
            })
            const advancedSearchButton = screen.getByText('Advanced Search')
            await act(async () => {
                await userEvent.click(advancedSearchButton)
            })

            await waitFor(() => {
                expect(mockCloseModal).toHaveBeenCalled()
            })
        })

        it('should not navigate to advanced search on keypress when modal is closed', async () => {
            renderWithRouter(
                <WrappedSpotlightModal {...minProps} isOpen={false} />,
            )
            await act(flushPromises)
            act(() => {
                fireEnterShortcutUsingKeyboardEvent(
                    document.body,
                    '{shift}{enter}',
                )
            })

            expect(history.push).not.toHaveBeenCalled()
        })

        it('should navigate to tickets advanced search on keypress when modal is opened and log event', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            const ticketsTab = getTicketsTab()
            await act(async () => {
                ticketsTab?.focus()
            })

            act(() => {
                fireEnterShortcutUsingKeyboardEvent(
                    document.body,
                    '{shift}{enter}',
                )
            })

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
            await act(async () => {
                await userEvent.click(customersTab)
            })
            act(() => {
                fireEnterShortcutUsingKeyboardEvent(
                    customersTab,
                    '{shift}{enter}',
                )
            })

            expect(history.push).toHaveBeenCalledWith({
                pathname: CUSTOMERS_ADVANCED_SEARCH_PATH,
            })
        })

        it('should handle shift + enter shortcut after key input when search input is focused and navigate to advanced search', async () => {
            renderWithRouter(<WrappedSpotlightModal {...minProps} />, {
                history,
            })
            const ticketsTab = getTicketsTab()
            await act(async () => {
                await userEvent.click(ticketsTab)
            })
            const searchInput = screen.getByPlaceholderText('Search...')

            await act(async () => {
                await userEvent.type(searchInput, 'foo')
            })

            act(() => {
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
            await act(async () => {
                await userEvent.click(ticketsTab)
            })
            const searchInput = screen.getByPlaceholderText('Search...')

            await act(async () => {
                await userEvent.type(searchInput, 'foo')
            })

            act(() => {
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
            await act(async () => {
                ticketsTab?.focus()
            })
            const searchInput = screen.getByPlaceholderText('Search...')

            act(() => {
                fireEnterShortcutUsingKeyboardEvent(
                    searchInput,
                    '{shift}{enter}',
                )
            })

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

        act(() => {
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

    it('should fetch tickets on enter keypress from the new search endpoint', async () => {
        const searchQuery = 'foo'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')

        await act(async () => {
            await userEvent.type(searchInput, searchQuery)
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        await waitFor(() => {
            expect(searchTicketsWithHighlightsMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    search: searchQuery,
                    filters: '',
                }),
            )
        })
    })

    it('should not display calls in federated tab if product is disabled', async () => {
        mockCurrentAccountHasProduct.mockReturnValue((() => false) as any)
        searchCallsWithHighlightsMock.mockResolvedValue({
            data: { data: [voiceCall] },
        } as any)

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const tab = getFederatedTab()
        const searchInput = screen.getByPlaceholderText('Search...')
        await act(async () => {
            tab?.focus()
        })

        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        await act(flushPromises)

        expect(screen.queryByTestId(CALL_SPOTLIGHT_ROW_TEST_ID)).toBeNull()
    })

    it('should end previous searchRank scenario and register a new one on enter keypress', async () => {
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: { data: [{ foo: 'foo' }] },
        } as any)

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        const ticketsTab = getTicketsTab()
        await act(async () => {
            ticketsTab?.focus()
        })

        const searchInput = screen.getByPlaceholderText('Search...')

        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

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

    it('should not fetch on enter keypress again it the search term is identical', async () => {
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const ticketsTab = getTicketsTab()
        await act(async () => {
            ticketsTab?.focus()
        })

        const searchInput = screen.getByPlaceholderText('Search...')

        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        await act(flushPromises)
        await act(async () => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })
        expect(searchTicketsWithHighlightsMock).toHaveBeenCalledTimes(1)
    })

    it('should fetch items for the same search term on tab switch if search was performed', async () => {
        searchCustomersWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        await act(flushPromises)
        await act(async () => {
            customersTab?.focus()
        })
        await act(flushPromises)

        expect(searchCustomersWithHighlightsMock).toHaveBeenCalledTimes(2)
        expect(searchTicketsWithHighlightsMock).toHaveBeenCalledTimes(1)
        expect(searchCallsWithHighlightsMock).toHaveBeenCalledTimes(1)
    })

    it('should fetch items for the search term on previous tab if search was not triggered for new query', async () => {
        const searchQuery = 'foo'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        await act(async () => {
            await userEvent.type(searchInput, searchQuery)
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        await act(flushPromises)
        await act(async () => {
            await userEvent.type(searchInput, 'baz')
        })
        await act(async () => {
            customersTab?.focus()
        })
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

    it('should not fetch items on tab switch if a search has been performed for that item type', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')
        const ticketsTab = getTicketsTab()
        const customersTab = getCustomersTab()
        const callsTab = getCallsTab()

        await act(async () => {
            ticketsTab?.focus()
        })
        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        await act(flushPromises)

        await act(async () => {
            customersTab?.focus()
        })
        await act(flushPromises)
        await act(async () => {
            ticketsTab?.focus()
        })
        await act(flushPromises)
        await act(async () => {
            callsTab?.focus()
        })
        await act(flushPromises)

        expect(searchCustomersWithHighlightsMock).toHaveBeenCalledTimes(1)
        expect(searchCallsWithHighlightsMock).toHaveBeenCalledTimes(1)
        expect(searchTicketsWithHighlightsMock).toHaveBeenCalledTimes(2)
    })

    it('should not fetch items for any query on tab switch if the search was not submitted', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        await act(async () => {
            customersTab?.focus()
        })
        await act(flushPromises)

        expect(searchTicketsWithHighlightsMock).not.toHaveBeenCalled()
    })

    it('should fetch customers on enter keypress', async () => {
        searchCustomersWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)

        const searchQuery = 'foo2'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        await act(async () => {
            customersTab?.focus()
        })
        await act(async () => {
            await userEvent.type(searchInput, searchQuery)
        })

        await act(async () => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        expect(searchCustomersWithHighlightsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                search: searchQuery,
            }),
        )
    })

    it('should fetch calls on enter keypress', async () => {
        searchCallsWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)

        const searchQuery = 'foo2'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const callsTab = getCallsTab()

        await act(async () => {
            callsTab?.focus()
        })
        await act(async () => {
            await userEvent.type(searchInput, searchQuery)
        })

        await act(async () => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        expect(searchCallsWithHighlightsMock).toHaveBeenCalledWith(
            expect.objectContaining({
                search: searchQuery,
            }),
        )
    })

    it('should show SkeletonLoader component while results are fetched', async () => {
        // Mock a never-resolving promise to ensure loading state is visible
        const neverResolvingPromise = new Promise<any>(() => {
            // This promise never resolves, keeping the loading state active
        })
        searchTicketsWithHighlightsMock.mockImplementation(
            () => neverResolvingPromise,
        )

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')

        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        // Wait for the delayed loading state to be triggered (300ms delay)
        await waitFor(
            () => {
                expect(screen.getByText('SkeletonLoader')).toBeInTheDocument()
            },
            { timeout: 1000 },
        )

        // Reset the mock after the test to avoid affecting other tests
        searchTicketsWithHighlightsMock.mockReset()
    })

    it('should show SpotlightNoResults component when no results are available ', async () => {
        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )
        const ticketsTab = getTicketsTab()
        await act(async () => {
            ticketsTab?.focus()
        })
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')

        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        await act(flushPromises)

        expect(screen.getByText('No results')).toBeInTheDocument()
    })

    it('should notify when an error occurs and register searchRank scenario', async () => {
        searchTicketsWithHighlightsMock.mockRejectedValue({ message: 'error' })

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )

        const ticketsTab = getTicketsTab()
        await act(async () => {
            ticketsTab?.focus()
        })
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = screen.getByPlaceholderText('Search...')

        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })

        act(() => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        await act(flushPromises)

        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to fetch search results',
            status: NotificationStatus.Error,
        })
        await act(flushPromises)

        expect(mockSearchRank.registerResultsResponse).toHaveBeenCalledWith(
            expect.objectContaining({
                numberOfResults: 0,
                searchEngine: undefined,
            }),
        )
    })

    it('should cancel previous request when tab is switched and not notify on cancellation error', async () => {
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: { data: [] },
        } as any)
        const searchQuery = 'foo'

        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = screen.getByPlaceholderText('Search...')
        const customersTab = getCustomersTab()

        await act(async () => {
            await userEvent.type(searchInput, searchQuery)
        })

        await act(async () => {
            fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
        })

        await act(async () => {
            customersTab?.focus()
        })
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

    it.each([
        [TICKETS_LABEL, ticket, TICKET_SPOTLIGHT_ROW_TEST_ID],
        [CUSTOMERS_LABEL, customer, CUSTOMER_SPOTLIGHT_ROW_TEST_ID],
        [CALLS_LABEL, voiceCall, CALL_SPOTLIGHT_ROW_TEST_ID],
    ])(
        'should render the fetched result set with SpotlightRow for %s tab',
        async (_, item, componentName) => {
            searchTicketsWithHighlightsMock.mockResolvedValue({
                data: { data: [item] },
            } as any)

            const { rerender } = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />,
            )
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = getTicketsTab()
            const searchInput = screen.getByPlaceholderText('Search...')
            await act(async () => {
                tab?.focus()
            })
            await act(async () => {
                await userEvent.type(searchInput, 'foo')
            })

            act(() => {
                fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
            })

            await act(flushPromises)

            expect(screen.getByTestId(componentName)).toBeInTheDocument()
        },
    )

    it.each([
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

            const { rerender } = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />,
            )
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = screen.getByRole('tab', { name })
            const searchInput = screen.getByPlaceholderText('Search...')
            await act(async () => {
                tab?.focus()
            })
            await act(async () => {
                await userEvent.type(searchInput, 'foo')
            })

            await act(async () => {
                fireEnterShortcutUsingKeyboardEvent(searchInput, '{enter}')
            })

            await act(flushPromises)

            const endTrigger = screen.getByText('end area')
            await act(async () => {
                await userEvent.click(endTrigger)
            })

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

    it('should reset search after closing and end previous searchRank scenario', async () => {
        const searchQuery = 'foo'
        searchTicketsWithHighlightsMock.mockResolvedValue({
            data: { data: [ticket] },
        } as any)

        const { getByPlaceholderText, queryByTestId, rerender } =
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        await act(async () => {
            await userEvent.click(searchInput)
        })

        await act(async () => {
            await userEvent.type(searchInput, searchQuery)
        })

        await act(async () => {
            await userEvent.keyboard('{enter}')
        })

        await act(flushPromises)

        await waitFor(() => {
            expect(
                queryByTestId(TICKET_SPOTLIGHT_ROW_TEST_ID),
            ).toBeInTheDocument()
        })

        rerender(<WrappedSpotlightModal {...minProps} isOpen={false} />)
        await act(flushPromises)

        await waitFor(() => {
            expect(mockSearchRank.endScenario).toHaveBeenCalled()
            expect(
                queryByTestId(TICKET_SPOTLIGHT_ROW_TEST_ID),
            ).not.toBeInTheDocument()
        })
    })

    it('should close modal after pathname change', async () => {
        const history = createBrowserHistory()

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
            { history, route: '/app/tickets' },
        )
        await act(flushPromises)

        act(() => {
            history.push('/foo/bar')
        })
        rerender(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        expect(mockCloseModal).toHaveBeenCalled()
    })

    it('should log event on tab switch', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        const ticketsTab = getTicketsTab()
        const customersTab = getCustomersTab()
        const callsTab = getCallsTab()

        await act(async () => {
            customersTab?.focus()
        })
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchCustomerTabClick,
        )
        await act(async () => {
            ticketsTab?.focus()
        })
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchTicketTabClick,
        )
        await act(async () => {
            callsTab?.focus()
        })
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchCallTabClick,
        )
    })

    it('should end previous searchRank scenario on tab switch', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)

        const ticketsTab = getTicketsTab()
        const customersTab = getCustomersTab()
        const callsTab = getCallsTab()

        await act(async () => {
            customersTab?.focus()
        })
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(1)
        await act(async () => {
            ticketsTab?.focus()
        })
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(2)
        await act(async () => {
            callsTab?.focus()
        })
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(3)
    })

    describe('Recent items', () => {
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
                await act(async () => {
                    await userEvent.click(tab)
                })
                await act(flushPromises)
                rerender(<WrappedSpotlightModal {...minProps} />)

                await act(async () => {
                    await userEvent.click(tab)
                })
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
                await act(async () => {
                    await userEvent.click(tab)
                })

                await screen.findByTestId(componentName)

                await act(async () => {
                    await userEvent.click(screen.getByTestId(componentName))
                })

                await waitFor(() => {
                    expect(logEventMock).toHaveBeenNthCalledWith(
                        2,
                        SegmentEvent.RecentItemAccessed,
                        { type: segmentType, user_id: user.id },
                    )
                })

                await act(async () => {
                    await userEvent.click(screen.getByTestId(componentName))
                })

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

    describe('Shortcuts', () => {
        // TODO(React18): Remove this once we upgrade to React 18
        it.each([
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

                searchCustomersWithHighlightsMock.mockResolvedValue({
                    data: response,
                } as any)
                searchCallsWithHighlightsMock.mockResolvedValue({
                    data: response,
                } as any)

                const { getByPlaceholderText } = renderWithRouter(
                    <WrappedSpotlightModal {...minProps} />,
                )
                const tab = screen.getByRole('tab', { name })
                const searchInput = getByPlaceholderText('Search...')
                await act(async () => {
                    await userEvent.click(tab)
                })
                await act(async () => {
                    await userEvent.click(searchInput)
                })
                await act(async () => {
                    await userEvent.type(searchInput, 'foo')
                })

                await act(flushPromises)

                act(() => {
                    fireEnterShortcutUsingKeyboardEvent(searchInput, KBkey)
                })

                await act(flushPromises)

                await act(async () => {
                    await userEvent.type(searchInput, 'bar')
                })

                await act(flushPromises)

                act(() => {
                    fireEnterShortcutUsingKeyboardEvent(searchInput, KBkey)
                })
                await act(flushPromises)

                await waitFor(() => {
                    expect(shouldCall).toHaveBeenCalledWith(...expectedResult)
                })
            },
        )

        it.each([
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

                const { rerender, getByPlaceholderText } = renderWithRouter(
                    <WrappedSpotlightModal {...minProps} />,
                )

                await act(flushPromises)
                rerender(<WrappedSpotlightModal {...minProps} />)

                const tab = screen.getByRole('tab', { name })
                const searchInput = getByPlaceholderText('Search...')
                await act(async () => {
                    tab?.focus()
                    searchInput.focus()
                })

                await act(async () => {
                    await userEvent.type(searchInput, 'foo')
                })
                act(() => {
                    fireEnterShortcutUsingKeyboardEvent(searchInput, KBkey)
                })
                await act(flushPromises)

                await act(async () => {
                    await userEvent.type(searchInput, 'bar')
                })
                act(() => {
                    fireEnterShortcutUsingKeyboardEvent(searchInput, KBkey)
                })
                await act(flushPromises)
                rerender(<WrappedSpotlightModal {...minProps} />)

                await waitFor(() => {
                    expect(shouldCall).toHaveBeenCalledWith(...expectedResult)
                })

                await act(async () => {
                    await userEvent.clear(searchInput)
                })
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

            await act(async () => {
                fireEvent.keyDown(searchInput, { key: 'ArrowUp' })
            })
            expect(
                (
                    mockUseSelectedIndex.mock.results[1].value as ReturnType<
                        typeof useSelectedIndex
                    >
                ).previous,
            ).toHaveBeenCalled()

            await act(async () => {
                fireEvent.keyDown(searchInput, { key: 'ArrowDown' })
            })

            expect(
                (
                    mockUseSelectedIndex.mock.results[1].value as ReturnType<
                        typeof useSelectedIndex
                    >
                ).next,
            ).toHaveBeenCalled()
        })
    })

    it('clearing the input after searching a few times should clear component internals', async () => {
        mockUseSearchRankScenario.mockImplementation((arg) => {
            return {
                isRunning: arg === 'spotlight_customer',
                registerResultsRequest: jest.fn(),
                registerResultsResponse: jest.fn(),
                registerResultSelection: jest.fn(),
                endScenario: jest.fn(),
            }
        })

        const { rerender } = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
        )

        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const tab = getCustomersTab()
        const searchInput = screen.getByPlaceholderText('Search...')

        await act(async () => {
            tab?.focus()
        })
        await act(async () => {
            await userEvent.type(searchInput, 'foo')
        })
        await act(async () => {
            await userEvent.keyboard('{enter}')
        })
        await act(flushPromises)

        await act(async () => {
            await userEvent.type(searchInput, 'bar')
        })
        await act(flushPromises)

        await act(async () => {
            await userEvent.clear(searchInput)
        })
        await act(flushPromises)

        expect(searchInput.textContent).toEqual('')
    })
})
