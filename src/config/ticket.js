import {fromJS} from 'immutable'
import _find from 'lodash/find'

import {getLastMessage, compare, toImmutable} from '../utils'
import {isForwardedMessage} from '../state/ticket/utils'

export const EMAIL_CHANNEL = 'email'
export const CHAT_CHANNEL = 'chat'
export const AIRCALL_CHANNEL = 'aircall'
export const API_CHANNEL = 'api'
export const FACEBOOK_CHANNEL = 'facebook'
export const FACEBOOK_MESSENGER_CHANNEL = 'facebook-messenger'
export const PHONE_CHANNEL = 'phone'
export const SMS_CHANNEL = 'sms'
export const TWITTER_CHANNEL = 'twitter'
export const INSTAGRAM_COMMENT_CHANNEL = 'instagram-comment'

export const DEFAULT_CHANNEL = EMAIL_CHANNEL
export const DEFAULT_SOURCE_TYPE = EMAIL_CHANNEL

export const STATUSES = ['open', 'closed']
export const CHANNELS = [
    AIRCALL_CHANNEL, API_CHANNEL, CHAT_CHANNEL, EMAIL_CHANNEL, FACEBOOK_CHANNEL,
    SMS_CHANNEL, FACEBOOK_MESSENGER_CHANNEL, PHONE_CHANNEL, TWITTER_CHANNEL, INSTAGRAM_COMMENT_CHANNEL
]

export const EMAIL_SOURCE = 'email'
export const CHAT_SOURCE = 'chat'
export const FACEBOOK_MESSENGER_SOURCE = 'facebook-messenger'
export const FACEBOOK_MESSAGE_SOURCE = 'facebook-message'
export const FACEBOOK_POST_SOURCE = 'facebook-post'
export const INSTAGRAM_MEDIA_SOURCE = 'instagram-media'
export const FACEBOOK_COMMENT_SOURCE = 'facebook-comment'
export const INSTAGRAM_COMMENT_SOURCE = 'instagram-comment'
export const INTERNAL_NOTE_SOURCE = 'internal-note'
export const SYSTEM_MESSAGE_SOURCE = 'system-message'

export const SYSTEM_SOURCE_TYPES = [INTERNAL_NOTE_SOURCE, SYSTEM_MESSAGE_SOURCE]

// source types that can be used to answer
export const USABLE_SOURCE_TYPES = [
    EMAIL_SOURCE, CHAT_SOURCE, FACEBOOK_MESSENGER_SOURCE, FACEBOOK_MESSAGE_SOURCE,
    FACEBOOK_COMMENT_SOURCE, INTERNAL_NOTE_SOURCE, INSTAGRAM_COMMENT_SOURCE
]

