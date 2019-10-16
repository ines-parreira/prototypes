// @flow
import axios from 'axios'
import _find from 'lodash/find'
import _get from 'lodash/get'

import {RECHARGE_CANCELLATION_REASONS, RECHARGE_DEFAULT_CANCELLATION_REASON} from './config/integrations/recharge'

import {
    EMAIL_INTEGRATION_TYPE,
    EMAIL_INTEGRATION_TYPES,
    MAGENTO2_INTEGRATION_TYPE,
    RECHARGE_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE
} from './constants/integration'

import {daysToHours, hoursToSeconds} from './utils'

// TODO @LouisBarranqueiro switch all configuration to modular version

/**
 * Set default axios headers
 */
//$FlowFixMe
axios.defaults.headers.common['X-CSRF-Token'] = window.CSRF_TOKEN

/**
 * Action related
 */
// remember to keep them uppercase in the array below
export const HTTP_METHOD_GET = 'GET'
export const HTTP_METHOD_POST = 'POST'
export const HTTP_METHOD_PUT = 'PUT'
export const HTTP_METHOD_DELETE = 'DELETE'
export const AVAILABLE_HTTP_METHODS = [HTTP_METHOD_GET, HTTP_METHOD_POST, HTTP_METHOD_PUT, HTTP_METHOD_DELETE]

/**
 * Timeformat related
 */
export const AVAILABLE_LANGUAGES = [
    {
        localeName: 'en',
        displayName: 'English US'
    },
    {
        localeName: 'fr',
        displayName: 'French'
    },
]

/**
 * View related
 */
export const BASIC_OPERATORS = {
    eq: {
        label: 'is'
    },
    neq: {
        label: 'is not'
    }
}

export const EMPTY_OPERATORS = {
    isEmpty: {
        label: 'is empty'
    },
    isNotEmpty: {
        label: 'is not empty'
    }
}

export const UNARY_OPERATORS = {
    ...EMPTY_OPERATORS,
    duringBusinessHours: {
        label: 'during business hours'
    },
    outsideBusinessHours: {
        label: 'outside business hours'
    }
}

export const TIMEDELTA_OPERATOR_DEFAULT_UNIT = 'd'
export const TIMEDELTA_OPERATOR_DEFAULT_QUANTITY = 1
export const TIMEDELTA_OPERATOR_DEFAULT_VALUE =
    `${TIMEDELTA_OPERATOR_DEFAULT_QUANTITY}${TIMEDELTA_OPERATOR_DEFAULT_UNIT}`

/**
 * Ticket-related
 */
export const SOURCE_VALUE_PROP = {
    email: 'address',
    phone: 'address',
    'ottspott-call': 'address',
    chat: 'address',
    aircall: 'address',
    api: null,
    'facebook-message': 'address',
    'facebook-comment': 'address',
    'facebook-messenger': 'address',
    'facebook-post': 'address',
    'facebook-ad-post': 'address',
    'facebook-ad-comment': 'address',
    'instagram-media': 'address',
    'instagram-comment': 'address',
    'instagram-ad-media': 'address',
    'instagram-ad-comment': 'address',
}

export const TICKET_STATUSES = ['open', 'closed']

/**
 * Widget related
 */
export const DEFAULT_SOURCE_PATHS = {
    ticket: {
        custom: ['ticket', 'customer', 'data'],
        integrations: ['ticket', 'customer', 'integrations']
    },
    customer: {
        custom: ['customer', 'data'],
        integrations: ['customer', 'integrations']
    },
    //TODO(customers-migration): remove this property when we migrated widgets.
    user: {
        custom: ['customer', 'data'],
        integrations: ['customer', 'integrations']
    }
}

/**
 * Integration-related
 */

