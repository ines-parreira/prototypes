import { assumeMock, renderHook } from '@repo/testing'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentMeasure,
} from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME } from 'domains/reporting/pages/voice/constants/voiceAgents'
import { useVoiceAgentsMetrics } from 'domains/reporting/pages/voice/hooks/useVoiceAgentsMetrics'
import { useVoiceAgentsSummaryMetrics } from 'domains/reporting/pages/voice/hooks/useVoiceAgentsSummaryMetrics'
import type { VoiceAgentsPerformanceReportData } from 'domains/reporting/services/voiceAgentsReportingService'
import {
    createReport,
    useVoiceAgentsReportData,
} from 'domains/reporting/services/voiceAgentsReportingService'
import { agents } from 'fixtures/agents'
import useAppSelector from 'hooks/useAppSelector'
import * as files from 'utils/file'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)
jest.mock('domains/reporting/pages/voice/hooks/useVoiceAgentsMetrics')
const useVoiceAgentsMetricsMock = assumeMock(useVoiceAgentsMetrics)
jest.mock('domains/reporting/pages/voice/hooks/useVoiceAgentsSummaryMetrics')
const useVoiceAgentsSummaryMetricsMock = assumeMock(
    useVoiceAgentsSummaryMetrics,
)
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

describe('voiceAgentsReportingService', () => {
    const period = {
        start_datetime: '2023-12-11T00:00:00.000Z',
        end_datetime: '2023-12-11T23:59:59.999Z',
    }
    const statsFilters: StatsFilters = {
        period,
        agents: {
            values: [agents[0].id],
            operator: LogicalOperatorEnum.ONE_OF,
        },
    }

    const mockReportData: ReturnType<
        typeof useVoiceAgentsMetrics
    >['reportData'] = {
        totalCallsMetric: {
            isFetching: false,
            isError: false,
            data: {
                value: 10,
                decile: 0,
                allData: [
                    {
                        'VoiceCall.filteringAgentId': '1',
                        'VoiceCall.count': '5',
                    },
                    {
                        'VoiceCall.filteringAgentId': '2',
                        'VoiceCall.count': '3',
                    },
                ],
                dimensions: [VoiceCallDimension.FilteringAgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
            },
        },
        answeredCallsMetric: {
            isFetching: false,
            isError: false,
            data: {
                value: 8,
                decile: 0,
                allData: [
                    {
                        'VoiceCall.filteringAgentId': '1',
                        'VoiceCall.count': '4',
                    },
                    {
                        'VoiceCall.filteringAgentId': '2',
                        'VoiceCall.count': '2',
                    },
                ],
                dimensions: [VoiceCallDimension.FilteringAgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
            },
        },
        transferredInboundCallsMetric: {
            isFetching: false,
            isError: false,
            data: {
                value: 2,
                decile: 0,
                allData: [
                    {
                        'VoiceEventsByAgent.agentId': '1',
                        'VoiceEventsByAgent.count': '1',
                    },
                    {
                        'VoiceEventsByAgent.agentId': '2',
                        'VoiceEventsByAgent.count': '1',
                    },
                ],
                dimensions: [VoiceEventsByAgentDimension.AgentId],
                measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            },
        },
        missedCallsMetric: {
            isFetching: false,
            isError: false,
            data: {
                value: 3,
                decile: 0,
                allData: [
                    {
                        'VoiceCall.filteringAgentId': '1',
                        'VoiceCall.count': '2',
                    },
                    {
                        'VoiceCall.filteringAgentId': '2',
                        'VoiceCall.count': '1',
                    },
                ],
                dimensions: [VoiceCallDimension.FilteringAgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
            },
        },
        declinedCallsMetric: {
            isFetching: false,
            isError: false,
            data: {
                value: 1,
                decile: 0,
                allData: [
                    {
                        'VoiceEventsByAgent.agentId': '1',
                        'VoiceEventsByAgent.count': '1',
                    },
                    {
                        'VoiceEventsByAgent.agentId': '2',
                        'VoiceEventsByAgent.count': '0',
                    },
                ],
                dimensions: [VoiceEventsByAgentDimension.AgentId],
                measures: [VoiceEventsByAgentMeasure.VoiceEventsCount],
            },
        },
        outboundCallsMetric: {
            isFetching: false,
            isError: false,
            data: {
                value: 4,
                decile: 0,
                allData: [
                    {
                        'VoiceCall.filteringAgentId': '1',
                        'VoiceCall.count': '2',
                    },
                    {
                        'VoiceCall.filteringAgentId': '2',
                        'VoiceCall.count': '2',
                    },
                ],
                dimensions: [VoiceCallDimension.FilteringAgentId],
                measures: [VoiceCallMeasure.VoiceCallCount],
            },
        },
        averageTalkTimeMetric: {
            isFetching: false,
            isError: false,
            data: {
                value: 120,
                decile: 0,
                allData: [
                    {
                        'VoiceCall.agentId': '1',
                        'VoiceCall.averageTalkTimeSeconds': '150',
                    },
                    {
                        'VoiceCall.agentId': '2',
                        'VoiceCall.averageTalkTimeSeconds': '90',
                    },
                ],
                dimensions: [VoiceCallDimension.AgentId],
                measures: [VoiceCallMeasure.VoiceCallAverageTalkTime],
            },
        },
    }

    const mockSummaryData: VoiceAgentsPerformanceReportData<any> = {
        totalCallsMetric: {
            isFetching: false,
            isError: false,
            data: { value: 10 },
        },
        answeredCallsMetric: {
            isFetching: false,
            isError: false,
            data: { value: 8 },
        },
        transferredInboundCallsMetric: {
            isFetching: false,
            isError: false,
            data: { value: 2 },
        },
        missedCallsMetric: {
            isFetching: false,
            isError: false,
            data: { value: 3 },
        },
        declinedCallsMetric: {
            isFetching: false,
            isError: false,
            data: { value: 1 },
        },
        outboundCallsMetric: {
            isFetching: false,
            isError: false,
            data: { value: 4 },
        },
        averageTalkTimeMetric: {
            isFetching: false,
            isError: false,
            data: { value: 120 },
        },
    }

    const fakeReport = 'someValue'

    describe('createReport', () => {
        it('should create report with transferred calls column', () => {
            const createCsvMock = jest.spyOn(files, 'createCsv')
            createCsvMock.mockReturnValue(fakeReport)

            const fileName = getCsvFileNameWithDates(
                period,
                VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
            )

            const result = createReport(
                [agents[0], agents[1]],
                mockReportData,
                mockSummaryData,
                fileName,
            )

            expect(result).toEqual({
                files: { [fileName]: fakeReport },
                fileName,
            })

            expect(createCsvMock).toHaveBeenCalledWith([
                [
                    'Agent',
                    'Total calls',
                    'Inbound answered',
                    'Inbound transferred',
                    'Inbound missed',
                    'Inbound declined',
                    'Outbound',
                    'Average talk time',
                ],
                ['Team average', '5', '4', '1', '1.5', '0.5', '2', '120'],
                [agents[0].name, '5', '4', '1', '2', '1', '2', '150'],
                [agents[1].name, '3', '2', '1', '1', '0', '2', '90'],
            ])

            createCsvMock.mockRestore()
        })
    })

    describe('useVoiceAgentsReportData', () => {
        beforeEach(() => {
            useAppSelectorMock.mockReturnValue([agents[0], agents[1]])
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: statsFilters,
                granularity: ReportingGranularity.Day,
                userTimezone: 'UTC',
            })
            useVoiceAgentsMetricsMock.mockReturnValue({
                reportData: mockReportData,
                isLoading: false,
                period,
            })
            useVoiceAgentsSummaryMetricsMock.mockReturnValue({
                summaryData: mockSummaryData,
                isLoading: false,
                period,
            })
        })

        it('should fetch and format data with transferred calls', () => {
            const createCsvMock = jest.spyOn(files, 'createCsv')
            createCsvMock.mockReturnValue(fakeReport)

            const fileName = getCsvFileNameWithDates(
                period,
                VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
            )

            const { result } = renderHook(() => useVoiceAgentsReportData())

            expect(result.current).toEqual({
                files: { [fileName]: fakeReport },
                fileName,
                isLoading: false,
            })

            expect(createCsvMock).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.arrayContaining([
                        'Agent',
                        'Total calls',
                        'Inbound answered',
                        'Inbound transferred',
                        'Inbound missed',
                        'Inbound declined',
                        'Outbound',
                        'Average talk time',
                    ]),
                ]),
            )

            createCsvMock.mockRestore()
        })

        it('should show loading when metrics are loading', () => {
            useVoiceAgentsMetricsMock.mockReturnValue({
                reportData: mockReportData,
                isLoading: true,
                period,
            })

            const { result } = renderHook(() => useVoiceAgentsReportData())

            expect(result.current.isLoading).toBe(true)
        })

        it('should show loading when summary metrics are loading', () => {
            useVoiceAgentsSummaryMetricsMock.mockReturnValue({
                summaryData: mockSummaryData,
                isLoading: true,
                period,
            })

            const { result } = renderHook(() => useVoiceAgentsReportData())

            expect(result.current.isLoading).toBe(true)
        })
    })
})
