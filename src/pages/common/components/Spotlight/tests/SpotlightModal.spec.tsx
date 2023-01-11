import React, {ComponentProps, ReactPortal} from 'react'
import userEvent from '@testing-library/user-event'
import {act} from '@testing-library/react'
import ReactDOM from 'react-dom'
import {stringify} from 'qs'
import LD from 'launchdarkly-react-client-sdk'
import axios, {AxiosResponse} from 'axios'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {createBrowserHistory} from 'history'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {searchTickets} from 'models/ticket/resources'

import client from 'models/api/resources'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {Ticket} from 'models/ticket/types'
import {Customer} from 'state/customers/types'
import {assumeMock, flushPromises, renderWithRouter} from 'utils/testing'
import {ticket} from 'fixtures/ticket'
import history from 'pages/history'
import {FeatureFlagKey} from 'config/featureFlags'
import {ViewType} from 'models/view/types'
import {customer} from 'fixtures/customer'

import SpotlightModal from '../SpotlightModal'

jest.mock('pages/history')
jest.mock('models/ticket/resources')
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

const mockSearchTickets = assumeMock(searchTickets)

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

    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ElasticsearchTicketSearch]: true,
        }))
    })

    afterEach(() => {
        jest.clearAllMocks()
        jest.useRealTimers()
    })

    it('should render', () => {
        const {container} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should focus the search input when opened', () => {
        const {rerender, getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} isOpen={false} />
        )

        const searchInput = getByPlaceholderText('Search...')

        expect(searchInput).not.toEqual(document.activeElement)

        rerender(<WrappedSpotlightModal {...minProps} isOpen={true} />)
        expect(searchInput).toEqual(document.activeElement)
    })

    it('should not navigate to advanced search on keypress when modal is closed', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} isOpen={false} />)
        await userEvent.type(document.body, '{shift}{enter}')

        expect(history.push).not.toHaveBeenCalled()
    })

    it('should navigate to advanced search on click when modal is opened', () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        const advancedSearchButton = getByText('Advanced Search')
        userEvent.click(advancedSearchButton)

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
        })
    })

    it('should close the modal when navigating to advanced search ', () => {
        const {getByText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        const advancedSearchButton = getByText('Advanced Search')
        userEvent.click(advancedSearchButton)

        expect(mockCloseModal).toHaveBeenCalled()
    })

    it('should navigate to advanced search on keypress when modal is opened', async () => {
        renderWithRouter(<WrappedSpotlightModal {...minProps} />)
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

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
        })
    })

    it('should not set a query string search param when input was deleted', async () => {
        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )

        const searchInput = getByPlaceholderText('Search...')
        await userEvent.type(searchInput, 'foo')
        await userEvent.type(searchInput, '{backspace}{backspace}{backspace}')
        await userEvent.type(searchInput, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/tickets/search',
        })
    })

    it('should navigate to customers advanced search if on a customer route', async () => {
        jest.useFakeTimers()
        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
            {route: '/app/customers'}
        )

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{shift}{enter}')

        expect(history.push).toHaveBeenCalledWith({
            pathname: '/app/customers/search',
            search: stringify({q: 'foo'}),
        })
    })

    it('should fetch tickets on enter keypress from the new search endpoint', async () => {
        jest.useFakeTimers()

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        expect(searchTickets).toHaveBeenCalledWith({
            cancelToken: expect.anything(),
            filters: '',
            search: 'foo',
        })
    })

    it('should not fetch tickets on enter keypress again it the search term is identical', async () => {
        jest.useFakeTimers()

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await userEvent.type(searchInput, '{enter}')
        expect(searchTickets).toHaveBeenCalledTimes(1)
    })

    it('should fetch tickets on enter keypress from the old search endpoint', async () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.ElasticsearchTicketSearch]: false,
        }))
        jest.spyOn(axios, 'put').mockImplementation(
            jest.fn().mockResolvedValue({})
        )
        jest.useFakeTimers()

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo2')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        expect(client.put).toHaveBeenCalledWith(
            '/api/views/0/items/',
            {view: {search: 'foo2', type: ViewType.TicketList}},
            {cancelToken: expect.anything()}
        )
    })

    it('should fetch customers on enter keypress if on a customer route', async () => {
        jest.spyOn(axios, 'put').mockImplementation(
            jest.fn().mockResolvedValue({})
        )
        jest.useFakeTimers()

        const {getByPlaceholderText} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
            {route: '/app/customers'}
        )

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo2')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        expect(client.put).toHaveBeenCalledWith(
            '/api/views/0/items/',
            {view: {search: 'foo2', type: ViewType.CustomerList}},
            {cancelToken: expect.anything()}
        )
    })

    it('should show SpotlightLoader component while results are fetched', async () => {
        jest.useFakeTimers()
        mockSearchTickets.mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 600))
        )

        const {rerender, getByPlaceholderText, container} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        jest.advanceTimersByTime(300)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show SpotlightNoResults component when no results are available and notify when an error occurs', async () => {
        mockSearchTickets.mockResolvedValue({
            data: {
                data: [],
            },
        } as unknown as AxiosResponse<ApiListResponseCursorPagination<Ticket[]>>)
        jest.useFakeTimers()

        const {rerender, getByPlaceholderText, container} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)

        expect(container.firstChild).toMatchSnapshot()
        expect(notify).toHaveBeenCalledWith({
            message: 'Failed to fetch search results',
            status: NotificationStatus.Error,
        })
    })

    it.each([
        ['/app/tickets', ticket],
        ['/app/customers', customer],
    ])(
        'should render the fetched result set with SpotlightRow for %s route',
        async (route, item) => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.ElasticsearchTicketSearch]: false,
            }))
            jest.spyOn(axios, 'put').mockImplementation(
                jest.fn().mockResolvedValue({
                    data: {
                        data: [item],
                    },
                } as AxiosResponse<ApiListResponseCursorPagination<Ticket[] | Customer[]>>)
            )
            jest.useFakeTimers()

            const {rerender, getByPlaceholderText, container} =
                renderWithRouter(<WrappedSpotlightModal {...minProps} />, {
                    route,
                })
            rerender(<WrappedSpotlightModal {...minProps} />)

            const searchInput = getByPlaceholderText('Search...')

            await userEvent.type(searchInput, 'foo')
            jest.runOnlyPendingTimers()
            await userEvent.type(searchInput, '{enter}')
            await act(flushPromises)

            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should reset search after closing', async () => {
        jest.useFakeTimers()
        mockSearchTickets.mockResolvedValue({
            data: {
                data: [ticket],
            },
        } as AxiosResponse<ApiListResponseCursorPagination<Ticket[]>>)

        const {rerender, getByPlaceholderText, container} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />
        )
        rerender(<WrappedSpotlightModal {...minProps} />)

        const searchInput = getByPlaceholderText('Search...')

        await userEvent.type(searchInput, 'foo')
        jest.runOnlyPendingTimers()
        await userEvent.type(searchInput, '{enter}')
        await act(flushPromises)

        rerender(<WrappedSpotlightModal {...minProps} isOpen={false} />)
        rerender(<WrappedSpotlightModal {...minProps} isOpen={true} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should close modal after pathname change', () => {
        const history = createBrowserHistory()

        const {rerender} = renderWithRouter(
            <WrappedSpotlightModal {...minProps} />,
            {history, route: '/app/tickets'}
        )
        history.push('/foo/bar')
        rerender(<WrappedSpotlightModal {...minProps} />)

        expect(mockCloseModal).toHaveBeenCalled()
    })
})
