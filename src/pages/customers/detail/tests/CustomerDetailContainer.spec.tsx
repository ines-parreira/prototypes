import React, { ComponentProps } from 'react'

import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createBrowserHistory } from 'history'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useFlag from 'core/flags/hooks/useFlag'
import { customer } from 'fixtures/customer'
import { ticket } from 'fixtures/ticket'
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
                    customerHistory={fromJS({
                        hasHistory: true,
                        triedLoading: true,
                        tickets: fromJS([ticket]),
                    })}
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

    it('should fetch history of customer', async () => {
        const activeCustomer = fromJS({
            id: 1,
        }) as Map<any, any>
        renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={activeCustomer}
                />
            </Provider>,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            },
        )

        await waitFor(() =>
            expect(minProps.fetchCustomerHistory).toHaveBeenCalledWith(
                activeCustomer.get('id'),
                expect.objectContaining({
                    successCondition: expect.any(Function),
                }),
            ),
        )
    })

    it('should open modal to update customer', () => {
        const activeCustomer = fromJS({
            id: 1,
        })
        const { getByText } = renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={activeCustomer}
                />
            </Provider>,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            },
        )

        userEvent.click(getByText(/Edit customer/))
        expect(getByText(/Update customer: /i)).toBeTruthy()
    })

    it('should display loader when history of customer is loading', () => {
        const { getByText } = renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={fromJS({ id: 1 })}
                    customersLoading={Map({
                        history: true,
                    })}
                />
            </Provider>,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            },
        )

        expect(getByText(/Loading history/i)).toBeTruthy()
    })

    it('should display message when no history is present', () => {
        const { getByText } = renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={fromJS(mockActiveCustomer)}
                    customerHistory={fromJS({
                        hasHistory: true,
                        triedLoading: true,
                        tickets: fromJS([]),
                    })}
                />
            </Provider>,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            },
        )

        expect(
            getByText(/This customer has no activity recorded/i),
        ).toBeTruthy()
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

    it('should call `Timeline` component when feature flag is enabled', () => {
        useFlagMock.mockReturnValue(true)
        renderWithRouter(
            <Provider store={store}>
                <CustomerDetailContainer
                    {...minProps}
                    activeCustomer={fromJS(mockActiveCustomer)}
                    customerHistory={fromJS({
                        hasHistory: true,
                        triedLoading: true,
                        tickets: fromJS([ticket]),
                    })}
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
