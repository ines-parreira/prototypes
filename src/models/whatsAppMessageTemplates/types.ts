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

export type WhatsAppTemplateButtonComponent =
    | {
          type: 'quick_reply'
          text: string
      }
    | {
          type: 'phone_number'
          value: {
              name: string
              phone_number: string
          }
      }
    | {
          type: 'url'
          value: {
              name: string
              url: string
          }
      }

export type WhatsAppMessageTemplateTextComponent = {
    type: 'text'
    value: string
}

export type WhatsAppMessageTemplateComponents = {
    body: WhatsAppMessageTemplateTextComponent
    header?: WhatsAppMessageTemplateTextComponent
    footer?: WhatsAppMessageTemplateTextComponent
}

export type ListWhatsAppMessageTemplatesOrderBy =
    | 'created_datetime'
    | 'name'
    | 'created_datetime:asc'
    | 'created_datetime:desc'
    | 'name:asc'
    | 'name:desc'
    | 'status'
    | 'category'
    | 'language'
    | 'category:asc'
    | 'category:desc'
    | 'status:asc'
    | 'status:desc'
    | 'language:asc'
    | 'language:desc'

export type ListWhatsAppMessageTemplatesParams = {
    order_by?: ListWhatsAppMessageTemplatesOrderBy
    cursor?: string
    limit?: number
    waba_id?: string
    is_supported?: boolean
    status?: WhatsAppMessageTemplateStatus
    search?: string
}

export type ApplyExternalTemplateActionArguments = {
    provider: 'whatsapp'
    template_id: string
    template?: WhatsAppMessageTemplate
    body: WhatsAppMessageTemplateTextComponent[]
    header?: WhatsAppMessageTemplateTextComponent[]
}

export type ApplyExternalTemplateAction = {
    type: string
    arguments: ApplyExternalTemplateActionArguments
}
