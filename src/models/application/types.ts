export type Application = {
    id: string
    name: string
    channel_id: string
    status: string
    messaging_config: ApplicationMessagingConfig
    deactivated_datetime: string | null
}

export type ApplicationMessagingConfig = {
    supports_ticket_initiation: boolean
    supports_replies: boolean
    attachments: ApplicationAttachmentsMessagingConfig
}

export type ApplicationAttachmentsMessagingConfig = {
    supported: boolean
    allowed_mime_types: string[]
    max_amount: number
    alongside_text_allowed: boolean
}
