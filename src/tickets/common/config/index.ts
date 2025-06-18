import {
    TicketChannel,
    TicketMessageSourceType,
    TicketPriority,
    TicketStatus,
} from 'business/types/ticket'
import {
    INTEGRATION_HIDDEN_VARIABLES,
    INTEGRATION_PREVIOUS_VARIABLES,
    INTEGRATION_VARIABLES,
} from 'config/integrations/index'

export const DEFAULT_CHANNEL = TicketChannel.Email

export const CHANNELS = Object.values(TicketChannel)
export const STATUSES = Object.values(TicketStatus)
export const PRIORITIES = Object.values(TicketPriority)

export const DEFAULT_SOURCE_TYPE = TicketMessageSourceType.Email

export const SOURCE_TYPES = Object.values(TicketMessageSourceType)

export const SYSTEM_SOURCE_TYPES = [
    TicketMessageSourceType.InternalNote,
    TicketMessageSourceType.SystemMessage,
]

// source types that can be used to answer
export const USABLE_SOURCE_TYPES = [
    TicketMessageSourceType.Chat,
    TicketMessageSourceType.Email,
    TicketMessageSourceType.FacebookComment,
    TicketMessageSourceType.FacebookMentionComment,
    TicketMessageSourceType.FacebookReviewComment,
    TicketMessageSourceType.FacebookMessage,
    TicketMessageSourceType.FacebookMessenger,
    TicketMessageSourceType.InstagramAdComment,
    TicketMessageSourceType.InstagramComment,
    TicketMessageSourceType.InstagramMentionMedia,
    TicketMessageSourceType.InstagramMentionComment,
    TicketMessageSourceType.InstagramDirectMessage,
    TicketMessageSourceType.InternalNote,
    TicketMessageSourceType.YotpoReview,
    TicketMessageSourceType.YotpoReviewPublicComment,
    TicketMessageSourceType.YotpoReviewPrivateComment,
    TicketMessageSourceType.TwitterTweet,
    TicketMessageSourceType.TwitterQuotedTweet,
    TicketMessageSourceType.TwitterMentionTweet,
    TicketMessageSourceType.TwitterDirectMessage,
]

export type Variable = {
    type: string
    name: string
    children?: VariableChild[]
    value?: string
    explicit?: boolean
    fullName?: string

    integration?: string
    replace?: (
        object: Map<any, any>,
        value: any,
        currentUserObject?: Map<any, any>,
    ) => string
}

type VariableChild = {
    name: string
    fullName: string
    value: string
    tooltip?: string
}

// available variables in macros
export const VARIABLES: Variable[] = [
    {
        type: 'ticket.customer',
        name: 'Ticket customer',
        children: [
            {
                name: 'First name',
                fullName: 'Customer first name',
                value: '{{ticket.customer.firstname}}',
            },
            {
                name: 'Last name',
                fullName: 'Customer last name',
                value: '{{ticket.customer.lastname}}',
            },
            {
                name: 'Full name',
                fullName: 'Customer full name',
                value: '{{ticket.customer.name}}',
            },
            {
                name: 'Email',
                fullName: 'Customer email',
                value: '{{ticket.customer.email}}',
            },
        ],
    },
    {
        type: 'current_user',
        name: 'Current agent',
        children: [
            {
                name: 'First name',
                fullName: 'Current agent first name',
                value: '{{current_user.firstname}}',
            },
            {
                name: 'Last name',
                fullName: 'Current agent last name',
                value: '{{current_user.lastname}}',
            },
            {
                name: 'Full name',
                fullName: 'Current agent full name',
                value: '{{current_user.name}}',
            },
            {
                name: 'Email',
                fullName: 'Current agent email',
                value: '{{current_user.email}}',
            },
            {
                name: 'Bio',
                fullName: 'Current agent bio',
                value: '{{current_user.bio}}',
            },
        ],
    },
    {
        type: 'survey',
        explicit: true,
        name: 'Satisfaction Survey',
        value: '{{satisfaction_survey_url}}',
    },
    ...(INTEGRATION_VARIABLES as Variable[]),
]

// variables used in some other variables, but which are never available to use on their own
export const HIDDEN_VARIABLES = [...INTEGRATION_HIDDEN_VARIABLES] as Variable[]

// previously available variables in macros: still displayed as variables but are not available in dropdowns anymore
export const PREVIOUS_VARIABLES: Variable[] = [
    {
        name: 'Ticket Customer',
        type: 'ticket.requester',
        children: [
            {
                name: 'First name',
                fullName: 'Customer first name',
                value: '{{ticket.customer.firstname}}',
            },
            {
                name: 'Last name',
                fullName: 'Customer last name',
                value: '{{ticket.customer.lastname}}',
            },
            {
                name: 'Full name',
                fullName: 'Customer full name',
                value: '{{ticket.customer.name}}',
            },
            {
                name: 'Email',
                fullName: 'Customer email',
                value: '{{ticket.customer.email}}',
            },
        ],
    },
    ...(INTEGRATION_PREVIOUS_VARIABLES as Variable[]),
]
