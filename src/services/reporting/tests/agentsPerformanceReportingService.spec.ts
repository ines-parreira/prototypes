import moment from 'moment'
import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {saveReport} from 'services/reporting/agentsPerformanceReportingService'
import {UserRole, UserSettingType, User} from 'config/types/user'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {HelpdeskMessageMeasure} from 'models/reporting/cubes/HelpdeskMessageCube'
import {Period} from '../automateOverviewReportingService'

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

const emptyAgents: User[] = []
const agents: User[] = [
    {
        name: 'John Doe',
        id: 123,
        firstname: 'John',
        lastname: 'Doe',
        email: 'johndoe@example.com',
        role: {name: UserRole.Admin},
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
                data: {available: false, show_macros: false},
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
})

const reportDataFactory = (
    reportData: any,
    agents: Parameters<typeof saveReport>[0]['agents'],
    period: Period,
    metricsOverride: Record<string, any> | undefined = {},
    testName: string | undefined = ''
) => {
    const baseMetrics = baseMetricBuilder(reportData)
    const data: Parameters<typeof saveReport>[0] = {
        agents,
        ...baseMetrics,
    }
    const summaryData: Parameters<typeof saveReport>[1] = {
        ...{...baseMetrics, ...metricsOverride},
    }

    return {data, summaryData, period, testName}
}

const testCasesData = [
    reportDataFactory(
        emptyReportData,
        emptyAgents,
        {
            start_datetime: '2023-06-07',
            end_datetime: '2023-06-14',
        },
        undefined,
        'Empty data'
    ),
    reportDataFactory(
        reportDataWithoutCubeMetrics,
        agents,
        {
            start_datetime: '2023-08-01',
            end_datetime: '2023-08-31',
        },
        undefined,
        'Report data without cube metrics'
    ),
    reportDataFactory(
        reportDataWithCubeMetrics,
        agents,
        {
            start_datetime: '2023-08-01',
            end_datetime: '2023-08-31',
        },
        {
            closedTicketsMetric: {data: null},
            ticketsRepliedMetric: {data: null},
            messagesSentMetric: {data: null},
            oneTouchTicketsMetric: {data: null},
        },
        'Report data with cube metrics'
    ),
]

describe('agentsPerformanceReportingService', () => {
    it.each(testCasesData)(
        'should call saveReport with $testName',
        async ({data, summaryData, period}) => {
            const fakeReport1 = 'someString'

            jest.spyOn(files, 'createCsv').mockReturnValue(fakeReport1)

            const zipperMock = jest.spyOn(files, 'saveZippedFiles')

            await saveReport(data, summaryData, period)

            expect(zipperMock).toHaveBeenCalledWith(
                {
                    [`${period.start_datetime}_${
                        period.end_datetime
                    }-agents-metrics-${moment().format(DATE_TIME_FORMAT)}.csv`]:
                        fakeReport1,
                },
                `${period.start_datetime}_${
                    period.end_datetime
                }-agents-metrics-${moment().format(DATE_TIME_FORMAT)}`
            )
        }
    )
})
