import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { VoiceCallStatus } from '@gorgias/helpdesk-types'

import {
    VoiceCallDimension,
    VoiceCallMeasure,
    VoiceCallSegment,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import type { UsePostReportingQueryData } from 'domains/reporting/models/queries'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { voiceCallListQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import { voiceCallsCountAllDimensionsQueryFactoryV2 } from 'domains/reporting/models/scopes/voiceCalls'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    CALL_LIST_PAGE_SIZE,
    MAX_VOICE_CALLS_PAGE_NUMBER,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import {
    fetchVoiceCallList,
    fetchVoiceCallTableCsvData,
    selectVoiceCallData,
    useVoiceCallList,
} from 'domains/reporting/pages/voice/hooks/useVoiceCallList'
import type { VoiceCallStatListItem } from 'domains/reporting/pages/voice/models/types'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { VoiceCallDisplayStatus } from 'models/voiceCall/types'

jest.mock('domains/reporting/models/queries')
const usePostReportingV2Mock = assumeMock(usePostReportingV2)
const fetchPostReportingV2Mock = assumeMock(fetchPostReportingV2)

describe('useVoiceCallList', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    it('should usePostReporting with query and select', () => {
        renderHook(() => useVoiceCallList(statsFilters, 'UTC'))

        expect(usePostReportingV2Mock.mock.calls[0]).toEqual([
            [
                voiceCallListQueryFactory(
                    statsFilters,
                    'UTC',
                    undefined,
                    CALL_LIST_PAGE_SIZE,
                    0,
                    VoiceCallDimension.CreatedAt,
                    OrderDirection.Desc,
                ),
            ],
            voiceCallsCountAllDimensionsQueryFactoryV2(
                {
                    filters: statsFilters,
                    timezone: 'UTC',
                    offset: 0,
                    limit: CALL_LIST_PAGE_SIZE,
                    total: false,
                    sortDirection: OrderDirection.Desc,
                    sortBy: 'createdDatetime',
                },
                undefined,
            ),
            {
                select: selectVoiceCallData,
            },
        ])
    })

    it('should usePostReporting with order and sorting', () => {
        renderHook(() =>
            useVoiceCallList(
                statsFilters,
                'UTC',
                1,
                5,
                undefined,
                VoiceCallDimension.Duration,
                OrderDirection.Desc,
            ),
        )

        expect(usePostReportingV2Mock.mock.calls[0]).toEqual([
            [
                voiceCallListQueryFactory(
                    statsFilters,
                    'UTC',
                    undefined,
                    5,
                    0,
                    VoiceCallDimension.Duration,
                    OrderDirection.Desc,
                ),
            ],
            voiceCallsCountAllDimensionsQueryFactoryV2(
                {
                    filters: statsFilters,
                    timezone: 'UTC',
                    offset: 0,
                    limit: 5,
                    total: false,
                    sortDirection: OrderDirection.Desc,
                    sortBy: 'duration',
                },
                undefined,
            ),
            {
                select: selectVoiceCallData,
            },
        ])
    })

    it('should usePostReporting with correct pagination', () => {
        renderHook(() => useVoiceCallList(statsFilters, 'UTC', 3, 5))

        expect(usePostReportingV2Mock.mock.calls[0]).toEqual([
            [
                voiceCallListQueryFactory(
                    statsFilters,
                    'UTC',
                    undefined,
                    5,
                    10,
                    VoiceCallDimension.CreatedAt,
                    OrderDirection.Desc,
                ),
            ],
            voiceCallsCountAllDimensionsQueryFactoryV2(
                {
                    filters: statsFilters,
                    timezone: 'UTC',
                    offset: 10,
                    limit: 5,
                    total: false,
                    sortDirection: OrderDirection.Desc,
                    sortBy: 'createdDatetime',
                },
                undefined,
            ),
            {
                select: selectVoiceCallData,
            },
        ])
    })

    it('should select voice call data correctly', () => {
        const mockedResponse = {
            data: {
                data: [
                    {
                        [VoiceCallDimension.AgentId]: '11',
                        [VoiceCallDimension.CustomerId]: '101',
                        [VoiceCallDimension.Direction]: 'inbound',
                        [VoiceCallDimension.IntegrationId]: '1',
                        [VoiceCallDimension.CreatedAt]: 'string',
                        [VoiceCallDimension.Status]: VoiceCallStatus.Answered,
                        [VoiceCallDimension.Duration]: '0',
                        [VoiceCallDimension.TicketId]: '123',
                        [VoiceCallDimension.PhoneNumberDestination]:
                            '+123456789',
                        [VoiceCallDimension.PhoneNumberSource]: '+123456788',
                        [VoiceCallMeasure.VoiceCallCount]: '1',
                        [VoiceCallDimension.TalkTime]: '12',
                        [VoiceCallDimension.WaitTime]: '65',
                        [VoiceCallDimension.VoicemailAvailable]: true,
                        [VoiceCallDimension.VoicemailUrl]: 'test-voicemail',
                        [VoiceCallDimension.CallRecordingAvailable]: true,
                        [VoiceCallDimension.CallRecordingUrl]: 'test-recording',
                        [VoiceCallDimension.DisplayStatus]:
                            VoiceCallDisplayStatus.Answered,
                        [VoiceCallDimension.QueueId]: '23',
                        [VoiceCallDimension.QueueName]: 'Test Queue',
                        [VoiceCallDimension.CallSlaStatus]: '0',
                    },
                ],
            },
        } as UsePostReportingQueryData<VoiceCallStatListItem[]>
        const result = selectVoiceCallData(mockedResponse)

        expect(result).toEqual([
            {
                agentId: 11,
                customerId: 101,
                direction: 'inbound',
                integrationId: 1,
                createdAt: 'string',
                status: VoiceCallStatus.Answered,
                duration: 0,
                ticketId: 123,
                phoneNumberDestination: '+123456789',
                phoneNumberSource: '+123456788',
                talkTime: 12,
                waitTime: 65,
                voicemailAvailable: true,
                voicemailUrl: 'test-voicemail',
                callRecordingAvailable: true,
                callRecordingUrl: 'test-recording',
                displayStatus: VoiceCallDisplayStatus.Answered,
                queueId: 23,
                queueName: 'Test Queue',
                callSid: 'undefined',
                callSlaStatus: '0',
            },
        ])
    })

    it('should select voice call data with null values', () => {
        const mockedResponse = {
            data: {
                data: [
                    {
                        [VoiceCallDimension.AgentId]: null,
                        [VoiceCallDimension.CustomerId]: null,
                        [VoiceCallDimension.Direction]: 'inbound',
                        [VoiceCallDimension.IntegrationId]: null,
                        [VoiceCallDimension.CreatedAt]: 'string',
                        [VoiceCallDimension.Status]: VoiceCallStatus.Answered,
                        [VoiceCallDimension.Duration]: null,
                        [VoiceCallDimension.TicketId]: null,
                        [VoiceCallDimension.PhoneNumberDestination]: 'test',
                        [VoiceCallDimension.PhoneNumberSource]: 'test',
                        [VoiceCallMeasure.VoiceCallCount]: '1',
                        [VoiceCallDimension.TalkTime]: null,
                        [VoiceCallDimension.WaitTime]: null,
                        [VoiceCallDimension.VoicemailAvailable]: null,
                        [VoiceCallDimension.VoicemailUrl]: null,
                        [VoiceCallDimension.CallRecordingAvailable]: null,
                        [VoiceCallDimension.CallRecordingUrl]: null,
                        [VoiceCallDimension.DisplayStatus]:
                            VoiceCallDisplayStatus.Answered,
                        [VoiceCallDimension.QueueId]: null,
                        [VoiceCallDimension.QueueName]: null,
                        [VoiceCallDimension.CallSlaStatus]: null,
                    },
                ],
            },
        } as UsePostReportingQueryData<VoiceCallStatListItem[]>
        const result = selectVoiceCallData(mockedResponse)

        expect(result).toEqual([
            {
                agentId: null,
                customerId: null,
                direction: 'inbound',
                integrationId: null,
                createdAt: 'string',
                status: VoiceCallStatus.Answered,
                duration: null,
                ticketId: null,
                phoneNumberDestination: 'test',
                phoneNumberSource: 'test',
                talkTime: null,
                waitTime: null,
                voicemailAvailable: null,
                voicemailUrl: null,
                callRecordingAvailable: null,
                callRecordingUrl: null,
                displayStatus: VoiceCallDisplayStatus.Answered,
                queueId: null,
                queueName: null,
                callSid: 'undefined',
                callSlaStatus: null,
            },
        ])
    })

    it('should select voice call data with alternative key names (V2 format)', () => {
        const mockedResponse = {
            data: {
                data: [
                    {
                        agentId: '42',
                        customerId: '500',
                        callDirection: 'outbound',
                        integrationId: '5',
                        createdDatetime: '2025-12-10T10:00:00Z',
                        status: VoiceCallStatus.Missed,
                        duration: '120',
                        ticketId: '999',
                        destination: '+9876543210',
                        source: '+1234567890',
                        talkTime: '90',
                        waitTime: '30',
                        voicemailAvailable: false,
                        voicemailUrl: 'voicemail-url',
                        callRecordingAvailable: false,
                        callRecordingUrl: 'recording-url',
                        displayStatus: VoiceCallDisplayStatus.Missed,
                        queueId: '7',
                        queueName: 'Support Queue',
                        callSlaStatus: '1',
                    },
                ],
                annotation: {
                    title: 'Voice Calls',
                    shortTitle: 'Calls',
                    type: 'list',
                },
                query: {
                    dimensions: [],
                    measures: [],
                    filters: [],
                },
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
        } as unknown as UsePostReportingQueryData<VoiceCallStatListItem[]>
        const result = selectVoiceCallData(mockedResponse)

        expect(result).toEqual([
            {
                agentId: 42,
                customerId: 500,
                direction: 'outbound',
                integrationId: 5,
                createdAt: '2025-12-10T10:00:00Z',
                status: VoiceCallStatus.Missed,
                duration: 120,
                ticketId: 999,
                phoneNumberDestination: '+9876543210',
                phoneNumberSource: '+1234567890',
                talkTime: 90,
                waitTime: 30,
                voicemailAvailable: false,
                voicemailUrl: 'voicemail-url',
                callRecordingAvailable: false,
                callRecordingUrl: 'recording-url',
                displayStatus: VoiceCallDisplayStatus.Missed,
                queueId: 7,
                queueName: 'Support Queue',
                callSid: 'undefined',
                callSlaStatus: '1',
            },
        ])
    })

    it('should select callSlaStatus from V1 format (VoiceCallDimension key)', () => {
        const mockedResponse = {
            data: {
                data: [
                    {
                        [VoiceCallDimension.CallSlaStatus]: '0',
                        [VoiceCallDimension.AgentId]: '10',
                        [VoiceCallDimension.CustomerId]: '100',
                        [VoiceCallDimension.Direction]: 'inbound',
                        [VoiceCallDimension.IntegrationId]: '1',
                        [VoiceCallDimension.CreatedAt]: '2025-01-15T10:00:00Z',
                        [VoiceCallDimension.Status]: VoiceCallStatus.Answered,
                        [VoiceCallDimension.Duration]: '100',
                        [VoiceCallDimension.TicketId]: '123',
                        [VoiceCallDimension.PhoneNumberDestination]:
                            '+123456789',
                        [VoiceCallDimension.PhoneNumberSource]: '+987654321',
                        [VoiceCallMeasure.VoiceCallCount]: '1',
                        [VoiceCallDimension.TalkTime]: '90',
                        [VoiceCallDimension.WaitTime]: '10',
                        [VoiceCallDimension.VoicemailAvailable]: false,
                        [VoiceCallDimension.VoicemailUrl]: null,
                        [VoiceCallDimension.CallRecordingAvailable]: true,
                        [VoiceCallDimension.CallRecordingUrl]: 'url',
                        [VoiceCallDimension.DisplayStatus]:
                            VoiceCallDisplayStatus.Answered,
                        [VoiceCallDimension.QueueId]: '5',
                        [VoiceCallDimension.QueueName]: 'Queue',
                    },
                ],
            },
        } as UsePostReportingQueryData<VoiceCallStatListItem[]>

        const result = selectVoiceCallData(mockedResponse)

        expect(result[0].callSlaStatus).toBe('0')
    })

    it('should select callSlaStatus from V2 format (callSlaStatus key)', () => {
        const mockedResponse = {
            data: {
                data: [
                    {
                        callSlaStatus: '1',
                        agentId: '10',
                        customerId: '100',
                        callDirection: 'inbound',
                        integrationId: '1',
                        createdDatetime: '2025-01-15T10:00:00Z',
                        status: VoiceCallStatus.Answered,
                        duration: '100',
                        ticketId: '123',
                        destination: '+123456789',
                        source: '+987654321',
                        talkTime: '90',
                        waitTime: '10',
                        voicemailAvailable: false,
                        voicemailUrl: null,
                        callRecordingAvailable: true,
                        callRecordingUrl: 'url',
                        displayStatus: VoiceCallDisplayStatus.Answered,
                        queueId: '5',
                        queueName: 'Queue',
                    },
                ],
                annotation: {
                    title: 'Voice Calls',
                    shortTitle: 'Calls',
                    type: 'list',
                },
                query: {
                    dimensions: [],
                    measures: [],
                    filters: [],
                },
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any,
        } as unknown as UsePostReportingQueryData<VoiceCallStatListItem[]>

        const result = selectVoiceCallData(mockedResponse)

        expect(result[0].callSlaStatus).toBe('1')
    })
})

describe('useVoiceCallList with additional parameters', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    beforeEach(() => {
        usePostReportingV2Mock.mockClear()
    })

    it('should include segment parameter in both V1 and V2 queries', () => {
        const segment = VoiceCallSegment.outboundCalls

        renderHook(() =>
            useVoiceCallList(
                statsFilters,
                'UTC',
                1,
                CALL_LIST_PAGE_SIZE,
                segment,
            ),
        )

        const [v1Queries, v2Query] = usePostReportingV2Mock.mock.calls[0]

        expect(v1Queries![0]).toEqual(
            voiceCallListQueryFactory(
                statsFilters,
                'UTC',
                segment,
                CALL_LIST_PAGE_SIZE,
                0,
                VoiceCallDimension.CreatedAt,
                OrderDirection.Desc,
            ),
        )
        expect(v2Query).toEqual(
            voiceCallsCountAllDimensionsQueryFactoryV2(
                {
                    filters: statsFilters,
                    timezone: 'UTC',
                    offset: 0,
                    limit: CALL_LIST_PAGE_SIZE,
                    total: false,
                    sortDirection: OrderDirection.Desc,
                    sortBy: 'createdDatetime',
                },
                segment,
            ),
        )
    })

    it('should include statusFilter in V2 query filters with logical operator', () => {
        const statusFilter = [
            VoiceCallDisplayStatus.Answered,
            VoiceCallDisplayStatus.Missed,
        ]

        renderHook(() =>
            useVoiceCallList(
                statsFilters,
                'UTC',
                1,
                CALL_LIST_PAGE_SIZE,
                undefined,
                undefined,
                undefined,
                statusFilter,
            ),
        )

        const [v1Queries, v2Query] = usePostReportingV2Mock.mock.calls[0]

        // V1 query should include statusFilter
        expect(v1Queries![0]).toEqual(
            voiceCallListQueryFactory(
                statsFilters,
                'UTC',
                undefined,
                CALL_LIST_PAGE_SIZE,
                0,
                undefined,
                undefined,
                statusFilter,
            ),
        )

        // V2 query should contain a displayStatus filter with multiple values
        expect(v2Query!.filters).toContainEqual({
            member: 'displayStatus',
            operator: 'one-of',
            values: statusFilter,
        })
    })

    it('should map CreatedAt dimension to createdDatetime in sortBy', () => {
        renderHook(() =>
            useVoiceCallList(
                statsFilters,
                'UTC',
                1,
                CALL_LIST_PAGE_SIZE,
                undefined,
                VoiceCallDimension.CreatedAt,
                OrderDirection.Asc,
            ),
        )

        const [, v2Query] = usePostReportingV2Mock.mock.calls[0]

        expect(v2Query).toEqual(
            voiceCallsCountAllDimensionsQueryFactoryV2(
                {
                    filters: statsFilters,
                    timezone: 'UTC',
                    offset: 0,
                    limit: CALL_LIST_PAGE_SIZE,
                    total: false,
                    sortDirection: OrderDirection.Asc,
                    sortBy: 'createdDatetime',
                },
                undefined,
            ),
        )
    })

    it('should map WaitTime dimension to waitTime in sortBy', () => {
        renderHook(() =>
            useVoiceCallList(
                statsFilters,
                'UTC',
                1,
                CALL_LIST_PAGE_SIZE,
                undefined,
                VoiceCallDimension.WaitTime,
                OrderDirection.Desc,
            ),
        )

        const [, v2Query] = usePostReportingV2Mock.mock.calls[0]

        expect(v2Query).toEqual(
            voiceCallsCountAllDimensionsQueryFactoryV2(
                {
                    filters: statsFilters,
                    timezone: 'UTC',
                    offset: 0,
                    limit: CALL_LIST_PAGE_SIZE,
                    total: false,
                    sortDirection: OrderDirection.Desc,
                    sortBy: 'waitTime',
                },
                undefined,
            ),
        )
    })

    it('should map DisplayStatus dimension to displayStatus in sortBy', () => {
        renderHook(() =>
            useVoiceCallList(
                statsFilters,
                'UTC',
                1,
                CALL_LIST_PAGE_SIZE,
                undefined,
                VoiceCallDimension.DisplayStatus,
                OrderDirection.Asc,
            ),
        )

        const [, v2Query] = usePostReportingV2Mock.mock.calls[0]

        expect(v2Query).toEqual(
            voiceCallsCountAllDimensionsQueryFactoryV2(
                {
                    filters: statsFilters,
                    timezone: 'UTC',
                    offset: 0,
                    limit: CALL_LIST_PAGE_SIZE,
                    total: false,
                    sortDirection: OrderDirection.Asc,
                    sortBy: 'displayStatus',
                },
                undefined,
            ),
        )
    })

    it('should return undefined sortBy for unmapped dimensions', () => {
        renderHook(() =>
            useVoiceCallList(
                statsFilters,
                'UTC',
                1,
                CALL_LIST_PAGE_SIZE,
                undefined,
                VoiceCallDimension.AgentId,
                OrderDirection.Desc,
            ),
        )

        const [, v2Query] = usePostReportingV2Mock.mock.calls[0]

        expect(v2Query).toEqual(
            voiceCallsCountAllDimensionsQueryFactoryV2(
                {
                    filters: statsFilters,
                    timezone: 'UTC',
                    offset: 0,
                    limit: CALL_LIST_PAGE_SIZE,
                    total: false,
                    sortDirection: OrderDirection.Desc,
                    sortBy: undefined,
                },
                undefined,
            ),
        )
    })

    it('should handle statusFilter with segment and order together', () => {
        const statusFilter = [VoiceCallDisplayStatus.Answered]
        const segment = VoiceCallSegment.inboundCalls

        renderHook(() =>
            useVoiceCallList(
                statsFilters,
                'UTC',
                2,
                10,
                segment,
                VoiceCallDimension.Duration,
                OrderDirection.Asc,
                statusFilter,
            ),
        )

        const [v1Queries, v2Query] = usePostReportingV2Mock.mock.calls[0]

        // V1 query should include all parameters
        expect(v1Queries![0]).toEqual(
            voiceCallListQueryFactory(
                statsFilters,
                'UTC',
                segment,
                10,
                10,
                VoiceCallDimension.Duration,
                OrderDirection.Asc,
                statusFilter,
            ),
        )

        // V2 query should include both statusFilter and segment filters
        expect(v2Query!.filters).toContainEqual({
            member: 'displayStatus',
            operator: 'one-of',
            values: statusFilter,
        })
        expect(v2Query!.filters).toContainEqual({
            member: 'callDirection',
            operator: 'one-of',
            values: ['inbound'],
        })
    })
})

describe('fetchVoiceCallList', () => {
    const FULL_LIST_LIMIT = MAX_VOICE_CALLS_PAGE_NUMBER * CALL_LIST_PAGE_SIZE

    const statsFilters: StatsFilters = {
        period: {
            end_datetime: formatReportingQueryDate(moment()),
            start_datetime: formatReportingQueryDate(moment()),
        },
    }

    beforeEach(() => {
        fetchPostReportingV2Mock.mockResolvedValue({
            data: { data: [] },
        } as unknown as UsePostReportingQueryData<VoiceCallStatListItem[]>)
    })

    afterEach(() => {
        fetchPostReportingV2Mock.mockClear()
    })

    it('should call fetchPostReportingV2 with the full limit and offset 0', async () => {
        await fetchVoiceCallList(statsFilters, 'UTC')

        expect(fetchPostReportingV2Mock.mock.calls[0]).toEqual([
            [
                voiceCallListQueryFactory(
                    statsFilters,
                    'UTC',
                    undefined,
                    FULL_LIST_LIMIT,
                    0,
                    undefined,
                    undefined,
                    undefined,
                ),
            ],
            voiceCallsCountAllDimensionsQueryFactoryV2(
                {
                    filters: statsFilters,
                    timezone: 'UTC',
                    offset: 0,
                    limit: FULL_LIST_LIMIT,
                    total: false,
                },
                undefined,
            ),
        ])
    })

    it('should pass segment to both queries', async () => {
        await fetchVoiceCallList(
            statsFilters,
            'UTC',
            VoiceCallSegment.inboundCalls,
        )

        const [v1Queries, v2Query] = fetchPostReportingV2Mock.mock.calls[0]

        expect(v1Queries![0]).toEqual(
            voiceCallListQueryFactory(
                statsFilters,
                'UTC',
                VoiceCallSegment.inboundCalls,
                FULL_LIST_LIMIT,
                0,
            ),
        )
        expect(v2Query!.filters).toContainEqual({
            member: 'callDirection',
            operator: 'one-of',
            values: ['inbound'],
        })
    })

    it('should pass statusFilter to both queries', async () => {
        const statusFilter = [VoiceCallDisplayStatus.Missed]

        await fetchVoiceCallList(statsFilters, 'UTC', undefined, statusFilter)

        const [v1Queries, v2Query] = fetchPostReportingV2Mock.mock.calls[0]

        expect(v1Queries![0]).toEqual(
            voiceCallListQueryFactory(
                statsFilters,
                'UTC',
                undefined,
                FULL_LIST_LIMIT,
                0,
                undefined,
                undefined,
                statusFilter,
            ),
        )
        expect(v2Query!.filters).toContainEqual({
            member: 'displayStatus',
            operator: 'one-of',
            values: statusFilter,
        })
    })

    it('should return transformed VoiceCallSummary rows', async () => {
        fetchPostReportingV2Mock.mockResolvedValue({
            data: {
                data: [
                    {
                        [VoiceCallDimension.AgentId]: '7',
                        [VoiceCallDimension.CustomerId]: '42',
                        [VoiceCallDimension.Direction]: 'inbound',
                        [VoiceCallDimension.IntegrationId]: '3',
                        [VoiceCallDimension.CreatedAt]: '2025-01-15T10:00:00Z',
                        [VoiceCallDimension.Status]: VoiceCallStatus.Answered,
                        [VoiceCallDimension.Duration]: '90',
                        [VoiceCallDimension.TicketId]: '555',
                        [VoiceCallDimension.PhoneNumberDestination]:
                            '+10001112222',
                        [VoiceCallDimension.PhoneNumberSource]: '+19998887777',
                        [VoiceCallMeasure.VoiceCallCount]: '1',
                        [VoiceCallDimension.TalkTime]: '75',
                        [VoiceCallDimension.WaitTime]: '15',
                        [VoiceCallDimension.VoicemailAvailable]: false,
                        [VoiceCallDimension.VoicemailUrl]: null,
                        [VoiceCallDimension.CallRecordingAvailable]: true,
                        [VoiceCallDimension.CallRecordingUrl]: 'rec-url',
                        [VoiceCallDimension.DisplayStatus]:
                            VoiceCallDisplayStatus.Answered,
                        [VoiceCallDimension.QueueId]: '2',
                        [VoiceCallDimension.QueueName]: 'Support',
                        [VoiceCallDimension.CallSlaStatus]: '0',
                    },
                ],
            },
        } as unknown as UsePostReportingQueryData<VoiceCallStatListItem[]>)

        const result = await fetchVoiceCallList(statsFilters, 'UTC')

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
            agentId: 7,
            integrationId: 3,
            duration: 90,
            ticketId: 555,
            callSlaStatus: '0',
        })
    })
})

