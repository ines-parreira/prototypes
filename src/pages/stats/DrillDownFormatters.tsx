import {MergedRecord} from 'hooks/reporting/withEnrichment'
import {User} from 'config/types/user'
import {EnrichmentFields} from 'models/reporting/types'
import {DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import {OrderConversionDimension} from 'pages/stats/convert/clients/constants'
import {TicketChannel, TicketStatus} from 'business/types/ticket'

export interface TicketDetails {
    id: number | string
    subject: string | null
    description: string | null
    channel: TicketChannel | null
    isRead: boolean
    created: string | null
    contactReason: string | null
    status: TicketStatus | null
}

export interface BaseDrillDownRowData {
    metricValue: number
    rowData?: MergedRecord<any, any>
}

export interface TicketDrillDownRowData extends BaseDrillDownRowData {
    ticket: TicketDetails
    assignee:
        | ({
              id: number
          } & Partial<User>)
        | null
}

export interface CampaignSaleDetails {
    id: number
    amount: string
    currency: string
    productIds: string[]
    customerId: number
    campaignId: string
    createdDatetime: string
}

export interface ConvertDrillDownRowData extends BaseDrillDownRowData {
    data: CampaignSaleDetails
}

export type TicketDrillDownFormatter = (
    row: MergedRecord<any, any>,
    agents: User[],
    metricField: string,
    ticketIdField: string
) => TicketDrillDownRowData

export type ConvertDrillDownFormatter = (
    row: MergedRecord<any, any>,
    metricField: string
) => ConvertDrillDownRowData

export type DrillDownFormatter = ConvertDrillDownFormatter

export type EnrichedDrillDownFormatter = TicketDrillDownFormatter

export const formatTicketDrillDownRowData = (
    row: MergedRecord<any, any>,
    agents: User[],
    metricField: string,
    ticketIdField: string
): TicketDrillDownRowData => ({
    ticket: {
        id: row[ticketIdField] || null,
        subject: row[EnrichmentFields.TicketName] || null,
        description: row[EnrichmentFields.Description] || null,
        channel: row[EnrichmentFields.Channel] || null,
        isRead: !(row[EnrichmentFields.IsUnread] ?? true),
        created: row[EnrichmentFields.CreatedDatetime] || null,
        contactReason: row[EnrichmentFields.ContactReason] || null,
        status: row[EnrichmentFields.Status] || null,
    },
    metricValue: row[metricField],
    assignee: row[EnrichmentFields.AssigneeId]
        ? {
              id: row[EnrichmentFields.AssigneeId],
              name:
                  agents.find(
                      (agent) => agent.id === row[EnrichmentFields.AssigneeId]
                  )?.name || '',
          }
        : null,
    ...(row?.['slas'] ? {rowData: row['slas']} : {}),
})

export const formatConvertCampaignSalesDrillDownRowData = (
    row: MergedRecord<any, any>,
    metricField: string
): ConvertDrillDownRowData => ({
    data: {
        id: row[OrderConversionDimension.orderId],
        amount: row[OrderConversionDimension.orderAmount],
        currency: row[OrderConversionDimension.orderCurrency],
        productIds: row[OrderConversionDimension.orderProductIds],
        customerId: row[OrderConversionDimension.customerId],
        campaignId: row[OrderConversionDimension.campaignId],
        createdDatetime: row[OrderConversionDimension.createdDatatime],
    },
    metricValue: row[metricField],
    rowData: row,
})

export const getDrillDownFormatter = (
    metricName: DrillDownMetric
): DrillDownFormatter => {
    switch (metricName.metricName) {
        default:
            return formatConvertCampaignSalesDrillDownRowData
    }
}

export const getEnrichedDrillDownFormatter = (
    metricName: DrillDownMetric
): EnrichedDrillDownFormatter => {
    switch (metricName.metricName) {
        default:
            return formatTicketDrillDownRowData
    }
}
