import {render, screen} from '@testing-library/react'
import React from 'react'
import LineChart from 'pages/stats/LineChart'
import {
    TicketsCreatedVsClosedChartCard,
    TITLE,
} from 'pages/stats/support-performance/components/TicketsCreatedVsClosedChartCard'
import {useCreatedVsClosedTicketsTimeSeries} from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useCreatedVsClosedTicketsTimeSeries')
const createdVsClosedTicketsTimeSeriesMock = assumeMock(
    useCreatedVsClosedTicketsTimeSeries
)

jest.mock('pages/stats/LineChart')
const LineChartMock = assumeMock(LineChart as unknown as jest.Mock)

describe('<TicketsCreatedVsClosedChartCard />', () => {
    const isLoading = true
    const timeSeriesResponse = {
        timeSeries: [
            {
                label: 'MetricName',
                values: [{x: '2022-12-11', y: 123}],
            },
            {
                label: 'SecondMetricName',
                values: [{x: '2022-12-11', y: 123}],
            },
        ],
        isLoading,
    }

    beforeEach(() => {
        createdVsClosedTicketsTimeSeriesMock.mockReturnValue(timeSeriesResponse)
        LineChartMock.mockImplementation(() => null)
    })

    it('should use CreatedVsClosedTicketsTimeSeries hook data and render chart', () => {
        render(<TicketsCreatedVsClosedChartCard />)

        expect(screen.getByText(new RegExp(TITLE))).toBeInTheDocument()
        expect(LineChartMock).toHaveBeenCalledWith(
            {
                isLoading,
                data: timeSeriesResponse.timeSeries,
                hasBackground: true,
                _displayLegacyTooltip: true,
            },
            {}
        )
    })
})
