// @flow
import axios from 'axios'
import _get from 'lodash/get'
import _find from 'lodash/find'

import {hoursToSeconds} from './utils'

// TODO @LouisBarranqueiro switch all configuration to modular version

/**
 * Set default axios headers
 */

axios.defaults.headers.common['X-CSRF-Token'] = window.CSRF_TOKEN

/**
 * Action related
 */
// remember to keep them uppercase in the array below
export const AVAILABLE_HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE']

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
    'instagram-media': 'address',
    'instagram-comment': 'address'
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
    user: {
        custom: ['user', 'data'],
        integrations: ['user', 'integrations']
    }
}

/**
 * Integration-related
 */

// A list of integration types along with descriptions that will be displayed in the integrations summary
export const INTEGRATION_TYPE_DESCRIPTIONS = [
    {
        type: 'email',
        subTypes: ['email', 'gmail'],
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
        type: 'recharge',
        title: 'Recharge',
        description: 'Display subscription info. Refund charges & skip monthly payments.',
        image: 'integrations/recharge.svg',
    },
    {
        title: 'Helpdocs',
        description: 'Create a knowledge base & connect it to Gorgias',
        url: 'http://docs.gorgias.io/integrations/helpdocs',
        image: 'integrations/helpdocs.png',
    },
    {
        title: 'Magento 2',
        description: 'Display customer & orders info next to tickets. Edit orders with macros',
        url: 'http://docs.gorgias.io/integrations/http-integrations#magento',
        image: 'integrations/magento.png',
    },
    {
        title: 'WooCommerce',
        description: 'Display customer profiles & orders next to tickets. Edit orders with macros',
        url: 'http://docs.gorgias.io/integrations/http-integrations#woo_commerce',
        image: 'integrations/woocommerce.png',
    },
    {
        title: 'Prestashop',
        description: 'See customer profiles & orders next to support conversations. Refund orders with macros',
        url: 'http://docs.gorgias.io/integrations/http-integrations#prestashop',
        image: 'integrations/prestashop.png',
    },
    {
        title: 'Veeqo',
        description: 'Display orders & inventory status next to tickets',
        url: 'http://docs.gorgias.io/integrations/http-integrations#veeqo',
        image: 'integrations/veeqo.png',
    },
    {
        title: 'Shipstation',
        description: 'Display shipping info next to tickets',
        url: 'http://docs.gorgias.io/integrations/http-integrations#shipstation',
        image: 'integrations/shipstation.png',
    },
    {
        title: 'Ordoro',
        description: 'Display orders & inventory status next to tickets',
        url: 'http://docs.gorgias.io/integrations/ordoro',
        image: 'integrations/ordoro.png',
    },
    {
        title: 'ShippingEasy',
        description: 'Display tracking info next to tickets & automatically respond to "where is my order" questions.',
        url: 'https://gorgias.helpdocs.io/integrations/http-integrations#shipping_easy',
        image: 'integrations/shippingeasy.png',
    },
    {
        title: 'LoyaltyLion',
        description: 'See loyalty points next to tickets. Award points with macros.',
        url: 'https://gorgias.helpdocs.io/integrations/http-integrations#loyalty_lion',
        image: 'integrations/loyaltylion.png',
    },
    {
        title: 'Swell',
        description: 'Display loyalty points next to tickets. Award points with macros.',
        url: 'https://gorgias.helpdocs.io/integrations/http-integrations#swell_rewards',
        image: 'integrations/swell.png',
    },
    {
        title: 'Yotpo',
        description: 'Display product reviews customers left next to support tickets.',
        url: 'https://gorgias.helpdocs.io/integrations/http-integrations#yotpo',
        image: 'integrations/yotpo.png',
    },
    {
        title: 'Mailchimp',
        description: 'Display what lists the customer is on, along with their attributes.',
        url: 'https://gorgias.helpdocs.io/integrations/http-integrations#mailchimp',
        image: 'integrations/mailchimp.png',
    },
    {
        title: 'Amazon',
        description: 'Respond to support requests from Amazon',
        url: 'http://docs.gorgias.io/integrations/amazon',
        image: 'integrations/amazon.png',
    },
    {
        title: 'eBay',
        description: 'Respond to support requests from eBay',
        url: 'http://docs.gorgias.io/integrations/e-bay',
        image: 'integrations/ebay.png',
    },
    {
        title: 'Slack',
        description: 'Post notifications on Slack when tickets are created or updated',
        url: 'https://gorgias.helpdocs.io/integrations/http-integrations#slack',
        image: 'integrations/slack.png',
    },
    {
        title: 'Segment',
        description: 'Use Gorgias activity data in other apps.',
        url: 'https://gorgias.helpdocs.io/integrations/http-integrations#segment',
        image: 'integrations/segment.png',
    },
    {
        title: 'Zapier',
        description: 'Trigger zaps with macros',
        url: 'https://gorgias.helpdocs.io/integrations/http-integrations#zapier',
        image: 'integrations/zapier.png',
    },
    {
        title: 'Ottspott',
        description: 'Create tickets from phone conversations',
        url: 'http://docs.gorgias.io/integrations/ottspott',
        image: 'integrations/ottspott.png'
    },
    {
        type: 'smooch',
        title: 'Smooch',
        description: 'Connect your own Smooch to Gorgias',
        image: 'integrations/smooch.png',
    },
    {
        type: 'smile',
        title: 'Smile',
        description: 'Display customer points and activity. Insert point balance or referral url in macros.',
        image: 'integrations/smile.svg',
    }
]

