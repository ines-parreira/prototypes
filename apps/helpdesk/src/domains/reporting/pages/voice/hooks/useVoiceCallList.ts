import { formatPhoneNumberInternational } from '@repo/tickets'
import { formatDatetime } from '@repo/utils'

import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import type { VoiceCallSegment } from 'domains/reporting/models/cubes/VoiceCallCube'
import { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { UsePostReportingQueryData } from 'domains/reporting/models/queries'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { voiceCallListQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import {
    mapVoiceCallDirectionToScopeOrder,
    voiceCallsCountAllDimensionsQueryFactoryV2,
} from 'domains/reporting/models/scopes/voiceCalls'
import type {
    AggregationWindow,
    StatsFilters,
} from 'domains/reporting/models/stat/types'
import { APIOnlyFilterKey } from 'domains/reporting/models/stat/types'
import {
    CALL_LIST_PAGE_SIZE,
    MAX_VOICE_CALLS_PAGE_NUMBER,
    VOICE_CALL_LIST_FILE_NAME,
} from 'domains/reporting/pages/voice/constants/voiceOverview'
import type {
    VoiceCallStatListItem,
    VoiceCallSummary,
} from 'domains/reporting/pages/voice/models/types'
import { OrderDirection } from 'models/api/types'
import type { Integration } from 'models/integration/types'
import type { VoiceCallDisplayStatus } from 'models/voiceCall/types'
import {
    formatSlaStatus,
    getFormattedDurationEndedCall,
} from 'models/voiceCall/utils'
import { createCsv } from 'utils/file'

export const useVoiceCallList = (
    filters: StatsFilters,
    timezone: string,
    page = 1,
    perPage = CALL_LIST_PAGE_SIZE,
    segment?: VoiceCallSegment,
    order: VoiceCallDimension = VoiceCallDimension.CreatedAt,
    sorting: OrderDirection = OrderDirection.Desc,
    statusFilter?: VoiceCallDisplayStatus[],
) =>
    usePostReportingV2(
        [
            voiceCallListQueryFactory(
                filters,
                timezone,
                segment,
                perPage,
                (page - 1) * perPage,
                order,
                sorting,
                statusFilter,
            ),
        ],
        voiceCallsCountAllDimensionsQueryFactoryV2(
            {
                filters: {
                    ...filters,
                    ...(statusFilter
                        ? {
                              [APIOnlyFilterKey.DisplayStatus]:
                                  withLogicalOperator(statusFilter),
                          }
                        : {}),
                },
                timezone,
                offset: (page - 1) * perPage,
                limit: perPage,
                // TODO(new-stats-api): when we fully migrate to V2, refactor to use total from here
                total: false,
                sortDirection: sorting,
                sortBy: mapVoiceCallDirectionToScopeOrder(order),
            },
            segment,
        ),
        {
            select: selectVoiceCallData,
        },
    )

export const selectVoiceCallData = (
    results: UsePostReportingQueryData<VoiceCallStatListItem[]>,
): VoiceCallSummary[] => {
    const parseNullableInteger = (value: string | null) =>
        value ? parseInt(value) : null

    return results.data.data.map((row: VoiceCallStatListItem) => ({
        agentId: parseNullableInteger(
            VoiceCallDimension.AgentId in row
                ? row[VoiceCallDimension.AgentId]
                : row['agentId'],
        ),
        customerId: parseNullableInteger(
            VoiceCallDimension.CustomerId in row
                ? row[VoiceCallDimension.CustomerId]
                : row['customerId'],
        ),
        direction:
            VoiceCallDimension.Direction in row
                ? row[VoiceCallDimension.Direction]
                : row['callDirection'],
        integrationId: parseNullableInteger(
            VoiceCallDimension.IntegrationId in row
                ? row[VoiceCallDimension.IntegrationId]
                : row['integrationId'],
        ),
        createdAt:
            VoiceCallDimension.CreatedAt in row
                ? row[VoiceCallDimension.CreatedAt]
                : row['createdDatetime'],
        status:
            VoiceCallDimension.Status in row
                ? row[VoiceCallDimension.Status]
                : row['status'],
        duration:
            VoiceCallDimension.Duration in row
                ? parseNullableInteger(row[VoiceCallDimension.Duration])
                : parseNullableInteger(row['duration']),
        ticketId:
            VoiceCallDimension.TicketId in row
                ? parseNullableInteger(row[VoiceCallDimension.TicketId])
                : parseNullableInteger(row['ticketId']),
        phoneNumberDestination:
            VoiceCallDimension.PhoneNumberDestination in row
                ? row[VoiceCallDimension.PhoneNumberDestination]
                : row['destination'],
        phoneNumberSource:
            VoiceCallDimension.PhoneNumberSource in row
                ? row[VoiceCallDimension.PhoneNumberSource]
                : row['source'],
        talkTime: parseNullableInteger(
            VoiceCallDimension.TalkTime in row
                ? row[VoiceCallDimension.TalkTime]
                : row['talkTime'],
        ),
        waitTime: parseNullableInteger(
            VoiceCallDimension.WaitTime in row
                ? row[VoiceCallDimension.WaitTime]
                : row['waitTime'],
        ),
        voicemailAvailable:
            VoiceCallDimension.VoicemailAvailable in row
                ? row[VoiceCallDimension.VoicemailAvailable]
                : row['voicemailAvailable'],
        voicemailUrl:
            VoiceCallDimension.VoicemailUrl in row
                ? row[VoiceCallDimension.VoicemailUrl]
                : row['voicemailUrl'],
        callRecordingAvailable:
            VoiceCallDimension.CallRecordingAvailable in row
                ? row[VoiceCallDimension.CallRecordingAvailable]
                : row['callRecordingAvailable'],
        callRecordingUrl:
            VoiceCallDimension.CallRecordingUrl in row
                ? row[VoiceCallDimension.CallRecordingUrl]
                : row['callRecordingUrl'],
        displayStatus:
            VoiceCallDimension.DisplayStatus in row
                ? row[VoiceCallDimension.DisplayStatus]
                : row['displayStatus'],
        queueId: parseNullableInteger(
            VoiceCallDimension.QueueId in row
                ? row[VoiceCallDimension.QueueId]
                : row['queueId'],
        ),
        queueName:
            VoiceCallDimension.QueueName in row
                ? row[VoiceCallDimension.QueueName]
                : row['queueName'],
        callSid: 'undefined', // can be filled if we ever need it, by adding it to the dimensions
        isPossibleSpam:
            VoiceCallDimension.IsPossibleSpam in row
                ? row[VoiceCallDimension.IsPossibleSpam]
                : row['isPossibleSpam'],
        callSlaStatus:
            VoiceCallDimension.CallSlaStatus in row
                ? row[VoiceCallDimension.CallSlaStatus]
                : row['callSlaStatus'],
    }))
}

const FULL_LIST_LIMIT = MAX_VOICE_CALLS_PAGE_NUMBER * CALL_LIST_PAGE_SIZE

export const fetchVoiceCallList = (
    filters: StatsFilters,
    timezone: string,
    segment?: VoiceCallSegment,
    statusFilter?: VoiceCallDisplayStatus[],
) =>
    fetchPostReportingV2<VoiceCallStatListItem[]>(
        [
            voiceCallListQueryFactory(
                filters,
                timezone,
                segment,
                FULL_LIST_LIMIT,
                0,
                undefined,
                undefined,
                statusFilter,
            ),
        ],
        voiceCallsCountAllDimensionsQueryFactoryV2(
            {
                filters: {
                    ...filters,
                    ...(statusFilter
                        ? {
                              [APIOnlyFilterKey.DisplayStatus]:
                                  withLogicalOperator(statusFilter),
                          }
                        : {}),
                },
                timezone,
                offset: 0,
                limit: FULL_LIST_LIMIT,
                total: false,
            },
            segment,
        ),
    ).then((result) => selectVoiceCallData(result))

const formatDuration = (seconds: number | null | undefined): string =>
    seconds ? getFormattedDurationEndedCall(seconds) : '-'

const capitalize = (value: string | null | undefined): string =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : ''

const CSV_HEADERS = [
    'Phone number source',
    'Phone number destination',
    'Agent ID',
    'Customer ID',
    'Direction',
    'Integration',
    'Queue',
    'Date',
    'SLA status',
    'State',
    'Duration',
    'Wait time',
    'Ticket ID',
]

const voiceCallSummaryToCsvRow = (
    call: VoiceCallSummary,
    integrations: Integration[],
    timezone: string,
): unknown[] => [
    formatPhoneNumberInternational(call.phoneNumberSource ?? '') ||
        call.phoneNumberSource ||
        '',
    formatPhoneNumberInternational(call.phoneNumberDestination ?? '') ||
        call.phoneNumberDestination ||
        '',
    call.agentId ?? '',
    call.customerId ?? '',
    capitalize(call.direction),
    integrations.find((i) => i.id === call.integrationId)?.name ?? '',
    call.queueName ?? '',
    call.createdAt
        ? formatDatetime(
              call.createdAt.slice(0, -4),
              'YYYY-MM-DD HH:mm:ss',
              timezone,
          )
        : '',
    formatSlaStatus(call.callSlaStatus),
    capitalize(call.displayStatus),
    formatDuration(call.duration),
    formatDuration(call.waitTime),
    call.ticketId ?? '',
]

export const fetchVoiceCallTableCsvData = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    _granularity: AggregationWindow,
    context: { integrations: Integration[] },
) => {
    const fileName = getCsvFileNameWithDates(
        statsFilters.period,
        VOICE_CALL_LIST_FILE_NAME,
    )
    try {
        const rows = await fetchVoiceCallList(statsFilters, userTimezone)
        const csv = createCsv([
            CSV_HEADERS,
            ...rows.map((row) =>
                voiceCallSummaryToCsvRow(
                    row,
                    context.integrations,
                    userTimezone,
                ),
            ),
        ])
        return {
            isLoading: false as const,
            fileName,
            files: { [fileName]: csv },
        }
    } catch {
        return { isLoading: false as const, fileName, files: {} }
    }
}
