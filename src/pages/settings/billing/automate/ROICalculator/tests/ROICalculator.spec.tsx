import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'

import {fromJS} from 'immutable'

import {fireEvent, render} from '@testing-library/react'

import {billingState} from 'fixtures/billing'

import {RootState, StoreDispatch} from 'state/types'

import * as metricTrends from 'hooks/reporting/metricTrends'
import * as useGetCostPerBillableTicket from 'pages/automate/common/hooks/useGetCostPerBillableTicket'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import ROICalculator from '../ROICalculator'

const middlewares = [thunk]
const mockStore = configureMockStore<RootState, StoreDispatch>(middlewares)

const queryClient = mockQueryClient()

describe('<ROICalculator />', () => {
    beforeEach(() => {
        jest.spyOn(
            useGetCostPerBillableTicket,
            'useGetCostPerBillableTicket'
        ).mockReturnValue(1)
    })

    it('should disable fields when trend data is available', () => {
        // Arrange
        jest.spyOn(
            metricTrends,
            'useMedianResolutionTimeTrend'
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 3600,
                prevValue: 3600,
            },
        })

        jest.spyOn(
            metricTrends,
            'useMedianFirstResponseTimeTrend'
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 3600,
                prevValue: 3600,
            },
        })

        const closedTickets = 100

        jest.spyOn(metricTrends, 'useClosedTicketsTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: closedTickets,
                prevValue: closedTickets,
            },
        })

        jest.spyOn(metricTrends, 'useTicketHandleTimeTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 120,
                prevValue: 120,
            },
        })

        const {getByTestId} = render(
            <Provider
                store={mockStore({billing: fromJS(billingState)} as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <ROICalculator />
                </QueryClientProvider>
            </Provider>
        )

        // Act
        const metricsValueInput = getByTestId('metrics-value-input')
        const salaryValueInput = getByTestId('salary-value-input')
        const resolutionTimeInput = getByTestId('resolution-time-input')
        const firstResponseTimeInput = getByTestId('first-response-time-input')
        const ticketsClosedPerHourInput = getByTestId(
            'tickets-closed-per-hour-input'
        )
        const ticketHandleTimeInput = getByTestId('ticket-handle-time-input')

        fireEvent.change(salaryValueInput, {target: {value: '20'}})

        // Assert
        expect(metricsValueInput).toBeDisabled()
        expect(metricsValueInput).toHaveValue(closedTickets.toString())

        expect(salaryValueInput).toHaveValue('20')

        expect(resolutionTimeInput).toBeDisabled()
        expect(resolutionTimeInput).toHaveValue('1hrs')

        expect(firstResponseTimeInput).toBeDisabled()
        expect(firstResponseTimeInput).toHaveValue('1hrs')

        expect(ticketsClosedPerHourInput).toHaveValue('5')

        expect(ticketHandleTimeInput).toBeDisabled()
        expect(ticketHandleTimeInput).toHaveValue('2m')
    })

    it('should enable fields when trend data is not available', () => {
        // Arrange
        jest.spyOn(
            metricTrends,
            'useMedianResolutionTimeTrend'
        ).mockReturnValue({
            isFetching: false,
            isError: true,
        })

        jest.spyOn(
            metricTrends,
            'useMedianFirstResponseTimeTrend'
        ).mockReturnValue({
            isFetching: false,
            isError: true,
        })

        jest.spyOn(metricTrends, 'useClosedTicketsTrend').mockReturnValue({
            isFetching: false,
            isError: false,
        })

        const {getByTestId} = render(
            <Provider
                store={mockStore({billing: fromJS(billingState)} as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <ROICalculator />
                </QueryClientProvider>
            </Provider>
        )

        // Act
        const metricsValueInput = getByTestId('metrics-value-input')
        const salaryValueInput = getByTestId('salary-value-input')
        const resolutionTimeInput = getByTestId('resolution-time-input')
        const firstResponseTimeInput = getByTestId('first-response-time-input')

        // Assert
        expect(metricsValueInput).not.toBeDisabled()
        expect(metricsValueInput).toHaveValue('0')

        expect(salaryValueInput).toHaveValue('15.5')

        expect(resolutionTimeInput).not.toBeDisabled()
        expect(resolutionTimeInput).toHaveValue('0hrs')

        expect(firstResponseTimeInput).not.toBeDisabled()
        expect(firstResponseTimeInput).toHaveValue('0hrs')

        // Act

        fireEvent.change(metricsValueInput, {target: {value: '2000'}})
        fireEvent.change(salaryValueInput, {target: {value: '14.88'}})

        fireEvent.change(resolutionTimeInput, {target: {value: '12'}})
        fireEvent.blur(resolutionTimeInput)

        fireEvent.change(firstResponseTimeInput, {target: {value: '12'}})
        fireEvent.blur(firstResponseTimeInput)

        // Assert
        expect(metricsValueInput).toHaveValue('2,000')
        expect(salaryValueInput).toHaveValue('14.88')
        expect(resolutionTimeInput).toHaveValue('12hrs')
        expect(firstResponseTimeInput).toHaveValue('12hrs')

        const costWithAutomate = getByTestId('cost-with-automate')
        const costWithoutAutomate = getByTestId('cost-without-automate')

        expect(costWithAutomate).toHaveTextContent('$6,076')
        expect(costWithoutAutomate).toHaveTextContent('$7,952')
    })

    it('should display zeros instead of Infinity or NaN', () => {
        // Arrange
        jest.spyOn(
            metricTrends,
            'useMedianResolutionTimeTrend'
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 3600,
                prevValue: 3600,
            },
        })

        jest.spyOn(
            metricTrends,
            'useMedianFirstResponseTimeTrend'
        ).mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 3600,
                prevValue: 3600,
            },
        })

        const closedTickets = 100

        jest.spyOn(metricTrends, 'useClosedTicketsTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: closedTickets,
                prevValue: closedTickets,
            },
        })

        jest.spyOn(metricTrends, 'useTicketHandleTimeTrend').mockReturnValue({
            isFetching: false,
            isError: false,
            data: {
                value: 120,
                prevValue: 120,
            },
        })

        const {getByTestId} = render(
            <Provider
                store={mockStore({billing: fromJS(billingState)} as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <ROICalculator />
                </QueryClientProvider>
            </Provider>
        )

        // Act
        const ticketsClosedPerHourInput = getByTestId(
            'tickets-closed-per-hour-input'
        )

        fireEvent.change(ticketsClosedPerHourInput, {target: {value: ''}})

        // Assert
        const costWithAutomate = getByTestId('cost-with-automate')
        const costWithoutAutomate = getByTestId('cost-without-automate')
        const savedInPercentage = getByTestId('saved-in-percentage')

        expect(costWithAutomate).toHaveTextContent('0')
        expect(costWithoutAutomate).toHaveTextContent('0')
        expect(savedInPercentage).toHaveTextContent('0%')
    })
})
