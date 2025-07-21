import React from 'react'

import { fromJS } from 'immutable'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { User, UserRole, UserSettingType } from 'config/types/user'
import { fetchTableReportData } from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { Metric } from 'domains/reporting/hooks/metrics'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    MetricWithDecile,
    QueryReturnType,
} from 'domains/reporting/hooks/useMetricPerDimension'
import {
    VoiceCallCube,
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import {
    VoiceEventsByAgentCube,
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentMeasure,
} from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import { VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME } from 'domains/reporting/pages/voice/constants/voiceAgents'
import { useVoiceAgentsMetrics } from 'domains/reporting/pages/voice/hooks/useVoiceAgentsMetrics'
import { useVoiceAgentsSummaryMetrics } from 'domains/reporting/pages/voice/hooks/useVoiceAgentsSummaryMetrics'
import {
    createReport,
    fetchVoiceAgentsReportData,
    useVoiceAgentsReportData,
} from 'domains/reporting/services/voiceAgentsReportingService'
import { getSortedAgents } from 'domains/reporting/state/ui/stats/voiceAgentsPerformanceSlice'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { agents } from 'fixtures/agents'
import { OrderDirection } from 'models/api/types'
import { RootState } from 'state/types'
import { createCsv } from 'utils/file'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const mockStore = configureMockStore()
jest.mock('domains/reporting/hooks/common/useTableReportData')
const fetchTableReportDataMock = assumeMock(fetchTableReportData)
jest.mock('domains/reporting/state/ui/stats/voiceAgentsPerformanceSlice')
const getSortedAgentsMock = assumeMock(getSortedAgents)
jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)
jest.mock('domains/reporting/pages/voice/hooks/useVoiceAgentsMetrics')
const useVoiceAgentsMetricsMock = assumeMock(useVoiceAgentsMetrics)
jest.mock('domains/reporting/pages/voice/hooks/useVoiceAgentsSummaryMetrics')
const useVoiceAgentsSummaryMetricsMock = assumeMock(
    useVoiceAgentsSummaryMetrics,
)

