import React, {ComponentProps, ReactPortal} from 'react'
import userEvent from '@testing-library/user-event'
import {act, fireEvent, getByTestId} from '@testing-library/react'
import ReactDOM from 'react-dom'
import {stringify} from 'qs'
import LD from 'launchdarkly-react-client-sdk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {createBrowserHistory} from 'history'
import MockAdapter from 'axios-mock-adapter'
import {fromJS} from 'immutable'

import {logEvent, SegmentEvent} from 'common/segment'
import useRecentItems from 'hooks/useRecentItems/useRecentItems'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import client from 'models/api/resources'
import {assumeMock, flushPromises, renderWithRouter} from 'utils/testing'
import {ticket} from 'fixtures/ticket'
import {user} from 'fixtures/users'
import history from 'pages/history'
import {FeatureFlagKey} from 'config/featureFlags'
import {customer} from 'fixtures/customer'
import useSearchRankScenario from 'hooks/useSearchRankScenario'
import {mockSearchRank} from 'fixtures/searchRank'
import {SearchEngine} from 'models/search/types'
import mockedVirtuoso from 'tests/mockedVirtuoso'

import useSelectedIndex from 'hooks/useSelectedIndex'
import * as platform from 'utils/platform'
import SpotlightModal from '../SpotlightModal'
import SpotlightTicketRow from '../SpotlightTicketRow'
import SpotlightCustomerRow from '../SpotlightCustomerRow'

const TICKET_SPOTLIGHT_ROW_TEST_ID = 'spotlight-ticket-row'
const CUSTOMER_SPOTLIGHT_ROW_TEST_ID = 'spotlight-customer-row'

jest.mock('pages/history')
jest.mock('state/notifications/actions')

jest.mock('pages/common/components/SkeletonLoader', () => () => (
    <div>SkeletonLoader</div>
))

jest.mock(
    'pages/common/components/Spotlight/SpotlightTicketRow',
    () =>
        ({onClick, onHover}: ComponentProps<typeof SpotlightTicketRow>) =>
            (
                <div
                    onClick={onClick}
                    onMouseEnter={onHover}
                    data-testid={TICKET_SPOTLIGHT_ROW_TEST_ID}
                >
                    MockedSpotlightTicketRow
                </div>
            )
)

jest.mock(
    'pages/common/components/Spotlight/SpotlightCustomerRow',
    () =>
        ({onClick, onHover}: ComponentProps<typeof SpotlightCustomerRow>) =>
            (
                <div
                    onClick={onClick}
                    onMouseEnter={onHover}
                    data-testid={CUSTOMER_SPOTLIGHT_ROW_TEST_ID}
                >
                    MockedSpotlightCustomerRow
                </div>
            )
)

jest.spyOn(ReactDOM, 'createPortal').mockImplementation(
    (element) => element as ReactPortal
)

jest.mock('common/segment')
const logEventMock = assumeMock(logEvent)

jest.mock('hooks/useSearchRankScenario')
const mockUseSearchRankScenario = assumeMock(useSearchRankScenario)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mockStore = configureMockStore([thunk])

const WrappedSpotlightModal = (
    props: ComponentProps<typeof SpotlightModal>
) => (
    <Provider store={mockStore({currentUser: fromJS(user)})}>
        <SpotlightModal {...props} />
    </Provider>
)

jest.mock('react-virtuoso', () => mockedVirtuoso)

const mockUseRecentItems = assumeMock(useRecentItems)

jest.mock('hooks/useRecentItems/useRecentItems')

jest.mock(
    'focus-trap-react',
    () =>
        ({children}: {children: React.ReactNode}) => {
            return <>{children}</>
        }
)

jest.mock('hooks/useSelectedIndex')
const mockUseSelectedIndex = assumeMock(useSelectedIndex)

