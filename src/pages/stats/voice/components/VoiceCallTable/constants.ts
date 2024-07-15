import {VoiceMetric} from 'state/ui/stats/types'

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
}
