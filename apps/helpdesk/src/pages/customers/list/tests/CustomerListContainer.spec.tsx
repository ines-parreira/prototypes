import React from 'react'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import CustomerListContainer from '../CustomerListContainer'

jest.mock('pages/common/components/ViewTable/ViewTable', () => (props: any) => (
    <div data-hide-header={props.hideHeader}>
        ViewTable
        {props.viewButtons}
    </div>
))

jest.mock(
    'pages/customers/common/components/CustomerForm',
    () =>
        ({
            closeModal,
            onSuccess,
        }: {
            closeModal: () => void
            onSuccess: () => void
        }) => (
            <div>
                CustomerForm
                <button onClick={closeModal}>Close form</button>
                <button onClick={onSuccess}>Submit form</button>
            </div>
        ),
)

const mockFetchViewItems = jest.fn(() => ({ type: 'MOCK_FETCH_VIEW_ITEMS' }))
jest.mock('state/views/actions', () => ({
    fetchViewItems: (...args: Parameters<typeof mockFetchViewItems>) =>
        mockFetchViewItems(...args),
}))

jest.mock('pages/customers/list/CustomerListActions', () => () => (
    <div>CustomerListActions</div>
))

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultView = {
    name: 'All customers',
    count: 150,
    decoration: { emoji: '👤' },
}

const originalLocation = window.location

afterEach(() => {
    Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
    })
})

function renderComponent({
    viewState = defaultView,
    hasActiveView = true,
    route = '/app/customers/view/123',
    path = '/app/customers/view/:viewId',
    pathname,
}: {
    viewState?: Record<string, any>
    hasActiveView?: boolean
    route?: string
    path?: string
    pathname?: string
} = {}) {
    if (pathname) {
        Object.defineProperty(window, 'location', {
            value: { ...originalLocation, pathname },
            writable: true,
        })
    }

    const store = mockStore({
        customers: fromJS({ items: fromJS([]) }),
        views: fromJS({
            active: hasActiveView ? viewState : {},
        }),
    })

    return renderWithRouter(
        <Provider store={store}>
            <CustomerListContainer />
        </Provider>,
        { route, path },
    )
}

describe('<CustomerListContainer />', () => {
    it('should render the PageHeader with view name when not in search mode', () => {
        renderComponent()

        expect(screen.getByText('All customers')).toBeInTheDocument()
    })

    it('should render the emoji in the PageHeader', () => {
        renderComponent()

        expect(screen.getByText('👤')).toBeInTheDocument()
    })

    it('should render the "Add customer" button in the PageHeader', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /add customer/i }),
        ).toBeInTheDocument()
    })

    it('should hide the PageHeader in search mode', () => {
        renderComponent({
            route: '/app/customers/search/123',
            path: '/app/customers/search/:viewId',
            pathname: '/app/customers/search/123',
        })

        expect(screen.queryByText('All customers')).not.toBeInTheDocument()
    })

    it('should pass hideHeader=true to ViewTable when not in search mode', () => {
        renderComponent()

        expect(
            screen.getByText('ViewTable').closest('[data-hide-header]'),
        ).toHaveAttribute('data-hide-header', 'true')
    })

    it('should pass the "Add customer" button as viewButtons to ViewTable in search mode', () => {
        renderComponent({
            route: '/app/customers/search/123',
            path: '/app/customers/search/:viewId',
            pathname: '/app/customers/search/123',
        })

        expect(
            screen.getByRole('button', { name: /add customer/i }),
        ).toBeInTheDocument()
    })

    it('should open the customer form modal when clicking "Add customer"', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /add customer/i }))

        expect(screen.getByText('CustomerForm')).toBeInTheDocument()
    })

    it('should set the document title with count when view has items', () => {
        renderComponent()

        expect(document.title).toBe('(150) All customers')
    })

    it('should set the document title without count when count is 0', () => {
        renderComponent({
            viewState: { ...defaultView, count: 0 },
        })

        expect(document.title).toBe('All customers')
    })

    it('should set the document title to "Wrong view" when there is no active view', () => {
        renderComponent({ hasActiveView: false })

        expect(document.title).toBe('Wrong view')
    })

    it('should set the document title to "New view" on creation URL', () => {
        renderComponent({
            route: '/app/customers/new',
            path: '/app/customers/new',
            pathname: '/app/customers/new',
        })

        expect(document.title).toBe('New view')
    })

    it('should set the document title to "Search" in search mode', () => {
        renderComponent({
            route: '/app/customers/search/123',
            path: '/app/customers/search/:viewId',
            pathname: '/app/customers/search/123',
        })

        expect(document.title).toBe('Search')
    })

    it('should close the modal when the form calls closeModal', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /add customer/i }))
        expect(screen.getByText('CustomerForm')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: /close form/i }))

        await waitFor(() => {
            expect(screen.queryByText('CustomerForm')).not.toBeInTheDocument()
        })
    })

    it('should close the modal when the Modal onClose is triggered', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /add customer/i }))
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    it('should dispatch fetchViewItems when the form calls onSuccess', async () => {
        const user = userEvent.setup()
        renderComponent()

        await user.click(screen.getByRole('button', { name: /add customer/i }))

        await user.click(screen.getByRole('button', { name: /submit form/i }))

        expect(mockFetchViewItems).toHaveBeenCalled()
    })
})
