import React, {ComponentProps} from 'react'
import {waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS, Map} from 'immutable'
import {createBrowserHistory} from 'history'

import {renderWithRouter} from '../../../../utils/testing'
import {ticket} from '../../../../fixtures/ticket'
import * as labels from '../../../common/utils/labels'
import {CustomerDetailContainer} from '../CustomerDetailContainer'

jest.mock('../../common/components/CustomerForm', () => () => (
    <div>CustomerForm</div>
))

type MockLabels = typeof labels

jest.mock(
    '../../../common/utils/labels',
    () =>
        ({
            ...jest.requireActual('../../../common/utils/labels'),
            DatetimeLabel: ({
                dateTime,
            }: ComponentProps<MockLabels['DatetimeLabel']>) => {
                return <div>{dateTime}</div>
            },
        } as MockLabels)
)

describe('<CustomerDetailContainer />', () => {
    const minProps = ({
        activeCustomer: fromJS({}),
        customerHistory: fromJS({}),
        customersIsLoading: jest.fn(),
        fetchCustomer: jest.fn().mockResolvedValue({resp: {id: 1}}),
        fetchCustomerHistory: jest.fn(),
    } as unknown) as ComponentProps<typeof CustomerDetailContainer>

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should display the customer and its history of messages', () => {
        const {container} = renderWithRouter(
            <CustomerDetailContainer
                {...minProps}
                activeCustomer={fromJS({
                    id: 1,
                    name: 'Rachel Greene',
                })}
                customerHistory={fromJS({
                    hasHistory: true,
                    triedLoading: true,
                    tickets: fromJS([ticket]),
                })}
            />,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            }
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should fetch the customer', () => {
        const history = createBrowserHistory()
        history.push('/foo/1')

        const {rerender} = renderWithRouter(
            <CustomerDetailContainer {...minProps} />,
            {history, path: '/foo/:customerId?'}
        )

        expect(minProps.fetchCustomer).toHaveBeenCalledWith('1')
        history.push('/foo/2')
        rerender(<CustomerDetailContainer {...minProps} />)
        expect(minProps.fetchCustomer).toHaveBeenLastCalledWith('2')
    })

    it('should display an unknown state when no active customer is provided', () => {
        const {getByText} = renderWithRouter(
            <CustomerDetailContainer {...minProps} />,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            }
        )
        expect(getByText(/Unknown customer/i)).toBeTruthy()
    })

    it('should display a loader when active customer is being loaded', () => {
        const customersIsLoading = (type: string) => type === 'active'

        const {getByText} = renderWithRouter(
            <CustomerDetailContainer
                {...minProps}
                customersIsLoading={customersIsLoading}
            />,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            }
        )

        expect(getByText(/Loading customer/i)).toBeTruthy()
    })

    it('should fetch history of customer', async () => {
        const activeCustomer = fromJS({
            id: 1,
        }) as Map<any, any>
        renderWithRouter(
            <CustomerDetailContainer
                {...minProps}
                activeCustomer={activeCustomer}
            />,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            }
        )

        await waitFor(() =>
            expect(minProps.fetchCustomerHistory).toHaveBeenCalledWith(
                activeCustomer.get('id'),
                expect.objectContaining({
                    successCondition: expect.any(Function),
                })
            )
        )
    })

    it('should open modal to update customer', () => {
        const activeCustomer = fromJS({
            id: 1,
        })
        const {getByText} = renderWithRouter(
            <CustomerDetailContainer
                {...minProps}
                activeCustomer={activeCustomer}
            />,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            }
        )

        userEvent.click(getByText(/Edit customer/))
        expect(getByText(/Update customer: /i)).toBeTruthy()
    })

    it('should display loader when history of customer is loading', () => {
        const customersIsLoading = (type: string) => type === 'history'

        const {getByText} = renderWithRouter(
            <CustomerDetailContainer
                {...minProps}
                activeCustomer={fromJS({id: 1})}
                customersIsLoading={customersIsLoading}
            />,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            }
        )

        expect(getByText(/Loading history/i)).toBeTruthy()
    })

    it('should display message when no history is present', () => {
        const {getByText} = renderWithRouter(
            <CustomerDetailContainer
                {...minProps}
                activeCustomer={fromJS({
                    id: 1,
                    name: 'Rachel Greene',
                })}
                customerHistory={fromJS({
                    hasHistory: true,
                    triedLoading: true,
                    tickets: fromJS([]),
                })}
            />,
            {
                path: '/foo/:customerId?',
                route: '/foo/1',
            }
        )

        expect(
            getByText(/This customer has no activity recorded/i)
        ).toBeTruthy()
    })
})
