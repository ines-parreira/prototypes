import type { IconName } from '@gorgias/axiom'
import type {
    ExpressionFieldType,
    TicketCompact,
} from '@gorgias/helpdesk-queries'

export type CustomFieldValue = string | number | boolean

export type CustomerData = {
    name?: string
    firstname?: string
    lastname?: string
    email: string
}

export type TicketEvaluationResults = {
    evaluationResults: Record<number, ExpressionFieldType | undefined>
    conditionsLoading: boolean
}

export type TicketCustomField = {
    id: number
    label: string
    value: CustomFieldValue | undefined
    shortValueLabel: string
}

export type EnrichedTicket = {
    ticket: TicketCompact
    evaluationResults: Record<number, ExpressionFieldType | undefined>
    conditionsLoading: boolean
    customFields: TicketCustomField[]
    iconName: IconName
}
