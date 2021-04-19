import axios from 'axios'
import _find from 'lodash/find'
import _get from 'lodash/get'

import {
    RECHARGE_CANCELLATION_REASONS,
    RECHARGE_DEFAULT_CANCELLATION_REASON,
} from './config/integrations/recharge'
import {Order} from './constants/integrations/types/shopify'

import {IntegrationType} from './models/integration/types'
import {MacroActionName} from './models/macroAction/types'
import {Customer} from './state/customers/types'

import {daysToHours, hoursToSeconds} from './utils'
import {ActionTemplateExecution} from './types'

// TODO @LouisBarranqueiro switch all configuration to modular version

/**
 * Set default axios headers
 */
const commonHeaders = (axios.defaults.headers as Record<string, unknown>)
    .common as Record<string, unknown>
commonHeaders['X-CSRF-Token'] = window.CSRF_TOKEN
commonHeaders['X-Gorgias-User-Client'] = 'web'

export const DATADOG_CLIENT_TOKEN = 'pubc9857173f4901f3b10fc39dfcde707c6'
/**
 * Action related
 */
//$TsFixMe fallback values for js, replace with HttpMethod enum instead
export const HTTP_METHOD_GET = 'GET'
export const HTTP_METHOD_POST = 'POST'
export const HTTP_METHOD_PUT = 'PUT'
export const HTTP_METHOD_DELETE = 'DELETE'
export const AVAILABLE_HTTP_METHODS = [
    HTTP_METHOD_GET,
    HTTP_METHOD_POST,
    HTTP_METHOD_PUT,
    HTTP_METHOD_DELETE,
]

/**
 * Timeformat related
 */
export const AVAILABLE_LANGUAGES = [
    {
        localeName: 'en',
        displayName: 'English US',
    },
    {
        localeName: 'fr',
        displayName: 'French',
    },
]

/**
 * View related
 */
export const BASIC_OPERATORS = {
    eq: {
        label: 'is',
    },
    neq: {
        label: 'is not',
    },
}

export const EMPTY_OPERATORS = {
    isEmpty: {
        label: 'is empty',
    },
    isNotEmpty: {
        label: 'is not empty',
    },
}

export const UNARY_OPERATORS = {
    ...EMPTY_OPERATORS,
    duringBusinessHours: {
        label: 'during business hours',
    },
    outsideBusinessHours: {
        label: 'outside business hours',
    },
}

export const TIMEDELTA_OPERATOR_DEFAULT_UNIT = 'd'
export const TIMEDELTA_OPERATOR_DEFAULT_QUANTITY = 1
export const TIMEDELTA_OPERATOR_DEFAULT_VALUE = `${TIMEDELTA_OPERATOR_DEFAULT_QUANTITY}${TIMEDELTA_OPERATOR_DEFAULT_UNIT}`

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
    'facebook-review-comment': 'address',
    'facebook-messenger': 'address',
    'facebook-post': 'address',
    'facebook-review': 'address',
    'facebook-ad-post': 'address',
    'facebook-ad-comment': 'address',
    'instagram-media': 'address',
    'instagram-comment': 'address',
    'instagram-ad-media': 'address',
    'instagram-ad-comment': 'address',
    'instagram-direct-message': 'address',
    'instagram-mention-media': 'address',
    'instagram-mention-comment': 'address',
}

//$TsFixMe fallback for js files, replace with TicketStatus enum
export const TICKET_STATUSES = ['open', 'closed']

/**
 * Widget related
 */
export const DEFAULT_SOURCE_PATHS = {
    ticket: {
        custom: ['ticket', 'customer', 'data'],
        integrations: ['ticket', 'customer', 'integrations'],
    },
    customer: {
        custom: ['customer', 'data'],
        integrations: ['customer', 'integrations'],
    },
    //TODO(customers-migration): remove this property when we migrated widgets.
    user: {
        custom: ['customer', 'data'],
        integrations: ['customer', 'integrations'],
    },
}

/**
 * Integration-related
 */

