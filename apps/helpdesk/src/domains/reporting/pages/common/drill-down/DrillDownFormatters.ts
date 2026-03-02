import type { TicketChannel, TicketStatus } from 'business/types/ticket'
import type { User } from 'config/types/user'
import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import {
    AI_AGENT_OUTCOME_DISPLAY_LABELS,
    CUSTOM_FIELD_AI_AGENT_HANDOVER,
} from 'domains/reporting/hooks/automate/types'
import type { MergedRecord } from 'domains/reporting/hooks/withEnrichment'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { TicketInsightsTaskMeasure } from 'domains/reporting/models/cubes/TicketInsightsTaskCube'
import { TicketSatisfactionSurveyDimension } from 'domains/reporting/models/cubes/TicketSatisfactionSurveyCube'
import { VoiceCallDimension } from 'domains/reporting/models/cubes/VoiceCallCube'
import { VoiceEventsByAgentDimension } from 'domains/reporting/models/cubes/VoiceEventsByAgent'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { OrderConversionDimension } from 'domains/reporting/pages/convert/clients/constants'
import type { SLAPolicyStatus } from 'domains/reporting/pages/sla/components/SlaStatusCell'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'

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
    product?: {
        titles: string[]
        variants: string[]
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

type OutcomeExtractor = (params: {
    row: MergedRecord<any, any>
    customFieldsIds?: {
        outcomeCustomFieldId?: number
        intentCustomFieldId?: number
    }
}) => string | undefined

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

        if (!outcome) {
            return undefined
        }

        const hasDelimiter = outcome.includes(DROPDOWN_NESTING_DELIMITER)
        const [level1, level2] = hasDelimiter
            ? outcome.split(DROPDOWN_NESTING_DELIMITER)
            : [outcome, undefined]

        if (level1?.startsWith(CUSTOM_FIELD_AI_AGENT_HANDOVER)) {
            if (level2) {
                return `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover}${DROPDOWN_NESTING_DELIMITER}${level2}`
            }
            return AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover
        }

        return `${AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated}${DROPDOWN_NESTING_DELIMITER}${outcome}`
    }
    return undefined
}

const getKnowledgeOutcome = ({
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
    if (!outcomeId) {
        return undefined
    }

    const outcome = (
        row[EnrichmentFields.CustomFields] as Record<string, any>
    )?.[outcomeId] as string | undefined

    if (!outcome) {
        return undefined
    }

    if (outcome.startsWith(CUSTOM_FIELD_AI_AGENT_HANDOVER)) {
        return AI_AGENT_OUTCOME_DISPLAY_LABELS.Handover
    }

    return AI_AGENT_OUTCOME_DISPLAY_LABELS.Automated
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
    return intentId
        ? ((row[EnrichmentFields.CustomFields] as Record<string, any>)?.[
              intentId
          ] as string | undefined)
        : undefined
}

const formatTicketDrillDownRowDataInternal = (
    {
        row,
        agents,
        metricField,
        ticketIdField,
        customFieldsIds,
    }: DrillDownFormatterProps,
    outcomeExtractor: OutcomeExtractor,
): TicketDrillDownRowData => {
    const outcome = outcomeExtractor({ row, customFieldsIds })
    const intent = getAIIntent({ row, customFieldsIds })
    const surveyScore =
        row[TicketSatisfactionSurveyDimension.SurveyScore] ||
        row[TicketInsightsTaskMeasure.AvgSurveyScore]
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
            amount: row[AiSalesAgentOrdersMeasure.Gmv],
            customer: row[EnrichmentFields.CustomerIntegrationDataByExternalId],
        },
        product: {
            titles: row[EnrichmentFields.ProductsTitles]
                ? Object.values(row[EnrichmentFields.ProductsTitles])
                : [],
            variants: row[EnrichmentFields.ProductsVariants]
                ? Object.values(row[EnrichmentFields.ProductsVariants])
                : [],
        },
    }
}

export const formatTicketDrillDownRowData = (
    props: DrillDownFormatterProps,
): TicketDrillDownRowData => {
    return formatTicketDrillDownRowDataInternal(props, getAIOutcome)
}

export const formatKnowledgeTicketDrillDownRowData = (
    props: DrillDownFormatterProps,
): TicketDrillDownRowData => {
    return formatTicketDrillDownRowDataInternal(props, getKnowledgeOutcome)
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
    agentId:
        row[VoiceCallDimension.AgentId] ||
        row[VoiceEventsByAgentDimension.AgentId] ||
        row['agentId'],
    callSlaStatus:
        row[VoiceCallDimension.CallSlaStatus] || row['callSlaStatus'],
    customerId: row[VoiceCallDimension.CustomerId] || row['customerId'],
    direction: row[VoiceCallDimension.Direction] || row['direction'],
    integrationId:
        row[VoiceCallDimension.IntegrationId] ||
        row[VoiceEventsByAgentDimension.IntegrationId] ||
        row['integrationId'],
    createdAt:
        row[VoiceCallDimension.CreatedAt] ||
        row[VoiceEventsByAgentDimension.CreatedAt] ||
        row['createdDatetime'],
    status:
        row[VoiceCallDimension.Status] ||
        row[VoiceEventsByAgentDimension.Status] ||
        row['status'],
    duration: row[VoiceCallDimension.Duration] || row['duration'],
    ticketId:
        row[VoiceCallDimension.TicketId] ||
        row[VoiceEventsByAgentDimension.TicketId] ||
        row['ticketId'],
    phoneNumberDestination:
        row[VoiceCallDimension.PhoneNumberDestination] || row['destination'],
    phoneNumberSource:
        row[VoiceCallDimension.PhoneNumberSource] || row['source'],
    talkTime: row[VoiceCallDimension.TalkTime] || row['talkTime'],
    waitTime: row[VoiceCallDimension.WaitTime] || row['waitTime'],
    voicemailAvailable:
        row[VoiceCallDimension.VoicemailAvailable] || row['voicemailAvailable'],
    voicemailUrl: row[VoiceCallDimension.VoicemailUrl] || row['voicemailUrl'],
    callRecordingAvailable:
        row[VoiceCallDimension.CallRecordingAvailable] ||
        row['callRecordingAvailable'],
    callRecordingUrl:
        row[VoiceCallDimension.CallRecordingUrl] || row['callRecordingUrl'],
    displayStatus:
        row[VoiceCallDimension.DisplayStatus] || row['displayStatus'],
    queueId: row[VoiceCallDimension.QueueId] || row['queueId'],
    queueName: row[VoiceCallDimension.QueueName] || row['queueName'],
    transferType: row[VoiceEventsByAgentDimension.TransferType],
    transferTargetAgentId:
        row[VoiceEventsByAgentDimension.TransferTargetAgentId],
    transferTargetQueueId:
        row[VoiceEventsByAgentDimension.TransferTargetQueueId],
    transferTargetExternalNumber:
        row[VoiceEventsByAgentDimension.TransferTargetExternalNumber],
    callSid: 'undefined', // can be filled if we ever need it, by adding it to the dimensions
    metricValue: row[metricField],
    rowData: row,
})