const CUSTOMERS_TAB_LABEL = 'Customers'
const TICKETS_TAB_LABEL = 'Tickets'
describe('<SpotlightModal/>', () => {
    const mockCloseModal = jest.fn()
    const minProps: ComponentProps<typeof SpotlightModal> = {
        isOpen: true,
        onCloseModal: mockCloseModal,
    }
    let mockServer: MockAdapter

    beforeAll(() => {
        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
            value: jest.fn(),
            writable: true,
        })
    })

    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ElasticsearchTicketSearch]: true,
        }))
        mockServer = new MockAdapter(client)
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
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should render with tickets tab as default', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        expect(getByText(TICKETS_TAB_LABEL)).toBeInTheDocument()
    })

    it('should set customers tab on click', async () => {
        const customersLabel = CUSTOMERS_TAB_LABEL
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const customersTab = getByText(customersLabel)
        customersTab.parentElement?.focus()

        expect(getByText(customersLabel)).toBeInTheDocument()
    })

    it('should focus the search input when opened', async () => {
        const {rerender, getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} isOpen={false} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} isOpen={true} />)

        const searchInput = getByPlaceholderText('Search...')

        expect(searchInput).toEqual(document.activeElement)
    })

    it('should navigate to tickets advanced search on click when modal is opened and log event', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        const advancedSearchButton = getByText('Advanced Search')
        userEvent.click(advancedSearchButton)

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchAdvancedButtonClick
        )
    })

    it('should navigate to customers advanced search on click when modal is opened on the customers tab and log event', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)
        customersTab.parentElement?.focus()
        const advancedSearchButton = getByText('Advanced Search')
        userEvent.click(advancedSearchButton)

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/customers/search',
        })
    })

    it('should close the modal when navigating to advanced search ', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        const advancedSearchButton = getByText('Advanced Search')
        userEvent.click(advancedSearchButton)

        expect(mockCloseModal).toHaveBeenCalled()
    })

    it('should not navigate to advanced search on keypress when modal is closed', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} isOpen={false} />)
        await act(flushPromises)
        await userEvent.type(document.body, '{shift}{enter}')

        expect(history.push).not.toHaveBeenCalled()
    })

    it('should navigate to tickets advanced search on keypress when modal is opened and log event', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)
        await userEvent.type(document.body, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchAdvancedShortcut
        )
    })

    it('should navigate to customers advanced search on keypress when modal is opened on a ticket tab ', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)
        customersTab.parentElement?.focus()
        await userEvent.type(document.body, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/customers/search',
        })
    })

    it('should handle shift + enter shortcut after key input when search input is focused and navigate to advanced search', async () => {
        jest.useFakeTimers()
        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
            {history}
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
            search: stringify({q: 'foo'}),
        })
    })

    it('should handle shift + enter shortcut after key input when search input is not focused and navigate to advanced search', async () => {
        jest.useFakeTimers()
        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(document.body, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
            search: stringify({q: 'foo'}),
        })
    })

    it('should not set a query string search param when no input was performed', async () => {
        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
        })
    })

    // TODO: test is skipped because of the input not being correctly cleared - check for user-event upgrade path
    it.skip('should not set a query string search param when input was deleted', async () => {
        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await act(flushPromises)
        await userEvent.type(searchInput, '{backspace}{backspace}{backspace}')
        await userEvent.type(searchInput, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
        })
    })

    it('should fetch tickets on enter keypress from the new search endpoint', async () => {
        jest.useFakeTimers()
        const searchQuery = 'foo'

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')

        expect(mockServer.history.post).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    data: JSON.stringify({search: searchQuery, filters: ''}),
                }),
            ])
        )
    })

    it('should end previous searchRank scenario and register a new one on enter keypress', async () => {
        mockServer.onPost().reply(200, {data: ['foo']})
        jest.useFakeTimers()

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        expect(mockSearchRank.endScenario).toHaveBeenCalled()
        expect(mockSearchRank.registerResultsRequest).toHaveBeenCalledWith(
            expect.objectContaining({
                query: 'foo',
            })
        )
        await act(flushPromises)
        expect(mockSearchRank.registerResultsResponse).toHaveBeenCalledWith(
            expect.objectContaining({
                numberOfResults: 1,
                searchEngine: SearchEngine.ES,
            })
        )
    })

    it('should not fetch on enter keypress again it the search term is identical', async () => {
        jest.useFakeTimers()
        mockServer.onPost().reply(200, {data: []})

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)
        await userEvent.type(searchInput, '{enter}')
        expect(mockServer.history.post).toHaveLength(1)
    })

    it('should fetch tickets on enter keypress from the old search endpoint', async () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ElasticsearchTicketSearch]: false,
        }))
        jest.useFakeTimers()
        const searchQuery = 'foo2'

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')

        expect(mockServer.history.put).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    data: JSON.stringify({
                        view: {
                            search: searchQuery,
                            type: 'ticket-list',
                        },
                    }),
                }),
            ])
        )
    })

    it('should register a new searchRank scenario with PG as searchEngine enter keypress from the old search endpoint', async () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ElasticsearchTicketSearch]: false,
        }))
        mockServer.onPut().reply(200, {data: ['foo']})
        jest.useFakeTimers()

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)
        expect(mockSearchRank.registerResultsResponse).toHaveBeenCalledWith(
            expect.objectContaining({
                numberOfResults: 1,
                searchEngine: SearchEngine.PG,
            })
        )
    })

    it('should fetch items for the same search term on tab switch if search was performed', async () => {
        jest.useFakeTimers()
        mockServer.onPost().reply(200, {data: []})

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)
        customersTab.parentElement?.focus()
        await act(flushPromises)
        expect(mockServer.history.post).toHaveLength(2)
    })

    it('should fetch items for the search term on previous tab if search was not triggered for new query', async () => {
        jest.useFakeTimers()
        mockServer.onPost().reply(200, {data: []})
        const searchQuery = 'foo'

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)

        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)
        await userEvent.type(searchInput, 'baz')
        customersTab.parentElement?.focus()
        await act(flushPromises)

        expect(mockServer.history.post).toHaveLength(2)
        expect(mockServer.history.post).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    data: JSON.stringify({search: searchQuery, filters: ''}),
                }),
                expect.objectContaining({
                    data: JSON.stringify({search: searchQuery}),
                }),
            ])
        )
    })

    it('should not fetch items on tab switch if a search has been performed for that item type', async () => {
        jest.useFakeTimers()
        mockServer.onPost().reply(200, {data: []})

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const ticketsTab = getByText(TICKETS_TAB_LABEL)
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)
        customersTab.parentElement?.focus()
        await act(flushPromises)
        ticketsTab.parentElement?.focus()
        await act(flushPromises)

        expect(mockServer.history.post).toHaveLength(2)
    })

    it('should not fetch items for any query on tab switch if the search was not submitted', async () => {
        jest.useFakeTimers()

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        customersTab.parentElement?.focus()
        await act(flushPromises)

        expect(mockServer.history.post).toHaveLength(0)
    })

    it('should fetch customers on enter keypress', async () => {
        mockServer.onPost().reply(200, {data: []})
        jest.useFakeTimers()
        const searchQuery = 'foo2'

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)

        customersTab.parentElement?.focus()
        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')

        expect(mockServer.history.post).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    data: JSON.stringify({search: searchQuery}),
                }),
            ])
        )
    })

    it('should show SkeletonLoader component while results are fetched', async () => {
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        jest.advanceTimersByTime(300)

        expect(getByText('SkeletonLoader')).toBeInTheDocument()
    })

    it('should show SpotlightNoResults component when no results are available ', async () => {
        mockServer.onPost().reply(200, {data: []})
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)

        expect(getByText('No results')).toBeInTheDocument()
    })

    it('should notify when an error occurs and register searchRank scenario', async () => {
        mockServer.onPost().reply(503, {message: 'error'})
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
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
            })
        )
    })

    it('should cancel previous request when tab is switched and not notify on cancellation error', async () => {
        jest.useFakeTimers()
        mockServer = new MockAdapter(client, {delayResponse: 2000})
        mockServer.onPost().reply(200, {data: []})
        const searchQuery = 'foo'

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)

        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        jest.advanceTimersByTime(500)
        customersTab.parentElement?.focus()
        await act(flushPromises)

        expect(mockServer.history.post).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    data: JSON.stringify({search: searchQuery}),
                }),
                expect.objectContaining({
                    data: JSON.stringify({search: searchQuery}),
                }),
                expect.objectContaining({
                    cancelToken: expect.objectContaining({
                        reason: expect.objectContaining({
                            code: 'ERR_CANCELED',
                            message: 'canceled',
                            name: 'CanceledError',
                        }),
                    }),
                }),
            ])
        )
        expect(notify).not.toHaveBeenCalled()
    })

    it.each([
        [TICKETS_TAB_LABEL, ticket, TICKET_SPOTLIGHT_ROW_TEST_ID],
        [CUSTOMERS_TAB_LABEL, customer, CUSTOMER_SPOTLIGHT_ROW_TEST_ID],
    ])(
        'should render the fetched result set with SpotlightRow for %s tab',
        async (name, item, componentName) => {
            mockServer.onPost().reply(200, {data: [item]})
            jest.useFakeTimers()

            const {rerender, getByPlaceholderText, getByText, container} =
                renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = getByText(name)
            const searchInput = getByPlaceholderText('Search...')
            tab.parentElement?.focus()

            await userEvent.type(searchInput, 'foo')
            jest.runOnlyPendingTimers()
            await userEvent.type(searchInput, '{enter}')
            await act(flushPromises)

            expect(getByTestId(container, componentName)).toBeInTheDocument()
        }
    )

    it.each([
        [TICKETS_TAB_LABEL, ticket],
        [CUSTOMERS_TAB_LABEL, customer],
    ])(
        'should fetch more from new endpoint on end reached if meta indicates more items are available',
        async (name, item) => {
            mockServer.onPost().reply(200, {
                data: [item],
                meta: {
                    prev_cursor: null,
                    next_cursor: 'foo',
                },
            })
            jest.useFakeTimers()

            const {rerender, getByPlaceholderText, getByText} =
                renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = getByText(name)
            const searchInput = getByPlaceholderText('Search...')
            tab.parentElement?.focus()

            await userEvent.type(searchInput, 'foo')
            jest.runOnlyPendingTimers()
            await userEvent.type(searchInput, '{enter}')
            await act(flushPromises)

            const endTrigger = getByText('end area')
            userEvent.click(endTrigger)

            await act(flushPromises)
            expect(
                (mockServer.history.post[1].params as Record<string, unknown>)
                    .cursor
            ).toEqual('foo')
        }
    )

    it('should fetch more from old endpoint on end reached if meta indicates more items are available', async () => {
        const mockMeta = {
            next_items:
                '/api/views/0/items/?direction=next&ignored_item=169178&cursor=MTY3NDc4MTEyNjc0ODg4Ni1mYWxzZQ%3D%3D',
            prev_items: null,
            current_cursor: 'MTY3NzY3Nzk0ODM0NzA3NC1mYWxzZQ==',
        }

        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ElasticsearchTicketSearch]: false,
        }))
        mockServer.onPut().reply(200, {
            data: [ticket],
            meta: mockMeta,
        })
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const tab = getByText(TICKETS_TAB_LABEL)
        const searchInput = getByPlaceholderText('Search...')
        tab.parentElement?.focus()

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)

        const endTrigger = getByText('end area')
        userEvent.click(endTrigger)

        await act(flushPromises)
        expect(mockServer.history.put[1].url).toEqual(mockMeta.next_items)
    })

    it('should reset search after closing and end previous searchRank scenario', async () => {
        const searchQuery = 'foo'
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, searchQuery)
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)

        expect(searchInput).toHaveValue(searchQuery)

        rerender(<WrappedSpotlightModal {...minProps} isOpen={false} />)
        rerender(<WrappedSpotlightModal {...minProps} isOpen={true} />)

        expect(mockSearchRank.endScenario).toHaveBeenCalled()
        expect(searchInput).toHaveValue('')
    })

    it('should close modal after pathname change', async () => {
        const history = createBrowserHistory()

        const {rerender} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
            {history, route: '/app/tickets'}
        )
        await act(flushPromises)

        history.push('/foo/bar')
        rerender(<WrappedSpotlightModal {...minProps} />)

        expect(mockCloseModal).toHaveBeenCalled()
    })

    it('should log event on tab switch', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const ticketsTab = getByText(TICKETS_TAB_LABEL)
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)

        customersTab.parentElement?.focus()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchCustomerTabClick
        )
        ticketsTab.parentElement?.focus()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchTicketTabClick
        )
    })

    it('should end previous searchRank scenario on tab switch', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const ticketsTab = getByText(TICKETS_TAB_LABEL)
        const customersTab = getByText(CUSTOMERS_TAB_LABEL)

        customersTab.parentElement?.focus()
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(1)
        ticketsTab.parentElement?.focus()
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(2)
    })

    it.each([
        [TICKETS_TAB_LABEL, ticket, TICKET_SPOTLIGHT_ROW_TEST_ID],
        [CUSTOMERS_TAB_LABEL, customer, CUSTOMER_SPOTLIGHT_ROW_TEST_ID],
    ])(
        'should render the recent %s searches with SpotlightRow',
        async (name, item, componentName) => {
            mockUseRecentItems.mockReturnValue({
                items: [item],
                setRecentItem: jest.fn() as any,
                isGettingItems: false,
            })

            const {rerender, getByText, container} = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />
            )
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = getByText(name)
            tab.parentElement?.focus()

            expect(getByText('Recently accessed')).toBeInTheDocument()
            expect(getByTestId(container, componentName)).toBeInTheDocument()
        }
    )

    it.each([
        [
            TICKETS_TAB_LABEL,
            ticket,
            TICKET_SPOTLIGHT_ROW_TEST_ID,
            'spotlight-ticket',
        ],
        [
            CUSTOMERS_TAB_LABEL,
            customer,
            CUSTOMER_SPOTLIGHT_ROW_TEST_ID,
            'spotlight-customer',
        ],
    ])(
        'should log segment event when a recent %s row is clicked',
        async (name, item, componentName, segmentType) => {
            mockUseRecentItems.mockReturnValue({
                items: [item],
                setRecentItem: jest.fn() as any,
                isGettingItems: false,
            })

            const {rerender, getByText, container} = renderWithRouter(
                <WrappedSpotlightModal {...minProps} />
            )
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = getByText(name)
            tab.parentElement?.focus()

            userEvent.click(getByTestId(container, componentName))
            expect(logEventMock).toHaveBeenNthCalledWith(
                2,
                SegmentEvent.RecentItemAccessed,
                {type: segmentType, user_id: user.id}
            )

            await userEvent.type(
                getByTestId(container, componentName),
                '{enter}'
            )
            expect(logEventMock).toHaveBeenNthCalledWith(
                3,
                SegmentEvent.RecentItemAccessed,
                {type: segmentType, user_id: user.id}
            )
        }
    )

    it.each([
        [
            TICKETS_TAB_LABEL,
            ticket,
            {
                KBkey: '{enter}',
                shouldCall: history.push,
                expectedResult: [`/app/ticket/${ticket.id}`],
            },
        ],
        [
            CUSTOMERS_TAB_LABEL,
            customer,
            {
                KBkey: '{enter}',
                shouldCall: history.push,
                expectedResult: [`/app/customer/${customer.id}`],
            },
        ],
        [
            TICKETS_TAB_LABEL,
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
            CUSTOMERS_TAB_LABEL,
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
    ])(
        'should check enter/ctrl+enter hotkeys open searched entry in the same/new tab - platforms other than MacOs',
        async (name, item, {KBkey, shouldCall, expectedResult}) => {
            mockUseSearchRankScenario.mockImplementation((arg) => {
                return {
                    isRunning: arg === 'spotlight_customer',
                    registerResultsRequest: jest.fn(),
                    registerResultsResponse: jest.fn(),
                    registerResultSelection: jest.fn(),
                    endScenario: jest.fn(),
                }
            })
            mockServer.onPost().reply(200, {
                data: [item],
                meta: {
                    prev_cursor: 'bar',
                    next_cursor: 'foo',
                },
            })
            jest.useFakeTimers()

            const {rerender, getByPlaceholderText, getByText} =
                renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = getByText(name)
            const searchInput = getByPlaceholderText('Search...')
            tab.parentElement?.focus()

            await userEvent.type(searchInput, 'foo')
            jest.runOnlyPendingTimers()
            await userEvent.type(searchInput, KBkey)
            await act(flushPromises)

            await userEvent.type(searchInput, 'bar')
            jest.runOnlyPendingTimers()
            await userEvent.type(searchInput, KBkey)
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            expect(shouldCall).toHaveBeenCalledWith(...expectedResult)

            userEvent.clear(searchInput)

            rerender(<WrappedSpotlightModal {...minProps} isOpen={false} />)
        }
    )

    it.each([
        [
            TICKETS_TAB_LABEL,
            ticket,
            {
                KBkey: '{enter}',
                shouldCall: history.push,
                expectedResult: [`/app/ticket/${ticket.id}`],
            },
        ],
        [
            CUSTOMERS_TAB_LABEL,
            customer,
            {
                KBkey: '{enter}',
                shouldCall: history.push,
                expectedResult: [`/app/customer/${customer.id}`],
            },
        ],
        [
            TICKETS_TAB_LABEL,
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
            CUSTOMERS_TAB_LABEL,
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
    ])(
        'should check enter/ctrl+enter hotkeys open searched entry in the same/new tab - platform is MacOs',
        async (name, item, {KBkey, shouldCall, expectedResult}) => {
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
            mockServer.onPost().reply(200, {
                data: [item],
                meta: {
                    prev_cursor: 'bar',
                    next_cursor: 'foo',
                },
            })
            jest.useFakeTimers()

            const {rerender, getByPlaceholderText, getByText} =
                renderWithRouter(<WrappedSpotlightModal {...minProps} />)

            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = getByText(name)
            const searchInput = getByPlaceholderText('Search...')
            tab.parentElement?.focus()

            await userEvent.type(searchInput, 'foo')
            jest.runOnlyPendingTimers()
            await userEvent.type(searchInput, KBkey)
            await act(flushPromises)

            await userEvent.type(searchInput, 'bar')
            jest.runOnlyPendingTimers()
            await userEvent.type(searchInput, KBkey)
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            expect(shouldCall).toHaveBeenCalledWith(...expectedResult)

            userEvent.clear(searchInput)

            rerender(<WrappedSpotlightModal {...minProps} isOpen={false} />)
        }
    )

    it('should check keyboard navigation actions set next and previous actions on useSelectedIndex hook', async () => {
        mockUseSelectedIndex.mockReturnValue({
            index: 0,
            setIndex: jest.fn(),
            next: jest.fn(),
            previous: jest.fn(),
            reset: jest.fn(),
        })
        const {rerender, getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} isOpen={false} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} isOpen={true} />)

        const searchInput = getByPlaceholderText('Search...')

        expect(searchInput).toEqual(document.activeElement)

        fireEvent.keyDown(searchInput, {key: 'ArrowUp'})
        expect(
            (
                mockUseSelectedIndex.mock.results[1].value as ReturnType<
                    typeof useSelectedIndex
                >
            ).previous
        ).toHaveBeenCalled()

        fireEvent.keyDown(searchInput, {key: 'ArrowDown'})

        expect(
            (
                mockUseSelectedIndex.mock.results[1].value as ReturnType<
                    typeof useSelectedIndex
                >
            ).next
        ).toHaveBeenCalled()
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
        mockServer.onPost().reply(200, {
            data: [customer],
            meta: {
                prev_cursor: 'bar',
                next_cursor: 'foo',
            },
        })
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )

        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const tab = getByText(CUSTOMERS_TAB_LABEL)
        const searchInput = getByPlaceholderText('Search...')
        tab.parentElement?.focus()

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)

        await userEvent.type(searchInput, 'bar')
        await act(flushPromises)

        userEvent.clear(searchInput)
        await act(flushPromises)
        jest.runOnlyPendingTimers()

        expect(searchInput.textContent).toEqual('')
    })

    it('should test hover behavior when customer row is present in template', async () => {
        mockServer.onPost().reply(200, {
            data: [customer],
            meta: {
                prev_cursor: null,
                next_cursor: 'foo',
            },
        })
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText, getByText, container} =
            renderWithRouter(<WrappedSpotlightModal {...minProps} />)

        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const tab = getByText(CUSTOMERS_TAB_LABEL)
        jest.runOnlyPendingTimers()
        const searchInput = getByPlaceholderText('Search...')
        tab.parentElement?.focus()

        await userEvent.type(searchInput, 'asdf')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')

        await act(flushPromises)

        const spotlightCustomerRow = getByTestId(
            container,
            CUSTOMER_SPOTLIGHT_ROW_TEST_ID
        )
        act(() => {
            fireEvent.mouseOver(spotlightCustomerRow)
        })

        expect(
            (
                mockUseSelectedIndex.mock.results[1].value as ReturnType<
                    typeof useSelectedIndex
                >
            ).setIndex
        ).toHaveBeenCalledWith(0)
    })
})
