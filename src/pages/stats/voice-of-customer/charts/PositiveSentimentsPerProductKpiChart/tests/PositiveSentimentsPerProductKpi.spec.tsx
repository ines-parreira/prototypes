import { render, screen } from '@testing-library/react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { usePositiveSentimentsPerProductMetricTrend } from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { ReportingGranularity } from 'models/reporting/types'
import { DrillDownModalTrigger } from 'pages/stats/common/drill-down/DrillDownModalTrigger'
import { PositiveSentimentsPerProductKpi } from 'pages/stats/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpi'
import { getDrillDownMetricData } from 'pages/stats/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { ProductInsightsTableColumns } from 'state/ui/stats/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/voice-of-customer/useSentimentPerProduct')
const usePositiveSentimentsPerProductMetricTrendMock = assumeMock(
    usePositiveSentimentsPerProductMetricTrend,
)

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('pages/stats/common/drill-down/DrillDownModalTrigger')
const DrillDownModalTriggerMock = assumeMock(DrillDownModalTrigger)

describe('PositiveSentimentsPerProductKpi', () => {
    const product = { id: 'productId', name: 'productName' }
    const sentimentCustomFieldId = 123
    const positiveSentiments = 45

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-09-14T00:00:00+00:00',
                    end_datetime: '2024-09-20T23:59:59+00:00',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })

        DrillDownModalTriggerMock.mockImplementation(({ children }) => (
            <div>{children}</div>
        ))
    })

    it('should not render the Kpi when loading', () => {
        usePositiveSentimentsPerProductMetricTrendMock.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        render(
            <PositiveSentimentsPerProductKpi
                product={product}
                sentimentCustomFieldId={sentimentCustomFieldId}
            />,
        )

        expect(DrillDownModalTriggerMock).not.toHaveBeenCalled()
        expect(screen.queryByText(positiveSentiments)).not.toBeInTheDocument()
    })

    it('should render the Kpi when sentiment custom field is available', () => {
        usePositiveSentimentsPerProductMetricTrendMock.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: positiveSentiments, prevValue: 55 },
        })

        render(
            <PositiveSentimentsPerProductKpi
                product={product}
                sentimentCustomFieldId={sentimentCustomFieldId}
            />,
        )

        expect(DrillDownModalTriggerMock).toHaveBeenCalledWith(
            {
                children: '45',
                enabled: true,
                highlighted: true,
                metricData: getDrillDownMetricData(
                    ProductInsightsTableColumns.PositiveSentiment,
                    product,
                    sentimentCustomFieldId,
                ),
            },
            {},
        )
        expect(screen.getByText(positiveSentiments)).toBeInTheDocument()
    })
})
