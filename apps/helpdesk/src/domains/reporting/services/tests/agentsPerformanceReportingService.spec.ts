import type { User } from 'config/types/user'
import { UserRole, UserSettingType } from 'config/types/user'
import type { Metric } from 'domains/reporting/hooks/metrics'
import { HelpdeskMessageMeasure } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketsFirstAgentResponseTimeDimension,
    TicketsFirstAgentResponseTimeMeasure,
} from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import { NOT_AVAILABLE_PLACEHOLDER } from 'domains/reporting/pages/common/utils'
import { TableLabels } from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import type { AgentsPerformanceReportData } from 'domains/reporting/services/agentsPerformanceReportingService'
import {
    createAgentsReport,
    getData,
    SUMMARY_ROW_AGENT_COLUMN_LABEL,
    TOTAL_ROW_AGENT_COLUMN_LABEL,
} from 'domains/reporting/services/agentsPerformanceReportingService'
import {
    AgentsTableColumn,
    AgentsTableRow,
} from 'domains/reporting/state/ui/stats/types'
import * as files from 'utils/file'

jest.mock('utils/file')
jest.mock('@repo/feature-flags')

const emptyReportData = {
    value: 1,
    decile: 0,
    allData: [],
    dimensions: [],
    measures: [],
}

const reportDataWithoutCubeMetrics = {
    value: 1,
    decile: 0,
    allData: [
        {
            dimension: 'ticketCount',
            value: '123',
        },
        {
            dimension: 'periodStart',
            value: '2022-01-01',
        },
        {
            dimension: 'periodEnd',
            value: '2022-01-31',
        },
    ],
    dimensions: [],
    measures: [],
}

const reportDataWithCubeMetrics = {
    value: 1,
    decile: 0,
    allData: [
        {
            dimension: 'ticketCount',
            value: '123',
        },
        {
            dimension: 'periodStart',
            value: '2022-01-01',
        },
        {
            [TicketDimension.AssigneeUserId]: '123',
            [HelpdeskMessageMeasure.TicketCount]: '100500',
        },
    ],
    dimensions: [TicketDimension.AssigneeUserId],
    measures: [HelpdeskMessageMeasure.TicketCount],
}

const buildQuery = <T>(isFetching: boolean, data: T) => ({
    isFetching,
    data,
    isError: false,
})

const columnsOrder: AgentsTableColumn[] = Object.values(AgentsTableColumn)
const rowsOrder: AgentsTableRow[] = []

const emptyAgents: User[] = []
const agents: User[] = [
    {
        name: 'John Doe',
        id: 123,
        firstname: 'John',
        lastname: 'Doe',
        email: 'johndoe@example.com',
        role: { name: UserRole.Admin },
        active: true,
        bio: 'Lorem ipsum dolor sit amet',
        country: 'United States',
        language: 'English',
        created_datetime: '2021-01-01T12:00:00Z',
        deactivated_datetime: null,
        external_id: 'abc123',
        meta: null,
        updated_datetime: '2021-01-05T10:30:00Z',
        settings: [
            {
                id: 1,
                type: UserSettingType.Preferences,
                data: { available: false, show_macros: false },
            },
        ],
        timezone: 'America/New_York',
        has_2fa_enabled: true,
        client_id: null,
    },
]

const baseMetricBuilder = (reportData: any) => ({
    closedTicketsMetric: buildQuery(false, reportData),
    customerSatisfactionMetric: buildQuery(false, reportData),
    medianResponseTimeMetric: buildQuery(false, reportData),
    humanResponseTimeAfterAiHandoffMetric: buildQuery(false, reportData),
    medianFirstResponseTimeMetric: buildQuery(false, reportData),
    messagesSentMetric: buildQuery(false, reportData),
    messagesReceivedMetric: buildQuery(false, reportData),
    percentageOfClosedTicketsMetric: buildQuery(false, reportData),
    medianResolutionTimeMetric: buildQuery(false, reportData),
    ticketsRepliedMetric: buildQuery(false, reportData),
    oneTouchTicketsMetric: buildQuery(false, reportData),
    zeroTouchTicketsMetric: buildQuery(false, reportData),
    repliedTicketsPerHourMetric: buildQuery(false, reportData),
    onlineTimeMetric: buildQuery(false, reportData),
    messagesSentPerHourMetric: buildQuery(false, reportData),
    closedTicketsPerHourMetric: buildQuery(false, reportData),
    ticketHandleTimeMetric: buildQuery(false, reportData),
})

