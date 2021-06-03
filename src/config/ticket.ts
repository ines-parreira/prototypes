import {fromJS, List, Map} from 'immutable'
import _find from 'lodash/find'

import {
    TicketChannel,
    TicketMessageSourceType,
    TicketStatus,
    TicketVia,
} from '../business/types/ticket'
import {TicketMessage} from '../models/ticket/types'
import {compare, getLastMessage, toImmutable} from '../utils'
import {isForwardedMessage} from '../state/ticket/utils.js'

import {
    INTEGRATION_HIDDEN_VARIABLES,
    INTEGRATION_PREVIOUS_VARIABLES,
    INTEGRATION_VARIABLES,
} from './integrations/index.js'

// TODO(business-extract): Deprecated constants => Use directly Channels.XXX in your code
//$TsFixMe fallback constants for js files, remove once replaced with TicketChannel enum
export const CHAT_CHANNEL = TicketChannel.Chat
export const EMAIL_CHANNEL = TicketChannel.Email
export const FACEBOOK_MESSENGER_CHANNEL = TicketChannel.FacebookMessenger
export const INSTAGRAM_DM_CHANNEL = TicketChannel.InstagramDirectMessage
export const CHANNELS = Object.values(TicketChannel)

export const DEFAULT_CHANNEL = TicketChannel.Email

// TODO(business-extract): Deprecated constants => Use directly Statuses.XXX in your code
//$TsFixMe fallback constants for js files, remove once replaced with TicketStatus enum
export const OPEN_STATUS = TicketStatus.Open
export const CLOSED_STATUS = TicketStatus.Closed
export const STATUSES = Object.values(TicketStatus)

// TODO(business-extract): Deprecated constants => Use directly SourceTypes.XXX in your code
//$TsFixMe fallback constants for js files, remove once replaced with TicketMessageSourceType enum
export const AIRCALL_SOURCE = TicketMessageSourceType.Aircall
export const API_SOURCE = TicketMessageSourceType.Api
export const CHAT_SOURCE = TicketMessageSourceType.Chat
export const EMAIL_FORWARD_SOURCE = TicketMessageSourceType.EmailForward
export const EMAIL_SOURCE = TicketMessageSourceType.Email
export const FACEBOOK_COMMENT_SOURCE = TicketMessageSourceType.FacebookComment
export const FACEBOOK_REVIEW_COMMENT_SOURCE =
    TicketMessageSourceType.FacebookReviewComment
export const FACEBOOK_MESSAGE_SOURCE = TicketMessageSourceType.FacebookMessage
export const FACEBOOK_MESSENGER_SOURCE =
    TicketMessageSourceType.FacebookMessenger
export const FACEBOOK_POST_SOURCE = TicketMessageSourceType.FacebookPost
export const FACEBOOK_REVIEW_SOURCE = TicketMessageSourceType.FacebookReview
export const INSTAGRAM_AD_COMMENT_SOURCE =
    TicketMessageSourceType.InstagramAdComment
export const INSTAGRAM_AD_MEDIA_SOURCE =
    TicketMessageSourceType.InstagramAdMedia
export const INSTAGRAM_COMMENT_SOURCE = TicketMessageSourceType.InstagramComment
export const INSTAGRAM_MEDIA_SOURCE = TicketMessageSourceType.InstagramMedia
export const INSTAGRAM_MENTION_MEDIA_SOURCE =
    TicketMessageSourceType.InstagramMentionMedia
export const INSTAGRAM_MENTION_COMMENT_SOURCE =
    TicketMessageSourceType.InstagramMentionComment
export const INSTAGRAM_DM_SOURCE =
    TicketMessageSourceType.InstagramDirectMessage
export const INTERNAL_NOTE_SOURCE = TicketMessageSourceType.InternalNote
export const OTTSPOTT_CALL_SOURCE = TicketMessageSourceType.OttspottCall
export const PHONE_SOURCE = TicketMessageSourceType.Phone
export const SYSTEM_MESSAGE_SOURCE = TicketMessageSourceType.SystemMessage
export const TWITTER_SOURCE = TicketMessageSourceType.Twitter

