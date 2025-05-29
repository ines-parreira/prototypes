import { render, screen } from '@testing-library/react'

import { useStatsFilters } from 'hooks/reporting/support-performance/useStatsFilters'
import { usePositiveSentimentsPerProductMetricTrend } from 'hooks/reporting/voice-of-customer/useSentimentPerProduct'
import { ReportingGranularity } from 'models/reporting/types'
import { PositiveSentimentsPerProductKpi } from 'pages/stats/voice-of-customer/side-panel/PositiveSentimentsPerProductKpi'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/voice-of-customer/useSentimentPerProduct')
const usePositiveSentimentsPerProductMetricTrendMock = assumeMock(
    usePositiveSentimentsPerProductMetricTrend,
)

jest.mock('hooks/reporting/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

describe('PositiveSentimentsPerProductKpi', () => {
    const productId = 'productId'
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
    })

    it('should not render the Kpi when loading', () => {
        usePositiveSentimentsPerProductMetricTrendMock.mockReturnValue({
            isFetching: true,
            isError: false,
            data: undefined,
        })

        render(
            <PositiveSentimentsPerProductKpi
                productId={productId}
                sentimentCustomFieldId={sentimentCustomFieldId}
            />,
        )

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
                productId={productId}
                sentimentCustomFieldId={sentimentCustomFieldId}
            />,
        )

        expect(screen.getByText(positiveSentiments)).toBeInTheDocument()
    })
})