const reportDataFactory = (
    agents: User[],
    reportData: any,
    metricsOverride: Record<string, any> | undefined = {},
    testName: string | undefined = '',
) => {
    const baseMetrics = baseMetricBuilder(reportData)
    const data: AgentsPerformanceReportData = {
        ...baseMetrics,
    }
    const summaryData: AgentsPerformanceReportData<Metric> = {
        ...baseMetrics,
        ...metricsOverride,
    }
    const totalData: AgentsPerformanceReportData<Metric> = {
        ...baseMetrics,
        ...metricsOverride,
    }

    return { agents, data, summaryData, totalData, testName }
}

const testCaseReportData = reportDataFactory(
    agents,
    reportDataWithCubeMetrics,
    {
        closedTicketsMetric: { data: null },
        ticketsRepliedMetric: { data: null },
        messagesSentMetric: { data: null },
        oneTouchTicketsMetric: { data: null },
        zeroTouchTicketsMetric: { data: null },
    },
    'Report data with cube metrics',
)

const testCasesData = [
    reportDataFactory(emptyAgents, emptyReportData, undefined, 'Empty data'),
    reportDataFactory(
        agents,
        reportDataWithoutCubeMetrics,
        undefined,
        'Report data without cube metrics',
    ),
    testCaseReportData,
]

