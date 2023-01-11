import {CancelToken} from 'axios'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
    TicketVia,
} from 'business/types/ticket'
import {FacebookReactionType} from 'constants/integrations/facebook'
import {ApiCursorPaginationParams, OrderParams} from 'models/api/types'

import {Event} from '../event/types'

export type TicketSearchOptions = ApiCursorPaginationParams &
    OrderParams<TicketSearchSortableProperties> & {
        search: string
        filters?: string
        cancelToken?: CancelToken
    }

export enum TicketSearchSortableProperties {
    UpdatedDatetime = 'updated_datetime',
    CreatedDatetime = 'created_datetime',
    LastMessageDatetime = 'last_message_datetime',
    LastReceivedMessageDatetime = 'last_received_message_datetime',
    ClosedDatetime = 'closed_datetime',
    SnoozeDatetime = 'snooze_datetime',
}

export type Ticket = {
    id: number
    assignee_user: TicketAssignee
    messages: TicketElement[]
    status: TicketStatus
    subject: string
    channel: TicketChannel
    receiver: Actor
    sender: Actor
    tags: unknown[]
    events: InternalTicketEvent[]
    customer: Record<string, any>
    from_agent: boolean
    created_datetime: string
    opened_datetime: string | null
    updated_datetime: string | null
    closed_datetime: string | null
    snooze_datetime: string | null
    trashed_datetime: string | null
    last_message_datetime: string | null
    last_received_message_datetime: string | null
    meta: Record<string, unknown> | null
    uri: string
    external_id: string | null
    via: TicketVia
    is_unread: boolean
    excerpt?: string
}

type InternalTicketEvent = Pick<
    Event,
    'id' | 'type' | 'data' | 'created_datetime'
> & {user: Record<string, unknown> | null}

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

export type TicketEvent = Event & {
    isEvent: true
}

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
    name: string
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
    }
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
    }
}

export type SourceAddress = {
    address: string
    name: string
}

export type Meta = {
    current_page?: string
    campaign_id?: string
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
    is_duplicated?: boolean
    is_story_mention?: boolean
    is_story_reply?: boolean
    facebook_reactions?: FacebookReactions
    quoted_tweet?: QuotedTweet
    product?: ProductDetails
    rule_suggestion_slug?: string
}

export type FacebookPrivateReply = {
    already_sent?: boolean
    sent_datetime?: string
    messenger_ticket_id?: number
    original_ticket_id?: string
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
} & Partial<{[key in FacebookReactionType]: number}>

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
    category: {name: string}
    description: string
    images?: Array<{
        original: string
        square: string
    }>
    name: string
    total_reviews: number
    url: string
}