// A list of integration types along with descriptions that will be displayed in the integrations summary
export const INTEGRATION_TYPE_DESCRIPTIONS = [
    {
        type: EMAIL_INTEGRATION_TYPE,
        subTypes: EMAIL_INTEGRATION_TYPES,
        title: 'Email',
        description: 'Connect your support email addresses and respond to your customers from Gorgias',
    },
    {
        type: 'smooch_inside',
        title: 'Chat',
        description: 'Add a chat on your website',
    },
    {
        type: 'facebook',
        title: 'Facebook, Messenger & Instagram',
        description: 'Create tickets from Facebook posts and comments, Instagram comments and Messenger conversations',
        image: 'integrations/facebook.png',
    },
    {
        type: 'aircall',
        title: 'Aircall',
        description: 'Provide phone support & create tickets when customers call you.',
        image: 'integrations/aircall.png'
    },
    {
        type: 'http',
        title: 'HTTP',
        description: 'Connect any application to Gorgias',
        image: 'integrations/http.png',
    },
    {
        type: 'shopify',
        title: 'Shopify',
        description: 'Display customer profiles & orders next to tickets. Edit orders with macros',
        image: 'integrations/shopify.png',
    },
    {
        type: MAGENTO2_INTEGRATION_TYPE,
        title: 'Magento 2',
        description: 'Display customer profiles & orders next to tickets. Edit orders with macros',
        image: 'integrations/magento.png',
        hide: true

    },
    {
        type: 'recharge',
        title: 'Recharge',
        description: 'Display subscription info. Refund charges & skip monthly payments.',
        image: 'integrations/recharge.svg',
    },
    {
        type: 'smile',
        title: 'Smile',
        description: 'Display customer points and activity. Insert point balance or referral url in macros.',
        image: 'integrations/smile.svg',
    },
    {
        title: 'Helpdocs',
        description: 'Create a knowledge base & connect it to Gorgias',
        url: 'https://docs.gorgias.io/other-integrations/helpdocs',
        image: 'integrations/helpdocs.png',
    },
    {
        title: 'Veeqo',
        description: 'Display orders & inventory status next to tickets',
        url: 'https://docs.gorgias.io/other-integrations/veeqo',
        image: 'integrations/veeqo.png',
    },
    {
        title: 'Swell',
        description: 'Display loyalty points next to tickets. Award points with macros.',
        url: 'https://docs.gorgias.io/reward-and-loyalty/swell-rewards',
        image: 'integrations/swell.png',
    },
    {
        title: 'Amazon',
        description: 'Respond to support requests from Amazon',
        url: 'https://docs.gorgias.io/ecommerce-integrations/amazon',
        image: 'integrations/amazon.png',
    },
    {
        title: 'Slack',
        description: 'Post notifications on Slack when tickets are created or updated',
        url: 'https://docs.gorgias.io/other-integrations/slack',
        image: 'integrations/slack.png',
    },
    {
        title: 'Segment',
        description: 'Use Gorgias activity data in other apps.',
        url: 'https://docs.gorgias.io/data-and-http-integrations/segment',
        image: 'integrations/segment.png',
    },
    {
        title: 'Zapier',
        description: 'Trigger zaps with macros',
        url: 'https://docs.gorgias.io/data-and-http-integrations/zapier',
        image: 'integrations/zapier.png',
    },
    {
        title: 'Ottspott',
        description: 'Create tickets from phone conversations',
        url: 'https://docs.gorgias.io/voice-and-phone/ottspott',
        image: 'integrations/ottspott.png'
    },
    {
        type: 'smooch',
        title: 'Smooch',
        description: 'Connect your own Smooch to Gorgias',
        image: 'integrations/smooch.png',
    }
]

// Number of threads imported from Gmail
export const GMAIL_IMPORTED_THREADS = 1000

export const JSON_CONTENT_TYPE = 'application/json'
export const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded'

/**
 * execution - 'front' or 'back', either the action is executed client side or on server
 * name - name of the action (must correspond to action name to be triggered on client side)
 * title - label shown in actions list in macro editor
 * arguments - description of macro action form (and structure of data returned by the form)
 * integrationType - action bound to a type of integration (should nt be available if no integration of this type)
 * getStateData - selector used to retrieve data from reducer corresponding to data updated by the action
 */
