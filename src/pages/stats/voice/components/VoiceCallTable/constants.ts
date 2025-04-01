export enum VoiceCallTableColumnName {
    Activity = 'Activity',
    Integration = 'Integration',
    Queue = 'Queue',
    Date = 'Date',
    State = 'State',
    Recording = 'Recording',
    Duration = 'Duration',
    WaitTime = 'Wait time',
    Ticket = 'Ticket',
    TalkTime = 'Talk time',
    OngoingTime = 'Time',
    LiveStatus = 'Status',
}

export const skeletonColumnsWidth: Record<string, number> = {
    [VoiceCallTableColumnName.Activity]: 364,
    [VoiceCallTableColumnName.Integration]: 174,
    [VoiceCallTableColumnName.Queue]: 174,
    [VoiceCallTableColumnName.Date]: 154,
    [VoiceCallTableColumnName.OngoingTime]: 120,
    [VoiceCallTableColumnName.State]: 74,
    [VoiceCallTableColumnName.LiveStatus]: 74,
    [VoiceCallTableColumnName.Recording]: 84,
    [VoiceCallTableColumnName.Duration]: 74,
    [VoiceCallTableColumnName.TalkTime]: 84,
    [VoiceCallTableColumnName.WaitTime]: 84,
    [VoiceCallTableColumnName.Ticket]: 82,
}