export const SOURCE_TYPES = Object.values(TicketMessageSourceType)

export const SYSTEM_SOURCE_TYPES = [INTERNAL_NOTE_SOURCE, SYSTEM_MESSAGE_SOURCE]

// source types that can be used to answer
export const USABLE_SOURCE_TYPES = [
    CHAT_SOURCE,
    EMAIL_SOURCE,
    FACEBOOK_COMMENT_SOURCE,
    FACEBOOK_REVIEW_COMMENT_SOURCE,
    FACEBOOK_MESSAGE_SOURCE,
    FACEBOOK_MESSENGER_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
    INSTAGRAM_MENTION_MEDIA_SOURCE,
    INSTAGRAM_MENTION_COMMENT_SOURCE,
    INSTAGRAM_DM_SOURCE,
    INTERNAL_NOTE_SOURCE,
]

export const DEFAULT_SOURCE_TYPE = TicketMessageSourceType.Email

type Variable = {
    type: string
    name: string
    children?: VariableChild[]
    value?: string
    explicit?: boolean
    fullName?: string
    integration?: string
}

type VariableChild = {
    name: string
    fullName: string
    value: string
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

/**
 * Return passed messages ordered by created_datetime
 */
export function orderedMessages(messages: Array<TicketMessage>): Map<any, any> {
    return toImmutable<List<any>>(
        messages
    ).sort((a: Map<any, any>, b: Map<any, any>) =>
        compare(a.get('created_datetime'), b.get('created_datetime'))
    ) as Map<any, any>
}

/**
 * Return true if passed source type can be used to answer (can be used as a source type in a new message)
 */
export function isAnswerableType(sourceType: TicketMessageSourceType): boolean {
    return USABLE_SOURCE_TYPES.includes(sourceType)
}

/**
 * Return true if passed source type is a system source type
 */
export function isSystemType(sourceType: TicketMessageSourceType): boolean {
    return SYSTEM_SOURCE_TYPES.includes(sourceType)
}

/**
 * Get the most recent message that was not a system-type message, if any
 */
export function lastNonSystemTypeMessage(messages: Array<TicketMessage>) {
    const filteredMessages = orderedMessages(messages).filter(
        (message: Map<any, any>) => {
            return (
                !isSystemType(message.getIn(['source', 'type'])) &&
                !isForwardedMessage(message)
            )
        }
    )
    return (!filteredMessages.isEmpty() &&
        fromJS(getLastMessage(filteredMessages.toJS()))) as Maybe<Map<any, any>>
}

/**
 * Return channel of passed source type
 */
export function sourceTypeToChannel(
    sourceType: TicketMessageSourceType,
    messages: Array<TicketMessage> = []
): TicketChannel | TicketMessageSourceType {
    if (!sourceType) {
        return DEFAULT_CHANNEL
    }

    if (isSystemType(sourceType)) {
        const lastMessage = lastNonSystemTypeMessage(messages)
        if (!lastMessage) {
            return DEFAULT_CHANNEL
        }

        if (lastMessage.get('via') === TicketVia.Twilio) {
            return DEFAULT_CHANNEL
        }
        const lastSourceType = lastMessage.getIn(['source', 'type'])
        return sourceTypeToChannel(lastSourceType, messages)
    }

    if (
        sourceType.startsWith('facebook') &&
        sourceType !== TicketMessageSourceType.FacebookMessenger
    ) {
        if (
            sourceType === TicketMessageSourceType.FacebookReview ||
            sourceType === TicketMessageSourceType.FacebookReviewComment
        ) {
            return TicketChannel.FacebookRecommendations
        }

        return TicketChannel.Facebook
    }

    if (sourceType.startsWith('instagram-ad')) {
        return TicketChannel.InstagramAdComment
    }

    if (sourceType.startsWith('instagram-mention')) {
        return TicketChannel.InstagramMention
    }

    if (sourceType.startsWith('instagram-direct')) {
        return TicketChannel.InstagramDirectMessage
    }

    if (sourceType.startsWith('instagram')) {
        return TicketChannel.InstagramComment
    }

    if (sourceType === 'ottspott-call') {
        return TicketChannel.Phone
    }

    return sourceType
}

/**
 * Return source type we should set on a **new** message based on the source type of messages we're responding to
 */
export function responseSourceType(
    messages: Array<TicketMessage>,
    via: TicketVia
): TicketMessageSourceType {
    const lastMessage = lastNonSystemTypeMessage(messages)

    if (via === TicketVia.Twilio) {
        return TicketMessageSourceType.InternalNote
    }
    // some messages don't have sources - failed imports, api, etc..
    if (!lastMessage || !lastMessage.get('source')) {
        return DEFAULT_SOURCE_TYPE
    }

    const lastSourceType = lastMessage.getIn([
        'source',
        'type',
    ]) as TicketMessageSourceType

    if (lastSourceType === TicketMessageSourceType.FacebookPost) {
        return TicketMessageSourceType.FacebookComment
    }

    if (lastSourceType === TicketMessageSourceType.FacebookReview) {
        return TicketMessageSourceType.FacebookReviewComment
    }

    if (lastSourceType === TicketMessageSourceType.InstagramMedia) {
        return TicketMessageSourceType.InstagramComment
    }

    if (lastSourceType === TicketMessageSourceType.InstagramAdMedia) {
        return TicketMessageSourceType.InstagramAdComment
    }

    if (lastSourceType === TicketMessageSourceType.InstagramMentionMedia) {
        return TicketMessageSourceType.InstagramMentionComment
    }

    if (!isAnswerableType(lastSourceType)) {
        return DEFAULT_SOURCE_TYPE
    }

    return lastSourceType
}

/**
 * Return true if source type is public type
 */
export function isPublic(sourceType: TicketMessageSourceType): boolean {
    return sourceType !== TicketMessageSourceType.InternalNote
}

/**
 * Return true if type supports HTML content
 */
export function isRichType(sourceType: TicketMessageSourceType): boolean {
    return [
        TicketMessageSourceType.Email,
        TicketMessageSourceType.InternalNote,
        TicketMessageSourceType.Chat,
    ].includes(sourceType)
}

/**
 * Return true if can leave internal note
 */
export function canLeaveInternalNote(
    sourceType: TicketMessageSourceType
): boolean {
    return sourceType === TicketMessageSourceType.InternalNote
}

/**
 * Return variables config
 */
export function getVariables(types: Array<string>): Array<Variable> {
    if (!types) {
        return VARIABLES.filter((variable) => !variable.explicit)
    }

    return VARIABLES.filter((variables) => types.includes(variables.type))
}

/**
 * Return array of configs of variables
 * Autocomplete fullName and type properties of each config
 */
export function getVariablesList(
    variablesList: Array<Variable> = VARIABLES
): Array<Variable> {
    const variables: Variable[] = []

    variablesList.forEach((category) => {
        if (category.children !== undefined) {
            category.children.forEach((variable) => {
                const object = {
                    ...variable,
                    fullName: variable.fullName || variable.name,
                } as Variable

                if (category.type) {
                    object.type = category.type
                }

                if (category.integration) {
                    object.integration = category.integration
                }

                variables.push(object)
            })
        } else {
            variables.push({
                value: category.value,
                type: category.type,
                fullName: category.fullName || category.name,
            } as Variable)
        }
    })

    return variables
}

/**
 * Return variable config with passed value
 */
export function getVariableWithValue(value: string) {
    const variables = getVariablesList()
    const hiddenVariables = getVariablesList(HIDDEN_VARIABLES)
    const previousVariables = getVariablesList(PREVIOUS_VARIABLES)

    return (
        _find(variables, {value}) ||
        _find(previousVariables, {value}) ||
        _find(hiddenVariables, {value})
    )
}
