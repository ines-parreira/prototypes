import {render} from '@testing-library/react'

import React from 'react'

import {AutomateTimeseries} from 'hooks/reporting/automate/types'
import {
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'hooks/reporting/automate/useAutomationDataset'
import {useNewAutomateFilters} from 'hooks/reporting/automate/useNewAutomateFilters'
import {ReportingGranularity} from 'models/reporting/types'
import {AutomatedInteractionsPerFeatureGraphChart} from 'pages/stats/automate/overview/charts/AutomatedInteractionsPerFeatureGraphChart'
import {LineChart} from 'pages/stats/common/components/charts/LineChart/LineChart'
import {assumeMock} from 'utils/testing'

jest.mock('pages/stats/common/components/charts/LineChart/LineChart')
const LineChartMock = assumeMock(LineChart)
jest.mock('hooks/reporting/automate/useAutomationDataset')
const useAutomateMetricsTrendMock = assumeMock(useAutomateMetricsTrend)
jest.mock('hooks/reporting/automate/useAutomationDataset')
const useAutomateMetricsTimeSeriesMock = assumeMock(
    useAutomateMetricsTimeSeries
)
jest.mock('hooks/reporting/automate/useNewAutomateFilters')
const useNewAutomateFiltersMock = assumeMock(useNewAutomateFilters)

describe('AutomatedInteractionsPerFeatureGraphChart', () => {
    const statsFilters = {
        period: {
            start_datetime: '2024-09-14T00:00:00+00:00',
            end_datetime: '2024-09-20T23:59:59+00:00',
        },
    }
    const userTimezone = 'UTC'
    const granularity = ReportingGranularity.Day
    const automateMetricsTimeSeries: AutomateTimeseries = {
        isFetching: false,
        isError: false,
        automationRateTimeSeries: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],
        automatedInteractionTimeSeries: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],

        automatedInteractionByEventTypesTimeSeries: [
            [
                {
                    dateTime: '2022-02-02T12:45:33.122',
                    value: 23,
                },
            ],
        ],
    }

    beforeEach(() => {
        useNewAutomateFiltersMock.mockReturnValue({
            statsFilters,
            userTimezone,
            granularity,
            isAnalyticsNewFiltersAutomate: true,
        })
        useAutomateMetricsTrendMock.mockReturnValue({
            automatedInteractionTrend: {
                isFetching: true,
                isError: false,
                data: undefined,
            },
        } as ReturnType<typeof useAutomateMetricsTrend>)
        useAutomateMetricsTimeSeriesMock.mockReturnValue(
            automateMetricsTimeSeries
        )
        LineChartMock.mockImplementation(() => <div />)
    })

    it('renders default y scale when no activity', () => {
        render(<AutomatedInteractionsPerFeatureGraphChart />)

        expect(LineChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                yAxisScale: {min: 0, max: 750},
            }),
            {}
        )
    })
})
