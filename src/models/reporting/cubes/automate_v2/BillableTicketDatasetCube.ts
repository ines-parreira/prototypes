import {Cube} from 'models/reporting/types'

export enum BillableTicketDatasetMeasure {
    TotalResolutionTime = 'BillableTicketDataset.totalResolutionTime',
    TotalFirstResponseTime = 'BillableTicketDataset.totalFirstResponseTime',
    BillableTicketCount = 'BillableTicketDataset.billableTicketCount',
}

export enum BillableTicketDatasetDimension {
    TicketCreatedDatetime = 'BillableTicketDataset.ticketCreatedDatetime',
    AccountId = 'BillableTicketDataset.accountId',
}

export enum BillableTicketDatasetMember {
    TicketCreatedDatetime = 'BillableTicketDataset.ticketCreatedDatetime',
    AccountId = 'BillableTicketDataset.accountId',
}

export enum BillableTicketDatasetSegment {}

export type BillableTicketDatasetCube = Cube<
    BillableTicketDatasetMeasure,
    BillableTicketDatasetDimension,
    BillableTicketDatasetSegment,
    BillableTicketDatasetMember
>
