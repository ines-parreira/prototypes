import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useTicketsFieldTimeSeries } from 'domains/reporting/hooks/ticket-insights/useTicketsFieldTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { TicketInsightsFieldTrend } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldTrend'
import useAppSelector from 'hooks/useAppSelector'

jest.mock(
    '@gorgias/axiom',
    () =>
        ({
            ...jest.requireActual('@gorgias/axiom'),

            Skeleton: () => <div data-testid="skeleton" />,
        }) as typeof import('@gorgias/axiom'),
)

jest.mock('domains/reporting/hooks/ticket-insights/useTicketsFieldTimeSeries')
const useTicketsFieldTrendMock = assumeMock(useTicketsFieldTimeSeries)
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('<TicketInsightsFieldTrend>', () => {
    const data = [
        [
            { dateTime: '2023-02-27T00:00:00.000', value: 6 },
            { dateTime: '2023-03-06T00:00:00.000', value: 21 },
        ],
        [
            { dateTime: '2023-03-24T00:00:00.000', value: 10 },
            { dateTime: '2023-04-05T00:00:00.000', value: 5 },
        ],
    ]

    const useTicketsFieldTrendReturnValue: ReturnType<
        typeof useTicketsFieldTimeSeries
    > = {
        data: data,
        granularity: ReportingGranularity.Month,
        isFetching: false,
        legendDatasetVisibility: { 0: true },
        legendInfo: {
            labels: ['Level1', 'Level2'],
            tooltips: ['Level1 > Level2'],
        },
    }

    useTicketsFieldTrendMock.mockReturnValue(useTicketsFieldTrendReturnValue)
    useAppSelectorMock.mockReturnValue({ id: 2 })

    it('should render the chart', () => {
        render(<TicketInsightsFieldTrend />)

        expect(screen.getByRole('img')).toBeInTheDocument()
    })

    it('should render legend items', () => {
        render(<TicketInsightsFieldTrend />)

        expect(screen.queryAllByRole('checkbox')).toHaveLength(data.length)
    })

    it('should render skeleton on loading', () => {
        useTicketsFieldTrendMock.mockReturnValue({
            ...useTicketsFieldTrendReturnValue,
            isFetching: true,
        })

        render(<TicketInsightsFieldTrend />)

        expect(screen.getAllByTestId('skeleton')).toHaveLength(1)
    })

    it('should render with legend visibility', () => {
        useTicketsFieldTrendMock.mockReturnValue({
            ...useTicketsFieldTrendReturnValue,
            legendDatasetVisibility: { 0: false },
        })

        render(<TicketInsightsFieldTrend />)

        expect(screen.queryAllByRole('checkbox')[0]).not.toBeChecked()
    })
})
