import React from 'react'

import { renderHook } from '@repo/testing'
import { Provider } from 'react-redux'

import { useAccuracyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useAccuracyPerAgent'
import { useAccuracyTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useAccuracyTrend'
import { useAutoQAMetrics } from 'domains/reporting/hooks/support-performance/auto-qa/useAutoQAMetrics'
import { useBrandVoicePerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useBrandVoicePerAgent'
import { useBrandVoiceTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useBrandVoiceTrend'
import { useCommunicationSkillsPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import { useCommunicationSkillsTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useCommunicationSkillsTrend'
import { useEfficiencyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyPerAgent'
import { useEfficiencyTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyTrend'
import { useInternalCompliancePerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useInternalCompliancePerAgent'
import { useInternalComplianceTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useInternalComplianceTrend'
import { useLanguageProficiencyPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyPerAgent'
import { useLanguageProficiencyTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyTrend'
import { useResolutionCompletenessPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import { useResolutionCompletenessTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessTrend'
import { useReviewedClosedTicketsPerAgent } from 'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import { useReviewedClosedTicketsTrend } from 'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { MetricWithDecile } from 'domains/reporting/hooks/useMetricPerDimension'
import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { initialState } from 'domains/reporting/state/stats/statsSlice'
import { getSortedAutoQAAgents } from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import { agents } from 'fixtures/agents'
import { assumeMock, mockStore } from 'utils/testing'

jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useCommunicationSkillsPerAgent',
)
const useCommunicationSkillsPerAgentMock = assumeMock(
    useCommunicationSkillsPerAgent,
)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useCommunicationSkillsTrend',
)
const useCommunicationSkillsTrendMock = assumeMock(useCommunicationSkillsTrend)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessPerAgent',
)
const useResolutionCompletenessPerAgentMock = assumeMock(
    useResolutionCompletenessPerAgent,
)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyTrend',
)
const useLanguageProficiencyTrendMock = assumeMock(useLanguageProficiencyTrend)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useLanguageProficiencyPerAgent',
)
const useLanguageProficiencyPerAgentMock = assumeMock(
    useLanguageProficiencyPerAgent,
)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useAccuracyTrend',
)
const useAccuracyTrendMock = assumeMock(useAccuracyTrend)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useAccuracyPerAgent',
)
const useAccuracyPerAgentMock = assumeMock(useAccuracyPerAgent)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyTrend',
)
const useEfficiencyTrendMock = assumeMock(useEfficiencyTrend)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useEfficiencyPerAgent',
)
const useEfficiencyPerAgentMock = assumeMock(useEfficiencyPerAgent)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useInternalComplianceTrend',
)
const useInternalComplianceTrendMock = assumeMock(useInternalComplianceTrend)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useInternalCompliancePerAgent',
)
const useInternalCompliancePerAgentMock = assumeMock(
    useInternalCompliancePerAgent,
)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useBrandVoiceTrend',
)
const useBrandVoiceTrendMock = assumeMock(useBrandVoiceTrend)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useBrandVoicePerAgent',
)
const useBrandVoicePerAgentMock = assumeMock(useBrandVoicePerAgent)

jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useResolutionCompletenessTrend',
)
const useResolutionCompletenessTrendMock = assumeMock(
    useResolutionCompletenessTrend,
)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsPerAgent',
)
const useReviewedClosedTicketsPerAgentMock = assumeMock(
    useReviewedClosedTicketsPerAgent,
)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useReviewedClosedTicketsTrend',
)
const useReviewedClosedTicketsTrendMock = assumeMock(
    useReviewedClosedTicketsTrend,
)
jest.mock('domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice')
const getSortedAutoQAAgentsMock = assumeMock(getSortedAutoQAAgents)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useNewStatsFiltersMock = assumeMock(useStatsFilters)