describe('agentsPerformanceReportingService', () => {
    it.each(testCasesData)(
        'should call saveReport with $testName',
        ({ agents, data, summaryData, totalData, testName }) => {
            const fakeReport1 = 'someString'

            jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport1)

            const result = createAgentsReport(
                agents,
                data,
                summaryData,
                totalData,
                columnsOrder,
                rowsOrder,
                testName,
            )

            expect(result).toEqual({
                files: {
                    [testName]: fakeReport1,
                },
            })
        },
    )

    it('should return agent name', () => {
        const fakeReport1 = 'someString'
        const fileName = 'someFileName'
        const createCsvMock = jest
            .spyOn(files, 'createCsv')
            .mockReturnValue(fakeReport1)

        const { data, summaryData, totalData } = testCaseReportData
        createAgentsReport(
            agents,
            data,
            summaryData,
            totalData,
            columnsOrder,
            rowsOrder,
            fileName,
        )

        const firstAgentName = createCsvMock.mock.calls[0][0][1][0]

        expect(firstAgentName).toEqual(agents[0].name)
    })

    it('should return empty when no data', () => {
        const fileName = 'someFileName'

        const { summaryData, totalData } = testCaseReportData
        const result = createAgentsReport(
            agents,
            null,
            summaryData,
            totalData,
            columnsOrder,
            rowsOrder,
            fileName,
        )

        expect(result).toEqual({ files: {} })
    })

    it('should return empty when no summary data', () => {
        const fileName = 'someFileName'

        const { data, totalData } = testCaseReportData
        const result = createAgentsReport(
            agents,
            data,
            null,
            totalData,
            columnsOrder,
            rowsOrder,
            fileName,
        )

        expect(result).toEqual({ files: {} })
    })

    it('should return empty when no total data', () => {
        const fileName = 'someFileName'

        const { data, summaryData } = testCaseReportData
        const result = createAgentsReport(
            agents,
            data,
            summaryData,
            null,
            columnsOrder,
            rowsOrder,
            fileName,
        )

        expect(result).toEqual({ files: {} })
    })

    describe('aggregation rows', () => {
        it('should include average row when specified in rowsOrder', () => {
            const { agents, data, summaryData, totalData } = testCaseReportData
            const columnsOrder = [
                AgentsTableColumn.AgentName,
                AgentsTableColumn.ClosedTickets,
            ]
            const rowsOrder = [AgentsTableRow.Average]

            const result = getData(
                agents,
                data,
                summaryData,
                totalData,
                columnsOrder,
                rowsOrder,
            )

            expect(result[0]).toEqual(
                columnsOrder.map((col) => TableLabels[col]),
            )

            expect(result[1][0]).toEqual(SUMMARY_ROW_AGENT_COLUMN_LABEL)
            expect(result[1].length).toEqual(columnsOrder.length)
        })

        it('should include total row when specified in rowsOrder', () => {
            const { agents, data, summaryData, totalData } = testCaseReportData
            const columnsOrder = [
                AgentsTableColumn.AgentName,
                AgentsTableColumn.ClosedTickets,
                AgentsTableColumn.OnlineTime,
            ]
            const rowsOrder = [AgentsTableRow.Total]

            const result = getData(
                agents,
                data,
                summaryData,
                totalData,
                columnsOrder,
                rowsOrder,
            )

            expect(result[0]).toEqual(
                columnsOrder.map((col) => TableLabels[col]),
            )

            expect(result[1][0]).toEqual(TOTAL_ROW_AGENT_COLUMN_LABEL)
            expect(result[1][2]).toEqual(NOT_AVAILABLE_PLACEHOLDER)
            expect(result[1].length).toEqual(columnsOrder.length)
        })

        it('should include both average and total rows in the specified order', () => {
            const { agents, data, summaryData, totalData } = testCaseReportData
            const columnsOrder = [
                AgentsTableColumn.AgentName,
                AgentsTableColumn.ClosedTickets,
            ]
            const rowsOrder = [AgentsTableRow.Average, AgentsTableRow.Total]

            const result = getData(
                agents,
                data,
                summaryData,
                totalData,
                columnsOrder,
                rowsOrder,
            )

            expect(result[0]).toEqual(
                columnsOrder.map((col) => TableLabels[col]),
            )

            expect(result[1][0]).toEqual(SUMMARY_ROW_AGENT_COLUMN_LABEL)

            expect(result[2][0]).toEqual(TOTAL_ROW_AGENT_COLUMN_LABEL)

            expect(result.length).toEqual(4)
        })

        it('should calculate per-agent metrics correctly in average row', () => {
            const mockSummaryData = {
                ...baseMetricBuilder(reportDataWithCubeMetrics),
                closedTicketsMetric: {
                    data: { value: 100 },
                    isFetching: false,
                    isError: false,
                },
                onlineTimeMetric: {
                    data: { value: 500 },
                    isFetching: false,
                    isError: false,
                },
            }

            const multipleAgents = [
                ...agents,
                {
                    ...agents[0],
                    id: 456,
                    name: 'Jane Smith',
                },
            ]

            const columnsOrder = [
                AgentsTableColumn.AgentName,
                AgentsTableColumn.ClosedTickets,
                AgentsTableColumn.OnlineTime,
            ]

            const result = getData(
                multipleAgents,
                baseMetricBuilder(reportDataWithCubeMetrics),
                mockSummaryData,
                mockSummaryData,
                columnsOrder,
                [AgentsTableRow.Average],
            )

            expect(result[0]).toEqual(
                columnsOrder.map((col) => TableLabels[col]),
            )

            expect(result[1][0]).toEqual(SUMMARY_ROW_AGENT_COLUMN_LABEL)

            expect(
                mockSummaryData.onlineTimeMetric.data.value /
                    multipleAgents.length,
            ).toEqual(250)
        })
        it('should calculate per-agent MedianFirstResponseTime correctly', () => {
            const mockReportData = {
                value: 1,
                decile: 0,
                allData: [
                    {
                        [TicketDimension.AssigneeUserId]: '123',
                        [HelpdeskMessageMeasure.TicketCount]: '100500',
                    },
                ],
                dimensions: [TicketDimension.AssigneeUserId],
                measures: [HelpdeskMessageMeasure.TicketCount],
            }

            const mockMedianFirstResponseTimeData = {
                value: 1,
                decile: 0,
                allData: [
                    {
                        [TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId]:
                            '123',
                        [TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime]:
                            '300',
                    },
                ],
                dimensions: [
                    TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId,
                ],
                measures: [
                    TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime,
                ],
            }

            const {
                agents: testAgents,
                data,
                summaryData,
                totalData,
            } = reportDataFactory(
                agents,
                mockReportData,
                {
                    medianFirstResponseTimeMetric: {
                        data: { value: 300 },
                        isFetching: false,
                        isError: false,
                    },
                },
                'MedianFirstResponseTime',
            )

            // Override the medianFirstResponseTimeMetric data to use the mock data
            data.medianFirstResponseTimeMetric = buildQuery(
                false,
                mockMedianFirstResponseTimeData,
            )

            const columnsOrder = [
                AgentsTableColumn.AgentName,
                AgentsTableColumn.MedianFirstResponseTime,
            ]
            const rowsOrder: AgentsTableRow[] = []

            const result = getData(
                testAgents,
                data,
                summaryData,
                totalData,
                columnsOrder,
                rowsOrder,
            )

            expect(result[0]).toEqual(
                columnsOrder.map((col) => TableLabels[col]),
            )

            expect(result[1][0]).toEqual(testAgents[0].name)
            expect(result[1][1]).toBeDefined()
        })
    })

    describe('agent rows', () => {
        it('should generate rows for each agent with formatted metrics', () => {
            const mockReportData = {
                value: 1,
                decile: 0,
                allData: [
                    {
                        [TicketDimension.AssigneeUserId]: '123',
                        [HelpdeskMessageMeasure.TicketCount]: '50',
                    },
                ],
                dimensions: [TicketDimension.AssigneeUserId],
                measures: [HelpdeskMessageMeasure.TicketCount],
            }

            const {
                agents: testAgents,
                data,
                summaryData,
                totalData,
            } = reportDataFactory(agents, mockReportData)

            const columnsOrder = [
                AgentsTableColumn.AgentName,
                AgentsTableColumn.ClosedTickets,
            ]
            const rowsOrder: AgentsTableRow[] = []

            const result = getData(
                testAgents,
                data,
                summaryData,
                totalData,
                columnsOrder,
                rowsOrder,
            )

            // First row is headers
            expect(result[0]).toEqual(
                columnsOrder.map((col) => TableLabels[col]),
            )

            // Second row is the agent data
            expect(result[1][0]).toEqual(testAgents[0].name)
            expect(result[1][1]).toBe('50')
        })

        it('should handle multiple agents correctly', () => {
            const multipleAgents = [
                ...agents,
                {
                    ...agents[0],
                    id: 456,
                    name: 'Jane Smith',
                },
            ]

            const mockReportData = {
                value: 1,
                decile: 0,
                allData: [
                    {
                        [TicketDimension.AssigneeUserId]: '123',
                        [HelpdeskMessageMeasure.TicketCount]: '50',
                    },
                    {
                        [TicketDimension.AssigneeUserId]: '456',
                        [HelpdeskMessageMeasure.TicketCount]: '75',
                    },
                ],
                dimensions: [TicketDimension.AssigneeUserId],
                measures: [HelpdeskMessageMeasure.TicketCount],
            }

            const { data, summaryData, totalData } = reportDataFactory(
                multipleAgents,
                mockReportData,
            )

            const columnsOrder = [
                AgentsTableColumn.AgentName,
                AgentsTableColumn.ClosedTickets,
            ]
            const rowsOrder: AgentsTableRow[] = []

            const result = getData(
                multipleAgents,
                data,
                summaryData,
                totalData,
                columnsOrder,
                rowsOrder,
            )

            // Headers
            expect(result[0]).toEqual(
                columnsOrder.map((col) => TableLabels[col]),
            )

            // First agent row
            expect(result[1][0]).toEqual('John Doe')
            expect(result[1][1]).toBe('50')

            // Second agent row
            expect(result[2][0]).toEqual('Jane Smith')
            expect(result[2][1]).toBe('75')
        })
    })
})
