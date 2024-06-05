import moment from 'moment'

import * as files from 'utils/file'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {saveReport} from 'services/reporting/voiceAgentsReportingService'
import {
    MetricWithDecile,
    QueryReturnType,
} from 'hooks/reporting/useMetricPerDimension'
import {
    VoiceCallCube,
    VoiceCallDimension,
    VoiceCallMeasure,
} from 'models/reporting/cubes/VoiceCallCube'
import {User, UserRole, UserSettingType} from 'config/types/user'
import {
    VoiceEventsByAgentCube,
    VoiceEventsByAgentDimension,
    VoiceEventsByAgentMeasure,
} from 'models/reporting/cubes/VoiceEventsByAgent'
import {Metric} from 'hooks/reporting/metrics'

jest.mock('utils/file')

const emptyMetric: MetricWithDecile<VoiceCallCube | VoiceEventsByAgentCube> = {
    data: {
        value: null,
        decile: null,
        allData: [],
    },
    isError: false,
    isFetching: false,
}

const buildMetric = (
    allData: QueryReturnType<VoiceCallCube | VoiceEventsByAgentCube>
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
    role: {name: UserRole.Admin},
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
            data: {available: false, show_macros: false},
        },
    ],
    timezone: null,
    has_2fa_enabled: false,
}

const agent2: User = {
    name: 'Eve Green',
    id: 456,
    firstname: 'Even',
    lastname: 'Green',
    email: 'even.green@example.com',
    role: {name: UserRole.Agent},
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
            data: {available: false, show_macros: false},
        },
    ],
    timezone: null,
    has_2fa_enabled: false,
}

const testCaseData = [
    {
        testName: 'empty data should return empty report',
        period: {
            start_datetime: '2023-06-07',
            end_datetime: '2023-06-14',
        },
        data: {
            agents: [],
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
        period: {
            start_datetime: '2024-02-05',
            end_datetime: '2024-02-11',
        },
        data: {
            agents: [agent1, agent2],
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

describe('voiceAgentsPerformanceReportingService', () => {
    it.each(testCaseData)(
        'should call saveReport with $testName',
        async ({period, data, summaryData, expectedOutputData}) => {
            const fakeReport1 = 'csvFileContent'

            const createCsvMock = jest.spyOn(files, 'createCsv')
            createCsvMock.mockReturnValue(fakeReport1)

            const zipperMock = jest.spyOn(files, 'saveZippedFiles')

            await saveReport(data, summaryData, period)

            expect(zipperMock).toHaveBeenCalledWith(
                {
                    [`${period.start_datetime}_${
                        period.end_datetime
                    }-call-activity-per-agent-${moment().format(
                        DATE_TIME_FORMAT
                    )}.csv`]: fakeReport1,
                },
                `${period.start_datetime}_${
                    period.end_datetime
                }-call-activity-per-agent-${moment().format(DATE_TIME_FORMAT)}`
            )

            expect(createCsvMock).toHaveBeenCalledWith(expectedOutputData)
        }
    )
})
