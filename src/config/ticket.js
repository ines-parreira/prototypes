import {fromJS} from 'immutable'
import _find from 'lodash/find'

import { SourceTypes, type SourceType } from '../business/ticket'
import type {TicketMessage} from '../models/ticket'
import {compare, getLastMessage, toImmutable} from '../utils'
import {isForwardedMessage} from '../state/ticket/utils'

import {INTEGRATION_HIDDEN_VARIABLES, INTEGRATION_PREVIOUS_VARIABLES, INTEGRATION_VARIABLES} from './integrations'

export const AIRCALL_CHANNEL = 'aircall'
export const API_CHANNEL = 'api'
export const CHAT_CHANNEL = 'chat'
export const EMAIL_CHANNEL = 'email'
export const FACEBOOK_CHANNEL = 'facebook'
export const FACEBOOK_MESSENGER_CHANNEL = 'facebook-messenger'
export const INSTAGRAM_AD_COMMENT_CHANNEL = 'instagram-ad-comment'
export const INSTAGRAM_COMMENT_CHANNEL = 'instagram-comment'
export const PHONE_CHANNEL = 'phone'
export const SMS_CHANNEL = 'sms'
export const TWITTER_CHANNEL = 'twitter'

export const DEFAULT_CHANNEL = EMAIL_CHANNEL
export const DEFAULT_SOURCE_TYPE = EMAIL_CHANNEL

export const STATUSES = ['open', 'closed']
export const CHANNELS = [
    AIRCALL_CHANNEL, API_CHANNEL, CHAT_CHANNEL, EMAIL_CHANNEL, FACEBOOK_CHANNEL, FACEBOOK_MESSENGER_CHANNEL,
    INSTAGRAM_AD_COMMENT_CHANNEL, INSTAGRAM_COMMENT_CHANNEL, PHONE_CHANNEL, SMS_CHANNEL, TWITTER_CHANNEL
]

// TODO(business-extract): Deprecated constants => Use directly the SourceTypes.XXX in your code
export const AIRCALL_SOURCE = SourceTypes.AIRCALL
export const API_SOURCE = SourceTypes.API
export const CHAT_SOURCE = SourceTypes.CHAT
export const EMAIL_FORWARD_SOURCE = SourceTypes.EMAIL_FORWARD
export const EMAIL_SOURCE = SourceTypes.EMAIL
export const FACEBOOK_COMMENT_SOURCE = SourceTypes.FACEBOOK_COMMENT
export const FACEBOOK_MESSAGE_SOURCE = SourceTypes.FACEBOOK_MESSAGE
export const FACEBOOK_MESSENGER_SOURCE = SourceTypes.FACEBOOK_MESSENGER
export const FACEBOOK_POST_SOURCE = SourceTypes.FACEBOOK_POST
export const INSTAGRAM_AD_COMMENT_SOURCE = SourceTypes.INSTAGRAM_AD_COMMENT
export const INSTAGRAM_AD_MEDIA_SOURCE = SourceTypes.INSTAGRAM_AD_MEDIA
export const INSTAGRAM_COMMENT_SOURCE = SourceTypes.INSTAGRAM_COMMENT
export const INSTAGRAM_MEDIA_SOURCE = SourceTypes.INSTAGRAM_MEDIA
export const INTERNAL_NOTE_SOURCE = SourceTypes.INTERNAL_NOTE
export const OTTSPOTT_CALL_SOURCE = SourceTypes.OTTSPOTT_CALL
export const PHONE_SOURCE = SourceTypes.PHONE
export const SYSTEM_MESSAGE_SOURCE = SourceTypes.SYSTEM_MESSAGE
export const TWITTER_SOURCE = SourceTypes.TWITTER

export const SOURCE_TYPES = [
    AIRCALL_SOURCE | API_SOURCE | CHAT_SOURCE | EMAIL_FORWARD_SOURCE | EMAIL_SOURCE | FACEBOOK_COMMENT_SOURCE |
    FACEBOOK_MESSAGE_SOURCE | FACEBOOK_MESSENGER_SOURCE | FACEBOOK_POST_SOURCE | INSTAGRAM_AD_COMMENT_SOURCE |
    INSTAGRAM_AD_MEDIA_SOURCE | INSTAGRAM_COMMENT_SOURCE | INSTAGRAM_MEDIA_SOURCE | INTERNAL_NOTE_SOURCE |
    OTTSPOTT_CALL_SOURCE | PHONE_SOURCE | SYSTEM_MESSAGE_SOURCE | TWITTER_SOURCE
]