export function shouldHidePhoneIntegration() {
    const isProd =
        location.hostname.endsWith('.gorgias.io') ||
        location.hostname.endsWith('.gorgias.com')
    const phoneAllowedHostnames = [
        'test-samy.gorgias.com',
        'illiatststore.gorgias.com',
        'zachbanov.gorgias.com',
        'test-martin.gorgias.com',
        'bakehouse.gorgias.com',
        'artemisathletix.gorgias.com',
    ]

    return isProd && !phoneAllowedHostnames.includes(location.hostname)
}

// A list of integration types along with descriptions that will be displayed in the integrations summary
export const INTEGRATION_TYPE_DESCRIPTIONS = [
    {
        type: 'native_phone_early_access',
        title: 'Native Phone - Early Access',
        description:
            'Create a new number or forward an existing one to Gorgias. Be the first to try our built-in solution!',
        url:
            'https://gorgias.typeform.com/to/IbJV4T8S?utm_source=in_app_settings_integrations',
        image: 'integrations/phone.png',
        isEarlyAccess: true,
    },
    {
        type: IntegrationType.EmailIntegrationType,
        subTypes: [
            IntegrationType.EmailIntegrationType,
            IntegrationType.GmailIntegrationType,
            IntegrationType.OutlookIntegrationType,
        ],
        title: 'Email',
        description:
            'Connect your support email addresses and respond to your customers from Gorgias',
    },
    {
        type: IntegrationType.PhoneIntegrationType,
        title: 'Phone',
        description: 'Chat with your customers over the phone from Gorgias.',
        image: 'integrations/phone.png',
        hide: shouldHidePhoneIntegration(),
    },
    {
        type: IntegrationType.GorgiasChatIntegrationType,
        title: 'Chat',
        description: 'Add a chat on your website.',
    },
    {
        type: 'smooch_inside',
        title: 'Chat - 🗄 DEPRECATED',
        description:
            'Please migrate to the new chat integration as this one will soon be removed.',
    },
    {
        type: 'facebook',
        title: 'Facebook, Messenger & Instagram',
        description:
            'Create tickets from Facebook posts, comments and recommendations, Instagram comments and mentions and Messenger conversations',
        image: 'integrations/facebook.png',
    },
    {
        type: 'aircall',
        title: 'Aircall',
        description:
            'Provide phone support & create tickets when customers call you.',
        image: 'integrations/aircall.png',
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
        description:
            'Display customer profiles & orders next to tickets. Edit orders with macros',
        image: 'integrations/shopify.png',
    },
    {
        type: IntegrationType.Magento2IntegrationType,
        title: 'Magento 2',
        description:
            'Display customer profiles & orders next to tickets. Edit orders with macros',
        image: 'integrations/magento.png',
    },
    {
        type: 'recharge',
        title: 'Recharge',
        description:
            'Display subscription info. Refund charges & skip monthly payments.',
        image: 'integrations/recharge.svg',
    },
    {
        type: 'smile',
        title: 'Smile',
        description:
            'Display customer points and activity. Insert point balance or referral url in macros.',
        image: 'integrations/smile.svg',
    },
    {
        title: 'Klaviyo',
        type: IntegrationType.KlaviyoIntegrationType,
        description:
            'Handle your customers, lists and segments from your Klaviyo campaigns via emails or sms.',
        image: 'integrations/klaviyo.png',
    },
    {
        type: IntegrationType.YotpoIntegrationType,
        title: 'Yotpo',
        description:
            'Yotpo is a user-generated content tool for merchants. It includes customer reviews, visual marketing, loyalty, and referrals.',
        image: 'integrations/yotpo.png',
        hide: true,
    },
    {
        title: 'BigCommerce',
        description:
            'Display customer profiles & orders next to tickets. Edit orders with macros.',
        url: 'https://docs.gorgias.com/ecommerce-integrations/bigcommerce',
        image: 'integrations/bigcommerce.png',
    },
    {
        title: 'Helpdocs',
        description: 'Create a knowledge base & connect it to Gorgias',
        url: 'https://docs.gorgias.com/other-integrations/helpdocs',
        image: 'integrations/helpdocs.png',
    },
    {
        title: 'Swell',
        description:
            'Display loyalty points next to tickets. Award points with macros.',
        url: 'https://docs.gorgias.com/reward-and-loyalty/swell-rewards',
        image: 'integrations/swell.png',
    },
    {
        title: 'Amazon & eBay by ChannelReply',
        description: 'Respond to eBay and Amazon inquiries',
        url: 'https://docs.gorgias.com/ecommerce-integrations/channel-reply',
        image: 'integrations/channelreply.png',
    },
    {
        title: 'Slack',
        description:
            'Post notifications on Slack when tickets are created or updated',
        url: 'https://docs.gorgias.com/other-integrations/slack',
        image: 'integrations/slack.png',
    },
    {
        title: 'Segment',
        description: 'Use Gorgias activity data in other apps.',
        url: 'https://docs.gorgias.com/data-and-http-integrations/segment',
        image: 'integrations/segment.png',
    },
    {
        title: 'Zapier',
        description: 'Trigger zaps with macros',
        url: 'https://docs.gorgias.com/data-and-http-integrations/zapier',
        image: 'integrations/zapier.png',
    },
    {
        title: 'Ottspott',
        description: 'Create tickets from phone conversations',
        url: 'https://docs.gorgias.com/voice-and-phone/ottspott',
        image: 'integrations/ottspott.png',
    },
    {
        type: 'smooch',
        title: 'Smooch',
        description: 'Connect your own Smooch to Gorgias',
        image: 'integrations/smooch.png',
    },
    {
        title: 'Omnisend',
        description:
            'Create customer segments based on customer support data from Gorgias',
        url: 'https://docs.gorgias.io/ecommerce-integrations/omnisend',
        image: 'integrations/omnisend.png',
    },
    {
        title: 'Postscript',
        description: 'Respond to Postscript SMS conversations from Gorgias',
        url: 'https://docs.gorgias.com/sms-integration/postscript',
        image: 'integrations/postscript.png',
    },
    {
        title: 'SMSBump',
        description:
            'Create SMS tickets inside Gorgias from your SMSBump admin',
        url: 'https://docs.gorgias.com/sms-integration/smsbump',
        image: 'integrations/smsbump.png',
    },
    {
        title: 'Emotive',
        description:
            'Create SMS tickets inside Gorgias from your Emotive admin',
        url: 'https://docs.gorgias.com/sms-integration/emotive',
        image: 'integrations/emotive.png',
    },
    {
        title: 'Attentive',
        description: 'Seamless two-way support via SMS',
        url: 'https://docs.gorgias.com/sms-integration/attentive-mobile',
        image: 'integrations/attentive.png',
    },
    {
        title: 'Reviews.io',
        description: 'Trigger and respond to review within Gorgias admin',
        url: 'https://docs.gorgias.com/reward-and-loyalty/reviews-io',
        image: 'integrations/reviews.io.png',
    },
    {
        title: 'Glew.io',
        description: 'Get actionable insights on your customer support',
        url: 'https://docs.gorgias.com/business-intelligence/glew-io',
        image: 'integrations/glewio.png',
    },
    {
        title: 'Circleloop',
        description: 'Synchronize customer contacts from Gorgias to CircleLoop',
        url: 'https://docs.gorgias.com/voice-and-phone/circle-loop',
        image: 'integrations/circleloop.png',
    },
    {
        title: 'Growave',
        description:
            'Brings customer reviews and questions into Gorgias helpdesk',
        url: 'https://docs.gorgias.com/reward-and-loyalty/growave',
        image: 'integrations/growave.png',
    },
    {
        title: 'StellaConnect',
        description:
            'Unlock full potential of frontline team with real-time customer feedback',
        url: 'https://docs.gorgias.com/quality-assurance/stella-connect',
        image: 'integrations/stellaconnect.png',
    },
    {
        title: 'Voicefront',
        description:
            'Allows Voicefront to create tickets from customers talking to your Alexa skill inside Gorgias',
        url: 'https://docs.gorgias.com/voice-and-phone/voicefront-ai',
        image: 'integrations/voicefront.jpg',
    },
    {
        title: 'Klausapp',
        description:
            'Track, review, rate, and improve the quality of your customer support',
        url: 'https://docs.gorgias.com/quality-assurance/klausapp',
        image: 'integrations/klaus.png',
    },
    {
        title: 'ElectricSMS',
        description:
            'Create SMS tickets inside Gorgias from your ElectricSMS admin',
        url: 'https://docs.gorgias.com/sms-integration/electric-sms',
        image: 'integrations/electricsms.png',
    },
    {
        title: 'Chatdesk',
        description: 'Manage your repetitive tickets and free up your time\n',
        url: 'https://docs.gorgias.com/other-integrations/chatdesk-teams',
        image: 'integrations/chatdesk.png',
    },
    {
        title: 'Retention Rocket',
        description:
            'Enabling the integration allows you to receive and reply to customer SMS directly',
        url: 'https://docs.gorgias.com/sms-integration/retention-rocket',
        image: 'integrations/retentionrocket.jpg',
    },
    {
        title: 'Alloy',
        description:
            'Taking your customer support automation to the next level',
        url: 'https://docs.gorgias.com/business-intelligence/alloy',
        image: 'integrations/alloy.png',
    },
    {
        title: 'Churn Buster',
        description: 'For a seamless flow to your failed payments recovery',
        url: 'https://docs.gorgias.com/business-intelligence/churn-buster',
        image: 'integrations/churnbuster.png',
    },
    {
        title: 'CloudTalk',
        description: 'Streamline communication with your customers',
        url: 'https://docs.gorgias.com/voice-and-phone/cloud-talk',
        image: 'integrations/cloudtalk.png',
    },
    {
        title: 'Returnly',
        description: 'Create a seamless return process for your customers',
        url: 'https://docs.gorgias.com/returns-exchanges/returnly',
        image: 'integrations/returnly.png',
    },
    {
        title: 'Loop Returns',
        description: 'Automate your entire returns process, even exchanges',
        url: 'https://docs.gorgias.com/returns-exchanges/loop-returns',
        image: 'integrations/loopreturns.png',
    },
    {
        title: 'LateShipment',
        description:
            'Real-time visibility on shipping status so you can be proactive with your customers',
        url: 'https://docs.gorgias.com/shipping/late-shipment',
        image: 'integrations/lateshipment.png',
    },
    {
        title: 'JustCall',
        description: 'Make and receive calls directly on Gorgias',
        url: 'https://docs.gorgias.com/voice-and-phone/just-call',
        image: 'integrations/justcall.png',
    },
    {
        title: 'Textline',
        description:
            'Create tickets in Gorgias that match your Textline conversations',
        url: 'https://docs.gorgias.com/sms-integration/textline',
        image: 'integrations/textline.png',
    },
    {
        title: 'ShippingChimp',
        description:
            'Track your orders in real-time and communicate delivery issues and delays',
        url: 'https://help.shippingchimp.com/kb/en/article/gorgias-integration',
        image: 'integrations/shippingchimp.png',
    },
    {
        title: 'TXTFi',
        description:
            'Create SMS tickets inside Gorgias to accept orders via SMS',
        url: 'https://docs.gorgias.com/sms-integration/txtfi',
        image: 'integrations/txtfi.png',
    },
]

