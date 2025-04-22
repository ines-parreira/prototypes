import { TicketChannel, TicketStatus } from 'business/types/ticket'
import { User } from 'config/types/user'
import {
    AI_AGENT_OUTCOME_DISPLAY_LABELS,
    CUSTOM_FIELD_AI_AGENT_HANDOVER,
} from 'hooks/reporting/automate/types'
import { transformIntentName } from 'hooks/reporting/automate/utils'
import { MergedRecord } from 'hooks/reporting/withEnrichment'
import { AiSalesAgentOrdersDimension } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { TicketSatisfactionSurveyDimension } from 'models/reporting/cubes/TicketSatisfactionSurveyCube'
import { VoiceCallDimension } from 'models/reporting/cubes/VoiceCallCube'
import { EnrichmentFields } from 'models/reporting/types'
import { OrderConversionDimension } from 'pages/stats/convert/clients/constants'
import { SLAPolicyStatus } from 'pages/stats/sla/components/SlaStatusCell'
import { VoiceCallSummary } from 'pages/stats/voice/models/types'

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
    slas?: Record<string, SLAPolicyStatus>
    surveyScore?: string | null
    outcome?: string | null
    intent?: string | null
    order?: {
        id: number
        amount: number
        customer: string
    } | null
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
    customFieldsIds?: {
        outcomeCustomFieldId?: number
        intentCustomFieldId?: number
    }
}

const getAIOutcome = ({
    row,
    customFieldsIds,
}: {
    row: MergedRecord<any, any>
    customFieldsIds?: {
        outcomeCustomFieldId?: number
        intentCustomFieldId?: number
    }
}): string | undefined => {
    const outcomeId = customFieldsIds?.outcomeCustomFieldId
    if (outcomeId) {
        const outcome = (
            row[EnrichmentFields.CustomFields] as Record<string, any>
        )?.[outcomeId] as string | undefined
        if (outcome?.startsWith(CUSTOM_FIELD_AI_AGENT_HANDOVER)) {
            return AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover
        }

        return AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated
    }
    return undefined
}

const getAIIntent = ({
    row,
    customFieldsIds,
}: {
    row: MergedRecord<any, any>
    customFieldsIds?: {
        outcomeCustomFieldId?: number
        intentCustomFieldId?: number
    }
}): string | undefined => {
    const intentId = customFieldsIds?.intentCustomFieldId
    if (intentId) {
        const intent = (
            row[EnrichmentFields.CustomFields] as Record<string, any>
        )?.[intentId] as string | undefined

        if (intent) {
            return transformIntentName(intent)
        }
    }
    return undefined
}

export const formatTicketDrillDownRowData = ({
    row,
    agents,
    metricField,
    ticketIdField,
    customFieldsIds,
}: DrillDownFormatterProps): TicketDrillDownRowData => {
    const outcome = getAIOutcome({ row, customFieldsIds })
    const intent = getAIIntent({ row, customFieldsIds })
    const surveyScore = row[TicketSatisfactionSurveyDimension.SurveyScore]

    return {
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
                          (agent) =>
                              agent.id === row[EnrichmentFields.AssigneeId],
                      )?.name || '',
              }
            : null,
        ...(surveyScore ? { surveyScore } : {}),

        rowData: {
            ...row,
        },
        slas: row?.['slas'] ? row['slas'] : {},
        outcome: outcome,
        intent: intent,
        order: {
            id: row[AiSalesAgentOrdersDimension.OrderId],
            amount: row[AiSalesAgentOrdersDimension.TotalAmount],
            customer: row[EnrichmentFields.CustomerIntegrationDataByExternalId],
        },
    }
}

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
    displayStatus: row[VoiceCallDimension.DisplayStatus],
    queueId: row[VoiceCallDimension.QueueId],
    queueName: row[VoiceCallDimension.QueueName],
    metricValue: row[metricField],
    rowData: row,
})
