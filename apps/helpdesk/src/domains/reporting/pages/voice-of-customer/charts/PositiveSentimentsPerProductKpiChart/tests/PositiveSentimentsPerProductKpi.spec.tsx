import { render, screen } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { usePositiveSentimentsPerProductMetricTrend } from 'domains/reporting/hooks/voice-of-customer/useSentimentPerProduct'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { DrillDownModalTrigger } from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger'
import { PositiveSentimentsPerProductKpi } from 'domains/reporting/pages/voice-of-customer/charts/PositiveSentimentsPerProductKpiChart/PositiveSentimentsPerProductKpi'
import { getDrillDownMetricData } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import { assumeMock } from 'utils/testing'

jest.mock('domains/reporting/hooks/voice-of-customer/useSentimentPerProduct')
const usePositiveSentimentsPerProductMetricTrendMock = assumeMock(
    usePositiveSentimentsPerProductMetricTrend,
)

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock('domains/reporting/pages/common/drill-down/DrillDownModalTrigger')
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
