import React, {ComponentProps, ReactPortal} from 'react'
import userEvent from '@testing-library/user-event'
import {act} from '@testing-library/react'
import ReactDOM from 'react-dom'
import {stringify} from 'qs'
import LD from 'launchdarkly-react-client-sdk'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {createBrowserHistory} from 'history'
import MockAdapter from 'axios-mock-adapter'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import client from 'models/api/resources'
import {assumeMock, flushPromises, renderWithRouter} from 'utils/testing'
import {ticket} from 'fixtures/ticket'
import history from 'pages/history'
import {FeatureFlagKey} from 'config/featureFlags'
import {customer} from 'fixtures/customer'
import useSearchRankScenario from 'hooks/useSearchRankScenario'
import {mockSearchRank} from 'fixtures/searchRank'
import {SearchEngine} from 'models/search/types'

import SpotlightModal from '../SpotlightModal'

jest.mock('pages/history')
jest.mock('state/notifications/actions')

jest.mock('pages/common/components/Spotlight/SpotlightLoader', () => () => (
    <div>SpotlightLoader</div>
))

jest.mock('pages/common/components/Spotlight/SpotlightTicketRow', () => () => (
    <div>SpotlightTicketRow</div>
))

jest.mock(
    'pages/common/components/Spotlight/SpotlightCustomerRow',
    () => () => <div>SpotlightCustomerRow</div>
)

jest.spyOn(ReactDOM, 'createPortal').mockImplementation(
    (element) => element as ReactPortal
)

jest.mock('store/middlewares/segmentTracker')
const logEventMock = assumeMock(logEvent)

jest.mock('hooks/useSearchRankScenario')
;(
    useSearchRankScenario as jest.MockedFunction<typeof useSearchRankScenario>
).mockImplementation(() => mockSearchRank)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

const mockStore = configureMockStore([thunk])

