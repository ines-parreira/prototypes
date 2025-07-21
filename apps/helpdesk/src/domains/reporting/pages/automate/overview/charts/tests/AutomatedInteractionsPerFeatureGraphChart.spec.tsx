import React from 'react'

import { render } from '@testing-library/react'

import { AutomateTimeseries } from 'domains/reporting/hooks/automate/types'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import {
    useAutomateMetricsTimeSeries,
    useAutomateMetricsTrend,
} from 'domains/reporting/hooks/automate/useAutomationDataset'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { AutomatedInteractionsPerFeatureGraphChart } from 'domains/reporting/pages/automate/overview/charts/AutomatedInteractionsPerFeatureGraphChart'
import { LineChart } from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { assumeMock } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/common/components/charts/LineChart/LineChart',
)
const LineChartMock = assumeMock(LineChart)
jest.mock('domains/reporting/hooks/automate/useAutomationDataset')
const useAutomateMetricsTrendMock = assumeMock(useAutomateMetricsTrend)
jest.mock('domains/reporting/hooks/automate/useAutomationDataset')
const useAutomateMetricsTimeSeriesMock = assumeMock(
    useAutomateMetricsTimeSeries,
)
jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
const useNewAutomateFiltersMock = assumeMock(useAutomateFilters)

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
        })
        useAutomateMetricsTrendMock.mockReturnValue({
            automatedInteractionTrend: {
                isFetching: true,
                isError: false,
                data: undefined,
            },
        } as ReturnType<typeof useAutomateMetricsTrend>)
        useAutomateMetricsTimeSeriesMock.mockReturnValue(
            automateMetricsTimeSeries,
        )
        LineChartMock.mockImplementation(() => <div />)
    })

    it('renders default y scale when no activity', () => {
        render(<AutomatedInteractionsPerFeatureGraphChart />)

        expect(LineChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                yAxisScale: { min: 0, max: 750 },
            }),
            {},
        )
    })
})
