import _get from 'lodash/get'
import _find from 'lodash/find'

export const POLL_ACTIVITY_INTERVAL = 10000
export const CHAT_POLLING_INTERVAL = 9000
export const POLL_ACTIVITY_TIMEOUT = 8000

// TODO @jebarjonet switch all configuration to modular version

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

/**
 * Ticket-related
 */
export const SOURCE_VALUE_PROP = {
    email: 'address',
    phone: 'address',
    'ottspott-call': 'address',
    chat: 'address',
    api: null,
    'facebook-message': 'address',
    'facebook-comment': 'address',
    'facebook-post': 'address'
}

export const TICKET_STATUSES = ['open', 'new', 'closed']

/**
 * Widget related
 */
export const DEFAULT_SOURCE_PATHS = {
    ticket: {
        custom: ['ticket', 'requester', 'customer'],
        integrations: ['ticket', 'requester', 'integrations']
    },
    user: {
        custom: ['user', 'customer'],
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
        title: 'Facebook',
        description: 'Create tickets when your customers post on your page or contact you on Messenger',
        image: 'integrations/facebook.png',
    },
    {
        type: 'smooch',
        title: 'Smooch',
        description: 'Connect your own Smooch to Gorgias',
        image: 'integrations/smooch.png',
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
        title: 'Helpdocs',
        description: 'Create a knowledge base & connect it to Gorgias',
        url: 'http://docs.gorgias.io/integrations/helpdocs',
        image: 'integrations/helpdocs.png',
    },
    {
        title: 'Elev.io',
        description: 'Let your customers contact you from your help center',
        url: 'http://docs.gorgias.io/integrations/elevio',
        image: 'integrations/elevio.png',
    },
    {
        title: 'Aircall',
        description: 'Provide phone support & create tickets when customers call you',
        url: 'http://docs.gorgias.io/integrations/aircall',
        image: 'integrations/aircall.png',
    },
    {
        title: 'Magento',
        description: 'Display customer & orders info next to tickets. Edit orders with macros',
        url: 'http://docs.gorgias.io/integrations/http-integrations#Magento',
        image: 'integrations/magento.png',
    },
    {
        title: 'WooCommerce',
        description: 'Display customer profiles & orders next to tickets. Edit orders with macros',
        url: 'http://docs.gorgias.io/integrations/http-integrations#WooCommerce',
        image: 'integrations/woocommerce.png',
    },
    {
        title: 'Prestashop',
        description: 'See customer profiles & orders next to support conversations. Refund orders with macros',
        url: 'http://docs.gorgias.io/integrations/http-integrations#Prestashop',
        image: 'integrations/prestashop.png',
    },
    {
        title: 'Salesforce',
        description: 'Display customer information next to tickets',
        url: 'http://docs.gorgias.io/integrations/http-integrations#Salesforce',
        image: 'integrations/salesforce.png',
    },
    {
        title: 'Shipstation',
        description: 'Display shipping info next to tickets',
        url: 'http://docs.gorgias.io/integrations/http-integrations#Shipstation',
        image: 'integrations/shipstation.png',
    },
    {
        title: 'LoyaltyLion',
        description: 'See loyalty points next to tickets. Award points with macros.',
        url: 'http://docs.gorgias.io/integrations/http-integrations#LoyaltyLion',
        image: 'integrations/loyaltylion.png',
    },
    {
        title: 'Yotpo',
        description: 'Display product reviews customers left next to support tickets.',
        url: 'http://docs.gorgias.io/integrations/http-integrations#Yotpo',
        image: 'integrations/yotpo.png',
    },
    {
        title: 'Slack',
        description: 'Post notifications on Slack when tickets are created or updated',
        url: 'http://docs.gorgias.io/integrations/http-integrations#Slack',
        image: 'integrations/slack.png',
    },
    {
        title: 'Zapier',
        description: 'Trigger zaps with macros',
        url: 'http://docs.gorgias.io/integrations/http-integrations#Zapier',
        image: 'integrations/zapier.png',
    }
]

// used on infobar after new account creation to suggest integrations to add
export const ONBOARDING_INTEGRATION_SUGGESTIONS = [{
    title: 'Connect Shopify',
    type: 'shopify',
    url: 'app/integrations/shopify/new',
}, {
    title: 'Connect Facebook',
    type: 'facebook',
    url: 'app/integrations/facebook',
}, {
    title: 'Connect chat',
    type: 'smooch_inside',
    url: 'app/integrations/smooch_inside',
}]

