import {fromJS} from 'immutable'
import _find from 'lodash/find'

import {getLastMessage, compare, toImmutable} from '../utils'
import {isForwardedMessage} from '../state/ticket/utils'

export const DEFAULT_CHANNEL = 'email'
export const DEFAULT_SOURCE_TYPE = 'email'

export const STATUSES = ['open', 'closed']
export const CHANNELS = ['aircall', 'api', 'chat', 'email', 'facebook', 'facebook-messenger', 'phone', 'sms', 'twitter', 'instagram-comment']

export const SYSTEM_SOURCE_TYPES = ['internal-note', 'system-message']

// source types that can be used to answer
export const USABLE_SOURCE_TYPES = ['email', 'chat', 'facebook-messenger', 'facebook-message', 'facebook-comment', 'internal-note', 'instagram-comment']

// available variables in macros
export const VARIABLES = [{
    name: 'Ticket requester',
    type: 'ticket.customer',
    children: [{
        name: 'First name',
        fullName: 'Requester first name',
        value: '{{ticket.customer.firstname}}',
    }, {
        name: 'Last name',
        fullName: 'Requester last name',
        value: '{{ticket.customer.lastname}}',
    }, {
        name: 'Full name',
        fullName: 'Requester full name',
        value: '{{ticket.customer.name}}',
    }, {
        name: 'Email',
        fullName: 'Requester email',
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
        name: 'Last order\'s number',
        value: '{{ticket.customer.integrations.shopify.orders[0].name}}',
    }, {
        name: 'Last order\'s date',
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
        name: 'Last order\'s shipping address',
        value: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address1}} {{ticket.customer.integrations.shopify.orders[0].shipping_address.address2}}, {{ticket.customer.integrations.shopify.orders[0].shipping_address.zip}} {{ticket.customer.integrations.shopify.orders[0].shipping_address.city}} {{ticket.customer.integrations.shopify.orders[0].shipping_address.province}}',
    }]
}, {
    type: 'recharge',
    integration: true,
    name: 'Recharge',
    children: [{
        name: 'Customer\'s hash',
        value: '{{ticket.customer.integrations.recharge.customer.hash}}',
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
    name: 'Ticket requester',
    type: 'ticket.requester',
    children: [{
        name: 'First name',
        fullName: 'Requester first name',
        value: '{{ticket.customer.firstname}}',
    }, {
        name: 'Last name',
        fullName: 'Requester last name',
        value: '{{ticket.customer.lastname}}',
    }, {
        name: 'Full name',
        fullName: 'Requester full name',
        value: '{{ticket.customer.name}}',
    }, {
        name: 'Email',
        fullName: 'Requester email',
        value: '{{ticket.customer.email}}',
    }],
}, {
    type: 'shopify',
    name: 'Shopify',
    children: [{
        name: 'Last order\'s number',
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
        name: 'Last order\'s number',
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
        name: 'Customer\'s hash',
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
    const filteredMessages = messages.filter(message => {
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
    return ['chat', 'facebook-messenger'].includes(sourceType)
}

/**
 * Return an icon for any message source type, message channel or integration type
 * @param sourceType
 * @returns {*}
 * TODO replace sourceTypeToIcon with SourceIcon component, for material-icons transition.
 */
export const sourceTypeToIcon = (sourceType) => {
    switch (sourceType) {
        case 'internal-note':
            return 'fa fa-fw fa-comment yellow'
        case 'email':
        case 'gmail':
            return 'fa fa-fw fa-envelope blue'
        case 'email-forward':
            return 'fa fa-fw fa-reply blue'
        case 'chat':
        case 'smooch':
        case 'smooch_inside':
            return 'fa fa-fw fa-comments purple'
        case 'api':
            return 'fa fa-fw fa-code'
        case 'aircall':
        case 'phone':
        case 'ottspott-call':
            return 'fa fa-fw fa-phone'
        case 'facebook':
        case 'facebook-account':
        case 'facebook-post':
        case 'facebook-comment':
            return 'fa fa-fw fa-facebook-square blue'
        case 'facebook-messenger':
        case 'facebook-message':
            return 'fa fa-fw fa-facebook-messenger blue' // custom font
        case 'system-message':
            return 'fa fa-fw fa-cog'
        case 'twitter':
            return 'fa fa-fw fa-twitter blue'
        case 'instagram-media':
        case 'instagram-comment':
        case 'instagram':
            return 'fa fa-fw fa-instagram purple'
        default:
            return 'fa fa-fw fa-question'
    }
}

/**
 * Return variables config
 * @returns {[*,*,*,*]}
 */
export const getVariables = (types) => {
    if (!types) {
        return VARIABLES
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
