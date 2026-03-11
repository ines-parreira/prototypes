import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { useAIIntentsTimeSeries } from 'domains/reporting/hooks/voice-of-customer/useAIIntentsTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import ChartCard from 'domains/reporting/pages/common/components/ChartCard'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatLabeledTimeSeriesData } from 'domains/reporting/pages/common/utils'
import { LINES_COLORS } from 'domains/reporting/pages/constants'
import { TopAIIntentsOverTimeChart } from 'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsOverTimeChart/TopAIIntentsOverTimeChart'
import {
    ProductInsightsChart,
    ProductInsightsChartConfig,
} from 'domains/reporting/pages/voice-of-customer/product-insights/ProductInsightsChartConfig'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

jest.mock('domains/reporting/hooks/voice-of-customer/useAIIntentsTimeSeries')
const useIntentsOverTimeTimeSeriesMock = assumeMock(useAIIntentsTimeSeries)
jest.mock(
    'domains/reporting/pages/common/components/charts/LineChart/LineChart',
)
const LineChartMock = assumeMock(LineChart)
jest.mock('domains/reporting/pages/common/components/ChartCard')
const ChartCardMock = assumeMock(ChartCard)
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

describe('TopAIIntentsOverTimeChart', () => {
    const intentCustomFieldId = 123
    const { hint, title } =
        ProductInsightsChartConfig[
            ProductInsightsChart.TopAIIntentsOverTimeChart
        ]

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

    const useTopAIIntentsOverTimeReturnValue: ReturnType<
        typeof useAIIntentsTimeSeries
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

    beforeEach(() => {
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: 123,
            intentCustomFieldId: intentCustomFieldId,
            outcomeCustomFieldId: 789,
            isLoading: false,
        })
        useIntentsOverTimeTimeSeriesMock.mockReturnValue(
            useTopAIIntentsOverTimeReturnValue,
        )

        LineChartMock.mockImplementation(() => <div>LineChart</div>)
        ChartCardMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
    })

    it('should render the chart', () => {
        render(<TopAIIntentsOverTimeChart />)

        expect(LineChartMock).toHaveBeenCalledWith(
            {
                customColors: LINES_COLORS,
                data: formatLabeledTimeSeriesData(
                    data,
                    useTopAIIntentsOverTimeReturnValue.legendInfo.tooltips,
                    useTopAIIntentsOverTimeReturnValue.granularity,
                ),
                defaultDatasetVisibility:
                    useTopAIIntentsOverTimeReturnValue.legendDatasetVisibility,
                displayLegend: true,
                isLoading: false,
                legendOnLeft: true,
                options: {
                    scales: {
                        y: {
                            ticks: {
                                precision: 0,
                            },
                        },
                    },
                },
                skeletonHeight: 328,
                toggleLegend: true,
            },
            {},
        )
    })

    it('should render title & tooltip', () => {
        render(<TopAIIntentsOverTimeChart />)

        expect(ChartCardMock).toHaveBeenCalledWith(
            expect.objectContaining({
                title: title,
                hint: hint,
            }),
            {},
        )
    })

    it('should render loading state', () => {
        useIntentsOverTimeTimeSeriesMock.mockReturnValue({
            ...useTopAIIntentsOverTimeReturnValue,
            isFetching: true,
        })

        render(<TopAIIntentsOverTimeChart />)

        expect(LineChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })
})
