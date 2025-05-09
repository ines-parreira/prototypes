import { ComponentProps } from 'react'

import { createBrowserHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useFlag from 'core/flags/hooks/useFlag'
import { customer } from 'fixtures/customer'
import Timeline from 'pages/common/components/timeline/Timeline'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock, renderWithRouter } from 'utils/testing'

import { CustomerDetailContainer } from '../CustomerDetailContainer'

jest.mock('core/flags/hooks/useFlag')
jest.mock('pages/common/components/timeline/Timeline', () =>
    jest.fn(() => <div>Timeline</div>),
)
jest.mock('pages/customers/common/components/CustomerForm', () => () => (
    <div>CustomerForm</div>
))
jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({ dateTime }: { dateTime: string }) => <div>{dateTime}</div>,
)

const mockSetRecentItem = jest.fn()
jest.mock('hooks/useRecentItems/useRecentItems', () => () => ({
    setRecentItem: mockSetRecentItem,
}))

const useFlagMock = assumeMock(useFlag)

describe('<CustomerDetailContainer />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    let store: ReturnType<typeof mockStore>
    const minProps = {
        activeCustomer: fromJS({}),
        customerHistory: fromJS({}),
        customersLoading: Map({}),
        fetchCustomer: jest.fn().mockResolvedValue({ resp: { id: 1 } }),
        fetchCustomerHistory: jest.fn(),
    } as unknown as ComponentProps<typeof CustomerDetailContainer>
    const defaultStore = {
        customers: fromJS({
            active: customer,
        }),
    }

    const mockActiveCustomer = {
        id: 1,
        name: 'Rachel Greene',
    }

    beforeEach(() => {
        store = mockStore(defaultStore)
        useFlagMock.mockReturnValue(false)
    })

    it('should display the customer and its history of messages', () => {
        const { container } = renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={fromJS(mockActiveCustomer)}
                />
            </Provider>,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            },
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch the customer', () => {
        const history = createBrowserHistory()
        history.push('/foo/1')

        const { rerender } = renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer {...minProps} />
            </Provider>,
            { history, path: '/foo/:customerId?' },
        )

        expect(minProps.fetchCustomer).toHaveBeenCalledWith('1')
        history.push('/foo/2')
        rerender(
            <Provider store={store}>
                <CustomerDetailContainer {...minProps} />
            </Provider>,
        )
        expect(minProps.fetchCustomer).toHaveBeenLastCalledWith('2')
    })

    it('should display an unknown state when no active customer is provided', () => {
        const { getByText } = renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer {...minProps} />
            </Provider>,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            },
        )
        expect(getByText(/Unknown customer/i)).toBeTruthy()
    })

    it('should display a loader when active customer is being loaded', () => {
        const { getByText } = renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    customersLoading={Map({
                        active: true,
                    })}
                />
            </Provider>,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            },
        )

        expect(getByText(/Loading customer/i)).toBeTruthy()
    })

    it('should call setRecentItems on mount', () => {
        renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={fromJS(mockActiveCustomer)}
                />
            </Provider>,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            },
        )

        expect(mockSetRecentItem).toHaveBeenCalledWith(mockActiveCustomer)
    })

    it('should call `Timeline` component', () => {
        renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={fromJS(mockActiveCustomer)}
                />
            </Provider>,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            },
        )

        expect(Timeline).toHaveBeenCalled()
    })
})