export const ACTION_TEMPLATES = [
    {
        execution: 'front',
        name: 'setResponseText',
        title: 'Add response text',
        arguments: {
            body_text: {
                type: 'string',
                default: ''
            },
            body_html: {
                type: 'string',
                format: 'html',
                default: ''
            }
        }
    },
    {
        execution: 'front',
        name: 'addAttachments',
        title: 'Add attachments',
        arguments: {
            attachments: {
                type: 'listDict',
                default: []
            }
        }
    },
    {
        execution: 'front',
        name: 'addTags',
        title: 'Add tags',
        partialUpdateKey: 'tags',
        partialUpdateValue: 'tags',
    },
    {
        execution: 'front',
        name: 'setStatus',
        title: 'Set status',
        partialUpdateKey: 'status',
        partialUpdateValue: 'status',
    },
    {
        execution: 'front',
        name: 'setAssignee',
        title: 'Assign an agent',
        partialUpdateKey: 'assignee_user',
        partialUpdateValue: 'assignee_user',
        arguments: {
            assignee_user: {
                type: 'dict',
                default: null
            }
        }
    },
    {
        execution: 'front',
        name: 'setTeamAssignee',
        title: 'Assign a team',
        partialUpdateKey: 'assignee_team',
        partialUpdateValue: 'assignee_team',
        arguments: {
            assignee_team: {
                type: 'dict',
                default: null
            }
        }
    },
    {
        execution: 'front',
        name: 'setSubject',
        title: 'Set subject',
        partialUpdateKey: 'subject',
        partialUpdateValue: 'subject',
    },
    {
        execution: 'back',
        name: 'http',
        title: 'HTTP hook',
        arguments: {
            method: {
                type: 'string',
                enum: AVAILABLE_HTTP_METHODS,
                default: HTTP_METHOD_GET,
            },
            url: {
                type: 'string',
                format: 'url'
            },
            headers: {
                type: 'listDict',
                default: [],
                items: {
                    schema: {
                        key: {
                            type: 'string'
                        },
                        value: {
                            type: 'string'
                        },
                        editable: {
                            type: 'bool'
                        }
                    },
                    type: 'object'
                }
            },
            params: {
                type: 'listDict',
                default: [],
                items: {
                    schema: {
                        key: {
                            type: 'string'
                        },
                        value: {
                            type: 'string'
                        },
                        editable: {
                            type: 'bool'
                        }
                    },
                    type: 'object'
                }
            },
            form: {
                type: 'listDict',
                default: [],
                items: {
                    schema: {
                        key: {
                            type: 'string'
                        },
                        value: {
                            type: 'string'
                        },
                        editable: {
                            type: 'bool'
                        }
                    },
                    type: 'object'
                }
            },
            json: {
                type: 'dict',
                format: 'json',
                default: {}
            },
            content_type: {
                type: 'string',
                default: JSON_CONTENT_TYPE,
                enum: [JSON_CONTENT_TYPE, FORM_CONTENT_TYPE]
            }
        }
    },
    {
        execution: 'back',
        integrationType: SHOPIFY_INTEGRATION_TYPE,
        name: 'shopifyCancelLastOrder',
        title: 'Cancel last order',
        arguments: {
            restock: {
                label: 'Restock',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox'
                },
                display_order: 1
            },
            refund: {
                label: 'Refund',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox'
                },
                display_order: 2
            }
        },
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})
                },
                error: 'This customer has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This customer has no order to cancel.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return _get(shopifyIntegration, ['orders', '0', 'financial_status']) !== 'fulfilled'
                },
                error: 'The last order has already been fulfilled, it\'s not cancellable.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: SHOPIFY_INTEGRATION_TYPE,
        name: 'shopifyCancelOrder',
        title: 'Cancel order',
        arguments: {
            order_id: {
                label: 'Order ID',
                type: 'string',
                default: '',
                editable: true,
                required: true
            },
            restock: {
                label: 'Restock',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox'
                },
                display_order: 1
            },
            refund: {
                label: 'Refund',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox'
                },
                display_order: 2
            }
        }
    },
    {
        execution: 'back',
        integrationType: SHOPIFY_INTEGRATION_TYPE,
        name: 'shopifyDuplicateLastOrder',
        title: 'Duplicate last order',
        arguments: {},
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})
                },
                error: 'This customer has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This customer has no order to duplicate.'
            },
        ]
    },
    {
        execution: 'back',
        integrationType: SHOPIFY_INTEGRATION_TYPE,
        name: 'shopifyEditShippingAddressOfLastOrder',
        title: 'Edit last order\'s shipping address',
        notes: [
            'This action won\'t work if the order has already been shipped.'
        ],
        arguments: {
            name: {
                label: 'Name',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.name}}',
                editable: true,
                required: false,
                display_order: 1
            },
            address1: {
                label: 'Address (1)',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address1}}',
                editable: true,
                required: false,
                display_order: 2
            },
            address2: {
                label: 'Address (2)',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address2}}',
                editable: true,
                required: false,
                display_order: 3
            },
            city: {
                label: 'City',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.city}}',
                editable: true,
                required: false,
                display_order: 4
            },
            province: {
                label: 'State/Province',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.province}}',
                editable: true,
                required: false,
                display_order: 5
            },
            zip: {
                label: 'ZIP',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.zip}}',
                editable: true,
                required: false,
                display_order: 6
            },
            country: {
                label: 'Country',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.country}}',
                editable: true,
                required: false,
                display_order: 7
            },
        },
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})
                },
                error: 'This customer has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This customer has no order to edit.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return _get(shopifyIntegration, ['orders', '0', 'financial_status']) !== 'fulfilled'
                },
                error: 'The last order has already been fulfilled, you can\'t edit it\'s shipping address.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: SHOPIFY_INTEGRATION_TYPE,
        name: 'shopifyRefundShippingCostOfLastOrder',
        title: 'Refund last order\'s shipping cost',
        arguments: {},
        notes: [
            'This action will fail if the payment hasn\'t been captured yet.'
        ],
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This customer has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This customer has no order to refund.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return !['refunded', 'accepted']
                        .includes(_get(shopifyIntegration, ['orders', '0', 'financial_status']))
                },
                error: 'The last order has already been refunded or hasn\'t been paid for yet.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: SHOPIFY_INTEGRATION_TYPE,
        name: 'shopifyFullRefundLastOrder',
        title: 'Refund last order',
        arguments: {
            restock: {
                label: 'Restock',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox'
                },
                display_order: 1
            }
        },
        notes: [
            'This action will fail if the payment hasn\'t been captured yet.'
        ],
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})
                },
                error: 'This customer has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This customer has no order to refund.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return !['refunded', 'accepted'].includes(_get(shopifyIntegration, ['orders', '0', 'financial_status']))
                },
                error: 'The last order has already been refunded or hasn\'t been paid for yet.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: SHOPIFY_INTEGRATION_TYPE,
        name: 'shopifyPartialRefundLastOrder',
        title: 'Partially refund last order',
        arguments: {
            amount: {
                label: 'Amount',
                default: '',
                editable: true,
                required: true,
                display_order: 1,
                input: {
                    type: 'number',
                    step: 0.01
                }
            }
        },
        notes: [
            'This action will fail if the payment hasn\'t been captured yet.'
        ],
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})
                },
                error: 'This customer has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This customer has no order to refund.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return !['refunded', 'accepted'].includes(_get(shopifyIntegration, ['orders', '0', 'financial_status']))
                },
                error: 'The last order has already been refunded or hasn\'t been paid for yet.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: SHOPIFY_INTEGRATION_TYPE,
        name: 'shopifyEditNoteOfLastOrder',
        title: 'Edit last order\'s note',
        arguments: {
            note: {
                label: 'Note',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].note}}',
                editable: true,
                required: false,  // can be nulled
                display_order: 1
            }
        },
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})
                },
                error: 'This customer has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations,
                        {'__integration_type__': SHOPIFY_INTEGRATION_TYPE})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This customer has no order to edit.'
            },
        ]
    },
    {
        execution: 'back',
        integrationType: RECHARGE_INTEGRATION_TYPE,
        name: 'rechargeCancelLastSubscription',
        title: 'Cancel last subscription',
        arguments: {
            cancellation_reason: {
                label: 'Cancellation reason',
                type: 'select',
                default: RECHARGE_DEFAULT_CANCELLATION_REASON,
                editable: true,
                required: true,
                display_order: 1,
                input: {
                    type: 'select',
                    options: RECHARGE_CANCELLATION_REASONS.map((option) => ({value: option, label: option})),
                    allowCustomValue: true,
                }
            }
        },
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': RECHARGE_INTEGRATION_TYPE})
                },
                error: 'This customer has no Recharge data.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations,
                        {'__integration_type__': RECHARGE_INTEGRATION_TYPE})

                    return _get(rechargeIntegration, ['subscriptions'])
                },
                error: 'This customer has no subscription to cancel.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations,
                        {'__integration_type__': RECHARGE_INTEGRATION_TYPE})

                    return _get(rechargeIntegration, ['subscriptions', '0', 'cancelled_at']) === null
                },
                error: 'The last subscription has already been cancelled.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: RECHARGE_INTEGRATION_TYPE,
        name: 'rechargeActivateLastSubscription',
        title: 'Activate last subscription',
        arguments: {},
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': RECHARGE_INTEGRATION_TYPE})
                },
                error: 'This customer has no Recharge data.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations,
                        {'__integration_type__': RECHARGE_INTEGRATION_TYPE})

                    return _get(rechargeIntegration, ['subscriptions'])
                },
                error: 'This customer has no subscription to activate.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations,
                        {'__integration_type__': RECHARGE_INTEGRATION_TYPE})

                    return _get(rechargeIntegration, ['subscriptions', '0', 'cancelled_at']) !== null
                },
                error: 'The last subscription is already active.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: RECHARGE_INTEGRATION_TYPE,
        name: 'rechargeRefundLastCharge',
        title: 'Refund last charge',
        arguments: {
            amount: {
                label: 'Amount',
                default: '{{ticket.customer.integrations.recharge.charges[0].total_price}}',
                editable: true,
                required: true,
                display_order: 1,
                input: {
                    type: 'number',
                    step: 0.01
                }
            }
        },
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': RECHARGE_INTEGRATION_TYPE})
                },
                error: 'This customer has no Recharge data.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations,
                        {'__integration_type__': RECHARGE_INTEGRATION_TYPE})

                    return _get(rechargeIntegration, ['charges'])
                },
                error: 'This customer has no charges to refund.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations,
                        {'__integration_type__': RECHARGE_INTEGRATION_TYPE})

                    return ['SUCCESS', 'PARTIALLY_REFUNDED']
                        .includes(_get(rechargeIntegration, ['charges', '0', 'status']))
                },
                error: 'The last charge is not refundable.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: RECHARGE_INTEGRATION_TYPE,
        name: 'rechargeRefundLastOrder',
        title: 'Refund last order',
        arguments: {
            amount: {
                label: 'Amount',
                default: '{{ticket.customer.integrations.recharge.orders[0].total_price}}',
                editable: true,
                required: true,
                display_order: 1,
                input: {
                    type: 'number',
                    step: 0.01
                }
            }
        },
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': RECHARGE_INTEGRATION_TYPE})
                },
                error: 'This customer has no Recharge data.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations,
                        {'__integration_type__': RECHARGE_INTEGRATION_TYPE})

                    return _get(rechargeIntegration, ['orders'])
                },
                error: 'This customer has no orders to refund.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations,
                        {'__integration_type__': RECHARGE_INTEGRATION_TYPE})

                    return ['SUCCESS', 'PARTIALLY_REFUNDED']
                        .includes(_get(rechargeIntegration, ['orders', '0', 'charge_status']))
                },
                error: 'The last order is not refundable.'
            }
        ]
    }
]

export const DEFAULT_ACTIONS = ACTION_TEMPLATES.map((template) => template.name)

/*
 * Default currentUser preferences
 */
export const DEFAULT_PREFERENCES = {
    show_macros: false,
    available_for_chat: true
}

/**
 * Chat inactivity time before split
 */
export const TIMES_BEFORE_SPLIT = [
    {
        value: hoursToSeconds(0.5),
        label: '30 minutes'
    },
    {
        value: hoursToSeconds(3),
        label: '3 hours'
    },
    {
        value: hoursToSeconds(6),
        label: '6 hours'
    },
    {
        value: hoursToSeconds(24),
        label: '1 day'
    },
    {
        value: hoursToSeconds(24 * 7),
        label: '7 days'
    }
]

/**
 * Delay delta before a satisfaction survey is send
 */
export const DELAY_SURVEY_FOR = [
    {
        value: 2,
        label: '2 hours'
    },
    {
        value: daysToHours(1),
        label: '1 day'
    },
    {
        value: daysToHours(2),
        label: '2 days'
    },
    {
        value: daysToHours(7),
        label: '7 days'
    }
]


/**
 * Max header length
 */
export const MAX_HEADER_LENGTH = 1000

export const DEFAULT_TAG_COLOR = '#8088D6'
