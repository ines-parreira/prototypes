import React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { useCreatedVsClosedTicketsTimeSeries } from 'domains/reporting/hooks/useCreatedVsClosedTicketsTimeSeries'
import BarChart from 'domains/reporting/pages/common/components/charts/BarChart/BarChart'
import { TicketsCreatedVsClosedChart } from 'domains/reporting/pages/support-performance/overview/charts/TicketsCreatedVsClosedChart'
import { CREATED_VS_CLOSED_TICKETS_LABEL } from 'domains/reporting/services/constants'

jest.mock('domains/reporting/hooks/useCreatedVsClosedTicketsTimeSeries')
const createdVsClosedTicketsTimeSeriesMock = assumeMock(
    useCreatedVsClosedTicketsTimeSeries,
)

jest.mock('domains/reporting/pages/common/components/charts/BarChart/BarChart')
const BarChartMock = assumeMock(BarChart as unknown as jest.Mock)

describe('<TicketsCreatedVsClosedChartCard />', () => {
    const isLoading = true
    const timeSeriesResponse = {
        timeSeries: [
            {
                label: 'MetricName',
                values: [{ x: '2022-12-11', y: 123 }],
                isDisabled: false,
            },
            {
                label: 'SecondMetricName',
                values: [{ x: '2022-12-11', y: 123 }],
                isDisabled: false,
            },
        ],
        isLoading,
    }

    beforeEach(() => {
        createdVsClosedTicketsTimeSeriesMock.mockReturnValue(timeSeriesResponse)
        BarChartMock.mockImplementation(() => null)
    })

    it('should use CreatedVsClosedTicketsTimeSeries hook data and render chart', () => {
        render(<TicketsCreatedVsClosedChart />)

        expect(
            screen.getByText(new RegExp(CREATED_VS_CLOSED_TICKETS_LABEL)),
        ).toBeInTheDocument()
        expect(BarChartMock).toHaveBeenCalledWith(
            {
                isLoading,
                data: timeSeriesResponse.timeSeries,
                hasBackground: true,
                _displayLegacyTooltip: true,
                displayLegend: true,
                legendOnLeft: true,
            },
            {},
        )
    })
})