describe('fetchVoiceCallTableCsvData', () => {
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: '2025-01-15T23:59:59',
            start_datetime: '2025-01-01T00:00:00',
        },
    }

    const mockIntegrations = [
        { id: 1, name: 'Support Phone' },
        { id: 2, name: 'Sales Phone' },
    ]

    const context = {
        integrations: mockIntegrations as any,
    }

    const mockRow = {
        [VoiceCallDimension.AgentId]: '1',
        [VoiceCallDimension.CustomerId]: '10',
        [VoiceCallDimension.Direction]: 'inbound',
        [VoiceCallDimension.IntegrationId]: '1',
        [VoiceCallDimension.CreatedAt]: '2025-01-10T14:30:00.000',
        [VoiceCallDimension.Status]: VoiceCallStatus.Answered,
        [VoiceCallDimension.Duration]: '125',
        [VoiceCallDimension.TicketId]: '999',
        [VoiceCallDimension.PhoneNumberDestination]: '+10001112222',
        [VoiceCallDimension.PhoneNumberSource]: '+33612345678',
        [VoiceCallMeasure.VoiceCallCount]: '1',
        [VoiceCallDimension.TalkTime]: '110',
        [VoiceCallDimension.WaitTime]: '15',
        [VoiceCallDimension.VoicemailAvailable]: false,
        [VoiceCallDimension.VoicemailUrl]: null,
        [VoiceCallDimension.CallRecordingAvailable]: false,
        [VoiceCallDimension.CallRecordingUrl]: null,
        [VoiceCallDimension.DisplayStatus]: VoiceCallDisplayStatus.Answered,
        [VoiceCallDimension.QueueId]: '5',
        [VoiceCallDimension.QueueName]: 'Test Queue',
        [VoiceCallDimension.CallSlaStatus]: '0',
    }

    beforeEach(() => {
        fetchPostReportingV2Mock.mockResolvedValue({
            data: { data: [mockRow] },
        } as unknown as UsePostReportingQueryData<VoiceCallStatListItem[]>)
    })

    afterEach(() => {
        fetchPostReportingV2Mock.mockClear()
    })

    it('should return CSV with correct headers', async () => {
        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        const firstLine = Object.values(result.files)[0]!.split('\r\n')[0]
        expect(firstLine).toBe(
            '"Phone number source","Phone number destination","Agent ID","Customer ID","Direction","Integration","Queue","Date","SLA status","State","Duration","Wait time","Ticket ID"',
        )
    })

    it('should format the date column as YYYY-MM-DD HH:mm:ss', async () => {
        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        expect(Object.values(result.files)[0]!).toContain(
            '"2025-01-10 14:30:00"',
        )
    })

    it('should resolve integration name from context', async () => {
        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        const csv = Object.values(result.files)[0]!
        expect(csv).toContain('"Support Phone"')
    })

    it('should use empty string when integration is not found', async () => {
        fetchPostReportingV2Mock.mockResolvedValue({
            data: {
                data: [
                    { ...mockRow, [VoiceCallDimension.IntegrationId]: '99' },
                ],
            },
        } as unknown as UsePostReportingQueryData<VoiceCallStatListItem[]>)

        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        expect(Object.values(result.files)[0]!).toContain('""')
    })

    it('should format SLA status 0 as Achieved', async () => {
        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        const csv = Object.values(result.files)[0]!
        expect(csv).toContain('"Achieved"')
    })

    it('should format SLA status 1 as Breached', async () => {
        fetchPostReportingV2Mock.mockResolvedValue({
            data: {
                data: [{ ...mockRow, [VoiceCallDimension.CallSlaStatus]: '1' }],
            },
        } as unknown as UsePostReportingQueryData<VoiceCallStatListItem[]>)

        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        const csv = Object.values(result.files)[0]!
        expect(csv).toContain('"Breached"')
    })

    it('should format null SLA status as -', async () => {
        fetchPostReportingV2Mock.mockResolvedValue({
            data: {
                data: [
                    { ...mockRow, [VoiceCallDimension.CallSlaStatus]: null },
                ],
            },
        } as unknown as UsePostReportingQueryData<VoiceCallStatListItem[]>)

        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        const csv = Object.values(result.files)[0]!
        expect(csv).toContain('"-"')
    })

    it('should format duration in seconds', async () => {
        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        const csv = Object.values(result.files)[0]!
        expect(csv).toContain('"2m 5s"')
    })

    it('should format null duration as -', async () => {
        fetchPostReportingV2Mock.mockResolvedValue({
            data: {
                data: [{ ...mockRow, [VoiceCallDimension.Duration]: null }],
            },
        } as unknown as UsePostReportingQueryData<VoiceCallStatListItem[]>)

        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        expect(Object.values(result.files)[0]!).toContain('"-"')
    })

    it('should return empty files on fetch error', async () => {
        fetchPostReportingV2Mock.mockRejectedValue(new Error('network error'))

        const result = await fetchVoiceCallTableCsvData(
            statsFilters,
            'UTC',
            'day' as any,
            context,
        )

        expect(result.files).toEqual({})
        expect(result.isLoading).toBe(false)
    })
})
