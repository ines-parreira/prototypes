import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAIAgentAutomatedInteractionsTrend,
    useAIAgentAutomatedInteractionsTrend,
} from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchAiAgentAllAgentsAutomatedInteractionsTrend,
    useAiAgentAllAgentsAutomatedInteractionsTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAutomatedInteractionsTrend'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters')
jest.mock(
    'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend',
)
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')

const mockUseAiAgentStatsFilters = assumeMock(useAiAgentStatsFilters)
const mockUseAIAgentAutomatedInteractionsTrend = assumeMock(
    useAIAgentAutomatedInteractionsTrend,
)
const mockFetchAIAgentAutomatedInteractionsTrend = assumeMock(
    fetchAIAgentAutomatedInteractionsTrend,
)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)
const mockGetNewStatsFeatureFlagMigration = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2021-05-29T00:00:00.000',
        end_datetime: '2021-06-04T23:59:59.000',
    },
}
const userTimezone = 'UTC'

const mockV1Trend = {
    data: { value: 10, prevValue: 8 },
    isFetching: false,
    isError: false,
}

const mockV2Trend = {
    data: { value: 12, prevValue: 9 },
    isFetching: false,
    isError: false,
}

describe('useAiAgentAllAgentsAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'off',
            isLoading: false,
        })
        mockUseAIAgentAutomatedInteractionsTrend.mockReturnValue(mockV1Trend)
        mockUseStatsMetricTrend.mockReturnValue(mockV2Trend)
    })

    const renderHookUnderTest = () =>
        renderHook(() => useAiAgentAllAgentsAutomatedInteractionsTrend())

    it('should call useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
        renderHookUnderTest()

        expect(mockUseGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS,
        )
    })

    describe('when feature flag is off', () => {
        it('should call useAIAgentAutomatedInteractionsTrend with enabled=true', () => {
            renderHookUnderTest()

            expect(
                mockUseAIAgentAutomatedInteractionsTrend,
            ).toHaveBeenCalledWith(statsFilters, userTimezone, true)
        })

        it('should call useStatsMetricTrend with enabled=false', () => {
            renderHookUnderTest()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                false,
            )
        })

        it('should return v1 trend data with label', () => {
            const { result } = renderHookUnderTest()

            expect(result.current).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    label: 'Automated interactions',
                    value: 10,
                    prevValue: 8,
                },
            })
        })

        it('should return null values on empty data', () => {
            mockUseAIAgentAutomatedInteractionsTrend.mockReturnValue({
                data: { value: null, prevValue: null },
                isFetching: false,
                isError: false,
            })

            const { result } = renderHookUnderTest()

            expect(result.current.data).toEqual({
                label: 'Automated interactions',
                value: null,
                prevValue: null,
            })
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
                stage: 'live',
                isLoading: false,
            })
        })

        it('should call useAIAgentAutomatedInteractionsTrend with enabled=false', () => {
            renderHookUnderTest()

            expect(
                mockUseAIAgentAutomatedInteractionsTrend,
            ).toHaveBeenCalledWith(statsFilters, userTimezone, false)
        })

        it('should call useStatsMetricTrend with current and previous period queries', () => {
            renderHookUnderTest()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                    filters: statsFilters,
                    timezone: userTimezone,
                }),
                dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone: userTimezone,
                }),
                true,
            )
        })

        it('should return v2 trend data with label', () => {
            const { result } = renderHookUnderTest()

            expect(result.current).toEqual({
                isFetching: false,
                isError: false,
                data: {
                    label: 'Automated interactions',
                    value: 12,
                    prevValue: 9,
                },
            })
        })

        it('should return null values when v2 data is undefined', () => {
            mockUseStatsMetricTrend.mockReturnValue({
                data: undefined,
                isFetching: false,
                isError: false,
            })

            const { result } = renderHookUnderTest()

            expect(result.current.data).toEqual({
                label: 'Automated interactions',
                value: null,
                prevValue: null,
            })
        })
    })

    describe('when feature flag is complete', () => {
        beforeEach(() => {
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
                stage: 'complete',
                isLoading: false,
            })
        })

        it('should call useStatsMetricTrend with enabled=true', () => {
            renderHookUnderTest()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                true,
            )
        })

        it('should call useAIAgentAutomatedInteractionsTrend with enabled=false', () => {
            renderHookUnderTest()

            expect(
                mockUseAIAgentAutomatedInteractionsTrend,
            ).toHaveBeenCalledWith(statsFilters, userTimezone, false)
        })
    })
})

describe('fetchAiAgentAllAgentsAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
        mockFetchAIAgentAutomatedInteractionsTrend.mockResolvedValue(
            mockV1Trend,
        )
        mockFetchStatsMetricTrend.mockResolvedValue(mockV2Trend)
    })

    it('should call getNewStatsFeatureFlagMigration with the correct metric name', async () => {
        await fetchAiAgentAllAgentsAutomatedInteractionsTrend(
            statsFilters,
            userTimezone,
        )

        expect(mockGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS,
        )
    })

    describe('when feature flag is off', () => {
        it('should call fetchAIAgentAutomatedInteractionsTrend and not fetchStatsMetricTrend', async () => {
            await fetchAiAgentAllAgentsAutomatedInteractionsTrend(
                statsFilters,
                userTimezone,
            )

            expect(
                mockFetchAIAgentAutomatedInteractionsTrend,
            ).toHaveBeenCalledWith(statsFilters, userTimezone)
            expect(mockFetchStatsMetricTrend).not.toHaveBeenCalled()
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('live')
        })

        it('should call fetchStatsMetricTrend and not fetchAIAgentAutomatedInteractionsTrend', async () => {
            await fetchAiAgentAllAgentsAutomatedInteractionsTrend(
                statsFilters,
                userTimezone,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchAIAgentAutomatedInteractionsTrend,
            ).not.toHaveBeenCalled()
        })

        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            await fetchAiAgentAllAgentsAutomatedInteractionsTrend(
                statsFilters,
                userTimezone,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                    filters: statsFilters,
                    timezone: userTimezone,
                }),
                dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                    filters: {
                        ...statsFilters,
                        period: getPreviousPeriod(statsFilters.period),
                    },
                    timezone: userTimezone,
                }),
            )
        })
    })

    describe('when feature flag is complete', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('complete')
        })

        it('should call fetchStatsMetricTrend and not fetchAIAgentAutomatedInteractionsTrend', async () => {
            await fetchAiAgentAllAgentsAutomatedInteractionsTrend(
                statsFilters,
                userTimezone,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchAIAgentAutomatedInteractionsTrend,
            ).not.toHaveBeenCalled()
        })
    })
})
