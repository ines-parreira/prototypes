import React from 'react'

import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { fetchTableReportData } from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useAutoQAMetrics } from 'domains/reporting/hooks/support-performance/auto-qa/useAutoQAMetrics'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { Cubes } from 'domains/reporting/models/cubes'
import { TicketQAScoreMeasure } from 'domains/reporting/models/cubes/auto-qa/TicketQAScoreCube'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import {
    AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER,
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
    TableLabels,
} from 'domains/reporting/pages/support-performance/auto-qa/AutoQAAgentsTableConfig'
import { TrendCardConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAMetricsConfig'
import { BusiestTimeOfDaysMetrics } from 'domains/reporting/pages/support-performance/busiest-times-of-days/types'
import type { AutoQAReportMetrics } from 'domains/reporting/services/autoQAReportingService'
import {
    AGENT_ID_DIMENSION,
    AUTO_QA_DOWNLOAD_AGENTS_FILE_NAME,
    AUTO_QA_DOWNLOAD_DATA_FILE_NAME,
    AUTO_QA_DOWNLOAD_TRENDS_FILE_NAME,
    createReport,
    fetchAutoQAAgentsTableReportData,
    useAutoQAReportData,
} from 'domains/reporting/services/autoQAReportingService'
import { DATE_TIME_FORMAT } from 'domains/reporting/services/constants'
import { getSortedAutoQAAgents } from 'domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice'
import { AutoQAMetric } from 'domains/reporting/state/ui/stats/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { agents } from 'fixtures/agents'
import { OrderDirection } from 'models/api/types'
import { createCsv } from 'utils/file'

const mockStore = configureMockStore()
jest.mock('domains/reporting/hooks/common/useTableReportData')
const fetchTableReportDataMock = assumeMock(fetchTableReportData)
jest.mock('domains/reporting/state/ui/stats/autoQAAgentPerformanceSlice')
const getSortedAutoQAAgentsMock = assumeMock(getSortedAutoQAAgents)
jest.mock(
    'domains/reporting/hooks/support-performance/auto-qa/useAutoQAMetrics',
)
const useAutoQAMetricsMock = assumeMock(useAutoQAMetrics)

describe('autoQAReportingService', () => {
    const period = {
        start_datetime: '2023-08-01',
        end_datetime: '2023-08-31',
    }
    const statsFilters = {
        period,
    }
    const userTimezone = 'UTC'
    const granularity = ReportingGranularity.Day
    const previousPeriod = getPreviousPeriod(period)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT,
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT,
    )

    const defaultData = {
        agents: [],
        communicationSkillsPerAgent: { data: null },
        languageProficiencyPerAgent: { data: null },
        accuracyPerAgent: { data: null },
        efficiencyPerAgent: { data: null },
        internalCompliancePerAgent: { data: null },
        brandVoicePerAgent: { data: null },
        resolutionCompletenessPerAgent: { data: null },
        reviewedClosedTicketsPerAgent: { data: null },
        communicationSkillsTrend: { data: undefined },
        languageProficiencyTrend: { data: undefined },
        accuracyTrend: { data: undefined },
        efficiencyTrend: { data: undefined },
        internalComplianceTrend: { data: undefined },
        brandVoiceTrend: { data: undefined },
        resolutionCompletenessTrend: { data: undefined },
        reviewedClosedTicketsTrend: { data: undefined },
    } as any

    const agentA = agents[0]
    const exampleData = (
        agentId: number,
        metricField: AutoQAReportMetrics,
        value: number,
    ): MetricWithDecile<string, Cubes> => ({
        isFetching: false,
        isError: false,
        data: {
            value: 12,
            decile: 4,
            allData: [
                {
                    [AGENT_ID_DIMENSION]: String(agentId),
                    [metricField]: String(value),
                },
            ],
        },
    })
    const exampleTrendData = {
        isFetching: false,
        isError: false,
        data: {
            value: 12,
            prevValue: 4,
        },
    }

    const agentACommunicationSkills = 5
    const agentALanguageProficiency = 4
    const agentAAccuracy = 3
    const agentAEfficiency = 2
    const agentAInternalCompliance = 5
    const agentABrandVoice = 4
    const agentAResolutionCompleteness = 0.65
    const agentAReviewedTickets = 3
    const data = {
        communicationSkillsPerAgent: exampleData(
            agentA.id,
            TicketQAScoreMeasure.AverageCommunicationSkillsScore,
            agentACommunicationSkills,
        ),
        languageProficiencyPerAgent: exampleData(
            agentA.id,
            TicketQAScoreMeasure.AverageLanguageProficiencyScore,
            agentALanguageProficiency,
        ),
        accuracyPerAgent: exampleData(
            agentA.id,
            TicketQAScoreMeasure.AverageAccuracyScore,
            agentAAccuracy,
        ),
        efficiencyPerAgent: exampleData(
            agentA.id,
            TicketQAScoreMeasure.AverageEfficiencyScore,
            agentAEfficiency,
        ),
        internalCompliancePerAgent: exampleData(
            agentA.id,
            TicketQAScoreMeasure.AverageInternalComplianceScore,
            agentAInternalCompliance,
        ),
        brandVoicePerAgent: exampleData(
            agentA.id,
            TicketQAScoreMeasure.AverageBrandVoiceScore,
            agentABrandVoice,
        ),
        resolutionCompletenessPerAgent: exampleData(
            agentA.id,
            TicketQAScoreMeasure.AverageResolutionCompletenessScore,
            agentAResolutionCompleteness,
        ),
        reviewedClosedTicketsPerAgent: exampleData(
            agentA.id,
            TicketQAScoreMeasure.TicketCount,
            agentAReviewedTickets,
        ),
        communicationSkillsTrend: exampleTrendData,
        languageProficiencyTrend: exampleTrendData,
        accuracyTrend: exampleTrendData,
        efficiencyTrend: exampleTrendData,
        internalComplianceTrend: exampleTrendData,
        brandVoiceTrend: exampleTrendData,
        resolutionCompletenessTrend: exampleTrendData,
        reviewedClosedTicketsTrend: exampleTrendData,
    }
    const headers = [
        'Metric',
        `${startDate} - ${endDate}`,
        `${previousStartDate} - ${previousEndDate}`,
    ]
    const expectedReport = [
        headers,
        [
            TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].title,
            formatMetricValue(
                exampleTrendData.data.value,
                TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
                    .metricFormat,
            ),
            formatMetricValue(
                exampleTrendData.data.prevValue,
                TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
                    .metricFormat,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.ResolutionCompleteness].title,
            formatMetricValue(
                exampleTrendData.data.value,
                TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
                    .metricFormat,
            ),
            formatMetricValue(
                exampleTrendData.data.prevValue,
                TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
                    .metricFormat,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.Accuracy].title,
            formatMetricValue(
                exampleTrendData.data.value,
                TrendCardConfig[AutoQAMetric.Accuracy].metricFormat,
            ),
            formatMetricValue(
                exampleTrendData.data.prevValue,
                TrendCardConfig[AutoQAMetric.Accuracy].metricFormat,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.InternalCompliance].title,
            formatMetricValue(
                exampleTrendData.data.value,
                TrendCardConfig[AutoQAMetric.InternalCompliance].metricFormat,
            ),
            formatMetricValue(
                exampleTrendData.data.prevValue,
                TrendCardConfig[AutoQAMetric.InternalCompliance].metricFormat,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.Efficiency].title,
            formatMetricValue(
                exampleTrendData.data.value,
                TrendCardConfig[AutoQAMetric.Efficiency].metricFormat,
            ),
            formatMetricValue(
                exampleTrendData.data.prevValue,
                TrendCardConfig[AutoQAMetric.Efficiency].metricFormat,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.CommunicationSkills].title,
            formatMetricValue(
                exampleTrendData.data.value,
                TrendCardConfig[AutoQAMetric.CommunicationSkills].metricFormat,
            ),
            formatMetricValue(
                exampleTrendData.data.prevValue,
                TrendCardConfig[AutoQAMetric.CommunicationSkills].metricFormat,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.LanguageProficiency].title,
            formatMetricValue(
                exampleTrendData.data.value,
                TrendCardConfig[AutoQAMetric.LanguageProficiency].metricFormat,
            ),
            formatMetricValue(
                exampleTrendData.data.prevValue,
                TrendCardConfig[AutoQAMetric.LanguageProficiency].metricFormat,
            ),
        ],
        [
            TrendCardConfig[AutoQAMetric.BrandVoice].title,
            formatMetricValue(
                exampleTrendData.data.value,
                TrendCardConfig[AutoQAMetric.BrandVoice].metricFormat,
            ),
            formatMetricValue(
                exampleTrendData.data.prevValue,
                TrendCardConfig[AutoQAMetric.BrandVoice].metricFormat,
            ),
        ],
    ]
    const expectedAgentsReport = [
        [
            TableLabels[AutoQAAgentsTableColumn.AgentName],
            TableLabels[AutoQAAgentsTableColumn.ReviewedClosedTickets],
            TableLabels[AutoQAAgentsTableColumn.ResolutionCompleteness],
            TableLabels[AutoQAAgentsTableColumn.Accuracy],
            TableLabels[AutoQAAgentsTableColumn.InternalCompliance],
            TableLabels[AutoQAAgentsTableColumn.Efficiency],
            TableLabels[AutoQAAgentsTableColumn.CommunicationSkills],
            TableLabels[AutoQAAgentsTableColumn.LanguageProficiency],
            TableLabels[AutoQAAgentsTableColumn.BrandVoice],
        ],
        [
            agents[0].name,
            formatMetricValue(
                agentAReviewedTickets,
                AutoQAAgentsColumnConfig[
                    AutoQAAgentsTableColumn.ReviewedClosedTickets
                ].format,
            ),
            formatMetricValue(
                agentAResolutionCompleteness,
                AutoQAAgentsColumnConfig[
                    AutoQAAgentsTableColumn.ResolutionCompleteness
                ].format,
            ),
            formatMetricValue(
                agentAAccuracy,
                AutoQAAgentsColumnConfig[AutoQAAgentsTableColumn.Accuracy]
                    .format,
            ),
            formatMetricValue(
                agentAInternalCompliance,
                AutoQAAgentsColumnConfig[
                    AutoQAAgentsTableColumn.InternalCompliance
                ].format,
            ),
            formatMetricValue(
                agentAEfficiency,
                AutoQAAgentsColumnConfig[AutoQAAgentsTableColumn.Efficiency]
                    .format,
            ),
            formatMetricValue(
                agentACommunicationSkills,
                AutoQAAgentsColumnConfig[
                    AutoQAAgentsTableColumn.CommunicationSkills
                ].format,
            ),
            formatMetricValue(
                agentALanguageProficiency,
                AutoQAAgentsColumnConfig[
                    AutoQAAgentsTableColumn.LanguageProficiency
                ].format,
            ),
            formatMetricValue(
                agentABrandVoice,
                AutoQAAgentsColumnConfig[AutoQAAgentsTableColumn.BrandVoice]
                    .format,
            ),
        ],
        [
            agents[1].name,
            NOT_AVAILABLE_PLACEHOLDER,
            NOT_AVAILABLE_PLACEHOLDER,
            NOT_AVAILABLE_PLACEHOLDER,
            NOT_AVAILABLE_PLACEHOLDER,
            NOT_AVAILABLE_PLACEHOLDER,
            NOT_AVAILABLE_PLACEHOLDER,
            NOT_AVAILABLE_PLACEHOLDER,
            NOT_AVAILABLE_PLACEHOLDER,
        ],
    ]
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        AUTO_QA_DOWNLOAD_DATA_FILE_NAME,
    )
    const agentsFileName = getCsvFileNameWithDates(
        statsFilters.period,
        AUTO_QA_DOWNLOAD_AGENTS_FILE_NAME,
    )
    const trendsFileName = getCsvFileNameWithDates(
        statsFilters.period,
        AUTO_QA_DOWNLOAD_TRENDS_FILE_NAME,
    )

    describe('createReport', () => {
        it('should format the report', () => {
            const report = createReport(
                agents,
                data,
                AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER,
                period,
            )

            expect(report).toEqual({
                files: {
                    [getCsvFileNameWithDates(
                        period,
                        AUTO_QA_DOWNLOAD_TRENDS_FILE_NAME,
                    )]: createCsv(expectedReport),
                    [getCsvFileNameWithDates(
                        period,
                        AUTO_QA_DOWNLOAD_AGENTS_FILE_NAME,
                    )]: createCsv(expectedAgentsReport),
                },
                fileName: getCsvFileNameWithDates(
                    period,
                    AUTO_QA_DOWNLOAD_DATA_FILE_NAME,
                ),
            })
        })

        it('should format data', () => {
            const report = createReport(
                agents,
                data,
                AUTO_QA_AGENTS_TABLE_DIMENSIONS_COLUMNS_ORDER,
                period,
            )

            expect(report).toEqual({
                files: {
                    [agentsFileName]: createCsv(expectedAgentsReport),
                    [trendsFileName]: createCsv(expectedReport),
                },
                fileName,
            })

            expect(report.files[agentsFileName]).toEqual(
                createCsv(expectedAgentsReport),
            )
        })
    })

    describe('useAutoQAReportData', () => {
        beforeEach(() => {
            getSortedAutoQAAgentsMock.mockReturnValue(agents)
            useAutoQAMetricsMock.mockReturnValue({
                reportData: data,
                isLoading: false,
                period,
            })
        })

        it('should fetch data and return a report', () => {
            const { result } = renderHook(() => useAutoQAReportData(), {
                wrapper: ({ children }) => (
                    <Provider store={mockStore({})}>{children}</Provider>
                ),
            })

            expect(result.current).toEqual({
                files: {
                    [agentsFileName]: createCsv(expectedAgentsReport),
                    [trendsFileName]: createCsv(expectedReport),
                },
                fileName,
                isLoading: false,
            })
        })
    })

    describe('fetchAutoQAAgentsTableReportData', () => {
        const context = {
            agents,
            agentsQA: agents,
            customFieldsOrder: {
                direction: OrderDirection.Asc,
                column: 1,
            },
            selectedCustomFieldId: null,
            columnsOrder: [],
            channels: [],
            channelColumnsOrder: [],
            selectedBTODMetric: BusiestTimeOfDaysMetrics.TicketsCreated,
            tags: {},
            tagsTableOrder: {
                direction: OrderDirection.Asc,
                column: 1,
            },
            integrations: [],
            getAgentDetails: () => undefined,
        }

        beforeEach(() => {
            fetchTableReportDataMock.mockResolvedValue({
                data,
                isFetching: false,
                isError: false,
            })
        })

        it('should fetch and format the report', async () => {
            const report = await fetchAutoQAAgentsTableReportData(
                statsFilters,
                userTimezone,
                granularity,
                context,
            )

            expect(report).toEqual({
                files: {
                    [agentsFileName]: createCsv(expectedAgentsReport),
                },
                fileName: getCsvFileNameWithDates(
                    statsFilters.period,
                    AUTO_QA_DOWNLOAD_DATA_FILE_NAME,
                ),
                isLoading: false,
            })
        })

        it('should return empty files on no data', async () => {
            fetchTableReportDataMock.mockResolvedValue({
                data: null,
                isFetching: false,
                isError: false,
            })

            const report = await fetchAutoQAAgentsTableReportData(
                statsFilters,
                userTimezone,
                granularity,
                context,
            )

            expect(report).toEqual({
                files: {},
                fileName: getCsvFileNameWithDates(
                    statsFilters.period,
                    AUTO_QA_DOWNLOAD_DATA_FILE_NAME,
                ),
                isLoading: false,
            })
        })

        it('should return empty files on error', async () => {
            fetchTableReportDataMock.mockRejectedValue(defaultData)

            const report = await fetchAutoQAAgentsTableReportData(
                statsFilters,
                userTimezone,
                granularity,
                context,
            )

            expect(report).toEqual({
                files: {},
                fileName: getCsvFileNameWithDates(
                    statsFilters.period,
                    AUTO_QA_DOWNLOAD_DATA_FILE_NAME,
                ),
                isLoading: false,
            })
        })
    })
})