// available variables in macros
export const VARIABLES = [{
    name: 'Ticket customer',
    type: 'ticket.customer',
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
    name: 'Current agent',
    type: 'current_user',
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
    type: 'shopify',
    name: 'Shopify',
    integration: true,
    children: [{
        name: 'Number of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].name}}',
    }, {
        name: 'Date of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].created_at|datetime_format("MMMM Do YYYY")}}',
    }, {
        name: 'Tracking url of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_url}}',
    }, {
        name: 'Tracking number of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_number}}',
    }, {
        name: 'Delivery status of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].shipment_status}}',
    }, {
        name: 'Status URL of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].order_status_url}}',
    }, {
        name: 'Shipping date of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].created_at|datetime_format("MMMM Do YYYY")}}'
    }, {
        name: 'Destination country of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.country}}'
    }, {
        name: 'Shipping address of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address1}} {{ticket.customer.integrations.shopify.orders[0].shipping_address.address2}}, {{ticket.customer.integrations.shopify.orders[0].shipping_address.zip}} {{ticket.customer.integrations.shopify.orders[0].shipping_address.city}} {{ticket.customer.integrations.shopify.orders[0].shipping_address.province}}',
    }]
}, {
    type: 'recharge',
    integration: true,
    name: 'Recharge',
    children: [{
        name: 'Hash of customer',
        value: '{{ticket.customer.integrations.recharge.customer.hash}}',
    }, {
        name: 'Quantity of last subscription',
        value: '{{ticket.customer.integrations.recharge.subscriptions[0].quantity}}',
    }, {
        name: 'Product title of last subscription',
        value: '{{ticket.customer.integrations.recharge.subscriptions[0].product_title}}',
    }, {
        name: 'Order interval frequency of last subscription',
        value: '{{ticket.customer.integrations.recharge.subscriptions[0].order_interval_frequency}}',
    }, {
        name: 'Order interval unit of last subscription',
        value: '{{ticket.customer.integrations.recharge.subscriptions[0].order_interval_unit}}',
    }, {
        name: 'Price of last subscription',
        value: '{{ticket.customer.integrations.recharge.subscriptions[0].price}}',
    }, {
        name: 'Scheduled date of next charge of last subscription',
        value: '{{ticket.customer.integrations.recharge.subscriptions[0].next_charge_scheduled_at|datetime_format("L")}}',
    }]
}, {
    type: 'smile',
    integration: true,
    name: 'Smile',
    children: [{
        name: 'Points balance',
        value: '{{ticket.customer.integrations.smile.customer.points_balance}}',
    }, {
        name: 'Referral URL',
        value: '{{ticket.customer.integrations.smile.customer.referral_url}}',
    }, {
        name: 'Customer state',
        value: '{{ticket.customer.integrations.smile.customer.state}}',
    }, {
        name: 'Vip tier',
        value: '{{ticket.customer.integrations.smile.customer.vip_tier.name}}',
    }]
}, {
    type: 'survey',
    explicit: true,
    name: 'Satisfaction Survey',
    value: '{{satisfaction_survey_url}}',
}]

// variables used in some other variables, but which are never available to use on their own
export const HIDDEN_VARIABLES = [{
    type: 'shopify',
    name: 'Shopify',
    integration: true,
    children: [{
        name: 'Address 1',
        value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address1}}'
    }, {
        name: 'Address 2',
        value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address2}}'
    }, {
        name: 'Zip code',
        value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.zip}}'
    }, {
        name: 'City',
        value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.city}}'
    }, {
        name: 'Province',
        value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.province}}'
    }],
}]

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
}, {
    type: 'shopify',
    name: 'Shopify',
    children: [{
        name: 'Number of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].name}}',
    }, {
        name: 'Tracking url of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_url}}',
    }, {
        name: 'Tracking number of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_number}}',
    }, {
        name: 'Delivery status of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].shipment_status}}',
    }, {
        name: 'Status URL of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].order_status_url}}',
    }, {
        name: 'Shipping date of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].created_at|datetime_format("MMMM Do YYYY")}}'
    }, {
        name: 'Destination country of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.country}}'
    }, {
        name: 'Number of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].order_number}}',
    }, {
        name: 'Tracking urls of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_urls}}',
    }, {
        name: 'Tracking numbers of last order',
        value: '{{ticket.customer.integrations.shopify.orders[0].fulfillments[0].tracking_numbers}}',
    }, {
        name: 'Address 1',
        value: '{{ticket.customer.integrations.shopify.customer.default_address.address1}}'
    }, {
        name: 'Address 2',
        value: '{{ticket.customer.integrations.shopify.customer.default_address.address2}}'
    }, {
        name: 'Zip code',
        value: '{{ticket.customer.integrations.shopify.customer.default_address.zip}}'
    }, {
        name: 'City',
        value: '{{ticket.customer.integrations.shopify.customer.default_address.city}}'
    }, {
        name: 'Province',
        value: '{{ticket.customer.integrations.shopify.customer.default_address.province}}'
    }],
}, {
    type: 'recharge',
    integration: true,
    name: 'Recharge',
    children: [{
        name: 'Hash of customer',
        value: '{{ticket.customer.integrations.recharge.customer.hash}}',
    }]
}]

/**
 * Return passed messages ordered by created_datetime
 * @param messages
 */
