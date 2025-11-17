import type {
    VoiceCallCube,
    VoiceCallSegment,
} from 'domains/reporting/models/cubes/VoiceCallCube'
import { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import type { UsePostReportingQueryData } from 'domains/reporting/models/queries'
import { usePostReporting } from 'domains/reporting/models/queries'
import { voiceCallListQueryFactory } from 'domains/reporting/models/queryFactories/voice/voiceCall'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { CALL_LIST_PAGE_SIZE } from 'domains/reporting/pages/voice/constants/voiceOverview'
import type {
    VoiceCallStatListItem,
    VoiceCallSummary,
} from 'domains/reporting/pages/voice/models/types'
import type { OrderDirection } from 'models/api/types'
import type { VoiceCallDisplayStatus } from 'models/voiceCall/types'

export const useVoiceCallList = (
    filters: StatsFilters,
    timezone: string,
    page = 1,
    perPage = CALL_LIST_PAGE_SIZE,
    segment?: VoiceCallSegment,
    order?: VoiceCallDimension,
    sorting?: OrderDirection,
    statusFilter?: VoiceCallDisplayStatus[],
) =>
    usePostReporting<
        VoiceCallStatListItem[],
        VoiceCallSummary[],
        VoiceCallCube
    >(
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
        agentId: parseNullableInteger(row[VoiceCallDimension.AgentId]),
        customerId: parseNullableInteger(row[VoiceCallDimension.CustomerId]),
        direction: row[VoiceCallDimension.Direction],
        integrationId: parseNullableInteger(
            row[VoiceCallDimension.IntegrationId],
        ),
        store: row[VoiceCallDimension.Store],
        createdAt: row[VoiceCallDimension.CreatedAt],
        status: row[VoiceCallDimension.Status],
        duration: parseNullableInteger(row[VoiceCallDimension.Duration]),
        ticketId: parseNullableInteger(row[VoiceCallDimension.TicketId]),
        phoneNumberDestination: row[VoiceCallDimension.PhoneNumberDestination],
        phoneNumberSource: row[VoiceCallDimension.PhoneNumberSource],
        talkTime: parseNullableInteger(row[VoiceCallDimension.TalkTime]),
        waitTime: parseNullableInteger(row[VoiceCallDimension.WaitTime]),
        voicemailAvailable: row[VoiceCallDimension.VoicemailAvailable],
        voicemailUrl: row[VoiceCallDimension.VoicemailUrl],
        callRecordingAvailable: row[VoiceCallDimension.CallRecordingAvailable],
        callRecordingUrl: row[VoiceCallDimension.CallRecordingUrl],
        displayStatus: row[VoiceCallDimension.DisplayStatus],
        queueId: parseNullableInteger(row[VoiceCallDimension.QueueId]),
        queueName: row[VoiceCallDimension.QueueName],
        callSid: 'undefined', // can be filled if we ever need it, by adding it to the dimensions
    }))
}
