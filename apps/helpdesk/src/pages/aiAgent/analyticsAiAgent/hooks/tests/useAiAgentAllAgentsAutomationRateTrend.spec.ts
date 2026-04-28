import { renderHook } from '@testing-library/react'

import {
    fetchAIAgentAutomationRateTrend,
    useAIAgentAutomationRateTrend,
} from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchAiAgentAllAgentsAutomationRateTrend,
    useAiAgentAllAgentsAutomationRateTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAutomationRateTrend'

jest.mock('domains/reporting/hooks/automate/useAIAgentAutomationRateTrend')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')

const mockFilters: StatsFilters = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}

const mockTimezone = 'America/New_York'

const mockV1Trend = {
    data: { value: 0.4, prevValue: 0.3 },
    isFetching: false,
    isError: false,
}

const mockV2Trend = {
    data: { value: 0.5, prevValue: 0.4 },
    isFetching: false,
    isError: false,
}

describe('useAiAgentAllAgentsAutomationRateTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.mocked(useGetNewStatsFeatureFlagMigration).mockReturnValue({
            stage: 'off',
            isLoading: false,
        })
        jest.mocked(useAIAgentAutomationRateTrend).mockReturnValue(mockV1Trend)
        jest.mocked(useStatsMetricTrend).mockReturnValue(mockV2Trend)
    })

    it('calls useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
        renderHook(() =>
            useAiAgentAllAgentsAutomationRateTrend(mockFilters, mockTimezone),
        )

        expect(useGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATION_RATE,
        )
    })

    describe('when flag is off', () => {
        it('calls useAIAgentAutomationRateTrend with enabled=true and useStatsMetricTrend with enabled=false', () => {
            renderHook(() =>
                useAiAgentAllAgentsAutomationRateTrend(
                    mockFilters,
                    mockTimezone,
                ),
            )

            expect(useAIAgentAutomationRateTrend).toHaveBeenCalledWith(
                mockFilters,
                mockTimezone,
                true,
            )
            expect(useStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
        })

        it('returns v1 trend result', () => {
            const { result } = renderHook(() =>
                useAiAgentAllAgentsAutomationRateTrend(
                    mockFilters,
                    mockTimezone,
                ),
            )

            expect(result.current).toEqual(mockV1Trend)
        })
    })

    describe('when flag is live', () => {
        beforeEach(() => {
            jest.mocked(useGetNewStatsFeatureFlagMigration).mockReturnValue({
                stage: 'live',
                isLoading: false,
            })
        })

        it('calls useStatsMetricTrend with enabled=true and useAIAgentAutomationRateTrend with enabled=false', () => {
            renderHook(() =>
                useAiAgentAllAgentsAutomationRateTrend(
                    mockFilters,
                    mockTimezone,
                ),
            )

            expect(useStatsMetricTrend).toHaveBeenCalledWith(
                dynamicAllAgentsAutomationRateQueryFactoryV2({
                    filters: mockFilters,
                    timezone: mockTimezone,
                }),
                dynamicAllAgentsAutomationRateQueryFactoryV2({
                    filters: {
                        ...mockFilters,
                        period: getPreviousPeriod(mockFilters.period),
                    },
                    timezone: mockTimezone,
                }),
                true,
            )
            expect(useAIAgentAutomationRateTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(String),
                false,
            )
        })

        it('returns v2 trend result', () => {
            const { result } = renderHook(() =>
                useAiAgentAllAgentsAutomationRateTrend(
                    mockFilters,
                    mockTimezone,
                ),
            )

            expect(result.current).toEqual(mockV2Trend)
        })
    })

    describe('when flag is complete', () => {
        beforeEach(() => {
            jest.mocked(useGetNewStatsFeatureFlagMigration).mockReturnValue({
                stage: 'complete',
                isLoading: false,
            })
        })

        it('calls useStatsMetricTrend with enabled=true', () => {
            renderHook(() =>
                useAiAgentAllAgentsAutomationRateTrend(
                    mockFilters,
                    mockTimezone,
                ),
            )

            expect(useStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                true,
            )
        })
    })
})

describe('fetchAiAgentAllAgentsAutomationRateTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.mocked(getNewStatsFeatureFlagMigration).mockResolvedValue('off')
        jest.mocked(fetchAIAgentAutomationRateTrend).mockResolvedValue(
            mockV1Trend,
        )
    })

    it('calls fetchAIAgentAutomationRateTrend when flag is off', async () => {
        await fetchAiAgentAllAgentsAutomationRateTrend(
            mockFilters,
            mockTimezone,
            12345,
        )

        expect(fetchAIAgentAutomationRateTrend).toHaveBeenCalledWith(
            mockFilters,
            mockTimezone,
            12345,
        )
        expect(fetchStatsMetricTrend).not.toHaveBeenCalled()
    })

    it('calls fetchStatsMetricTrend with correct queries when flag is live', async () => {
        jest.mocked(getNewStatsFeatureFlagMigration).mockResolvedValue('live')
        jest.mocked(fetchStatsMetricTrend).mockResolvedValue(mockV2Trend)

        await fetchAiAgentAllAgentsAutomationRateTrend(
            mockFilters,
            mockTimezone,
            12345,
        )

        expect(fetchStatsMetricTrend).toHaveBeenCalledWith(
            dynamicAllAgentsAutomationRateQueryFactoryV2({
                filters: mockFilters,
                timezone: mockTimezone,
            }),
            dynamicAllAgentsAutomationRateQueryFactoryV2({
                filters: {
                    ...mockFilters,
                    period: getPreviousPeriod(mockFilters.period),
                },
                timezone: mockTimezone,
            }),
        )
        expect(fetchAIAgentAutomationRateTrend).not.toHaveBeenCalled()
    })

    it('calls fetchStatsMetricTrend when flag is complete', async () => {
        jest.mocked(getNewStatsFeatureFlagMigration).mockResolvedValue(
            'complete',
        )
        jest.mocked(fetchStatsMetricTrend).mockResolvedValue(mockV2Trend)

        await fetchAiAgentAllAgentsAutomationRateTrend(
            mockFilters,
            mockTimezone,
            undefined,
        )

        expect(fetchStatsMetricTrend).toHaveBeenCalled()
        expect(fetchAIAgentAutomationRateTrend).not.toHaveBeenCalled()
    })
})