const WrappedSpotlightModal = (
    props: ComponentProps<typeof SpotlightModal>
) => (
    <Provider store={mockStore()}>
        <SpotlightModal {...props} />
    </Provider>
)

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
            [FeatureFlagKey.ElasticsearchCustomerSearch]: true,
        }))
        mockServer = new MockAdapter(client)
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.useRealTimers()
    })

    it('should render with customer tab as default', async () => {
        const {container} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should set tickets tab on click', async () => {
        const {container, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const ticketsTab = getByText('Tickets')
        ticketsTab.parentElement!.focus()

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should focus the search input when opened', async () => {
        const {rerender, getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} isOpen={false} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        expect(searchInput).not.toEqual(document.activeElement)

        rerender(<WrappedSpotlightModal {...minProps} isOpen={true} />)
        expect(searchInput).toEqual(document.activeElement)
    })

    it('should navigate to customer advanced search on click when modal is opened and log event', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        const advancedSearchButton = getByText('Advanced Search')
        userEvent.click(advancedSearchButton)

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/customers/search',
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchAdvancedButtonClick
        )
    })

    it('should navigate to tickets advanced search on click when modal is opened on a ticket tab and log event', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        const ticketsTab = getByText('Tickets')
        ticketsTab.parentElement!.focus()
        const advancedSearchButton = getByText('Advanced Search')
        userEvent.click(advancedSearchButton)

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
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

    it('should navigate to customers advanced search on keypress when modal is opened and log event', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
        await act(flushPromises)
        await userEvent.type(document.body, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/customers/search',
        })
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchAdvancedShortcut
        )
    })

    it('should navigate to tickets advanced search on keypress when modal is opened on a ticket tab ', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        const ticketsTab = getByText('Tickets')
        ticketsTab.parentElement!.focus()
        await userEvent.type(document.body, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
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
            pathname: '/app/customers/search',
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
            pathname: '/app/customers/search',
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
            pathname: '/app/customers/search',
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
            pathname: '/app/customers/search',
        })
    })

    it('should fetch tickets on enter keypress from the new search endpoint when on the tickets tab', async () => {
        jest.useFakeTimers()

        const {getByText, getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const ticketsTab = getByText('Tickets')
        ticketsTab.parentElement!.focus()

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        expect(mockServer.history.post).toMatchSnapshot()
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

    it('should fetch tickets on enter keypress from the old search endpoint if on the tickets tab', async () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ElasticsearchTicketSearch]: false,
        }))
        jest.useFakeTimers()

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const ticketsTab = getByText('Tickets')
        const searchInput = getByPlaceholderText('Search...')

        ticketsTab.parentElement!.focus()
        await userEvent.type(searchInput, 'foo2')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        expect(mockServer.history.put).toMatchSnapshot()
    })

    it('should fetch items for the same search term on tab switch if search was performed', async () => {
        jest.useFakeTimers()
        mockServer.onPost().reply(200, {data: []})

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const ticketsTab = getByText('Tickets')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)
        ticketsTab.parentElement!.focus()
        await act(flushPromises)
        expect(mockServer.history.post).toHaveLength(2)
    })

    it('should fetch items for the search term on previous tab if search was not triggered for new query', async () => {
        jest.useFakeTimers()
        mockServer.onPost().reply(200, {data: []})

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const ticketsTab = getByText('Tickets')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)
        await userEvent.type(searchInput, 'baz')
        ticketsTab.parentElement!.focus()
        await act(flushPromises)
        expect(mockServer.history.post).toHaveLength(2)
    })

    it('should not fetch items on tab switch if a search has been performed for that item type', async () => {
        jest.useFakeTimers()
        mockServer.onPost().reply(200, {data: []})

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const ticketsTab = getByText('Tickets')
        const customersTab = getByText('Customers')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)
        ticketsTab.parentElement!.focus()
        await act(flushPromises)
        customersTab.parentElement!.focus()
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
        const ticketsTab = getByText('Tickets')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        ticketsTab.parentElement!.focus()
        await act(flushPromises)
        expect(mockServer.history.post).toHaveLength(0)
    })

    it('should fetch customers on enter keypress', async () => {
        mockServer.onPost().reply(200, {data: []})
        jest.useFakeTimers()

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo2')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        expect(mockServer.history.post).toMatchSnapshot()
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

    it('should fetch customers on enter keypress from the old search endpoint ', async () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ElasticsearchCustomerSearch]: false,
        }))
        mockServer.onPut().reply(200, {data: []})
        jest.useFakeTimers()

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo2')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        expect(mockServer.history.put).toMatchSnapshot()
    })

    it('register a new searchRank scenario with PG as searchEngine enter keypress from the old search endpoint', async () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ElasticsearchCustomerSearch]: false,
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

    it('should show SpotlightLoader component while results are fetched', async () => {
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText, container} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        jest.advanceTimersByTime(300)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show SpotlightNoResults component when no results are available ', async () => {
        mockServer.onPost().reply(200, {data: []})
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText, container} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)

        expect(container.firstChild).toMatchSnapshot()
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

        const {getByPlaceholderText, getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const searchInput = getByPlaceholderText('Search...')
        const ticketsTab = getByText('Tickets')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        jest.advanceTimersByTime(500)
        ticketsTab.parentElement!.focus()
        await act(flushPromises)

        expect(mockServer.history.post).toMatchSnapshot()
        expect(notify).not.toHaveBeenCalled()
    })

    it.each([
        ['Tickets', ticket],
        ['Customers', customer],
    ])(
        'should render the fetched result set with SpotlightRow for %s tab',
        async (name, item) => {
            mockServer.onPost().reply(200, {data: [item]})
            jest.useFakeTimers()

            const {rerender, getByPlaceholderText, getByText, container} =
                renderWithRouter(<WrappedSpotlightModal {...minProps} />)
            await act(flushPromises)
            rerender(<WrappedSpotlightModal {...minProps} />)

            const tab = getByText(name)
            tab.parentElement!.focus()

            const searchInput = getByPlaceholderText('Search...')

            await userEvent.type(searchInput, 'foo')
            jest.runOnlyPendingTimers()
            await userEvent.type(searchInput, '{enter}')
            await act(flushPromises)

            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should reset search after closing and end previous searchRank scenario', async () => {
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText, container} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)

        rerender(<WrappedSpotlightModal {...minProps} isOpen={false} />)
        rerender(<WrappedSpotlightModal {...minProps} isOpen={true} />)
        expect(mockSearchRank.endScenario).toHaveBeenCalled()
        expect(container.firstChild).toMatchSnapshot()
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

        const ticketsTab = getByText('Tickets')
        const customersTab = getByText('Customers')

        ticketsTab.parentElement!.focus()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchTicketTabClick
        )
        customersTab.parentElement!.focus()
        expect(logEvent).toHaveBeenCalledWith(
            SegmentEvent.GlobalSearchCustomerTabClick
        )
    })

    it('should end previous searchRank scenario on tab switch', async () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        await act(flushPromises)

        const ticketsTab = getByText('Tickets')
        const customersTab = getByText('Customers')

        ticketsTab.parentElement!.focus()
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(1)
        customersTab.parentElement!.focus()
        expect(mockSearchRank.endScenario).toHaveBeenCalledTimes(2)
    })
})