export const SYSTEM_SOURCE_TYPES = [INTERNAL_NOTE_SOURCE, SYSTEM_MESSAGE_SOURCE]

// source types that can be used to answer
export const USABLE_SOURCE_TYPES = [
    CHAT_SOURCE, EMAIL_SOURCE, FACEBOOK_COMMENT_SOURCE, FACEBOOK_MESSAGE_SOURCE, FACEBOOK_MESSENGER_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE, INSTAGRAM_COMMENT_SOURCE, INTERNAL_NOTE_SOURCE
]

// available variables in macros
export const VARIABLES = [{
    type: 'ticket.customer',
    name: 'Ticket customer',
    children: [{
        name: 'First name',
        fullName: 'Customer first name',
        value: '{{ticket.customer.firstname}}',
    }, {
        name: 'Last name',
        fullName: 'Customer last name',
        value: '{{ticket.customer.lastname}}',
    }, {
        name: 'Full name',
        fullName: 'Customer full name',
        value: '{{ticket.customer.name}}',
    }, {
        name: 'Email',
        fullName: 'Customer email',
        value: '{{ticket.customer.email}}',
    }],
}, {
    type: 'current_user',
    name: 'Current agent',
    children: [{
        name: 'First name',
        fullName: 'Current agent first name',
        value: '{{current_user.firstname}}',
    }, {
        name: 'Last name',
        fullName: 'Current agent last name',
        value: '{{current_user.lastname}}',
    }, {
        name: 'Full name',
        fullName: 'Current agent full name',
        value: '{{current_user.name}}',
    }, {
        name: 'Email',
        fullName: 'Current agent email',
        value: '{{current_user.email}}',
    }, {
        name: 'Bio',
        fullName: 'Current agent bio',
        value: '{{current_user.bio}}',
    }],
}, {
    type: 'survey',
    explicit: true,
    name: 'Satisfaction Survey',
    value: '{{satisfaction_survey_url}}',
},
...INTEGRATION_VARIABLES
]

// variables used in some other variables, but which are never available to use on their own
export const HIDDEN_VARIABLES = [
    ...INTEGRATION_HIDDEN_VARIABLES
]

// previously available variables in macros: still displayed as variables but are not available in dropdowns anymore
export const PREVIOUS_VARIABLES = [{
    name: 'Ticket Customer',
    type: 'ticket.requester',
    children: [{
        name: 'First name',
        fullName: 'Customer first name',
        value: '{{ticket.customer.firstname}}',
    }, {
        name: 'Last name',
        fullName: 'Customer last name',
        value: '{{ticket.customer.lastname}}',
    }, {
        name: 'Full name',
        fullName: 'Customer full name',
        value: '{{ticket.customer.name}}',
    }, {
        name: 'Email',
        fullName: 'Customer email',
        value: '{{ticket.customer.email}}',
    }],
},
...INTEGRATION_PREVIOUS_VARIABLES
]

/**
 * Return passed messages ordered by created_datetime
 * @param messages
 */
export function orderedMessages(messages: Array<TicketMessage>): Array<TicketMessage> {
    return toImmutable(messages)
        .sort((a, b) => compare(a.get('created_datetime'), b.get('created_datetime')))
}

/**
 * Return true if passed source type can be used to answer (can be used as a source type in a new message)
 * @param sourceType
 * @returns {boolean}
 */
export function isAnswerableType(sourceType: SourceType): boolean {
    return USABLE_SOURCE_TYPES.includes(sourceType)
}

/**
 * Return true if passed source type is a system source type
 * @param sourceType
 * @returns {boolean}
 */
export function isSystemType(sourceType: SourceType): boolean {
    return SYSTEM_SOURCE_TYPES.includes(sourceType)
}

/**
 * Get the most recent message that was not a system-type message, if any
 * @param messages
 * @returns {?TicketMessage}
 */
export function lastNonSystemTypeMessage(messages: Array<TicketMessage>): ?TicketMessage  {
    const filteredMessages = orderedMessages(messages)
        .filter((message) => {
            return !isSystemType(message.getIn(['source', 'type'])) && !isForwardedMessage(message)
        })
    return !filteredMessages.isEmpty() && fromJS(getLastMessage(filteredMessages.toJS()))
}

