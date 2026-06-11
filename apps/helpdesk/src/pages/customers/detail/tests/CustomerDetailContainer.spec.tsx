import type { ComponentProps } from 'react'

import { useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { cleanup } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { customer } from 'fixtures/customer'
import type { RootState, StoreDispatch } from 'state/types'
import { DefaultExportTimeline as Timeline } from 'timeline/Timeline'

import { CustomerDetailContainer } from '../CustomerDetailContainer'

jest.mock('@repo/feature-flags')
jest.mock('timeline/Timeline', () => ({
    DefaultExportTimeline: jest.fn(() => <div>Timeline</div>),
}))
jest.mock('pages/customers/common/components/CustomerForm', () => ({
    DefaultExportCustomerForm: () => <div>CustomerForm</div>,
}))
jest.mock('pages/common/utils/DatetimeLabel', () => ({
    DatetimeLabel: ({ dateTime }: { dateTime: string }) => (
        <div>{dateTime}</div>
    ),
}))

const mockSetRecentItem = jest.fn()
jest.mock('hooks/useRecentItems/useRecentItems', () => ({
    useRecentItems: () => ({
        setRecentItem: mockSetRecentItem,
    }),
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
        const { container } = render(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={fromJS(mockActiveCustomer)}
                />
            </Provider>,
            { path: '/foo/:customerId?', initialEntries: ['/foo/1'] },
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch the customer', () => {
        render(
            <Provider store={store}>
                <CustomerDetailContainer {...minProps} />
            </Provider>,
            { path: '/foo/:customerId?', initialEntries: ['/foo/1'] },
        )

        expect(minProps.fetchCustomer).toHaveBeenCalledWith('1')

        cleanup()

        render(
            <Provider store={store}>
                <CustomerDetailContainer {...minProps} />
            </Provider>,
            { path: '/foo/:customerId?', initialEntries: ['/foo/2'] },
        )
        expect(minProps.fetchCustomer).toHaveBeenLastCalledWith('2')
    })

    it('should display an unknown state when no active customer is provided', () => {
        const { getByText } = render(
            <Provider store={store}>
                <CustomerDetailContainer {...minProps} />
            </Provider>,
            { path: '/foo/:customerId?', initialEntries: ['/foo/1'] },
        )
        expect(getByText(/Unknown customer/i)).toBeTruthy()
    })

    it('should display a loader when active customer is being loaded', () => {
        const { getByText } = render(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    customersLoading={Map({
                        active: true,
                    })}
                />
            </Provider>,
            { path: '/foo/:customerId?', initialEntries: ['/foo/1'] },
        )

        expect(getByText(/Loading customer/i)).toBeTruthy()
    })

    it('should call setRecentItems on mount', () => {
        render(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={fromJS(mockActiveCustomer)}
                />
            </Provider>,
            { path: '/foo/:customerId?', initialEntries: ['/foo/1'] },
        )

        expect(mockSetRecentItem).toHaveBeenCalledWith(mockActiveCustomer)
    })

    it('should call `Timeline` component', () => {
        render(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={fromJS(mockActiveCustomer)}
                />
            </Provider>,
            { path: '/foo/:customerId?', initialEntries: ['/foo/1'] },
        )

        expect(Timeline).toHaveBeenCalled()
    })
})
