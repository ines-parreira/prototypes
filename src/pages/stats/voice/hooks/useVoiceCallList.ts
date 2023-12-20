import {StatsFilters} from 'models/stat/types'
import {
    usePostReporting,
    UsePostReportingQueryData,
} from 'models/reporting/queries'
import {voiceCallListQueryFactory} from 'models/reporting/queryFactories/voice/voiceCall'
import {
    VoiceCallCube,
    VoiceCallDimension,
    VoiceCallSegment,
} from 'models/reporting/cubes/VoiceCallCube'
import {VoiceCallStatListItem, VoiceCallSummary} from '../models/types'
import {CALL_LIST_PAGE_SIZE} from '../constants/voiceOverview'

export const useVoiceCallList = (
    filters: StatsFilters,
    timezone: string,
    page = 1,
    perPage = CALL_LIST_PAGE_SIZE,
    segment?: VoiceCallSegment
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
                (page - 1) * perPage
            ),
        ],
        {
            select: selectVoiceCallData,
        }
    )

export const selectVoiceCallData = (
    results: UsePostReportingQueryData<VoiceCallStatListItem[]>
): VoiceCallSummary[] => {
    const parseNullableInteger = (value: string | null) =>
        value ? parseInt(value) : null

    return results.data.data.map((row: VoiceCallStatListItem) => ({
        agentId: parseNullableInteger(row[VoiceCallDimension.AgentId]),
        customerId: parseNullableInteger(row[VoiceCallDimension.CustomerId]),
        direction: row[VoiceCallDimension.Direction],
        integrationId: parseNullableInteger(
            row[VoiceCallDimension.IntegrationId]
        ),
        createdAt: row[VoiceCallDimension.CreatedAt],
        status: row[VoiceCallDimension.Status],
        duration: parseNullableInteger(row[VoiceCallDimension.Duration]),
        ticketId: parseNullableInteger(row[VoiceCallDimension.TicketId]),
        phoneNumberDestination: row[VoiceCallDimension.PhoneNumberDestination],
        phoneNumberSource: row[VoiceCallDimension.PhoneNumberSource],
    }))
}
