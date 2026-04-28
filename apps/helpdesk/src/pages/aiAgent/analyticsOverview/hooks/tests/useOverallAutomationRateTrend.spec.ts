import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchAutomationRateTrend,
    useAutomationRateTrend,
} from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import {
    fetchOverallAutomationRateTrend,
    useOverallAutomationRateTrend,
} from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomationRateTrend'

jest.mock('domains/reporting/utils/useGetNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/utils/getNewStatsFeatureFlagMigration')
jest.mock('domains/reporting/hooks/automate/useAutomationRateTrend')
jest.mock('domains/reporting/hooks/useStatsMetricTrend', () => ({
    __esModule: true,
    default: jest.fn(),
    fetchStatsMetricTrend: jest.fn(),
}))

const mockUseGetNewStatsFeatureFlagMigration = assumeMock(
    useGetNewStatsFeatureFlagMigration,
)
const mockGetNewStatsFeatureFlagMigration = assumeMock(
    getNewStatsFeatureFlagMigration,
)
const mockUseAutomationRateTrend = assumeMock(useAutomationRateTrend)
const mockFetchAutomationRateTrend = assumeMock(fetchAutomationRateTrend)
const mockUseStatsMetricTrend = assumeMock(useStatsMetricTrend)
const mockFetchStatsMetricTrend = assumeMock(fetchStatsMetricTrend)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2026-01-01T00:00:00.000',
        end_datetime: '2026-01-31T23:59:59.999',
    },
}
const timezone = 'UTC'

const v1Result = {
    data: { value: 0.5, prevValue: 0.4 },
    isFetching: false,
    isError: false,
}

const v2Result = {
    data: { value: 0.6, prevValue: 0.5 },
    isFetching: false,
    isError: false,
}

describe('useOverallAutomationRateTrend', () => {
    beforeEach(() => {
        mockUseAutomationRateTrend.mockReturnValue(v1Result)
        mockUseStatsMetricTrend.mockReturnValue(v2Result)
    })

    it('returns v1 result when stage is off', () => {
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'off',
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useOverallAutomationRateTrend(statsFilters, timezone),
        )

        expect(result.current).toEqual(v1Result)
        expect(mockUseAutomationRateTrend).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            true,
        )
    })

    it('returns v2 result when stage is live', () => {
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'live',
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useOverallAutomationRateTrend(statsFilters, timezone),
        )

        expect(result.current).toEqual(v2Result)
        expect(mockUseAutomationRateTrend).toHaveBeenCalledWith(
            statsFilters,
            timezone,
            false,
        )
    })

    it('returns v2 result when stage is complete', () => {
        mockUseGetNewStatsFeatureFlagMigration.mockReturnValue({
            stage: 'complete',
            isLoading: false,
        })

        const { result } = renderHook(() =>
            useOverallAutomationRateTrend(statsFilters, timezone),
        )

        expect(result.current).toEqual(v2Result)
    })
})

describe('fetchOverallAutomationRateTrend', () => {
    describe('when stage is off (v1 path)', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('off')
            mockFetchAutomationRateTrend.mockResolvedValue(v1Result)
        })

        it('calls fetchAutomationRateTrend and returns its result', async () => {
            const result = await fetchOverallAutomationRateTrend(
                statsFilters,
                timezone,
            )

            expect(mockFetchAutomationRateTrend).toHaveBeenCalledWith(
                statsFilters,
                timezone,
                undefined,
            )
            expect(result).toEqual(v1Result)
        })
    })

    describe('when stage is live (v2 path)', () => {
        beforeEach(() => {
            mockGetNewStatsFeatureFlagMigration.mockResolvedValue('live')
            mockFetchStatsMetricTrend.mockResolvedValue(v2Result)
        })

        it('calls fetchStatsMetricTrend and returns its result', async () => {
            const result = await fetchOverallAutomationRateTrend(
                statsFilters,
                timezone,
            )

            expect(mockFetchStatsMetricTrend).toHaveBeenCalled()
            expect(result).toEqual(v2Result)
        })
    })
})