/**
 * Return channel of passed source type
 * @param sourceType: the source type from which we want to get the corresponding channel
 * @param messages: the messages for which we want to get a channel
 * @returns {string}: the channel corresponding to the passed source type
 */
export function sourceTypeToChannel(sourceType: SourceType, messages: Array<TicketMessage> = []): string {
    if (!sourceType) {
        return DEFAULT_CHANNEL
    }

    if (isSystemType(sourceType)) {
        const lastMessage = lastNonSystemTypeMessage(messages)

        if (!lastMessage) {
            return DEFAULT_CHANNEL
        }

        const lastSourceType = lastMessage.getIn(['source', 'type'])
        return sourceTypeToChannel(lastSourceType, messages)
    }

    if (sourceType.startsWith('facebook') && sourceType !== SourceTypes.FACEBOOK_MESSENGER) {
        return FACEBOOK_CHANNEL
    }

    if (sourceType.startsWith('instagram-ad')) {
        return INSTAGRAM_AD_COMMENT_CHANNEL
    }

    if (sourceType.startsWith('instagram')) {
        return INSTAGRAM_COMMENT_CHANNEL
    }

    if (sourceType === 'ottspott-call') {
        return PHONE_CHANNEL
    }

    return sourceType
}

/**
 * Return source type we should set on a **new** message based on the source type of messages we're responding to
 */
export function responseSourceType(messages: Array<TicketMessage>): SourceType {
    if (!messages) {
        return DEFAULT_SOURCE_TYPE
    }

    const lastMessage = lastNonSystemTypeMessage(messages)

    // some messages don't have sources - failed imports, api, etc..
    if (!lastMessage || !lastMessage.get('source')) {
        return DEFAULT_SOURCE_TYPE
    }

    const lastSourceType = lastMessage.getIn(['source', 'type'])

    if (lastSourceType === SourceTypes.FACEBOOK_POST) {
        return SourceTypes.FACEBOOK_COMMENT
    }

    if (lastSourceType === SourceTypes.INSTAGRAM_MEDIA) {
        return SourceTypes.INSTAGRAM_COMMENT
    }

    if (lastSourceType === SourceTypes.INSTAGRAM_AD_MEDIA) {
        return SourceTypes.INSTAGRAM_AD_COMMENT
    }

    if (!isAnswerableType(lastSourceType)) {
        return DEFAULT_SOURCE_TYPE
    }

    return lastSourceType
}

/**
 * Return true if source type is public type
 * @param sourceType
 * @returns {boolean}
 */
export function isPublic(sourceType: SourceType): boolean {
    return sourceType !== SourceTypes.INTERNAL_NOTE
}

/**
 * Return true if type supports HTML content
 * @param sourceType
 * @returns {boolean}
 */
export function isRichType(sourceType: SourceType): boolean {
    return [SourceTypes.EMAIL, SourceTypes.INTERNAL_NOTE].includes(sourceType)
}

/**
 * Return true if can leave internal note
 * @param sourceType
 * @returns {boolean}
 */
export function canLeaveInternalNote(sourceType: SourceType): boolean {
    return sourceType === SourceTypes.INTERNAL_NOTE
}

/**
 * Return variables config
 * @returns {[*,*,*,*]}
 */
export function getVariables(types: Array<string>): Array {
    if (!types) {
        return VARIABLES.filter((variable) => !variable.explicit)
    }

    return VARIABLES.filter((variables) => types.includes(variables.type))
}

/**
 * Return array of configs of variables
 * Autocomplete fullName and type properties of each config
 * @param variablesList
 * @returns {Array}
 */
export function getVariablesList(variablesList: Array<Object> = VARIABLES): Array<Object> {
    const variables = []

    variablesList.forEach((category) => {
        if (category.children !== undefined) {
            category.children.forEach((variable) => {
                const object = {
                    ...variable,
                    fullName: variable.fullName || variable.name,
                }

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
            })
        }
    })

    return variables
}

/**
 * Return variable config with passed value
 * @param value
 * @returns {*}
 */
export function getVariableWithValue(value: string): Object {
    const variables = getVariablesList()
    const hiddenVariables = getVariablesList(HIDDEN_VARIABLES)
    const previousVariables = getVariablesList(PREVIOUS_VARIABLES)

    return _find(variables, {value})
        || _find(previousVariables, {value})
        || _find(hiddenVariables, {value})
}
