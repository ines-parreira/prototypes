export type WhatsAppMessageTemplate = {
    id: number
    name: string
    external_id: string
    language: string
    waba_id: string
    components: WhatsAppMessageTemplateComponents
    category: WhatsAppMessageTemplateCategory
    status: WhatsAppMessageTemplateStatus
    rejected_reason: string | null | undefined
    quality_score: string
    created_datetime: string
    updated_datetime: string | null | undefined
    deactivated_datetime: string | null | undefined
    is_supported: boolean
}

export enum WhatsAppMessageTemplateCategory {
    Utility = 'utility',
    Marketing = 'marketing',
    Authentication = 'authentication',
}

export enum WhatsAppMessageTemplateStatus {
    Approved = 'approved',
    Rejected = 'rejected',
    Pending = 'pending',
    InAppeal = 'in-appeal',
    Disabled = 'disabled',
    Paused = 'paused',
    Unsupported = 'unsupported',
}

export type WhatsAppMessageTemplateComponents = {
    body: {
        type: string
        value: string
    }
    header: {
        type: string
        value: string
    }
    footer: {
        type: string
        value: string
    }
    buttons: {
        type: string
        value: string
    }[]
}

export type ListWhatsAppMessageTemplatesOrderBy =
    | 'created_datetime'
    | 'name'
    | 'created_datetime:asc'
    | 'created_datetime:desc'
    | 'name:asc'
    | 'name:desc'

export type ListWhatsAppMessageTemplatesParams = {
    order_by?: ListWhatsAppMessageTemplatesOrderBy
    cursor?: string
    limit?: number
    waba_id?: string
    is_supported?: boolean
}
