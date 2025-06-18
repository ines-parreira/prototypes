import { SatisfactionSurvey, Tag } from '@gorgias/helpdesk-queries'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
    TicketVia,
} from 'business/types/ticket'
import { FacebookReactionType } from 'constants/integrations/facebook'
import { PhoneIntegrationEvent } from 'constants/integrations/types/event'
import { CustomFields } from 'custom-fields/types'
import { Customer } from 'models/customer/types'
import { Event } from 'models/event/types'
import { Integration } from 'models/integration/types'
import { MacroActionName } from 'models/macroAction/types'
import { Team } from 'models/team/types'

export type Ticket = {
    id: number
    assignee_user: TicketAssignee | null
    assignee_team: Pick<Team, 'id' | 'name' | 'decoration'> | null
    channel: TicketChannel
    closed_datetime: string | null
    created_datetime: string
    customer: Customer | null
    custom_fields?: CustomFields
    events: InternalTicketEvent[]
    excerpt?: string
    external_id: string | null
    from_agent: boolean
    is_unread: boolean
    language: string | null
    last_message_datetime: string | null
    last_received_message_datetime: string | null
    messages: TicketElement[]
    messages_count: number
    meta: Record<string, unknown> | null
    opened_datetime: string | null
    receiver: Actor
    satisfaction_survey?: SatisfactionSurvey
    sender: Actor
    snooze_datetime: string | null
    status: TicketStatus
    subject: string
    tags: Pick<Tag, 'name' | 'id' | 'decoration'>[]
    trashed_datetime: string | null
    updated_datetime: string | null
    uri: string
    via: TicketVia
    reply_options?: TicketReplyOptions
}

export type TicketPartial = Pick<Ticket, 'id' | 'updated_datetime'> & {
    cursor: string
}
export type NextPrevTicketPartial = Pick<Ticket, 'id'>

export type TicketReplyOptions = Record<string, TicketReplyOption>
export type TicketReplyOption = {
    answerable: boolean
    integrations?: Array<Pick<Integration, 'id' | 'name'> & { address: string }>
}

type InternalTicketEvent = Pick<
    Event,
    'id' | 'type' | 'data' | 'created_datetime'
> & { user: Record<string, unknown> | null }

export type PhoneTicketEvent = Pick<
    Event,
    'id' | 'data' | 'created_datetime'
> & {
    user: Record<string, unknown> | null
    type: PhoneIntegrationEvent
}

export type TicketAssignee = {
    id: number
    email: string
    firstname: string
    lastname: string
    name: string
    meta?: {
        profile_picture_url?: string
    }
}

export type TicketElement =
    | TicketMessage
    | TicketEvent
    | TicketSatisfactionSurvey

export type TicketMessage = {
    id?: number
    ticket_id?: number
    message_id?: string
    integration_id: number | null
    request_id?: string
    sender: Actor
    receiver: Actor | null
    subject: string
    body_html?: string
    body_text?: string
    stripped_html: string | null
    stripped_text: string | null
    channel: Channel
    via: TicketVia
    uri: string
    public: boolean
    from_agent: boolean
    isPending?: boolean
    source?: Source
    meta: Meta | null
    last_sending_error?: LastSendingError
    attachments: Attachment[]
    created_datetime: string
    stripped_signature: string | null
    actions: Action[] | null
    rule_id: string | null
    external_id: string | null
    failed_datetime: string | null
    opened_datetime: string | null
    is_retriable: boolean
    sent_datetime?: string
    _internal?: {
        id: number
    }
    isMessage: boolean
    intents?: TicketMessageIntent[]
}

export type TicketMessageIntent = {
    name: string
    is_user_feedback: boolean
    rejected: boolean | null
}

export type TicketEvent =
    | PhoneTicketEvent
    | (Event & {
          isEvent: true
      })

export type TicketSatisfactionSurvey = Omit<TicketMessage, 'isMessage'> & {
    isSatisfactionSurvey: true
}

export type Actor = {
    id: number
    email: string
    name: string | null
    firstname: string
    lastname: string
    meta?: any
}

export type Attachment = {
    content_type: string
    name: string
    public: boolean
    size: number
    url: string
}

export type Action = {
    status: ActionStatus
    name: MacroActionName
    title: string
    type: string
    response?: {
        msg: string
        status_code: number
        response: string
    }
    arguments?: {
        [key: string]: unknown
        headers?: Record<string, string>
        params?: Record<string, number>
        form?: Record<string, string>
        json?: Record<string, string>
        restock?: boolean
        order_id?: number
        last_order?: number
        tags?: string
    }
}