// Number of threads imported from Gmail
export const GMAIL_IMPORTED_THREADS = 1000
/**
 * Templates for custom actions.
 * Those templates are used by the front-end to generate the UI to create a new action (in the Macros Management).
 * Once it has been filled and saved by the user, it is saved in the Action table.
 * Then, when the macro will be used, the fields with no value will show up to be filled by the agent using the macro.
 */

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
                default: 'GET',
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
        integrationType: 'shopify',
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
                    return _find(customer.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to cancel.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders', 0, 'financial_status']) !== 'fulfilled'
                },
                error: 'The last order has already been fulfilled, it\'s not cancellable.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: 'shopify',
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
        integrationType: 'shopify',
        name: 'shopifyDuplicateLastOrder',
        title: 'Duplicate last order',
        arguments: {},
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to duplicate.'
            },
        ]
    },
    {
        execution: 'back',
        integrationType: 'shopify',
        name: 'shopifyEditShippingAddressOfLastOrder',
        title: 'Edit last order\'s shipping address',
        notes: [
            'This action won\'t work if the order has already been shipped.'
        ],
        arguments: {
            address1: {
                label: 'Address (1)',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address1}}',
                editable: true,
                required: false,
                display_order: 1
            },
            address2: {
                label: 'Address (2)',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address2}}',
                editable: true,
                required: false,
                display_order: 2
            },
            city: {
                label: 'City',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.city}}',
                editable: true,
                required: false,
                display_order: 3
            },
            province: {
                label: 'State/Province',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.province}}',
                editable: true,
                required: false,
                display_order: 4
            },
            zip: {
                label: 'ZIP',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.zip}}',
                editable: true,
                required: false,
                display_order: 5
            },
            country: {
                label: 'Country',
                type: 'string',
                default: '{{ticket.customer.integrations.shopify.orders[0].shipping_address.country}}',
                editable: true,
                required: false,
                display_order: 6
            },
        },
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to edit.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders', 0, 'financial_status']) !== 'fulfilled'
                },
                error: 'The last order has already been fulfilled, you can\'t edit it\'s shipping address.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: 'shopify',
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
                error: 'This user has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to refund.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return !['refunded', 'accepted'].includes(_get(shopifyIntegration, ['orders', 0, 'financial_status']))
                },
                error: 'The last order has already been refunded or hasn\'t been paid for yet.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: 'shopify',
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
                    return _find(customer.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to refund.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return !['refunded', 'accepted'].includes(_get(shopifyIntegration, ['orders', 0, 'financial_status']))
                },
                error: 'The last order has already been refunded or hasn\'t been paid for yet.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: 'shopify',
        name: 'shopifyPartialRefundLastOrder',
        title: 'Partially refund last order',
        arguments: {
            amount: {
                label: 'Amount',
                default: '{{ticket.customer.integrations.shopify.orders[0].total_price}}',
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
                    return _find(customer.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to refund.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return !['refunded', 'accepted'].includes(_get(shopifyIntegration, ['orders', 0, 'financial_status']))
                },
                error: 'The last order has already been refunded or hasn\'t been paid for yet.'
            }
        ]
    },
    {
        execution: 'back',
        integrationType: 'shopify',
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
                    return _find(customer.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (customer: Object) => {
                    const shopifyIntegration = _find(customer.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to edit.'
            },
        ]
    },
    {
        execution: 'back',
        integrationType: 'recharge',
        name: 'rechargeCancelLastSubscription',
        title: 'Cancel last subscription',
        arguments: {},
        validators: [
            {
                validate: (customer: Object) => {
                    return _find(customer.integrations, {'__integration_type__': 'recharge'})
                },
                error: 'This user has no Recharge data.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations, {'__integration_type__': 'recharge'})

                    return _get(rechargeIntegration, ['subscriptions'])
                },
                error: 'This user has no subscription to cancel.'
            },
            {
                validate: (customer: Object) => {
                    const rechargeIntegration = _find(customer.integrations, {'__integration_type__': 'recharge'})

                    return _get(rechargeIntegration, ['subscriptions', 0, 'cancelled_at']) === null
                },
                error: 'The last subscription has already been cancelled.'
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
 * Max header length
 */
export const MAX_HEADER_LENGTH = 1000

export const DEFAULT_TAG_COLOR = '#8088D6'
