//@flow

import {
    TicketChannels,
    TicketMessageSourceTypes,
    TicketStatuses,
} from '../../business/ticket'

export type Ticket = {
    id: number,
    assignee_user: TicketAssignee,
    messages: TicketElement[],
    messages_count: number,
    status: $Values<typeof TicketStatuses>,
    subject: string,
}

export type TicketAssignee = {
    id: number,
    email: string,
    firstname: string,
    lastname: string,
    name: string,
}

export type TicketElement = {
    id?: number,
    ticket_id?: number,
    message_id?: string,
    integration_id?: string,
    request_id?: string,
    rule_id?: string,
    external_id?: string,
    sender: Actor,
    receiver: Actor,
    subject: string,
    body_html?: string,
    body_text?: string,
    stripped_html?: string,
    stripped_text?: string,
    stripped_signature?: string,
    channel: Channel,
    via: string,
    uri: string,
    public: boolean,
    from_agent: boolean,
    isPending?: boolean,
    source?: Source,
    meta?: Meta,
    last_sending_error?: LastSendingError,
    attachments?: Attachment[],
    actions?: Action[],
    created_datetime: string,
    failed_datetime?: string,
    opened_datetime?: string,
    sent_datetime?: string,
    _internal?: {
        id: number,
    },
}

export type TicketEvent = TicketElement & {
    isEvent: true,
}

export type TicketSatisfactionSurvey = TicketElement & {
    isSatisfactionSurvey: true,
}

export type TicketMessage = TicketElement & {
    isMessage: true,
}

export type Actor = {
    id: number,
    email: string,
    name: string,
    firstname: string,
    lastname: string,
    meta?: any,
}

export type Attachment = {
    content_type: string,
    name: string,
    public: boolean,
    size: number,
    url: string,
}

export type Action = {
    status: ActionStatus,
    name: string,
    title: string,
    type: string,
    response?: {
        msg: string,
    },
}

export type ActionStatus = 'error' | 'pending' | 'success'

export type SourceType = $Values<typeof TicketMessageSourceTypes>
export type Channel = $Values<typeof TicketChannels>

export type Source = {
    type: SourceType,
    from: SourceAddress,
    to: SourceAddress[],
    cc?: SourceAddress[],
    bcc?: SourceAddress[],
    extra?: any,
}

export type SourceAddress = {
    address: string,
    name: string,
}

export type Meta = {
    current_page?: string,
    campaign_id?: string,
    facebook_carousel?: FacebookCarouselTemplate[],
    hidden_datetime?: string,
    liked_datetime?: string,
    error?: string,
    post_id?: string,
    page_id?: string,
    parent_id?: string,
    facebook_reactions?: FacebookReactions,
}

export type FacebookReactions = {
    page_reaction?: FacebookReaction,
    customer_reaction?: FacebookReaction,
    reactions_counter: FacebookReactionCounter,
}

export type FacebookReaction = {
    reaction_type: string,
    reaction_datetime: string,
    reaction_made_by?: string,
    is_reacting?: boolean,
}

export type FacebookReactionCounter = {
    total_reactions: number,
}

export type LastSendingError = {
    error?: string,
}

export type FacebookCarouselTemplate = {
    type: 'template',
    payload: {
        template_type: string,
        elements?: Array<{
            title: string,
            subtitle: string,
            image_url: string,
            buttons?: Array<{
                type: string,
                title: string,
                url: string,
            }>,
        }>,
    },
}