// Number of threads imported from Gmail
export const GMAIL_IMPORTED_THREADS = 100
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
    // {
    //     execution: 'front',
    //     name: 'setPriority',
    //     title: 'Set priority',
    //     partialUpdateKey: 'priority',
    //     partialUpdateValue: 'priority',
    // },
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
    // {
    //     execution: 'back',
    //     name: 'httpIntegration',
    //     title: '',
    //     arguments: {
    //         integration_id: {
    //             type: 'integer',
    //             choice: '{state.integrations.http}',
    //             required: true
    //         }
    //     }
    // },
    // {
    //     execution: 'back',
    //     name: 'notify',
    //     title: '',
    //     arguments: {
    //         email: {
    //             type: 'string',
    //             format: 'email',
    //             default: '{ticket.assignee_user.email}'
    //         },
    //         subject: {
    //             type: 'string',
    //             default: '{ticket.subject}',
    //             editable: true
    //         },
    //         content: {
    //             type: 'string',
    //             default: '{ticket.body_html}',
    //             editable: true
    //         }
    //     }
    // },
    {
        execution: 'back',
        integrationType: 'shopify',
        name: 'shopifyCancelLastOrder',
        title: 'Cancel last order',
        arguments: {},
        validators: [
            {
                validate: (requester) => {
                    return _find(requester.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (requester) => {
                    const shopifyIntegration = _find(requester.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to cancel.'
            },
            {
                validate: (requester) => {
                    const shopifyIntegration = _find(requester.integrations, {'__integration_type__': 'shopify'})

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
                type: 'string',
                default: '',
                editable: true,
                required: true
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
                validate: (requester) => {
                    return _find(requester.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (requester) => {
                    const shopifyIntegration = _find(requester.integrations, {'__integration_type__': 'shopify'})

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
                type: 'string',
                default: '{ticket.requester.customer._shopify.orders[0].shipping_address.address1}',
                editable: true,
                required: false,
                display_order: 1
            },
            address2: {
                type: 'string',
                default: '{ticket.requester.customer._shopify.orders[0].shipping_address.address2}',
                editable: true,
                required: false,
                display_order: 2
            },
            city: {
                type: 'string',
                default: '{ticket.requester.customer._shopify.orders[0].shipping_address.city}',
                editable: true,
                required: false,
                display_order: 3
            },
            country: {
                type: 'string',
                default: '{ticket.requester.customer._shopify.orders[0].shipping_address.country}',
                editable: true,
                required: false,
                display_order: 4
            },
            zip: {
                type: 'string',
                default: '{ticket.requester.customer._shopify.orders[0].shipping_address.zip}',
                editable: true,
                required: false,
                display_order: 5
            },
        },
        validators: [
            {
                validate: (requester) => {
                    return _find(requester.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (requester) => {
                    const shopifyIntegration = _find(requester.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to edit.'
            },
            {
                validate: (requester) => {
                    const shopifyIntegration = _find(requester.integrations, {'__integration_type__': 'shopify'})

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
                validate: (requester) => {
                    return _find(requester.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (requester) => {
                    const shopifyIntegration = _find(requester.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to refund.'
            },
            {
                validate: (requester) => {
                    const shopifyIntegration = _find(requester.integrations, {'__integration_type__': 'shopify'})

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
        arguments: {},
        notes: [
            'This action will fail if the payment hasn\'t been captured yet.'
        ],
        validators: [
            {
                validate: (requester) => {
                    return _find(requester.integrations, {'__integration_type__': 'shopify'})
                },
                error: 'This user has no Shopify data.'
            },
            {
                validate: (requester) => {
                    const shopifyIntegration = _find(requester.integrations, {'__integration_type__': 'shopify'})

                    return _get(shopifyIntegration, ['orders'])
                },
                error: 'This user has no order to refund.'
            },
            {
                validate: (requester) => {
                    const shopifyIntegration = _find(requester.integrations, {'__integration_type__': 'shopify'})

                    return !['refunded', 'accepted'].includes(_get(shopifyIntegration, ['orders', 0, 'financial_status']))
                },
                error: 'The last order has already been refunded or hasn\'t been paid for yet.'
            }
        ]
    }
]

export const DEFAULT_ACTIONS = ACTION_TEMPLATES.map(template => template.name)

/**
 * Notifications related
 */
export const NOTIFICATIONS_STYLE_CONFIG = {
    Containers: {
        DefaultStyle: {
            maxWidth: '500px',
            width: 'initial',
            display: 'inline-block'
        },
        tc: {
            left: 0,
            right: 0
        }
    },
    NotificationItem: {
        DefaultStyle: {
            padding: '1em 1.5em',
            fontSize: '1em'
        },
        success: {
            border: '1px solid #A3C293',
            backgroundColor: '#FCFFF5',
            color: '#2C662D'
        },
        error: {
            border: '1px solid #E0B4B4',
            backgroundColor: '#FFF6F6',
            color: '#9F3A38'
        },
        warning: {
            border: '1px solid #C9BA9B',
            backgroundColor: '#FFFA9B',
            color: '#573A08'
        },
        info: {
            border: '1px solid #A9D5DE',
            backgroundColor: '#F8FFFF',
            color: '#276F86'
        }
    },
    Title: {
        DefaultStyle: {
            fontSize: '1.14em'
        },
        success: {
            color: '#1A531B'
        },
        error: {
            color: '#912D2B'
        },
        warning: {
            color: '#794B02'
        },
        info: {
            color: '#0E566C'
        }
    },
    Dismiss: {
        DefaultStyle: {
            display: 'none'
        }
    }
}

/**
 * Default currentUser preferences
 */
export const DEFAULT_PREFERENCES = {
    show_macros: false,
    available_for_chat: true
}
