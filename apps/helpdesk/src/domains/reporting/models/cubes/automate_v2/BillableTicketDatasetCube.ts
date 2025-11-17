import type { Cube } from 'domains/reporting/models/types'

export enum BillableTicketDatasetMeasure {
    TotalResolutionTime = 'BillableTicketDataset.totalResolutionTime',
    TotalFirstResponseTime = 'BillableTicketDataset.totalFirstResponseTime',
    BillableTicketCount = 'BillableTicketDataset.billableTicketCount',
}

export enum BillableTicketDatasetDimension {
    TicketCreatedDatetime = 'BillableTicketDataset.ticketCreatedDatetime',
    AccountId = 'BillableTicketDataset.accountId',
    PeriodStart = 'BillableTicketDataset.periodStart',
    PeriodEnd = 'BillableTicketDataset.periodEnd',
    ResolvedByAgentUserId = 'BillableTicketDataset.resolvedByAgentUserId',
    Channel = 'BillableTicketDataset.channel',
}

export enum BillableTicketDatasetFilterMember {
    AccountId = 'BillableTicketDataset.accountId',
    PeriodStart = 'BillableTicketDataset.periodStart',
    PeriodEnd = 'BillableTicketDataset.periodEnd',
    Channel = 'BillableTicketDataset.channel',
}

export enum BillableTicketDatasetSegment {}

export type BillableTicketDatasetCube = Cube<
    BillableTicketDatasetMeasure,
    BillableTicketDatasetDimension,
    BillableTicketDatasetSegment,
    BillableTicketDatasetFilterMember
>
