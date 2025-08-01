import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import {
    useAIIntentsForProductTimeSeries,
    useAIIntentsTimeSeries,
} from 'domains/reporting/hooks/voice-of-customer/useAIIntentsTimeSeries'
import { ReportingGranularity } from 'domains/reporting/models/types'
import LineChart from 'domains/reporting/pages/common/components/charts/LineChart/LineChart'
import { formatLabeledTimeSeriesData } from 'domains/reporting/pages/common/utils'
import { LINES_COLORS } from 'domains/reporting/pages/constants'
import { TopAIIntentsForProductOverTimeGraph } from 'domains/reporting/pages/voice-of-customer/charts/TopAIIntentsForProductOverTimeChart/TopAIIntentsForProductOverTimeGraph'

jest.mock('domains/reporting/hooks/voice-of-customer/useAIIntentsTimeSeries')
const useAIIntentsForProductTimeSeriesMock = assumeMock(
    useAIIntentsForProductTimeSeries,
)
jest.mock(
    'domains/reporting/pages/common/components/charts/LineChart/LineChart',
)
const LineChartMock = assumeMock(LineChart)

describe('TopAIIntentsForProductOverTimeGraph', () => {
    const productId = 'some-product-id'
    const intentCustomFieldId = 123

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

    useAIIntentsForProductTimeSeriesMock.mockReturnValue(
        useTopAIIntentsOverTimeReturnValue,
    )

    LineChartMock.mockImplementation(() => <div>LineChart</div>)

    it('should render the chart', () => {
        render(
            <TopAIIntentsForProductOverTimeGraph
                productId={productId}
                intentCustomFieldId={intentCustomFieldId}
            />,
        )

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

    it('should render loading state', () => {
        useAIIntentsForProductTimeSeriesMock.mockReturnValue({
            ...useTopAIIntentsOverTimeReturnValue,
            isFetching: true,
        })

        render(
            <TopAIIntentsForProductOverTimeGraph
                productId={productId}
                intentCustomFieldId={intentCustomFieldId}
            />,
        )

        expect(LineChartMock).toHaveBeenCalledWith(
            expect.objectContaining({
                isLoading: true,
            }),
            {},
        )
    })
})
