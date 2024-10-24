import {TicketChannel, TicketStatus} from 'business/types/ticket'
import {User} from 'config/types/user'
import {MergedRecord} from 'hooks/reporting/withEnrichment'
import {
    TicketQAScoreDimensionName,
    TicketQAScoreMeasure,
} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {VoiceCallDimension} from 'models/reporting/cubes/VoiceCallCube'
import {EnrichmentFields} from 'models/reporting/types'
import {OrderConversionDimension} from 'pages/stats/convert/clients/constants'
import {VoiceCallSummary} from 'pages/stats/voice/models/types'

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
    qaScore?: Record<
        | TicketQAScoreDimensionName.ResolutionCompleteness
        | TicketQAScoreDimensionName.CommunicationSkills,
        string | undefined
    >
}

export interface CampaignSaleDetails {
    id: number
    amount: string
    currency: string
    productIds: string[]
    customerName?: string
    campaignId: string
    createdDatetime: string
}

export interface ConvertDrillDownRowData extends BaseDrillDownRowData {
    data: CampaignSaleDetails
}

export type VoiceCallDrillDownRowData = VoiceCallSummary & BaseDrillDownRowData

export type DrillDownFormatterProps = {
    row: MergedRecord<any, any>
    metricField: string
    agents?: User[]
    ticketIdField?: string
}

const getQAMetric = (
    key: TicketQAScoreDimensionName,
    data: string
): string | undefined => {
    const parsedField = JSON.parse(data)
    const dataArray: {dimension: string; prediction: string}[] = Array.isArray(
        parsedField
    )
        ? parsedField
        : []
    return dataArray.find((item) => item?.dimension === key)?.prediction
}

export const formatTicketDrillDownRowData = ({
    row,
    agents,
    metricField,
    ticketIdField,
}: DrillDownFormatterProps): TicketDrillDownRowData => ({
    ticket: {
        id: (ticketIdField && row[ticketIdField]) || null,
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
                  agents?.find(
                      (agent) => agent.id === row[EnrichmentFields.AssigneeId]
                  )?.name || '',
          }
        : null,
    ...(row?.['slas'] ? {rowData: row['slas']} : {}),
    ...(row?.[TicketQAScoreMeasure.QAScoreData]
        ? {rowData: row[TicketQAScoreMeasure.QAScoreData]}
        : {}),
    ...(row?.[TicketQAScoreMeasure.QAScoreData]
        ? {
              qaScore: {
                  [TicketQAScoreDimensionName.ResolutionCompleteness]:
                      getQAMetric(
                          TicketQAScoreDimensionName.ResolutionCompleteness,
                          row[TicketQAScoreMeasure.QAScoreData]
                      ),
                  [TicketQAScoreDimensionName.CommunicationSkills]: getQAMetric(
                      TicketQAScoreDimensionName.CommunicationSkills,
                      row[TicketQAScoreMeasure.QAScoreData]
                  ),
              },
          }
        : {}),
})

export const formatConvertCampaignSalesDrillDownRowData = ({
    row,
    metricField,
}: DrillDownFormatterProps): ConvertDrillDownRowData => ({
    data: {
        id: row[OrderConversionDimension.orderId],
        amount: row[OrderConversionDimension.orderAmount],
        currency: row[OrderConversionDimension.orderCurrency],
        productIds: row[OrderConversionDimension.orderProductIds],
        customerName: row[EnrichmentFields.CustomerIntegrationDataByExternalId],
        campaignId: row[OrderConversionDimension.campaignId],
        createdDatetime: row[OrderConversionDimension.createdDatatime],
    },
    metricValue: row[metricField],
    rowData: row,
})

export const formatVoiceDrillDownRowData = ({
    row,
    metricField,
}: DrillDownFormatterProps): VoiceCallDrillDownRowData => ({
    agentId: row[VoiceCallDimension.AgentId],
    customerId: row[VoiceCallDimension.CustomerId],
    direction: row[VoiceCallDimension.Direction],
    integrationId: row[VoiceCallDimension.IntegrationId],
    createdAt: row[VoiceCallDimension.CreatedAt],
    status: row[VoiceCallDimension.Status],
    duration: row[VoiceCallDimension.Duration],
    ticketId: row[VoiceCallDimension.TicketId],
    phoneNumberDestination: row[VoiceCallDimension.PhoneNumberDestination],
    phoneNumberSource: row[VoiceCallDimension.PhoneNumberSource],
    talkTime: row[VoiceCallDimension.TalkTime],
    waitTime: row[VoiceCallDimension.WaitTime],
    voicemailAvailable: row[VoiceCallDimension.VoicemailAvailable],
    voicemailUrl: row[VoiceCallDimension.VoicemailUrl],
    callRecordingAvailable: row[VoiceCallDimension.CallRecordingAvailable],
    callRecordingUrl: row[VoiceCallDimension.CallRecordingUrl],
    metricValue: row[metricField],
    rowData: row,
})
