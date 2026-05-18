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

type ReportData = ReturnType<typeof useVoiceAgentsMetrics>['reportData']

const buildMetric = (
    dimension: string,
    measure: string,
    agent1Value: string,
    agent2Value: string,
    teamValue: number,
) => ({
    isFetching: false,
    isError: false,
    data: {
        value: teamValue,
        decile: 0,
        allData: [
            { [dimension]: '1', [measure]: agent1Value },
            { [dimension]: '2', [measure]: agent2Value },
        ],
        dimensions: [dimension],
        measures: [measure],
    },
})

type FieldNames = {
    voiceFilteringAgentId: string
    voiceAgentId: string
    eventsAgentId: string
    callCount: string
    eventCount: string
    averageTalkTime: string
}

const v1FieldNames: FieldNames = {
    voiceFilteringAgentId: VoiceCallDimension.FilteringAgentId,
    voiceAgentId: VoiceCallDimension.AgentId,
    eventsAgentId: VoiceEventsByAgentDimension.AgentId,
    callCount: VoiceCallMeasure.VoiceCallCount,
    eventCount: VoiceEventsByAgentMeasure.VoiceEventsCount,
    averageTalkTime: VoiceCallMeasure.VoiceCallAverageTalkTime,
}

const v2FieldNames: FieldNames = {
    voiceFilteringAgentId: 'filteringAgentId',
    voiceAgentId: 'agentId',
    eventsAgentId: 'agentId',
    callCount: 'voiceCallsCount',
    eventCount: 'voiceCallsCount',
    averageTalkTime: 'averageTalkTimeInSeconds',
}

const buildReportData = (fields: FieldNames): ReportData =>
    ({
        totalCallsMetric: buildMetric(
            fields.voiceFilteringAgentId,
            fields.callCount,
            '5',
            '3',
            10,
        ),
        answeredCallsMetric: buildMetric(
            fields.voiceFilteringAgentId,
            fields.callCount,
            '4',
            '2',
            8,
        ),
        transferredInboundCallsMetric: buildMetric(
            fields.eventsAgentId,
            fields.eventCount,
            '1',
            '1',
            2,
        ),
        missedCallsMetric: buildMetric(
            fields.voiceFilteringAgentId,
            fields.callCount,
            '2',
            '1',
            3,
        ),
        declinedCallsMetric: buildMetric(
            fields.eventsAgentId,
            fields.eventCount,
            '1',
            '0',
            1,
        ),
        outboundCallsMetric: buildMetric(
            fields.voiceFilteringAgentId,
            fields.callCount,
            '2',
            '2',
            4,
        ),
        averageTalkTimeMetric: buildMetric(
            fields.voiceAgentId,
            fields.averageTalkTime,
            '150',
            '90',
            120,
        ),
    }) as unknown as ReportData

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

    const mockReportData = buildReportData(v1FieldNames)

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
    const expectedHeader = [
        'Agent',
        'Total calls',
        'Inbound answered',
        'Inbound transferred',
        'Inbound missed',
        'Inbound declined',
        'Outbound',
        'Average talk time',
    ]
    const expectedTeamAverageRow = [
        'Team average',
        '5',
        '4',
        '1',
        '1.5',
        '0.5',
        '2',
        '120',
    ]

    describe('createReport', () => {
        let createCsvMock: jest.SpyInstance

        beforeEach(() => {
            createCsvMock = jest.spyOn(files, 'createCsv')
            createCsvMock.mockReturnValue(fakeReport)
        })

        afterEach(() => {
            createCsvMock.mockRestore()
        })

        it.each([
            ['cube-prefixed (V1) field names', v1FieldNames],
            ['scope-local (V2) field names', v2FieldNames],
        ])(
            'populates per-agent rows from allData using %s',
            (_label, fields) => {
                const fileName = getCsvFileNameWithDates(
                    period,
                    VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
                )

                const result = createReport(
                    [agents[0], agents[1]],
                    buildReportData(fields),
                    mockSummaryData,
                    fileName,
                )

                expect(result).toEqual({
                    files: { [fileName]: fakeReport },
                    fileName,
                })
                expect(createCsvMock).toHaveBeenCalledWith([
                    expectedHeader,
                    expectedTeamAverageRow,
                    [agents[0].name, '5', '4', '1', '2', '1', '2', '150'],
                    [agents[1].name, '3', '2', '1', '1', '0', '2', '90'],
                ])
            },
        )

        it('renders - for an agent missing from allData', () => {
            const fileName = getCsvFileNameWithDates(
                period,
                VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
            )
            const missingAgent = {
                ...agents[0],
                id: 999,
                name: 'Unknown Agent',
            }

            createReport(
                [agents[0], missingAgent],
                mockReportData,
                mockSummaryData,
                fileName,
            )

            const [, , , agentRow] = createCsvMock.mock.calls[0][0]
            expect(agentRow).toEqual([
                missingAgent.name,
                '-',
                '-',
                '-',
                '-',
                '-',
                '-',
                '-',
            ])
        })

        it('renders N/A when a metric is missing dimensions or measures metadata', () => {
            const fileName = getCsvFileNameWithDates(
                period,
                VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
            )
            const reportData: ReportData = {
                ...mockReportData,
                totalCallsMetric: {
                    isFetching: false,
                    isError: false,
                    data: {
                        value: 10,
                        decile: 0,
                        allData: [],
                    },
                },
            }

            createReport(
                [agents[0], agents[1]],
                reportData,
                mockSummaryData,
                fileName,
            )

            const rows = createCsvMock.mock.calls[0][0]
            expect(rows[2][1]).toBe('-')
            expect(rows[3][1]).toBe('-')
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
                    expect.arrayContaining(expectedHeader),
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
