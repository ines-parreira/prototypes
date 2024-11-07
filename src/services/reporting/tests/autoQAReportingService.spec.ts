import moment from 'moment'

import {agents} from 'fixtures/agents'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {TicketQAScoreMeasure} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {
    AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER,
    AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER_WITH_LANGUAGE,
    AutoQAAgentsColumnConfig,
    AutoQAAgentsTableColumn,
    TableLabels,
} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTableConfig'
import {TrendCardConfig} from 'pages/stats/support-performance/auto-qa/AutoQAMetricsConfig'
import {
    AGENT_ID_DIMENSION,
    AutoQAReportMetrics,
    saveReport,
} from 'services/reporting/autoQAReportingService'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {AutoQAMetric} from 'state/ui/stats/types'
import * as files from 'utils/file'
import {getPreviousPeriod} from 'utils/reporting'

jest.mock('utils/file')

describe('autoQAReportingService', () => {
    const period = {
        start_datetime: '2023-08-01',
        end_datetime: '2023-08-31',
    }
    const previousPeriod = getPreviousPeriod(period)
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT
    )
    const periodPrefix = `${startDate}_${endDate}`

    const defaultData = {
        agents: [],
        communicationSkillsPerAgent: {data: null},
        languageProficiencyPerAgent: {data: null},
        resolutionCompletenessPerAgent: {data: null},
        reviewedClosedTicketsPerAgent: {data: null},
        communicationSkillsTrend: {data: undefined},
        languageProficiencyTrend: {data: undefined},
        resolutionCompletenessTrend: {data: undefined},
        reviewedClosedTicketsTrend: {data: undefined},
    } as any

    it('should zip the report', async () => {
        const fakeData = 'fakeReport1'
        jest.spyOn(files, 'createCsv').mockReturnValue(fakeData)
        const zipperMock = jest.spyOn(files, 'saveZippedFiles')

        await saveReport(
            defaultData,
            AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER,
            period
        )

        expect(zipperMock).toHaveBeenCalledWith(
            {
                [`${periodPrefix}-auto-qa-trends-metrics-${export_datetime}.csv`]:
                    fakeData,
                [`${periodPrefix}-auto-qa-agents-metrics-${export_datetime}.csv`]:
                    fakeData,
            },
            `${periodPrefix}-auto-qa-metrics-${export_datetime}`
        )
    })

    it('should format data', async () => {
        const agentA = agents[0]
        const createCsvSpy = jest
            .spyOn(files, 'createCsv')
            .mockReturnValue('fakeReport1')
        const exampleData = (
            agentId: number,
            metricField: AutoQAReportMetrics,
            value: number
        ): MetricWithDecile => ({
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
        const agentAResolutionCompleteness = 0.65
        const agentAReviewedTickets = 3
        const data = {
            agents: agents,
            communicationSkillsPerAgent: exampleData(
                agentA.id,
                TicketQAScoreMeasure.AverageScore,
                agentACommunicationSkills
            ),
            languageProficiencyPerAgent: exampleData(
                agentA.id,
                TicketQAScoreMeasure.AverageScore,
                agentALanguageProficiency
            ),
            resolutionCompletenessPerAgent: exampleData(
                agentA.id,
                TicketQAScoreMeasure.AverageScore,
                agentAResolutionCompleteness
            ),
            reviewedClosedTicketsPerAgent: exampleData(
                agentA.id,
                TicketQAScoreMeasure.TicketCount,
                agentAReviewedTickets
            ),
            communicationSkillsTrend: exampleTrendData,
            languageProficiencyTrend: exampleTrendData,
            resolutionCompletenessTrend: exampleTrendData,
            reviewedClosedTicketsTrend: exampleTrendData,
        }
        await saveReport(
            data,
            AUTO_QA_AGENTS_TABLE_COLUMNS_ORDER_WITH_LANGUAGE,
            period
        )

        const headers = [
            'Metric',
            `${startDate} - ${endDate}`,
            `${previousStartDate} - ${previousEndDate}`,
        ]
        expect(createCsvSpy).toHaveBeenCalledWith([
            headers,
            [
                TrendCardConfig[AutoQAMetric.ReviewedClosedTickets].title,
                formatMetricValue(
                    exampleTrendData.data.value,
                    TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
                        .metricFormat
                ),
                formatMetricValue(
                    exampleTrendData.data.prevValue,
                    TrendCardConfig[AutoQAMetric.ReviewedClosedTickets]
                        .metricFormat
                ),
            ],
            [
                TrendCardConfig[AutoQAMetric.ResolutionCompleteness].title,
                formatMetricValue(
                    exampleTrendData.data.value,
                    TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
                        .metricFormat
                ),
                formatMetricValue(
                    exampleTrendData.data.prevValue,
                    TrendCardConfig[AutoQAMetric.ResolutionCompleteness]
                        .metricFormat
                ),
            ],
            [
                TrendCardConfig[AutoQAMetric.CommunicationSkills].title,
                formatMetricValue(
                    exampleTrendData.data.value,
                    TrendCardConfig[AutoQAMetric.CommunicationSkills]
                        .metricFormat
                ),
                formatMetricValue(
                    exampleTrendData.data.prevValue,
                    TrendCardConfig[AutoQAMetric.CommunicationSkills]
                        .metricFormat
                ),
            ],
            [
                TrendCardConfig[AutoQAMetric.LanguageProficiency].title,
                formatMetricValue(
                    exampleTrendData.data.value,
                    TrendCardConfig[AutoQAMetric.LanguageProficiency]
                        .metricFormat
                ),
                formatMetricValue(
                    exampleTrendData.data.prevValue,
                    TrendCardConfig[AutoQAMetric.LanguageProficiency]
                        .metricFormat
                ),
            ],
        ])

        expect(createCsvSpy).toHaveBeenCalledWith([
            [
                TableLabels[AutoQAAgentsTableColumn.AgentName],
                TableLabels[AutoQAAgentsTableColumn.ReviewedClosedTickets],
                TableLabels[AutoQAAgentsTableColumn.ResolutionCompleteness],
                TableLabels[AutoQAAgentsTableColumn.CommunicationSkills],
                TableLabels[AutoQAAgentsTableColumn.LanguageProficiency],
            ],
            [
                agents[0].name,
                formatMetricValue(
                    agentAReviewedTickets,
                    AutoQAAgentsColumnConfig[
                        AutoQAAgentsTableColumn.ReviewedClosedTickets
                    ].format
                ),
                formatMetricValue(
                    agentAResolutionCompleteness,
                    AutoQAAgentsColumnConfig[
                        AutoQAAgentsTableColumn.ResolutionCompleteness
                    ].format
                ),
                formatMetricValue(
                    agentACommunicationSkills,
                    AutoQAAgentsColumnConfig[
                        AutoQAAgentsTableColumn.CommunicationSkills
                    ].format
                ),
                formatMetricValue(
                    agentALanguageProficiency,
                    AutoQAAgentsColumnConfig[
                        AutoQAAgentsTableColumn.LanguageProficiency
                    ].format
                ),
            ],
            [
                agents[1].name,
                NOT_AVAILABLE_PLACEHOLDER,
                NOT_AVAILABLE_PLACEHOLDER,
                NOT_AVAILABLE_PLACEHOLDER,
                NOT_AVAILABLE_PLACEHOLDER,
            ],
        ])
    })
})
