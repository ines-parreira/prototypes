import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import * as metricTrends from 'domains/reporting/hooks/metricTrends'
import { billingState } from 'fixtures/billing'
import * as useGetCostPerBillableTicket from 'pages/automate/common/hooks/useGetCostPerBillableTicket'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import ROICalculator from '../ROICalculator'

const middlewares = [thunk]
const mockStore = configureMockStore<RootState, StoreDispatch>(middlewares)

const queryClient = mockQueryClient()

describe('<ROICalculator />', () => {
    beforeEach(() => {
        jest.spyOn(
            useGetCostPerBillableTicket,
            'useGetCostPerBillableTicket',
        ).mockReturnValue(1)
    })

    it('should disable fields when trend data is available', () => {
        // Arrange
        jest.spyOn(
            metricTrends,
            'useMedianResolutionTimeTrend',
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
            'useMedianFirstResponseTimeTrend',
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

        render(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <ROICalculator />
                </QueryClientProvider>
            </Provider>,
        )

        // Act
        const metricsValueInput = screen.getByRole('textbox', {
            name: 'Metrics',
        })
        const salaryValueInput = screen.getByRole('textbox', {
            name: 'Salary',
        })
        const resolutionTimeInput = screen.getByRole('textbox', {
            name: 'Resolution time',
        })
        const firstResponseTimeInput = screen.getByRole('textbox', {
            name: 'First response time',
        })
        const ticketsClosedPerHourInput = screen.getByRole('textbox', {
            name: 'Tickets closed per hour',
        })
        const ticketHandleTimeInput = screen.getByRole('textbox', {
            name: 'Ticket handle time',
        })

        fireEvent.change(salaryValueInput, { target: { value: '20' } })

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
            'useMedianResolutionTimeTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: true,
        })

        jest.spyOn(
            metricTrends,
            'useMedianFirstResponseTimeTrend',
        ).mockReturnValue({
            isFetching: false,
            isError: true,
        })

        jest.spyOn(metricTrends, 'useClosedTicketsTrend').mockReturnValue({
            isFetching: false,
            isError: false,
        })

        render(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <ROICalculator />
                </QueryClientProvider>
            </Provider>,
        )

        // Act
        const metricsValueInput = screen.getByRole('textbox', {
            name: 'Metrics',
        })
        const salaryValueInput = screen.getByRole('textbox', {
            name: 'Salary',
        })
        const resolutionTimeInput = screen.getByRole('textbox', {
            name: 'Resolution time',
        })
        const firstResponseTimeInput = screen.getByRole('textbox', {
            name: 'First response time',
        })

        // Assert
        expect(metricsValueInput).not.toBeDisabled()
        expect(metricsValueInput).toHaveValue('0')

        expect(salaryValueInput).toHaveValue('15.5')

        expect(resolutionTimeInput).not.toBeDisabled()
        expect(resolutionTimeInput).toHaveValue('0hrs')

        expect(firstResponseTimeInput).not.toBeDisabled()
        expect(firstResponseTimeInput).toHaveValue('0hrs')

        // Act

        fireEvent.change(metricsValueInput, { target: { value: '2000' } })
        fireEvent.change(salaryValueInput, { target: { value: '14.88' } })

        fireEvent.change(resolutionTimeInput, { target: { value: '12' } })
        fireEvent.blur(resolutionTimeInput)

        fireEvent.change(firstResponseTimeInput, { target: { value: '12' } })
        fireEvent.blur(firstResponseTimeInput)

        // Assert
        expect(metricsValueInput).toHaveValue('2,000')
        expect(salaryValueInput).toHaveValue('14.88')
        expect(resolutionTimeInput).toHaveValue('12hrs')
        expect(firstResponseTimeInput).toHaveValue('12hrs')

        expect(screen.getByText('$6,076')).toBeInTheDocument()
        expect(screen.getByText('$7,952')).toBeInTheDocument()
    })

    it('should display zeros instead of Infinity or NaN', () => {
        // Arrange
        jest.spyOn(
            metricTrends,
            'useMedianResolutionTimeTrend',
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
            'useMedianFirstResponseTimeTrend',
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

        render(
            <Provider
                store={mockStore({
                    billing: fromJS(billingState),
                } as RootState)}
            >
                <QueryClientProvider client={queryClient}>
                    <ROICalculator />
                </QueryClientProvider>
            </Provider>,
        )

        // Act
        const ticketsClosedPerHourInput = screen.getByRole('textbox', {
            name: 'Tickets closed per hour',
        })

        fireEvent.change(ticketsClosedPerHourInput, { target: { value: '' } })

        // Assert
        expect(screen.getAllByText('$0')).toHaveLength(2)
        expect(screen.getByText('Save 0%')).toBeInTheDocument()
    })
})
