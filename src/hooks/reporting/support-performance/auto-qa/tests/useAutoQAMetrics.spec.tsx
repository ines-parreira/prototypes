import {renderHook} from '@testing-library/react-hooks'

import React from 'react'
import {Provider} from 'react-redux'

import {agents} from 'fixtures/agents'
import {useAccuracyPerAgent} from 'hooks/reporting/support-performance/auto-qa/useAccuracyPerAgent'
import {useAccuracyTrend} from 'hooks/reporting/support-performance/auto-qa/useAccuracyTrend'
import {useAutoQAMetrics} from 'hooks/reporting/support-performance/auto-qa/useAutoQAMetrics'
import {useBrandVoicePerAgent} from 'hooks/reporting/support-performance/auto-qa/useBrandVoicePerAgent'
import {useBrandVoiceTrend} from 'hooks/reporting/support-performance/auto-qa/useBrandVoiceTrend'
import {useCommunicationSkillsPerAgent} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsPerAgent'
import {useCommunicationSkillsTrend} from 'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
import {useEfficiencyPerAgent} from 'hooks/reporting/support-performance/auto-qa/useEfficiencyPerAgent'
import {useEfficiencyTrend} from 'hooks/reporting/support-performance/auto-qa/useEfficiencyTrend'
import {useInternalCompliancePerAgent} from 'hooks/reporting/support-performance/auto-qa/useInternalCompliancePerAgent'
import {useInternalComplianceTrend} from 'hooks/reporting/support-performance/auto-qa/useInternalComplianceTrend'
import {useLanguageProficiencyPerAgent} from 'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyPerAgent'
import {useLanguageProficiencyTrend} from 'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyTrend'
import {useResolutionCompletenessPerAgent} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessPerAgent'
import {useResolutionCompletenessTrend} from 'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
import {useReviewedClosedTicketsPerAgent} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
import {useReviewedClosedTicketsTrend} from 'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {ReportingGranularity} from 'models/reporting/types'
import {initialState} from 'state/stats/statsSlice'
import {getSortedAutoQAAgents} from 'state/ui/stats/autoQAAgentPerformanceSlice'
import {assumeMock, mockStore} from 'utils/testing'

jest.mock(
    'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsPerAgent'
)
const useCommunicationSkillsPerAgentMock = assumeMock(
    useCommunicationSkillsPerAgent
)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useCommunicationSkillsTrend'
)
const useCommunicationSkillsTrendMock = assumeMock(useCommunicationSkillsTrend)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessPerAgent'
)
const useResolutionCompletenessPerAgentMock = assumeMock(
    useResolutionCompletenessPerAgent
)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyTrend'
)
const useLanguageProficiencyTrendMock = assumeMock(useLanguageProficiencyTrend)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useLanguageProficiencyPerAgent'
)
const useLanguageProficiencyPerAgentMock = assumeMock(
    useLanguageProficiencyPerAgent
)
jest.mock('hooks/reporting/support-performance/auto-qa/useAccuracyTrend')
const useAccuracyTrendMock = assumeMock(useAccuracyTrend)
jest.mock('hooks/reporting/support-performance/auto-qa/useAccuracyPerAgent')
const useAccuracyPerAgentMock = assumeMock(useAccuracyPerAgent)
jest.mock('hooks/reporting/support-performance/auto-qa/useEfficiencyTrend')
const useEfficiencyTrendMock = assumeMock(useEfficiencyTrend)
jest.mock('hooks/reporting/support-performance/auto-qa/useEfficiencyPerAgent')
const useEfficiencyPerAgentMock = assumeMock(useEfficiencyPerAgent)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useInternalComplianceTrend'
)
const useInternalComplianceTrendMock = assumeMock(useInternalComplianceTrend)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useInternalCompliancePerAgent'
)
const useInternalCompliancePerAgentMock = assumeMock(
    useInternalCompliancePerAgent
)
jest.mock('hooks/reporting/support-performance/auto-qa/useBrandVoiceTrend')
const useBrandVoiceTrendMock = assumeMock(useBrandVoiceTrend)
jest.mock('hooks/reporting/support-performance/auto-qa/useBrandVoicePerAgent')
const useBrandVoicePerAgentMock = assumeMock(useBrandVoicePerAgent)

jest.mock(
    'hooks/reporting/support-performance/auto-qa/useResolutionCompletenessTrend'
)
const useResolutionCompletenessTrendMock = assumeMock(
    useResolutionCompletenessTrend
)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsPerAgent'
)
const useReviewedClosedTicketsPerAgentMock = assumeMock(
    useReviewedClosedTicketsPerAgent
)
jest.mock(
    'hooks/reporting/support-performance/auto-qa/useReviewedClosedTicketsTrend'
)
const useReviewedClosedTicketsTrendMock = assumeMock(
    useReviewedClosedTicketsTrend
)
jest.mock('state/ui/stats/autoQAAgentPerformanceSlice')
const getSortedAutoQAAgentsMock = assumeMock(getSortedAutoQAAgents)
jest.mock('hooks/reporting/support-performance/useNewStatsFilters')
const useNewStatsFiltersMock = assumeMock(useNewStatsFilters)

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
        isAnalyticsNewFilters: false,
    })
    getSortedAutoQAAgentsMock.mockReturnValue(agents)

    it('should return data from all hooks and a list of agents', () => {
        const {result} = renderHook(() => useAutoQAMetrics(), {
            wrapper: ({children}) => (
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

        const {result} = renderHook(() => useAutoQAMetrics(), {
            wrapper: ({children}) => (
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
