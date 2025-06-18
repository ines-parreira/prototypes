import { screen } from '@testing-library/react'

import { useGmvInfluencedTrend } from 'pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { TREND_BADGE_FORMAT } from 'pages/stats/common/components/TrendBadge'
import { formatMetricTrend, formatMetricValue } from 'pages/stats/common/utils'
import { RootState } from 'state/types'
import { initialState as uiStatsInitialState } from 'state/ui/stats/filtersSlice'
import { renderWithStore } from 'utils/testing'

import {
    AiSalesAgentChart,
    AiSalesAgentMetricConfig,
} from '../../AiSalesAgentMetricsConfig'
import { WarningBannerProvider } from '../../components/WarningBannerProvider'
import AiSalesAgentTrendCard from '../AiSalesAgentTrendCard'

jest.mock('hooks/reporting/dashboards/useDashboardActions', () => ({
    useDashboardActions: jest.fn().mockReturnValue({}),
}))

jest.mock('pages/stats/automate/aiSalesAgent/metrics/useGmvInfluencedTrend')
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
            data: { value: 100, prevValue: 90 },
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
