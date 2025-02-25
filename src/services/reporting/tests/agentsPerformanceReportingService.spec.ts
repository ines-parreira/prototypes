import { User, UserRole, UserSettingType } from 'config/types/user'
import { Metric } from 'hooks/reporting/metrics'
import { HelpdeskMessageMeasure } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    AgentsPerformanceReportData,
    createAgentsReport,
    SUMMARY_ROW_AGENT_COLUMN_LABEL,
} from 'services/reporting/agentsPerformanceReportingService'
import { AgentsTableColumn } from 'state/ui/stats/types'
import * as files from 'utils/file'

jest.mock('utils/file')

const emptyReportData = {
    value: 1,
    decile: 0,
    allData: [],
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
}

const buildQuery = <T>(isFetching: boolean, data: T) => ({
    isFetching,
    data,
    isError: false,
})

const columnsOrder: AgentsTableColumn[] = Object.values(AgentsTableColumn)

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
    },
]

const baseMetricBuilder = (reportData: any) => ({
    closedTicketsMetric: buildQuery(false, reportData),
    customerSatisfactionMetric: buildQuery(false, reportData),
    medianFirstResponseTimeMetric: buildQuery(false, reportData),
    messagesSentMetric: buildQuery(false, reportData),
    percentageOfClosedTicketsMetric: buildQuery(false, reportData),
    medianResolutionTimeMetric: buildQuery(false, reportData),
    ticketsRepliedMetric: buildQuery(false, reportData),
    oneTouchTicketsMetric: buildQuery(false, reportData),
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
        ...{ ...baseMetrics, ...metricsOverride },
    }

    return { agents, data, summaryData, testName }
}

const testCasesData = [
    reportDataFactory(emptyAgents, emptyReportData, undefined, 'Empty data'),
    reportDataFactory(
        agents,
        reportDataWithoutCubeMetrics,
        undefined,
        'Report data without cube metrics',
    ),
    reportDataFactory(
        agents,
        reportDataWithCubeMetrics,
        {
            closedTicketsMetric: { data: null },
            ticketsRepliedMetric: { data: null },
            messagesSentMetric: { data: null },
            oneTouchTicketsMetric: { data: null },
        },
        'Report data with cube metrics',
    ),
]

describe('agentsPerformanceReportingService', () => {
    it.each(testCasesData)(
        'should call saveReport with $testName',
        ({ agents, data, summaryData, testName }) => {
            const fakeReport1 = 'someString'

            jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport1)

            const result = createAgentsReport(
                agents,
                data,
                summaryData,
                columnsOrder,
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
        const reportData = testCasesData.find(
            ({ testName }) => testName === 'Report data with cube metrics',
        )
        const fakeReport1 = 'someString'
        const fileName = 'someFileName'
        const createCsvMock = jest
            .spyOn(files, 'createCsv')
            .mockReturnValue(fakeReport1)

        if (reportData) {
            const { data, summaryData } = reportData
            createAgentsReport(
                agents,
                data,
                summaryData,
                columnsOrder,
                fileName,
            )
        }
        const summaryRowAgentLabel = createCsvMock.mock.calls[0][0][1][0]
        const firstAgentName = createCsvMock.mock.calls[0][0][2][0]

        expect(summaryRowAgentLabel).toEqual(SUMMARY_ROW_AGENT_COLUMN_LABEL)
        expect(firstAgentName).toEqual(agents[0].name)
    })

    it('should return empty when no data', () => {
        const reportData = testCasesData.find(
            ({ testName }) => testName === 'Report data with cube metrics',
        )
        const fileName = 'someFileName'

        if (reportData) {
            const { summaryData } = reportData
            const result = createAgentsReport(
                agents,
                null,
                summaryData,
                columnsOrder,
                fileName,
            )

            expect(result).toEqual({ files: {} })
        }
    })

    it('should return empty when no summary data', () => {
        const reportData = testCasesData.find(
            ({ testName }) => testName === 'Report data with cube metrics',
        )
        const fileName = 'someFileName'

        if (reportData) {
            const { data } = reportData
            const result = createAgentsReport(
                agents,
                data,
                null,
                columnsOrder,
                fileName,
            )

            expect(result).toEqual({ files: {} })
        }
    })
})