export enum MessageMetadataType {
    Message = 'message',
    /**
     * Used to transfer metadata from chat without displaying a message
     */
    Signal = 'signal',
}

export enum ActionStatus {
    Error = 'error',
    Pending = 'pending',
    Success = 'success',
    Cancelled = 'canceled',
}

export type SourceType = TicketMessageSourceType
export type Channel = TicketChannel

export type Source = {
    type: SourceType
    from?: SourceAddress
    to?: SourceAddress[]
    cc?: SourceAddress[]
    bcc?: SourceAddress[]
    extra?: {
        forward?: boolean
        page_id?: string
        post_id?: string
        parent_id?: string
        permalink?: string
        conversation_id?: string
        open_graph_story_id?: string
        score?: number
        external_product_id?: string
        unfetchable?: boolean
        include_thread?: boolean
    }
}

export type SourceAddress = {
    address: string
    name: string
}

export type Meta = {
    current_page?: string
    campaign_id?: string
    ai_campaign_id?: string
    ai_campaign_trigger_key?: 'manual'
    ai_campaign_trigger_operator?: 'aiSalesAgentHelpOnSearch'
    ai_campaign_trigger_value?: string
    facebook_carousel?: FacebookCarouselTemplate[]
    hidden_datetime?: string
    permalink_url?: string
    liked_datetime?: string
    error?: string
    post_id?: string
    page_id?: string
    parent_id?: string
    deleted_datetime?: string
    private_reply?: FacebookPrivateReply
    replied_to?: ReplyMetaTicketMessage
    replied_by?: ReplyMetaTicketMessage
    is_duplicated?: boolean
    is_story_mention?: boolean
    is_story_reply?: boolean
    facebook_reactions?: FacebookReactions
    quoted_tweet?: QuotedTweet
    product?: ProductDetails
    rule_suggestion_slug?: string
    ai_suggestion?: boolean
    discount_codes?: string[]
    body_text_truncated?: boolean
    body_html_truncated?: boolean
    sms_deflection?: string
    hidden?: boolean
    type?: MessageMetadataType
    workflow_execution?: {
        configuration_id: string
        execution_id: string
        success: boolean
    }
}

export type FacebookPrivateReply = {
    already_sent?: boolean
    sent_datetime?: string
    messenger_ticket_id?: number
    original_ticket_id?: string
}

export type ReplyTicketMessage = {
    integration_id: number
    created_datetime?: string
    body_text: string
    source: Source
    customer: Actor
    user: Actor
}

export type ReplyMetaTicketMessage = {
    ticket_id: number
    ticket_message_id: number
}

export type LastSendingError = {
    error?: string
}

export type FacebookReactions = {
    page_reaction?: FacebookReaction
    customer_reaction?: FacebookReaction
    reactions_counter: FacebookReactionCounter
}

export type FacebookReaction = {
    reaction_type: FacebookReactionType
    reaction_datetime: string
    reaction_made_by?: string
    is_reacting?: boolean
}

export type FacebookReactionCounter = {
    total_reactions: number
} & Partial<{ [key in FacebookReactionType]: number }>

export type FacebookCarouselTemplate = {
    type: 'template'
    payload: {
        template_type: string
        elements?: Array<{
            title: string
            subtitle: string
            image_url: string
            buttons?: Array<{
                type: string
                title: string
                url: string
                webview_height_ratio?: string
            }>
        }>
        sharable?: boolean
    }
}

export type QuotedTweet = {
    id: string
    text: string
    user: {
        id: string
        name: string
        username: string
    }
    attachments: Attachment[]
}

export type ProductDetails = {
    average_score: number
    category: { name: string }
    description: string
    images?: Array<{
        original: string
        square: string
    }>
    name: string
    total_reviews: number
    url: string
}

/**
 * This represents the meta created by any Gorgias Contact Form tickets
 * to keep in sync with https://github.com/gorgias/help-center/blob/a596ce9588af9943d1974452cb4e9f0fe96708c3/apps/api/src/modules/helpdesk/ticket-meta-gorgias-contact-form.type.ts#L2
 */
export type GorgiasContactFormTicketMeta = {
    is_embedded: boolean
    host_url: string
    contact_form_id: number
    contact_form_uid: string
    contact_form_locale_id: number
    help_center_id: number | null
}
