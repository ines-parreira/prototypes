import {render, screen} from '@testing-library/react'
import React from 'react'

import {useCreatedVsClosedTicketsTimeSeries} from 'hooks/reporting/useCreatedVsClosedTicketsTimeSeries'
import BarChart from 'pages/stats/common/components/charts/BarChart/BarChart'
import {TicketsCreatedVsClosedChart} from 'pages/stats/support-performance/overview/charts/TicketsCreatedVsClosedChart'
import {CREATED_VS_CLOSED_TICKETS_LABEL} from 'services/reporting/constants'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useCreatedVsClosedTicketsTimeSeries')
const createdVsClosedTicketsTimeSeriesMock = assumeMock(
    useCreatedVsClosedTicketsTimeSeries
)

jest.mock('pages/stats/common/components/charts/BarChart/BarChart')
const BarChartMock = assumeMock(BarChart as unknown as jest.Mock)

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
        BarChartMock.mockImplementation(() => null)
    })

    it('should use CreatedVsClosedTicketsTimeSeries hook data and render chart', () => {
        render(<TicketsCreatedVsClosedChart />)

        expect(
            screen.getByText(new RegExp(CREATED_VS_CLOSED_TICKETS_LABEL))
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
            {}
        )
    })
})
