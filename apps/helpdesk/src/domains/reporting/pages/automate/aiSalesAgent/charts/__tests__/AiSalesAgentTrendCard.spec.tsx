import { screen } from '@testing-library/react'

import {
    AiSalesAgentChart,
    AiSalesAgentMetricConfig,
} from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import AiSalesAgentTrendCard from 'domains/reporting/pages/automate/aiSalesAgent/charts/AiSalesAgentTrendCard'
import { WarningBannerProvider } from 'domains/reporting/pages/automate/aiSalesAgent/components/WarningBannerProvider'
import { useGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { TREND_BADGE_FORMAT } from 'domains/reporting/pages/common/components/TrendBadge'
import {
    formatMetricTrend,
    formatMetricValue,
} from 'domains/reporting/pages/common/utils'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/dashboards/useDashboardActions', () => ({
    useDashboardActions: jest.fn().mockReturnValue({}),
}))

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend',
)
const mockUseGmvInfluencedTrend = jest.mocked(useGmvInfluencedTrend)

describe('AiSalesAgentTrendCard', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-03T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    it('should use trend hook when banner is not visible', () => {
        mockUseGmvInfluencedTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100, prevValue: 90, currency: 'USD' },
        })

        renderWithStore(
            <WarningBannerProvider isBannerVisible={false}>
                <AiSalesAgentTrendCard
                    chartId={AiSalesAgentChart.AiSalesAgentGmv}
                />
            </WarningBannerProvider>,
            defaultState,
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    100,
                    AiSalesAgentMetricConfig[AiSalesAgentChart.AiSalesAgentGmv]
                        .metricFormat,
                ),
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                String(
                    formatMetricTrend(100, 90, TREND_BADGE_FORMAT)
                        .formattedTrend,
                ),
            ),
        ).toBeInTheDocument()
    })

    it('should use null trend hook when banner is visible', () => {
        renderWithStore(
            <WarningBannerProvider isBannerVisible>
                <AiSalesAgentTrendCard
                    chartId={AiSalesAgentChart.AiSalesAgentGmv}
                />
            </WarningBannerProvider>,
            defaultState,
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    0,
                    AiSalesAgentMetricConfig[AiSalesAgentChart.AiSalesAgentGmv]
                        .metricFormat,
                ),
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                String(
                    formatMetricTrend(0, 0, TREND_BADGE_FORMAT).formattedTrend,
                ),
            ),
        ).toBeInTheDocument()
    })
})
