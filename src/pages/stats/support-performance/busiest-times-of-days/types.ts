export enum BusiestTimeOfDaysMetrics {
    TicketsCreated = 'btod-tickets-created',
    TicketsReplied = 'btod-tickets-replied',
    TicketsClosed = 'btod-tickets-closed',
    MessagesSent = 'btod-messages-sent',
}

export const HOUR_COLUMN = 'HOUR'

export type BTODColumns = DayOfWeek | typeof HOUR_COLUMN

export enum DayOfWeek {
    MONDAY = 'MONDAY',
    TUESDAY = 'TUESDAY',
    WEDNESDAY = 'WEDNESDAY',
    THURSDAY = 'THURSDAY',
    FRIDAY = 'FRIDAY',
    SATURDAY = 'SATURDAY',
    SUNDAY = 'SUNDAY',
}

export const columnsOrder: {field: BTODColumns; label: string}[] = [
    {
        label: 'HOUR',
        field: 'HOUR',
    },
    {
        label: 'MONDAY',
        field: DayOfWeek.MONDAY,
    },
    {
        label: 'TUESDAY',
        field: DayOfWeek.TUESDAY,
    },
    {
        label: 'WEDNESDAY',
        field: DayOfWeek.WEDNESDAY,
    },
    {
        label: 'THURSDAY',
        field: DayOfWeek.THURSDAY,
    },
    {
        label: 'FRIDAY',
        field: DayOfWeek.FRIDAY,
    },
    {
        label: 'SATURDAY',
        field: DayOfWeek.SATURDAY,
    },
    {
        label: 'SUNDAY',
        field: DayOfWeek.SUNDAY,
    },
]

export const isHourCell = (column: BTODColumns): column is typeof HOUR_COLUMN =>
    column === 'HOUR'
