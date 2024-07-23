import {VoiceAgentsMetric, VoiceMetric} from 'state/ui/stats/types'

export enum VoiceCallTableColumnName {
    Activity = 'Activity',
    Integration = 'Integration',
    Date = 'Date',
    State = 'State',
    Recording = 'Recording',
    Length = 'Length',
    WaitTime = 'Wait time',
    Ticket = 'Ticket',
}

const voiceAgentsColumns = [
    VoiceCallTableColumnName.Activity,
    VoiceCallTableColumnName.Length,
    VoiceCallTableColumnName.Integration,
    VoiceCallTableColumnName.Date,
    VoiceCallTableColumnName.State,
    VoiceCallTableColumnName.Recording,
]

export const tableColumns: Record<string, VoiceCallTableColumnName[]> = {
    default: [
        VoiceCallTableColumnName.Activity,
        VoiceCallTableColumnName.Integration,
        VoiceCallTableColumnName.Date,
        VoiceCallTableColumnName.State,
        VoiceCallTableColumnName.Recording,
        VoiceCallTableColumnName.Length,
        VoiceCallTableColumnName.WaitTime,
        VoiceCallTableColumnName.Ticket,
    ],
    [VoiceMetric.AverageWaitTime]: [
        VoiceCallTableColumnName.Activity,
        VoiceCallTableColumnName.WaitTime,
        VoiceCallTableColumnName.Integration,
        VoiceCallTableColumnName.Date,
        VoiceCallTableColumnName.State,
        VoiceCallTableColumnName.Recording,
    ],
    [VoiceMetric.AverageTalkTime]: [
        VoiceCallTableColumnName.Activity,
        VoiceCallTableColumnName.Length,
        VoiceCallTableColumnName.Integration,
        VoiceCallTableColumnName.Date,
        VoiceCallTableColumnName.State,
        VoiceCallTableColumnName.Recording,
    ],
    [VoiceAgentsMetric.AgentTotalCalls]: voiceAgentsColumns,
    [VoiceAgentsMetric.AgentInboundAnsweredCalls]: voiceAgentsColumns,
    [VoiceAgentsMetric.AgentInboundMissedCalls]: voiceAgentsColumns,
    [VoiceAgentsMetric.AgentOutboundCalls]: voiceAgentsColumns,
    [VoiceAgentsMetric.AgentAverageTalkTime]: voiceAgentsColumns,
}

export const skeletonColumnsWidth: Record<string, number> = {
    [VoiceCallTableColumnName.Activity]: 364,
    [VoiceCallTableColumnName.Integration]: 174,
    [VoiceCallTableColumnName.Date]: 154,
    [VoiceCallTableColumnName.State]: 74,
    [VoiceCallTableColumnName.Recording]: 84,
    [VoiceCallTableColumnName.Length]: 74,
    [VoiceCallTableColumnName.WaitTime]: 84,
    [VoiceCallTableColumnName.Ticket]: 82,
}
