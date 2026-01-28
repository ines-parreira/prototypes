import { formatMetricTrend, formatMetricValue } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TREND_BADGE_FORMAT } from 'domains/reporting/pages/common/components/TrendBadge'
import { VoiceCallSlaAchievementRateChart } from 'domains/reporting/pages/voice/charts/VoiceCallSlaAchievementRateChart'
import { useVoiceCallSlaAchievementRateTrend } from 'domains/reporting/pages/voice/hooks/useVoiceCallSlaAchievementRateTrend'
import { VoiceMetricsConfig } from 'domains/reporting/pages/voice/VoiceConfigs/VoiceMetricsConfig'
import { initialState as uiStatsInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { VoiceMetric } from 'domains/reporting/state/ui/stats/types'
import type { RootState } from 'state/types'

jest.mock(
    'domains/reporting/pages/voice/hooks/useVoiceCallSlaAchievementRateTrend',
)
const useVoiceCallSlaAchievementRateTrendMock = assumeMock(
    useVoiceCallSlaAchievementRateTrend,
)

const mockStore = configureMockStore([thunk])

describe('VoiceCallSlaAchievementRateChart', () => {
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
    const value = 5
    const prevValue = 10

    beforeEach(() => {
        useVoiceCallSlaAchievementRateTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value,
                prevValue,
            },
        })
    })

    it('should render Voice Call SLA Achievement Rate Trend', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <VoiceCallSlaAchievementRateChart />
            </Provider>,
        )

        expect(
            screen.getByText(
                formatMetricValue(
                    value,
                    VoiceMetricsConfig[VoiceMetric.VoiceCallsAchievementRate]
                        .metricFormat,
                ),
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                String(
                    formatMetricTrend(value, prevValue, TREND_BADGE_FORMAT)
                        .formattedTrend,
                ),
            ),
        ).toBeInTheDocument()
    })
})
