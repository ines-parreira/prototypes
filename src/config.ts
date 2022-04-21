import _find from 'lodash/find'
import _get from 'lodash/get'

import {
    RECHARGE_CANCELLATION_REASONS,
    RECHARGE_DEFAULT_CANCELLATION_REASON,
} from './config/integrations/recharge'
import {Order} from './constants/integrations/types/shopify'

import {
    Category,
    PricingPlan,
    TrialPeriod,
} from './models/integration/types/app'
import {IntegrationType} from './models/integration/types'
import {MacroActionName} from './models/macroAction/types'
import {Customer} from './state/customers/types'

import {daysToHours, hoursToSeconds} from './utils'
import {ActionTemplateExecution} from './types'
import {AccountFeature} from './state/currentAccount/types'
import {TicketMessageSourceType} from './business/types/ticket'

// TODO @LouisBarranqueiro switch all configuration to modular version

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
export const SOURCE_VALUE_PROP: Partial<
    Record<
        TicketMessageSourceType | 'facebook-ad-post' | 'facebook-ad-comment',
        'address' | null
    >
> = {
    [TicketMessageSourceType.Email]: 'address',
    [TicketMessageSourceType.Phone]: 'address',
    [TicketMessageSourceType.Sms]: 'address',
    [TicketMessageSourceType.OttspottCall]: 'address',
    [TicketMessageSourceType.Chat]: 'address',
    [TicketMessageSourceType.Aircall]: 'address',
    [TicketMessageSourceType.Api]: null,
    [TicketMessageSourceType.FacebookMessage]: 'address',
    [TicketMessageSourceType.FacebookComment]: 'address',
    [TicketMessageSourceType.FacebookReviewComment]: 'address',
    [TicketMessageSourceType.FacebookMessenger]: 'address',
    [TicketMessageSourceType.FacebookPost]: 'address',
    [TicketMessageSourceType.FacebookMentionPost]: 'address',
    [TicketMessageSourceType.FacebookMentionComment]: 'address',
    [TicketMessageSourceType.FacebookReview]: 'address',
    'facebook-ad-post': 'address',
    'facebook-ad-comment': 'address',
    [TicketMessageSourceType.InstagramMedia]: 'address',
    [TicketMessageSourceType.InstagramComment]: 'address',
    [TicketMessageSourceType.InstagramAdMedia]: 'address',
    [TicketMessageSourceType.InstagramAdComment]: 'address',
    [TicketMessageSourceType.InstagramDirectMessage]: 'address',
    [TicketMessageSourceType.InstagramMentionMedia]: 'address',
    [TicketMessageSourceType.InstagramMentionComment]: 'address',
    [TicketMessageSourceType.TwitterTweet]: 'address',
    [TicketMessageSourceType.TwitterQuotedTweet]: 'address',
    [TicketMessageSourceType.TwitterMentionTweet]: 'address',
    [TicketMessageSourceType.TwitterDirectMessage]: 'address',
    [TicketMessageSourceType.YotpoReviewPublicComment]: 'address',
    [TicketMessageSourceType.YotpoReviewPrivateComment]: 'address',
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

export type IntegrationConfig = {
    title: string
    description: string
    type: IntegrationType
    subTypes?: IntegrationType[]
    requiredFeature?: AccountFeature
    image?: string
    longDescription: string
    company?: string
    companyUrl?: string
    categories?: Category[]
    screenshots?: string[]
    privacyPolicy?: string
    setupGuide?: string
    pricingPlan?: PricingPlan | null
    pricingLink?: string
    pricingDetails?: string
    hasFreeTrial?: boolean
    freeTrialPeriod?: TrialPeriod
    // Whether the "Connect App" button is a path to a more detailed install page (internal)
    // or linking to an external url (e.g OAuth link)
    isExternalConnectUrl: boolean
}

// A list of integration types along with descriptions that will be displayed in the integrations summary
export const INTEGRATION_TYPE_CONFIG: IntegrationConfig[] = [
    {
        type: IntegrationType.Email,
        subTypes: [
            IntegrationType.Email,
            IntegrationType.Gmail,
            IntegrationType.Outlook,
        ],
        title: 'Email',
        description:
            'Connect your support email addresses and respond to your customers from Gorgias',
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.Phone,
        title: 'Voice',
        description: 'Chat with your customers over the phone from Gorgias.',
        requiredFeature: AccountFeature.PhoneNumber,
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.Sms,
        title: 'SMS',
        description: 'Chat with your customers via SMS from Gorgias.',
        requiredFeature: AccountFeature.PhoneNumber,
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.GorgiasChat,
        title: 'Chat',
        description: 'Add a chat on your website.',
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.SmoochInside,
        title: 'Chat - 🗄 DEPRECATED',
        description:
            'Please migrate to the new chat integration as this one will soon be removed.',
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.Facebook,
        title: 'Facebook, Messenger & Instagram',
        description:
            'Create tickets from Facebook posts, comments and recommendations, Instagram comments and mentions and Messenger conversations',
        image: 'integrations/facebook.png',
        longDescription: '',
        isExternalConnectUrl: true,
    },
    {
        type: IntegrationType.Aircall,
        title: 'Aircall',
        description:
            'Provide phone support & create tickets when customers call you.',
        image: 'integrations/aircall.png',
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.Http,
        title: 'HTTP',
        description: 'Connect any application to Gorgias',
        image: 'integrations/http.png',
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.Shopify,
        title: 'Shopify',
        description:
            'Display customer profiles & orders next to tickets. Edit orders with macros',
        image: 'integrations/shopify.png',
        longDescription: '',
        isExternalConnectUrl: true,
    },
    {
        type: IntegrationType.Twitter,
        title: 'Twitter',
        description:
            'Create tickets when customers interact with you via replies or mentions on Twitter',
        image: 'integrations/twitter.png',
        requiredFeature: AccountFeature.TwitterIntegration,
        longDescription: '',
        isExternalConnectUrl: true,
    },
    {
        type: IntegrationType.Magento2,
        title: 'Magento 2',
        description:
            'Display customer profiles & orders next to tickets. Edit orders with macros',
        image: 'integrations/magento.png',
        requiredFeature: AccountFeature.MagentoIntegration,
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.Recharge,
        title: 'Recharge',
        description:
            'Display subscription info. Refund charges & skip monthly payments.',
        image: 'integrations/recharge.svg',
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.Smile,
        title: 'Smile',
        description:
            'Display customer points and activity. Insert point balance or referral url in macros.',
        image: 'integrations/smile.svg',
        longDescription: '',
        isExternalConnectUrl: true,
    },
    {
        type: IntegrationType.Klaviyo,
        title: 'Klaviyo - 🗄 DEPRECATED',
        description:
            'Handle your customers, lists and segments from your Klaviyo campaigns via emails or sms.',
        image: 'integrations/klaviyo.png',
        longDescription: '',
        isExternalConnectUrl: false,
    },
    {
        type: IntegrationType.Yotpo,
        title: 'Yotpo',
        description:
            'Yotpo is a user-generated content tool for merchants. It includes customer reviews, visual marketing, loyalty, and referrals.',
        image: 'integrations/yotpo.png',
        requiredFeature: AccountFeature.YotpoIntegration,
        longDescription: '',
        isExternalConnectUrl: true,
    },
    {
        type: IntegrationType.Smooch,
        title: 'Smooch',
        description: 'Connect your own Smooch to Gorgias',
        image: 'integrations/smooch.png',
        longDescription: '',
        isExternalConnectUrl: true,
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
        name: MacroActionName.AddInternalNote,
        title: 'Add internal note',
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
        integrationType: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
                    })

                    return _get(shopifyIntegration, ['orders']) as Maybe<Order>
                },
                error: 'This customer has no order to cancel.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
                    })

                    return (
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ]) !== 'fulfilled'
                    )
                },
                error: "The last order has already been fulfilled, it's not cancellable.",
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
                    })

                    return (
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ]) !== 'partial'
                    )
                },
                error: "The last order has already been partially fulfilled, it's not cancellable.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.Shopify,
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
        integrationType: IntegrationType.Shopify,
        name: MacroActionName.ShopifyDuplicateLastOrder,
        title: 'Duplicate last order',
        arguments: {},
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
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
        integrationType: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })

                    return (
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ]) !== 'fulfilled'
                    )
                },
                error: "The last order has already been fulfilled, you can't edit it's shipping address.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })

                    return !['refunded', 'accepted'].includes(
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ])
                    )
                },
                error: "The last order has already been refunded or hasn't been paid for yet.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })

                    return !['refunded', 'accepted'].includes(
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ])
                    )
                },
                error: "The last order has already been refunded or hasn't been paid for yet.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })

                    return !['refunded', 'accepted'].includes(
                        _get(shopifyIntegration, [
                            'orders',
                            '0',
                            'financial_status',
                        ])
                    )
                },
                error: "The last order has already been refunded or hasn't been paid for yet.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        integrationType: IntegrationType.Shopify,
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
                        __integration_type__: IntegrationType.Shopify,
                    })
                },
                error: 'This customer has no Shopify data.',
            },
            {
                validate: (customer: Customer) => {
                    const shopifyIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Shopify,
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
        integrationType: IntegrationType.Recharge,
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
                        __integration_type__: IntegrationType.Recharge,
                    })
                },
                error: 'This customer has no Recharge data.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Recharge,
                    })

                    return _get(rechargeIntegration, ['subscriptions'])
                },
                error: 'This customer has no subscription to cancel.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Recharge,
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
        integrationType: IntegrationType.Recharge,
        name: MacroActionName.RechargeActivateLastSubscription,
        title: 'Activate last subscription',
        arguments: {},
        validators: [
            {
                validate: (customer: Customer) => {
                    return !!_find(customer.integrations, {
                        __integration_type__: IntegrationType.Recharge,
                    })
                },
                error: 'This customer has no Recharge data.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Recharge,
                    })

                    return _get(rechargeIntegration, ['subscriptions'])
                },
                error: 'This customer has no subscription to activate.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Recharge,
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
        integrationType: IntegrationType.Recharge,
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
                        __integration_type__: IntegrationType.Recharge,
                    })
                },
                error: 'This customer has no Recharge data.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Recharge,
                    })

                    return _get(rechargeIntegration, ['charges'])
                },
                error: 'This customer has no charges to refund.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Recharge,
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
        integrationType: IntegrationType.Recharge,
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
                        __integration_type__: IntegrationType.Recharge,
                    })
                },
                error: 'This customer has no Recharge data.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Recharge,
                    })

                    return _get(rechargeIntegration, ['orders'])
                },
                error: 'This customer has no orders to refund.',
            },
            {
                validate: (customer: Customer) => {
                    const rechargeIntegration = _find(customer.integrations, {
                        __integration_type__: IntegrationType.Recharge,
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
        value: 0,
        label: '5 minutes',
    },
    {
        value: 0.5,
        label: '30 minutes',
    },
    {
        value: 1,
        label: '1 hour',
    },
    {
        value: 2,
        label: '2 hours',
    },
    {
        value: 4,
        label: '4 hours',
    },
    {
        value: 6,
        label: '6 hours',
    },
    {
        value: 8,
        label: '8 hours',
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

/**
 * Text editor used in helpcenter
 */
export const FROALA_KEY =
    'aLF3c1A7B5E5E3E2G2D2xROKLJKYHROLDXDRH1e1YYGRe1Bg1G3I3A2A5D6A3F2E4D2F2=='

export const FROALA_VIDEO_PROVIDERS = [
    // DEFAULT PROVIDERS (with updated `provider` and `iframe` width)
    // Extracted from '/froala-editor/js/plugins/video.min.js'
    {
        test_regex:
            /^.*((youtu.be)|(youtube.com))\/((v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))?\??v?=?([^#\&\?]*).*/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/)?([0-9a-zA-Z_\-]+)(.+)?/g,
        url_text: 'https://www.youtube.com/embed/$1?$2',
        html: '<iframe width="100%" height="360" src="{url}&wmode=opaque&rel=0" frameborder="0" allowfullscreen></iframe>',
        provider: 'YouTube',
    },
    {
        test_regex:
            /^.*(?:vimeo.com)\/(?:channels(\/\w+\/)?|groups\/*\/videos\/\u200b\d+\/|video\/|)(\d+)(?:$|\/|\?)/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?(\/[a-zA-Z0-9_\-]+)?/i,
        url_text: 'https://player.vimeo.com/video/$1',
        html: '<iframe width="100%" height="360" src="{url}" frameborder="0" allowfullscreen></iframe>',
        provider: 'Vimeo',
    },
    {
        test_regex:
            /^.+(dailymotion.com|dai.ly)\/(video|hub)?\/?([^_]+)[^#]*(#video=([^_&]+))?/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.)?(?:dailymotion\.com|dai\.ly)\/(?:video|hub)?\/?(.+)/g,
        url_text: 'https://www.dailymotion.com/embed/video/$1',
        html: '<iframe width="100%" height="360" src="{url}" frameborder="0" allowfullscreen></iframe>',
        provider: 'Dailymotion',
    },
    {
        test_regex: /^.+(screen.yahoo.com)\/[^_&]+/,
        url_regex: '',
        url_text: '',
        html: '<iframe width="100%" height="360" src="{url}?format=embed" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" allowtransparency="true"></iframe>',
        provider: 'Yahoo',
    },
    {
        test_regex: /^.+(rutube.ru)\/[^_&]+/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.)?(?:rutube\.ru)\/(?:video)?\/?(.+)/g,
        url_text: 'https://rutube.ru/play/embed/$1',
        html: '<iframe width="100%" height="360" src="{url}" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" allowtransparency="true"></iframe>',
        provider: 'RuTube',
    },
    {
        test_regex: /^(?:.+)vidyard.com\/(?:watch)?\/?([^.&/]+)\/?(?:[^_.&]+)?/,
        url_regex: /^(?:.+)vidyard.com\/(?:watch)?\/?([^.&/]+)\/?(?:[^_.&]+)?/g,
        url_text: 'https://play.vidyard.com/$1',
        html: '<iframe width="100%" height="360" src="{url}" frameborder="0" allowfullscreen></iframe>',
        provider: 'Vidyard',
    },

    // CUSTOM PROVIDERS
    {
        test_regex: /^.*(loom.com)\/[^_&]+/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.)?(?:loom\.com)\/(?:share)?\/?(.+)/g,
        url_text: 'https://www.loom.com/embed/$1',
        html: '<iframe width="100%" height="360" src="{url}" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>',
        provider: 'Loom',
    },
]

export const HOTSWAP_SDK_URL = 'https://widget.hotswap.app/js/hotswap.js'