// Import period for tickets
export const GMAIL_IMPORTED_EMAILS_FOR_YEARS = 2
export const OUTLOOK_IMPORTED_EMAILS_FOR_YEARS = 2
export const ZENDESK_IMPORTED_TICKETS_FOR_YEARS = 2

//$TsFixMe fallback values for js files, replace with ContentType enum
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
        execution: ActionTemplateExecution.Front,
        name: MacroActionName.SetResponseText,
        title: 'Add response text',
        arguments: {
            body_text: {
                type: 'string',
                default: '',
            },
            body_html: {
                type: 'string',
                format: 'html',
                default: '',
            },
        },
    },
    {
        execution: ActionTemplateExecution.Front,
        name: MacroActionName.AddAttachments,
        title: 'Add attachments',
        arguments: {
            attachments: {
                type: 'listDict',
                default: [],
            },
        },
    },
    {
        execution: ActionTemplateExecution.Front,
        name: MacroActionName.AddTags,
        title: 'Add tags',
        partialUpdateKeys: 'tags',
        partialUpdateValues: 'tags',
    },
    {
        execution: ActionTemplateExecution.Front,
        name: MacroActionName.SetStatus,
        title: 'Set status',
        partialUpdateKeys: 'status',
        partialUpdateValues: 'status',
    },
    {
        execution: ActionTemplateExecution.Front,
        name: MacroActionName.SetAssignee,
        title: 'Assign an agent',
        partialUpdateKeys: 'assignee_user',
        partialUpdateValues: 'assignee_user',
        arguments: {
            assignee_user: {
                type: 'dict',
                default: null,
            },
        },
    },
    {
        execution: ActionTemplateExecution.Front,
        name: MacroActionName.SetTeamAssignee,
        title: 'Assign a team',
        partialUpdateKeys: 'assignee_team',
        partialUpdateValues: 'assignee_team',
        arguments: {
            assignee_team: {
                type: 'dict',
                default: null,
            },
        },
    },
    {
        execution: ActionTemplateExecution.Front,
        name: MacroActionName.SetSubject,
        title: 'Set subject',
        partialUpdateKeys: 'subject',
        partialUpdateValues: 'subject',
    },
    {
        execution: ActionTemplateExecution.Front,
        name: MacroActionName.SnoozeTicket,
        title: 'Snooze for',
        partialUpdateKeys: ['snooze_datetime', 'status'],
        partialUpdateValues: ['snooze_datetime', 'status'],
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.Http,
        title: 'HTTP hook',
        arguments: {
            method: {
                type: 'string',
                enum: AVAILABLE_HTTP_METHODS,
                default: HTTP_METHOD_GET,
            },
            url: {
                type: 'string',
                format: 'url',
            },
            headers: {
                type: 'listDict',
                default: [],
                items: {
                    schema: {
                        key: {
                            type: 'string',
                        },
                        value: {
                            type: 'string',
                        },
                        editable: {
                            type: 'bool',
                        },
                    },
                    type: 'object',
                },
            },
            params: {
                type: 'listDict',
                default: [],
                items: {
                    schema: {
                        key: {
                            type: 'string',
                        },
                        value: {
                            type: 'string',
                        },
                        editable: {
                            type: 'bool',
                        },
                    },
                    type: 'object',
                },
            },
            form: {
                type: 'listDict',
                default: [],
                items: {
                    schema: {
                        key: {
                            type: 'string',
                        },
                        value: {
                            type: 'string',
                        },
                        editable: {
                            type: 'bool',
                        },
                    },
                    type: 'object',
                },
            },
            json: {
                type: 'dict',
                format: 'json',
                default: {},
            },
            content_type: {
                type: 'string',
                default: JSON_CONTENT_TYPE,
                enum: [JSON_CONTENT_TYPE, FORM_CONTENT_TYPE],
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.ShopifyIntegrationType,
        name: MacroActionName.ShopifyCancelLastOrder,
        title: 'Cancel last order',
        arguments: {
            restock: {
                label: 'Restock',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox',
                },
                display_order: 1,
            },
            refund: {
                label: 'Refund',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox',
                },
                display_order: 2,
            },
        },
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return _get(shopifyIntegration, ['orders']) as Maybe<Order>
                },
                error: 'This customer has no order to cancel.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return (
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ]) !== 'fulfilled'
                    )
                },
                error:
                    "The last order has already been fulfilled, it's not cancellable.",
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return (
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ]) !== 'partial'
                    )
                },
                error:
                    "The last order has already been partially fulfilled, it's not cancellable.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.ShopifyIntegrationType,
        name: MacroActionName.ShopifyCancelOrder,
        title: 'Cancel order',
        arguments: {
            order_id: {
                label: 'Order ID',
                type: 'string',
                default: '',
                editable: true,
                required: true,
            },
            restock: {
                label: 'Restock',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox',
                },
                display_order: 1,
            },
            refund: {
                label: 'Refund',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox',
                },
                display_order: 2,
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.ShopifyIntegrationType,
        name: MacroActionName.ShopifyDuplicateLastOrder,
        title: 'Duplicate last order',
        arguments: {},
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return _get(shopifyIntegration, ['orders']) as Maybe<
                        Order[]
                    >
                },
                error: 'This customer has no order to duplicate.',
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.ShopifyIntegrationType,
        name: MacroActionName.ShopifyEditShippingAddressLastOrder,
        title: "Edit last order's shipping address",
        notes: [
            "This action won't work if the order has already been shipped.",
        ],
        arguments: {
            name: {
                label: 'Name',
                type: 'string',
                default:
                    '{{ticket.customer.integrations.shopify.orders[0].shipping_address.name}}',
                editable: true,
                required: false,
                display_order: 1,
            },
            address1: {
                label: 'Address (1)',
                type: 'string',
                default:
                    '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address1}}',
                editable: true,
                required: false,
                display_order: 2,
            },
            address2: {
                label: 'Address (2)',
                type: 'string',
                default:
                    '{{ticket.customer.integrations.shopify.orders[0].shipping_address.address2}}',
                editable: true,
                required: false,
                display_order: 3,
            },
            city: {
                label: 'City',
                type: 'string',
                default:
                    '{{ticket.customer.integrations.shopify.orders[0].shipping_address.city}}',
                editable: true,
                required: false,
                display_order: 4,
            },
            province: {
                label: 'State/Province',
                type: 'string',
                default:
                    '{{ticket.customer.integrations.shopify.orders[0].shipping_address.province}}',
                editable: true,
                required: false,
                display_order: 5,
            },
            zip: {
                label: 'ZIP',
                type: 'string',
                default:
                    '{{ticket.customer.integrations.shopify.orders[0].shipping_address.zip}}',
                editable: true,
                required: false,
                display_order: 6,
            },
            country: {
                label: 'Country',
                type: 'string',
                default:
                    '{{ticket.customer.integrations.shopify.orders[0].shipping_address.country}}',
                editable: true,
                required: false,
                display_order: 7,
            },
        },
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return _get(shopifyIntegration, ['orders']) as Maybe<
                        Order[]
                    >
                },
                error: 'This customer has no order to edit.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return (
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ]) !== 'fulfilled'
                    )
                },
                error:
                    "The last order has already been fulfilled, you can't edit it's shipping address.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.ShopifyIntegrationType,
        name: MacroActionName.ShopifyRefundShippingCostLastOrder,
        title: "Refund last order's shipping cost",
        arguments: {},
        notes: [
            "This action will fail if the payment hasn't been captured yet.",
        ],
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return _get(shopifyIntegration, ['orders']) as Maybe<
                        Order[]
                    >
                },
                error: 'This customer has no order to refund.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return !['refunded', 'accepted'].includes(
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ])
                    )
                },
                error:
                    "The last order has already been refunded or hasn't been paid for yet.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.ShopifyIntegrationType,
        name: MacroActionName.ShopifyFullRefundLastOrder,
        title: 'Refund last order',
        arguments: {
            restock: {
                label: 'Restock',
                type: 'boolean',
                default: true,
                editable: true,
                input: {
                    type: 'checkbox',
                },
                display_order: 1,
            },
        },
        notes: [
            "This action will fail if the payment hasn't been captured yet.",
        ],
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return _get(shopifyIntegration, ['orders']) as Maybe<
                        Order[]
                    >
                },
                error: 'This customer has no order to refund.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return !['refunded', 'accepted'].includes(
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ])
                    )
                },
                error:
                    "The last order has already been refunded or hasn't been paid for yet.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.ShopifyIntegrationType,
        name: MacroActionName.ShopifyPartialRefundLastOrder,
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
                    step: 0.01,
                },
            },
        },
        notes: [
            "This action will fail if the payment hasn't been captured yet.",
        ],
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return _get(shopifyIntegration, ['orders']) as Maybe<
                        Order[]
                    >
                },
                error: 'This customer has no order to refund.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return !['refunded', 'accepted'].includes(
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ])
                    )
                },
                error:
                    "The last order has already been refunded or hasn't been paid for yet.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.ShopifyIntegrationType,
        name: MacroActionName.ShopifyEditNoteLastOrder,
        title: "Edit last order's note",
        arguments: {
            note: {
                label: 'Note',
                type: 'string',
                default:
                    '{{ticket.customer.integrations.shopify.orders[0].note}}',
                editable: true,
                required: false, // can be nulled
                display_order: 1,
            },
        },
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.ShopifyIntegrationType,
                    })

                    return _get(shopifyIntegration, ['orders']) as Maybe<
                        Order[]
                    >
                },
                error: 'This customer has no order to edit.',
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.RechargeIntegrationType,
        name: MacroActionName.RechargeCancelLastSubscription,
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
                    options: RECHARGE_CANCELLATION_REASONS.map(
                        (option: string) => ({
                            value: option,
                            label: option,
                        })
                    ),
                    allowCustomValue: true,
                },
            },
        },
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })
                },
                error: 'This customer has no Recharge data.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })

                    return _get(rechargeIntegration, ['subscriptions'])
                },
                error: 'This customer has no subscription to cancel.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })

                    return (
                        _get(rechargeIntegration, [
                            'subscriptions',
                            '0',
                            'cancelled_at',
                        ]) === null
                    )
                },
                error: 'The last subscription has already been cancelled.',
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.RechargeIntegrationType,
        name: MacroActionName.RechargeActivateLastSubscription,
        title: 'Activate last subscription',
        arguments: {},
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })
                },
                error: 'This customer has no Recharge data.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })

                    return _get(rechargeIntegration, ['subscriptions'])
                },
                error: 'This customer has no subscription to activate.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })

                    return (
                        _get(rechargeIntegration, [
                            'subscriptions',
                            '0',
                            'cancelled_at',
                        ]) !== null
                    )
                },
                error: 'The last subscription is already active.',
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.RechargeIntegrationType,
        name: MacroActionName.RechargeRefundLastCharge,
        title: 'Refund last charge',
        arguments: {
            amount: {
                label: 'Amount',
                default:
                    '{{ticket.customer.integrations.recharge.charges[0].total_price}}',
                editable: true,
                required: true,
                display_order: 1,
                input: {
                    type: 'number',
                    step: 0.01,
                },
            },
        },
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })
                },
                error: 'This customer has no Recharge data.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })

                    return _get(rechargeIntegration, ['charges'])
                },
                error: 'This customer has no charges to refund.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })

                    return ['SUCCESS', 'PARTIALLY_REFUNDED'].includes(
                        _get(rechargeIntegration, ['charges', '0', 'status'])
                    )
                },
                error: 'The last charge is not refundable.',
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.RechargeIntegrationType,
        name: MacroActionName.RechargeRefundLastOrder,
        title: 'Refund last order',
        arguments: {
            amount: {
                label: 'Amount',
                default:
                    '{{ticket.customer.integrations.recharge.orders[0].total_price}}',
                editable: true,
                required: true,
                display_order: 1,
                input: {
                    type: 'number',
                    step: 0.01,
                },
            },
        },
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })
                },
                error: 'This customer has no Recharge data.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })

                    return _get(rechargeIntegration, ['orders'])
                },
                error: 'This customer has no orders to refund.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__:
                            IntegrationType.RechargeIntegrationType,
                    })

                    return ['SUCCESS', 'PARTIALLY_REFUNDED'].includes(
                        _get(rechargeIntegration, [
                            'orders',
                            '0',
                            'charge_status',
                        ])
                    )
                },
                error: 'The last order is not refundable.',
            },
        ],
    },
]

