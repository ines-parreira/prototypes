import React from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {fromJS} from 'immutable'

import {fireEvent, render} from '@testing-library/react'

import {billingState} from 'fixtures/billing'

import {RootState, StoreDispatch} from 'state/types'

import * as metricTrends from 'hooks/reporting/metricTrends'
import * as useGetCostPerBillableTicket from 'pages/automate/common/hooks/useGetCostPerBillableTicket'

import ROICalculator from '../ROICalculator'

const middlewares = [thunk]
const mockStore = configureMockStore<RootState, StoreDispatch>(middlewares)

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

        const {getByTestId} = render(
            <Provider
                store={mockStore({billing: fromJS(billingState)} as RootState)}
            >
                <ROICalculator />
            </Provider>
        )

        // Act
        const metricsValueInput = getByTestId('metrics-value-input')
        const salaryValueInput = getByTestId('salary-value-input')
        const resolutionTimeInput = getByTestId('resolution-time-input')
        const firstResponseTimeInput = getByTestId('first-response-time-input')

        fireEvent.change(salaryValueInput, {target: {value: '20'}})

        // Assert
        expect(metricsValueInput).toBeDisabled()
        expect(metricsValueInput).toHaveValue(closedTickets.toString())

        expect(salaryValueInput).toHaveValue('20')

        expect(resolutionTimeInput).toBeDisabled()
        expect(resolutionTimeInput).toHaveValue('1hrs')

        expect(firstResponseTimeInput).toBeDisabled()
        expect(firstResponseTimeInput).toHaveValue('1hrs')
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
                <ROICalculator />
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

        expect(salaryValueInput).toHaveValue('31,248')

        expect(resolutionTimeInput).not.toBeDisabled()
        expect(resolutionTimeInput).toHaveValue('0hrs')

        expect(firstResponseTimeInput).not.toBeDisabled()
        expect(firstResponseTimeInput).toHaveValue('0hrs')

        // Act

        fireEvent.change(metricsValueInput, {target: {value: '2000'}})
        fireEvent.change(salaryValueInput, {target: {value: '30000'}})

        fireEvent.change(resolutionTimeInput, {target: {value: '12'}})
        fireEvent.blur(resolutionTimeInput)

        fireEvent.change(firstResponseTimeInput, {target: {value: '12'}})
        fireEvent.blur(firstResponseTimeInput)

        // Assert
        expect(metricsValueInput).toHaveValue('2,000')
        expect(salaryValueInput).toHaveValue('30,000')
        expect(resolutionTimeInput).toHaveValue('12hrs')
        expect(firstResponseTimeInput).toHaveValue('12hrs')

        const costWithAutomate = getByTestId('cost-with-automate')
        const costWithoutAutomate = getByTestId('cost-without-automate')

        expect(costWithAutomate).toHaveTextContent('$6,077')
        expect(costWithoutAutomate).toHaveTextContent('$7,952')
    })
})