export const orderedMessages = (messages) => {
    messages = toImmutable(messages)
    return messages.sort((a, b) => compare(a.get('created_datetime'), b.get('created_datetime')))
}

/**
 * Return true if passed source type can be used to answer (can be used as a source type in a new message)
 * @param sourceType
 * @returns {boolean}
 */
export const isAnswerableType = (sourceType) => {
    return USABLE_SOURCE_TYPES.includes(sourceType)
}

/**
 * Return true if passed source type is a system source type
 * @param sourceType
 * @returns {boolean}
 */
export const isSystemType = (sourceType) => {
    return SYSTEM_SOURCE_TYPES.includes(sourceType)
}

/**
 * Get the most recent message that was not a system-type message
 * @param messages
 * @returns {*}
 */
export function lastNonSystemTypeMessage(messages) {
    messages = toImmutable(messages)
    messages = orderedMessages(messages)
    const filteredMessages = messages.filter((message) => {
        return !isSystemType(message.getIn(['source', 'type'])) && !isForwardedMessage(message)
    })
    return !filteredMessages.isEmpty() && fromJS(getLastMessage(filteredMessages.toJS()))
}

/**
 * Return channel of passed source type
 * @param sourceType
 * @param messages
 * @returns {*}
 */
export const sourceTypeToChannel = (sourceType, messages = []) => {
    if (!sourceType) {
        return DEFAULT_CHANNEL
    }

    messages = toImmutable(messages)

    if (isSystemType(sourceType)) {
        const lastMessage = lastNonSystemTypeMessage(messages)

        if (!lastMessage) {
            return DEFAULT_CHANNEL
        }

        const lastSourceType = lastMessage.getIn(['source', 'type'])
        return sourceTypeToChannel(lastSourceType, messages)
    }

    if (sourceType.startsWith('facebook') && sourceType !== 'facebook-messenger') {
        return 'facebook'
    }

    if (sourceType.startsWith('instagram')) {
        return 'instagram-comment'
    }

    if (sourceType === 'ottspott-call') {
        return 'phone'
    }

    return sourceType
}

/**
 * Return source type we should set on a **new** message based on the source type of messages we're responding to
 */
export const responseSourceType = (messages) => {
    messages = toImmutable(messages)
    messages = orderedMessages(messages)

    if (!messages) {
        return DEFAULT_SOURCE_TYPE
    }

    const lastMessage = lastNonSystemTypeMessage(messages)

    // some messages don't have sources - failed imports, api, etc..
    if (!lastMessage || !lastMessage.get('source')) {
        return DEFAULT_SOURCE_TYPE
    }

    const lastSourceType = lastMessage.getIn(['source', 'type'])

    if (lastSourceType === 'facebook-post') {
        return 'facebook-comment'
    }

    if (lastSourceType === 'instagram-media') {
        return 'instagram-comment'
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
export const isPublic = (sourceType) => {
    return sourceType !== 'internal-note'
}

/**
 * Return true if type supports HTML content
 * @param sourceType
 * @returns {boolean}
 */
export const isRichType = (sourceType) => {
    return ['email', 'internal-note'].includes(sourceType)
}

/**
 * Return true if can leave internal note
 * @param sourceType
 * @returns {boolean}
 */
export const canLeaveInternalNote = (sourceType) => {
    return sourceType === 'internal-note'
}

/**
 * Return true if type supports only images as attachments (no PDF, etc.)
 * @param sourceType
 * @returns {boolean}
 */
export const acceptsOnlyImages = (sourceType) => {
    return ['chat'].includes(sourceType)
}

/**
 * Return variables config
 * @returns {[*,*,*,*]}
 */
export const getVariables = (types) => {
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
export const getVariablesList = (variablesList = VARIABLES) => {
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
export const getVariableWithValue = (value) => {
    const variables = getVariablesList()
    const hiddenVariables = getVariablesList(HIDDEN_VARIABLES)
    const previousVariables = getVariablesList(PREVIOUS_VARIABLES)

    return _find(variables, {value})
        || _find(previousVariables, {value})
        || _find(hiddenVariables, {value})
}