describe('voiceAgentsPerformanceReportingService', () => {
    const period = {
        start_datetime: '2023-06-07',
        end_datetime: '2023-06-14',
    }
    const emptyMetric: MetricWithDecile<
        VoiceCallCube | VoiceEventsByAgentCube
    > = {
        data: {
            value: null,
            decile: null,
            allData: [],
        },
        isError: false,
        isFetching: false,
    }

    const buildMetric = (
        allData: QueryReturnType<VoiceCallCube | VoiceEventsByAgentCube>,
    ): MetricWithDecile<VoiceCallCube | VoiceEventsByAgentCube> => ({
        data: {
            value: null,
            decile: null,
            allData,
        },
        isError: false,
        isFetching: false,
    })

    const emptyAverageMetric: Metric = {
        data: {
            value: 0,
        },
        isError: false,
        isFetching: false,
    }

    const buildAverageMetric = (value: number): Metric => ({
        data: {
            value,
        },
        isError: false,
        isFetching: false,
    })

    const agent1: User = {
        name: 'Adam White',
        id: 123,
        firstname: 'Adam',
        lastname: 'White',
        email: 'adam.white@example.com',
        role: { name: UserRole.Admin },
        active: true,
        bio: null,
        country: null,
        language: null,
        created_datetime: '2023-05-29T09:22:30.142183+00:00',
        deactivated_datetime: null,
        external_id: 'abc123',
        meta: null,
        updated_datetime: '2024-02-05T16:21:43.875197+00:00',
        settings: [
            {
                id: 1,
                type: UserSettingType.Preferences,
                data: { available: false, show_macros: false },
            },
        ],
        timezone: null,
        has_2fa_enabled: false,
        client_id: null,
    }

    const agent2: User = {
        name: 'Eve Green',
        id: 456,
        firstname: 'Even',
        lastname: 'Green',
        email: 'even.green@example.com',
        role: { name: UserRole.Agent },
        active: true,
        bio: null,
        country: null,
        language: null,
        created_datetime: '2023-07-16T23:11:42.142183+00:00',
        deactivated_datetime: null,
        external_id: 'abc123',
        meta: null,
        updated_datetime: '2024-02-05T17:21:43.875197+00:00',
        settings: [
            {
                id: 1,
                type: UserSettingType.Preferences,
                data: { available: false, show_macros: false },
            },
        ],
        timezone: null,
        has_2fa_enabled: false,
        client_id: null,
    }

    const testCaseData = [
        {
            testName: 'empty data should return empty report',
            period: {
                start_datetime: '2023-06-07',
                end_datetime: '2023-06-14',
            },
            agents: [],
            data: {
                totalCallsMetric: emptyMetric,
                answeredCallsMetric: emptyMetric,
                missedCallsMetric: emptyMetric,
                declinedCallsMetric: emptyMetric,
                outboundCallsMetric: emptyMetric,
                averageTalkTimeMetric: emptyMetric,
            },
            summaryData: {
                totalCallsMetric: emptyAverageMetric,
                answeredCallsMetric: emptyAverageMetric,
                missedCallsMetric: emptyAverageMetric,
                declinedCallsMetric: emptyAverageMetric,
                outboundCallsMetric: emptyAverageMetric,
                averageTalkTimeMetric: emptyAverageMetric,
            },
            expectedOutputData: [
                [
                    'Agent',
                    'Total calls',
                    'Inbound answered',
                    'Inbound missed',
                    'Inbound declined',
                    'Outbound',
                    'Average talk time',
                ],
                ['Team average', '0', '0', '0', '0', '0', '0'],
            ],
        },
        {
            testName: 'data with agents should return report with agents',
            agents: [agent1, agent2],
            period: {
                start_datetime: '2024-02-05',
                end_datetime: '2024-02-11',
            },
            data: {
                totalCallsMetric: buildMetric([
                    {
                        [VoiceCallDimension.FilteringAgentId]: '123',
                        [VoiceCallMeasure.VoiceCallCount]: '31',
                    },
                    {
                        [VoiceCallDimension.FilteringAgentId]: '456',
                        [VoiceCallMeasure.VoiceCallCount]: '2',
                    },
                ]),
                answeredCallsMetric: buildMetric([
                    {
                        [VoiceCallDimension.FilteringAgentId]: '123',
                        [VoiceCallMeasure.VoiceCallCount]: '20',
                    },
                ]),
                missedCallsMetric: buildMetric([
                    {
                        [VoiceCallDimension.FilteringAgentId]: '123',
                        [VoiceCallMeasure.VoiceCallCount]: '5',
                    },
                    {
                        [VoiceCallDimension.FilteringAgentId]: '456',
                        [VoiceCallMeasure.VoiceCallCount]: '1',
                    },
                ]),
                declinedCallsMetric: buildMetric([
                    {
                        [VoiceEventsByAgentDimension.AgentId]: '123',
                        [VoiceEventsByAgentMeasure.VoiceEventsCount]: '2',
                    },
                ]),
                outboundCallsMetric: buildMetric([
                    {
                        [VoiceCallDimension.FilteringAgentId]: '123',
                        [VoiceCallMeasure.VoiceCallCount]: '6',
                    },
                    {
                        [VoiceCallDimension.FilteringAgentId]: '456',
                        [VoiceCallMeasure.VoiceCallCount]: '1',
                    },
                ]),
                averageTalkTimeMetric: buildMetric([
                    {
                        [VoiceCallDimension.AgentId]: '123',
                        [VoiceCallMeasure.VoiceCallAverageTalkTime]: '48.5',
                    },
                    {
                        [VoiceCallDimension.AgentId]: '456',
                        [VoiceCallMeasure.VoiceCallAverageTalkTime]: '18.2',
                    },
                ]),
            },
            summaryData: {
                totalCallsMetric: buildAverageMetric(33),
                answeredCallsMetric: buildAverageMetric(20),
                missedCallsMetric: buildAverageMetric(6),
                declinedCallsMetric: buildAverageMetric(2),
                outboundCallsMetric: buildAverageMetric(7),
                averageTalkTimeMetric: buildAverageMetric(21.5),
            },
            expectedOutputData: [
                [
                    'Agent',
                    'Total calls',
                    'Inbound answered',
                    'Inbound missed',
                    'Inbound declined',
                    'Outbound',
                    'Average talk time',
                ],
                ['Team average', '16.5', '10', '3', '1', '3.5', '21.5'],
                ['Adam White', '31', '20', '5', '2', '6', '48.5'],
                ['Eve Green', '2', '-', '1', '-', '1', '18.2'],
            ],
        },
    ]

    describe('createReport', () => {
        it.each(testCaseData)(
            'should call saveReport with $testName',
            ({ agents, period, data, summaryData, expectedOutputData }) => {
                const fileName = getCsvFileNameWithDates(
                    period,
                    VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
                )

                const report = createReport(agents, data, summaryData, fileName)

                expect(report).toEqual({
                    files: {
                        [fileName]: createCsv(expectedOutputData),
                    },
                    fileName: getCsvFileNameWithDates(
                        period,
                        VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
                    ),
                })
            },
        )
    })

    describe('useVoiceAgentsReportingService', () => {
        const state = {
            agents: fromJS({
                all: agents,
            }),
        } as RootState
        const fileName = getCsvFileNameWithDates(
            period,
            VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
        )

        beforeEach(() => {
            getSortedAgentsMock.mockReturnValue([])
            useStatsFiltersMock.mockReturnValue({
                cleanStatsFilters: { period },
                userTimezone: 'UTC',
                granularity: ReportingGranularity.Day,
            })
            useVoiceAgentsMetricsMock.mockReturnValue({
                reportData: testCaseData[0].data,
                isLoading: false,
                period,
            })
            useVoiceAgentsSummaryMetricsMock.mockReturnValue({
                summaryData: testCaseData[0].summaryData,
                isLoading: false,
                period,
            })
        })

        it('should ', () => {
            const { result } = renderHook(() => useVoiceAgentsReportData(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(state)}> {children}</Provider>
                ),
            })

            expect(result.current).toEqual({
                files: {
                    [fileName]: createCsv(testCaseData[0].expectedOutputData),
                },
                fileName,
                isLoading: false,
            })
        })
    })

    describe('fetchVoiceAgentsReportData', () => {
        const statsFilters: StatsFilters = {
            period: {
                end_datetime: formatReportingQueryDate(moment()),
                start_datetime: formatReportingQueryDate(moment()),
            },
        }
        const userTimezone = 'UTC'
        const granularity = ReportingGranularity.Day

        const fileName = getCsvFileNameWithDates(
            statsFilters.period,
            VOICE_AGENTS_CALL_ACTIVITY_FILE_NAME,
        )

        it.each(testCaseData)(
            'should fetch and format Voice Agents report',
            async ({ agents, data, summaryData, expectedOutputData }) => {
                fetchTableReportDataMock.mockResolvedValueOnce({
                    data,
                } as unknown as ReturnType<typeof fetchTableReportData>)
                fetchTableReportDataMock.mockResolvedValueOnce({
                    data: summaryData,
                } as unknown as ReturnType<typeof fetchTableReportData>)
                const context = {
                    agents,
                    agentsQA: [],
                    channels: [],
                    channelColumnsOrder: [],
                    columnsOrder: [],
                    customFieldsOrder: {
                        direction: OrderDirection.Asc,
                        column: 1,
                    },
                    selectedCustomFieldId: null,
                    selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
                    tags: {},
                    tagsTableOrder: {
                        direction: OrderDirection.Asc,
                        column: 1,
                    },
                    integrations: [],
                    getAgentDetails: () => undefined,
                }

                const report = await fetchVoiceAgentsReportData(
                    statsFilters,
                    userTimezone,
                    granularity,
                    context,
                )

                expect(report).toEqual({
                    files: { [fileName]: createCsv(expectedOutputData) },
                    fileName,
                    isLoading: false,
                })
            },
        )

        it('should return empty on no data', async () => {
            fetchTableReportDataMock.mockResolvedValueOnce({
                data: null,
            } as unknown as ReturnType<typeof fetchTableReportData>)
            fetchTableReportDataMock.mockResolvedValueOnce({
                data: null,
            } as unknown as ReturnType<typeof fetchTableReportData>)
            const context = {
                agents: [],
                agentsQA: [],
                channels: [],
                channelColumnsOrder: [],
                columnsOrder: [],
                customFieldsOrder: {
                    direction: OrderDirection.Asc,
                    column: 1,
                },
                selectedCustomFieldId: null,
                selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
                tags: {},
                tagsTableOrder: {
                    direction: OrderDirection.Asc,
                    column: 1,
                },
                integrations: [],
                getAgentDetails: () => undefined,
            }

            const report = await fetchVoiceAgentsReportData(
                statsFilters,
                userTimezone,
                granularity,
                context,
            )

            expect(report).toEqual({
                files: {},
                fileName,
                isLoading: false,
            })
        })

        it('should return empty on error', async () => {
            fetchTableReportDataMock.mockRejectedValue({})
            const context = {
                agents: [],
                agentsQA: [],
                channels: [],
                channelColumnsOrder: [],
                columnsOrder: [],
                customFieldsOrder: {
                    direction: OrderDirection.Asc,
                    column: 1,
                },
                selectedCustomFieldId: null,
                selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
                tags: {},
                tagsTableOrder: {
                    direction: OrderDirection.Asc,
                    column: 1,
                },
                integrations: [],
                getAgentDetails: () => undefined,
            }

            const report = await fetchVoiceAgentsReportData(
                statsFilters,
                userTimezone,
                granularity,
                context,
            )

            expect(report).toEqual({
                files: {},
                fileName,
                isLoading: false,
            })
        })
    })
})
