import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAiAgentSupportInteractionsTrend,
    useAiAgentSupportInteractionsTrend,
} from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicSupportAgentAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchAiAgentSupportAgentAutomatedInteractionsTrend,
    useAiAgentSupportAgentAutomatedInteractionsTrend,
} from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentAutomatedInteractionsTrend'

jest.mock('domains/reporting/hooks/automate/useAutomateFilters')
jest.mock('domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend')
jest.mock('domains/reporting/hooks/useStatsMetricTrend')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')

const mockUseAutomateFilters = assumeMock(useAutomateFilters)
const mockUseAiAgentSupportInteractionsTrend = assumeMock(
    useAiAgentSupportInteractionsTrend,
)
const mockFetchAiAgentSupportInteractionsTrend = assumeMock(
    fetchAiAgentSupportInteractionsTrend,
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

describe('useAiAgentSupportAgentAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockUseAutomateFilters.mockReturnValue({
            statsFilters,
            userTimezone,
            granularity: ReportingGranularity.Day,
        })
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('off')
        mockUseAiAgentSupportInteractionsTrend.mockReturnValue(mockV1Trend)
        mockUseStatsMetricTrend.mockReturnValue(mockV2Trend)
    })

    const renderHookUnderTest = () =>
        renderHook(() => useAiAgentSupportAgentAutomatedInteractionsTrend())

    it('should call useGetNewStatsFeatureFlagMigration with the correct metric name', () => {
        renderHookUnderTest()

        expect(mockUseGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS,
        )
    })

    describe('when feature flag is off', () => {
        it('should call useAiAgentSupportInteractionsTrend with enabled=true', () => {
            renderHookUnderTest()

            expect(mockUseAiAgentSupportInteractionsTrend).toHaveBeenCalledWith(
                statsFilters,
                userTimezone,
                true,
            )
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
            mockUseAiAgentSupportInteractionsTrend.mockReturnValue({
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
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('live')
        })

        it('should call useAiAgentSupportInteractionsTrend with enabled=false', () => {
            renderHookUnderTest()

            expect(mockUseAiAgentSupportInteractionsTrend).toHaveBeenCalledWith(
                statsFilters,
                userTimezone,
                false,
            )
        })

        it('should call useStatsMetricTrend with current and previous period queries', () => {
            renderHookUnderTest()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                    filters: statsFilters,
                    timezone: userTimezone,
                }),
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
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
            mockUseGetNewStatsFeatureFlagMigration.mockReturnValue('complete')
        })

        it('should call useStatsMetricTrend with enabled=true', () => {
            renderHookUnderTest()

            expect(mockUseStatsMetricTrend).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                true,
            )
        })

        it('should call useAiAgentSupportInteractionsTrend with enabled=false', () => {
            renderHookUnderTest()

            expect(mockUseAiAgentSupportInteractionsTrend).toHaveBeenCalledWith(
                statsFilters,
                userTimezone,
                false,
            )
        })
    })
})

describe('fetchAiAgentSupportAgentAutomatedInteractionsTrend', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
        mockFetchAiAgentSupportInteractionsTrend.mockResolvedValue(mockV1Trend)
        mockFetchStatsMetricTrend.mockResolvedValue(mockV2Trend)
    })

    it('should call getNewStatsFeatureFlagMigration with the correct metric name', async () => {
        await fetchAiAgentSupportAgentAutomatedInteractionsTrend(
            statsFilters,
            userTimezone,
        )

        expect(mockGetNewStatsFeatureFlagMigration).toHaveBeenCalledWith(
            METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS,
        )
    })

    describe('when feature flag is off', () => {
        it('should call fetchAiAgentSupportInteractionsTrend and not fetchStatsMetricTrend', async () => {
            await fetchAiAgentSupportAgentAutomatedInteractionsTrend(
                statsFilters,
                userTimezone,
            )

            expect(
                mockFetchAiAgentSupportInteractionsTrend,
            ).toHaveBeenCalledWith(statsFilters, userTimezone)
            expect(mockFetchStatsMetricTrend).not.toHaveBeenCalled()
        })
    })

    describe('when feature flag is live', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('live')
        })

        it('should call fetchStatsMetricTrend and not fetchAiAgentSupportInteractionsTrend', async () => {
            await fetchAiAgentSupportAgentAutomatedInteractionsTrend(
                statsFilters,
                userTimezone,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchAiAgentSupportInteractionsTrend,
            ).not.toHaveBeenCalled()
        })

        it('should call fetchStatsMetricTrend with current and previous period queries', async () => {
            await fetchAiAgentSupportAgentAutomatedInteractionsTrend(
                statsFilters,
                userTimezone,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalledWith(
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                    filters: statsFilters,
                    timezone: userTimezone,
                }),
                dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
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

        it('should call fetchStatsMetricTrend and not fetchAiAgentSupportInteractionsTrend', async () => {
            await fetchAiAgentSupportAgentAutomatedInteractionsTrend(
                statsFilters,
                userTimezone,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(
                mockFetchAiAgentSupportInteractionsTrend,
            ).not.toHaveBeenCalled()
        })
    })
})