export const DEFAULT_ACTIONS = ACTION_TEMPLATES.map<string>(
    (template) => template.name
)

/*
 * Default currentUser preferences
 */
export const DEFAULT_PREFERENCES = {
    show_macros: false,
    available: true,
}

/**
 * Chat inactivity time before split
 */
export const TIMES_BEFORE_SPLIT = [
    {
        value: hoursToSeconds(0.5),
        label: '30 minutes',
    },
    {
        value: hoursToSeconds(3),
        label: '3 hours',
    },
    {
        value: hoursToSeconds(6),
        label: '6 hours',
    },
    {
        value: hoursToSeconds(24),
        label: '1 day',
    },
    {
        value: hoursToSeconds(24 * 7),
        label: '7 days',
    },
]

/**
 * Delay delta before a satisfaction survey is send
 */
export const DELAY_SURVEY_FOR = [
    {
        value: 2,
        label: '2 hours',
    },
    {
        value: daysToHours(1),
        label: '1 day',
    },
    {
        value: daysToHours(2),
        label: '2 days',
    },
    {
        value: daysToHours(7),
        label: '7 days',
    },
]

/**
 * Max header length
 */
export const MAX_HEADER_LENGTH = 1000

export const DEFAULT_TAG_COLOR = '#8088D6'

export const SENTIMENT_TYPE_UPPER_BOUND = 0.4

export const SENTIMENT_TYPE_LOWER_BOUND = -0.4