describe('useAutoQAMetrics', () => {
    const someTrendData: MetricTrend = {
        data: {
            value: 123,
            prevValue: 456,
        },
        isFetching: false,
        isError: false,
    }
    const someMetricData: MetricWithDecile = {
        isFetching: false,
        isError: false,
        data: {
            value: 123,
            decile: 3,
            allData: [],
        },
    }
    const defaultState = {
        stats: initialState,
    }
    useCommunicationSkillsPerAgentMock.mockReturnValue(someMetricData)
    useCommunicationSkillsTrendMock.mockReturnValue(someTrendData)
    useResolutionCompletenessPerAgentMock.mockReturnValue(someMetricData)
    useResolutionCompletenessTrendMock.mockReturnValue(someTrendData)
    useReviewedClosedTicketsPerAgentMock.mockReturnValue(someMetricData)
    useReviewedClosedTicketsTrendMock.mockReturnValue(someTrendData)
    useLanguageProficiencyPerAgentMock.mockReturnValue(someMetricData)
    useLanguageProficiencyTrendMock.mockReturnValue(someTrendData)
    useAccuracyPerAgentMock.mockReturnValue(someMetricData)
    useAccuracyTrendMock.mockReturnValue(someTrendData)
    useEfficiencyPerAgentMock.mockReturnValue(someMetricData)
    useEfficiencyTrendMock.mockReturnValue(someTrendData)
    useInternalCompliancePerAgentMock.mockReturnValue(someMetricData)
    useInternalComplianceTrendMock.mockReturnValue(someTrendData)
    useBrandVoicePerAgentMock.mockReturnValue(someMetricData)
    useBrandVoiceTrendMock.mockReturnValue(someTrendData)
    useNewStatsFiltersMock.mockReturnValue({
        cleanStatsFilters: initialState.filters,
        userTimezone: 'UTC',
        granularity: ReportingGranularity.Day,
    })
    getSortedAutoQAAgentsMock.mockReturnValue(agents)

    it('should return data from all hooks and a list of agents', () => {
        const { result } = renderHook(() => useAutoQAMetrics(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            reportData: {
                communicationSkillsPerAgent: someMetricData,
                communicationSkillsTrend: someTrendData,
                resolutionCompletenessPerAgent: someMetricData,
                resolutionCompletenessTrend: someTrendData,
                reviewedClosedTicketsPerAgent: someMetricData,
                reviewedClosedTicketsTrend: someTrendData,
                languageProficiencyPerAgent: someMetricData,
                languageProficiencyTrend: someTrendData,
                accuracyPerAgent: someMetricData,
                accuracyTrend: someTrendData,
                efficiencyPerAgent: someMetricData,
                efficiencyTrend: someTrendData,
                internalCompliancePerAgent: someMetricData,
                internalComplianceTrend: someTrendData,
                brandVoicePerAgent: someMetricData,
                brandVoiceTrend: someTrendData,
            },
            isLoading: false,
            period: initialState.filters.period,
        })
    })

    it('should return isLoading when some of the hooks are still loading', () => {
        const loadingTrendData = {
            data: undefined,
            isFetching: true,
            isError: false,
        }
        useReviewedClosedTicketsTrendMock.mockReturnValue(loadingTrendData)

        const { result } = renderHook(() => useAutoQAMetrics(), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(result.current).toEqual({
            reportData: {
                communicationSkillsPerAgent: someMetricData,
                communicationSkillsTrend: someTrendData,
                resolutionCompletenessPerAgent: someMetricData,
                resolutionCompletenessTrend: someTrendData,
                reviewedClosedTicketsPerAgent: someMetricData,
                reviewedClosedTicketsTrend: loadingTrendData,
                languageProficiencyPerAgent: someMetricData,
                languageProficiencyTrend: someTrendData,
                accuracyPerAgent: someMetricData,
                accuracyTrend: someTrendData,
                efficiencyPerAgent: someMetricData,
                efficiencyTrend: someTrendData,
                internalCompliancePerAgent: someMetricData,
                internalComplianceTrend: someTrendData,
                brandVoicePerAgent: someMetricData,
                brandVoiceTrend: someTrendData,
            },
            isLoading: true,
            period: initialState.filters.period,
        })
    })
})
