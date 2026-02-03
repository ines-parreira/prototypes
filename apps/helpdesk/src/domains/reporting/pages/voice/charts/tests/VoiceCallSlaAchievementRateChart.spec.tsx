import { formatMetricTrend, formatMetricValue } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useAchievedExposuresVoiceCallsTrend } from 'domains/reporting/hooks/voice/useVoiceCallsTrends'
import {
    PERCENTAGE_LABEL,
    TOTAL_COUNT_LABEL,
} from 'domains/reporting/pages/common/components/Table/TableValueModeSwitch'
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
jest.mock('domains/reporting/hooks/voice/useVoiceCallsTrends')

const useVoiceCallSlaAchievementRateTrendMock = assumeMock(
    useVoiceCallSlaAchievementRateTrend,
)
const useAchievedExposuresVoiceCallsTrendMock = assumeMock(
    useAchievedExposuresVoiceCallsTrend,
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
    const percentageValue = 85
    const percentagePrevValue = 80
    const countValue = 150
    const countPrevValue = 120

    beforeEach(() => {
        useVoiceCallSlaAchievementRateTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value: percentageValue,
                prevValue: percentagePrevValue,
            },
        })

        useAchievedExposuresVoiceCallsTrendMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: {
                value: countValue,
                prevValue: countPrevValue,
            },
        })
    })

    describe('Percentage mode', () => {
        it('should render Voice Call SLA Achievement Rate in percentage mode by default', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <VoiceCallSlaAchievementRateChart />
                </Provider>,
            )

            expect(
                screen.getByText(
                    formatMetricValue(
                        percentageValue,
                        VoiceMetricsConfig[
                            VoiceMetric.VoiceCallsAchievementRate
                        ].metricFormat,
                    ),
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    String(
                        formatMetricTrend(
                            percentageValue,
                            percentagePrevValue,
                            TREND_BADGE_FORMAT,
                        ).formattedTrend,
                    ),
                ),
            ).toBeInTheDocument()
        })

        it('should display percentage toggle button in active state', () => {
            render(
                <Provider store={mockStore(defaultState)}>
                    <VoiceCallSlaAchievementRateChart />
                </Provider>,
            )

            const percentageButton = screen.getByText(PERCENTAGE_LABEL)
            expect(percentageButton.parentElement).toHaveAttribute(
                'aria-checked',
                'true',
            )
        })
    })

    describe('Count mode', () => {
        it('should switch to count mode when clicking the count toggle', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore(defaultState)}>
                    <VoiceCallSlaAchievementRateChart />
                </Provider>,
            )

            const countButton = screen.getByText(TOTAL_COUNT_LABEL)
            await user.click(countButton)

            expect(
                screen.getByText(formatMetricValue(countValue, 'decimal')),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    String(
                        formatMetricTrend(
                            countValue,
                            countPrevValue,
                            TREND_BADGE_FORMAT,
                        ).formattedTrend,
                    ),
                ),
            ).toBeInTheDocument()
        })

        it('should display count toggle button in active state after switching', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore(defaultState)}>
                    <VoiceCallSlaAchievementRateChart />
                </Provider>,
            )

            const countButton = screen.getByText(TOTAL_COUNT_LABEL)
            await user.click(countButton)

            expect(countButton.parentElement).toHaveAttribute(
                'aria-checked',
                'true',
            )
        })
    })

    describe('Toggle behavior', () => {
        it('should switch back to percentage mode when clicking percentage toggle', async () => {
            const user = userEvent.setup()
            render(
                <Provider store={mockStore(defaultState)}>
                    <VoiceCallSlaAchievementRateChart />
                </Provider>,
            )

            await user.click(screen.getByText(TOTAL_COUNT_LABEL))

            expect(
                screen.getByText(formatMetricValue(countValue, 'decimal')),
            ).toBeInTheDocument()

            await user.click(screen.getByText(PERCENTAGE_LABEL))

            expect(
                screen.getByText(
                    formatMetricValue(
                        percentageValue,
                        VoiceMetricsConfig[
                            VoiceMetric.VoiceCallsAchievementRate
                        ].metricFormat,
                    ),
                ),
            ).toBeInTheDocument()
        })
    })
})
