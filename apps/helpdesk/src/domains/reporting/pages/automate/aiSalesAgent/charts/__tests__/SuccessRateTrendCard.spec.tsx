import { screen } from '@testing-library/react'

import {
    AiSalesAgentChart,
    AiSalesAgentMetricConfig,
} from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import SuccessRateTrendCard from 'domains/reporting/pages/automate/aiSalesAgent/charts/SuccessRateTrendCard'
import { WarningBannerProvider } from 'domains/reporting/pages/automate/aiSalesAgent/components/WarningBannerProvider'
import { useSuccessRateTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend'
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
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useSuccessRateTrend',
)
const mockUseSuccessRateTrend = jest.mocked(useSuccessRateTrend)

describe('SuccessRateTrendCard', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    start_datetime: '2021-02-03T00:00:00.000Z',
                    end_datetime: '2021-02-05T23:59:59.999Z',
                },
            },
        },
        ui: {
            stats: { filters: uiStatsInitialState },
        },
    } as RootState

    beforeEach(() => {
        mockUseSuccessRateTrend.mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100, prevValue: 90 },
        })

        jest.useFakeTimers().setSystemTime(new Date('2021-02-10T00:00:00.000Z'))
    })

    it('should use trend hook when banner is not visible and start_datetime is more than 3 days ago', () => {
        renderWithStore(
            <WarningBannerProvider isBannerVisible={false}>
                <SuccessRateTrendCard
                    chartId={AiSalesAgentChart.AiSalesAgentSuccessRate}
                />
            </WarningBannerProvider>,
            defaultState,
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    100,
                    AiSalesAgentMetricConfig[
                        AiSalesAgentChart.AiSalesAgentSuccessRate
                    ].metricFormat,
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

    it('should use null trend hook when banner is visible and start_datetime is more than 3 days ago', () => {
        renderWithStore(
            <WarningBannerProvider isBannerVisible>
                <SuccessRateTrendCard
                    chartId={AiSalesAgentChart.AiSalesAgentSuccessRate}
                />
            </WarningBannerProvider>,
            defaultState,
        )

        expect(screen.getAllByText('0%')).toHaveLength(2)
    })

    it('should use null trend hook when banner is not visible but start_datetime is less than 3 days ago', () => {
        renderWithStore(
            <WarningBannerProvider isBannerVisible={false}>
                <SuccessRateTrendCard
                    chartId={AiSalesAgentChart.AiSalesAgentSuccessRate}
                />
            </WarningBannerProvider>,
            {
                ...defaultState,
                stats: {
                    filters: {
                        period: {
                            start_datetime: '2021-02-08T00:00:00.000Z',
                            end_datetime: '2021-02-09T23:59:59.999Z',
                        },
                    },
                },
            },
        )

        expect(screen.getAllByText('0%')).toHaveLength(2)
    })

    it('should call useTrend with updated date filters when end_datetime is less than 3 days ago', () => {
        renderWithStore(
            <WarningBannerProvider isBannerVisible={false}>
                <SuccessRateTrendCard
                    chartId={AiSalesAgentChart.AiSalesAgentSuccessRate}
                />
            </WarningBannerProvider>,
            {
                ...defaultState,
                stats: {
                    filters: {
                        period: {
                            start_datetime: '2021-02-06T00:00:00.000Z',
                            end_datetime: '2021-02-09T23:59:59.999Z',
                        },
                    },
                },
            },
        )

        expect(mockUseSuccessRateTrend).toHaveBeenCalledWith(
            {
                integrations: { operator: 'one-of', values: [] },
                period: {
                    end_datetime: '2021-02-07T23:59:59Z',
                    start_datetime: '2021-02-06T00:00:00.000Z',
                },
            },
            'UTC',
        )
    })
})
