import { daysToHours, hoursToSeconds } from '@repo/utils'
import _find from 'lodash/find'
import _get from 'lodash/get'

import { TicketMessageSourceType } from 'business/types/ticket'
import {
    RECHARGE_CANCELLATION_REASONS,
    RECHARGE_DEFAULT_CANCELLATION_REASON,
} from 'config/integrations/constants/recharge'
import type { Order } from 'constants/integrations/types/shopify'
import type { Customer } from 'models/customer/types'
import {
    Category,
    IntegrationType,
    PricingPlan,
} from 'models/integration/types'
import { MacroActionName } from 'models/macroAction/types'
import { AccountFeature } from 'state/currentAccount/types'
import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_ECOMMERCE_DATA_KEY,
    CUSTOMER_EXTERNAL_DATA_KEY,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
    STANDALONE_WIDGET_TYPE,
    WOOCOMMERCE_WIDGET_TYPE,
} from 'state/widgets/constants'
import { WidgetEnvironment } from 'state/widgets/types'

// TODO @LouisBarranqueiro switch all configuration to modular version

/**
 * Action related
 */
//$TsFixMe fallback values for js, replace with HttpMethod enum instead
export const HTTP_METHOD_GET = 'GET'
export const HTTP_METHOD_POST = 'POST'
export const HTTP_METHOD_PUT = 'PUT'
export const HTTP_METHOD_PATCH = 'PATCH'
export const HTTP_METHOD_DELETE = 'DELETE'
export const AVAILABLE_HTTP_METHODS = [
    HTTP_METHOD_GET,
    HTTP_METHOD_POST,
    HTTP_METHOD_PUT,
    HTTP_METHOD_PATCH,
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

export const HELP_DOCS_BASE_URL = 'https://docs.gorgias.com/'

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
    [TicketMessageSourceType.WhatsAppMessage]: 'address',
    [TicketMessageSourceType.OttspottCall]: 'address',
    [TicketMessageSourceType.Chat]: 'address',
    [TicketMessageSourceType.ChatContactForm]: 'address',
    [TicketMessageSourceType.ChatOfflineCapture]: 'address',
    [TicketMessageSourceType.HelpCenterContactForm]: 'address',
    [TicketMessageSourceType.ContactForm]: 'address',
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
    [WidgetEnvironment.Ticket]: {
        [CUSTOM_WIDGET_TYPE]: ['ticket', 'customer', 'data'],
        integrations: ['ticket', 'customer', 'integrations'],
        [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE]: [
            'ticket',
            'customer',
            CUSTOMER_EXTERNAL_DATA_KEY,
        ],
        [STANDALONE_WIDGET_TYPE]: ['ticket', 'customer'],
        [WOOCOMMERCE_WIDGET_TYPE]: [
            'ticket',
            'customer',
            CUSTOMER_ECOMMERCE_DATA_KEY,
        ],
    },
    [WidgetEnvironment.Customer]: {
        [CUSTOM_WIDGET_TYPE]: ['customer', 'data'],
        integrations: ['customer', 'integrations'],
        [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE]: [
            'customer',
            CUSTOMER_EXTERNAL_DATA_KEY,
        ],
        [STANDALONE_WIDGET_TYPE]: ['customer'],
        [WOOCOMMERCE_WIDGET_TYPE]: ['customer', CUSTOMER_ECOMMERCE_DATA_KEY],
    },
    //TODO(customers-migration): remove this property when we migrated widgets.
    [WidgetEnvironment.User]: {
        [CUSTOM_WIDGET_TYPE]: ['customer', 'data'],
        integrations: ['customer', 'integrations'],
        [CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE]: [
            'customer',
            CUSTOMER_EXTERNAL_DATA_KEY,
        ],
        [STANDALONE_WIDGET_TYPE]: ['customer'],
        [WOOCOMMERCE_WIDGET_TYPE]: ['customer', CUSTOMER_ECOMMERCE_DATA_KEY],
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
    benefits: string[]
    company: {
        name: string
        url: string
    }
    categories: Category[]
    screenshots: string[]
    privacyPolicy: string
    setupGuide: string
    supportEmail?: string
    supportPhone?: string
    pricingPlan: PricingPlan | null
    pricingLink?: string
    pricingDetails?: string
    additionalChargesLink?: string
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
            'Connect your support email addresses and respond to your customers from Gorgias.',
        longDescription: '',
        benefits: [],
        categories: [],
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        screenshots: [],
        pricingPlan: PricingPlan.FREE,
        privacyPolicy: '',
        setupGuide: '',
        supportEmail: 'support@gorgias.com',
    },
    {
        type: IntegrationType.Phone,
        title: 'Voice',
        image: '/img/icons/channels/phone.svg',
        description:
            'Make and receive phone calls from Gorgias with easy access to customer data and conversation history.',
        requiredFeature: AccountFeature.PhoneNumber,
        benefits: [],
        categories: [Category.PHONE],
        privacyPolicy: 'https://www.gorgias.com/privacy/privacy',
        longDescription:
            '<p>Gorgias Voice is our built-in phone support solution that allows agents to manage customer calls directly from the helpdesk.</p><For>Voice is available for over 30 countries. US, Canadian, and Australian numbers can be acquired through the helpdesk. For other numbers, you can submit a request through our <a href="https://form.typeform.com/to/Y3MVMLeX" target="_blank" rel="noopener noreferrer">request form</a>. View the <a href="https://docs.gorgias.com/en-US/available-phone-numbers-on-gorgias-424606" target="_blank" rel="noopener noreferrer">full list</a> of available phone numbers.</p><strong>With voice, you’ll be able to:</strong><ul><li>Customize your greeting, voicemail, and IVR settings</li><li>Forward incoming calls to your mobile device so you can answer customers on the go</li><li>Automatically generate tickets to store details from inbound and outbound calls, including missed calls, voicemails, and call recordings</li></ul>',
        screenshots: [
            '/img/integrations/screenshots/voice-1.png',
            '/img/integrations/screenshots/voice-2.png',
            '/img/integrations/screenshots/voice-3.png',
        ],
        pricingPlan: PricingPlan.RECURRING,
        pricingLink: 'https://gorgias.com/pricing',
        pricingDetails: 'Try without commitment',
        additionalChargesLink: 'https://link.gorgias.com/39286b',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        setupGuide: 'https://docs.gorgias.com/en-US/phone-integration-81798',
        supportEmail: 'support@gorgias.com',
    },
    {
        type: IntegrationType.Sms,
        title: 'SMS',
        description:
            'Send and receive text messages in Gorgias for seamless conversations with customers on the go.',
        requiredFeature: AccountFeature.PhoneNumber,
        benefits: [],
        categories: [Category.PHONE],
        privacyPolicy: 'https://www.gorgias.com/privacy/privacy',
        longDescription:
            '<p>Gorgias SMS is the easiest way for customers to communicate with your store on the go and receive fast, conversational support.</p><p></p>SMS and MMS are available for phone numbers in the US, Canada, and Australia. SMS is available for mobile numbers in other countries. View the <a href="https://docs.gorgias.com/en-US/available-phone-numbers-on-gorgias-424606" target="_blank" rel="noopener noreferrer">full list</a> of SMS capabilities.</p><strong>With SMS, you’ll be able to:</strong><ul><li>Add text messaging to your customer support number</li><li>Send photos back and forth with MMS</li><li>Easily switch from SMS to a phone call or email to continue the conversation</li></ul>',
        screenshots: [
            '/img/integrations/screenshots/sms-1.png',
            '/img/integrations/screenshots/sms-2.png',
            '/img/integrations/screenshots/sms-3.png',
        ],
        pricingPlan: PricingPlan.RECURRING,
        pricingLink: 'http://gorgias.com/pricing',
        pricingDetails: 'Try without commitment',
        additionalChargesLink: 'https://link.gorgias.com/95e887',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        setupGuide:
            'https://docs.gorgias.com/en-US/gorgias-sms-integration-81919',
        supportEmail: 'support@gorgias.com',
    },
    {
        type: IntegrationType.WhatsApp,
        title: 'WhatsApp',
        description: 'Chat with customers using a WhatsApp Business account.',
        benefits: [],
        categories: [Category.FEATURED, Category.SOCIAL],
        privacyPolicy: 'https://www.whatsapp.com/legal/privacy-policy/?lang=en',
        longDescription:
            "<p>Connect a WhatsApp Business account to your customer support number to chat with customers anywhere in the world. Tickets will automatically generate in Gorgias to keep your workflow seamless.</p><p><strong>With WhatsApp, you’ll be able to:</strong></p><ul><li>Match the customer's number with their Shopify profile to get full context of their purchase history</li><li>Share and receive text, audio, video and PDF files from customers</li><li>Prioritize conversations based on the 24-hour time frame to respond, visible on each ticket</li></ul>",
        screenshots: [
            '/img/integrations/screenshots/whatsapp-1.png',
            '/img/integrations/screenshots/whatsapp-2.png',
            /* Remove the last image for now, since the side nav timer icon was cut from the scope for Beta */
            //  '/img/integrations/screenshots/whatsapp-3.png'
        ],
        pricingPlan: PricingPlan.FREE,
        image: '/img/integrations/whatsapp.svg',
        company: {
            name: 'Meta',
            url: 'https://about.meta.com/technologies/whatsapp/',
        },
        setupGuide: '',
        supportEmail: 'support@gorgias.com',
    },
    {
        type: IntegrationType.GorgiasChat,
        title: 'Chat',
        description: 'Add a chat on your website.',
        longDescription: '',
        benefits: [],
        categories: [Category.CHAT],
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        screenshots: [],
        pricingPlan: PricingPlan.FREE,
        privacyPolicy: '',
        setupGuide: '',
    },
    {
        type: IntegrationType.Facebook,
        title: 'Facebook, Messenger & Instagram',
        description:
            'Create tickets from Facebook posts, comments and recommendations, Instagram comments and mentions and Messenger conversations.',
        image: '/img/integrations/facebook.svg',
        benefits: [],
        categories: [Category.SOCIAL],
        longDescription:
            '<p><strong>The most efficient way to provide personalized Facebook support for your customers.</strong></p><p>Gorgias makes it easy to engage with messages, comments, mentions, or ad comments directly from your helpdesk, with detailed ecommerce information and powerful automation tools.</p><p><strong>When you integrate your Facebook page with Gorgias, you’ll be able to:&nbsp;</strong></p><ul role="list"><li>Automatically create tickets based on page comments, ad comments, mentions, and Messenger notifications</li><li>Reply to all Facebook tickets with a public comment or private message</li><li>React to Facebook comments</li><li>Answer questions quickly, thanks to contextual customer information next to every ticket</li><li>AI Agent answers to common questions with Gorgias’ powerful automation tools<br></li></ul>',
        screenshots: [
            '/img/integrations/screenshots/facebook-1.png',
            '/img/integrations/screenshots/facebook-2.png',
            '/img/integrations/screenshots/facebook-3.png',
        ],
        pricingPlan: PricingPlan.FREE,
        pricingDetails: '',
        pricingLink: '',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        privacyPolicy: 'https://www.facebook.com/about/privacy',
        setupGuide:
            'https://docs.gorgias.com/facebook-messenger/connect-your-social-channels-facebook-instagram',
    },
    {
        type: IntegrationType.Aircall,
        title: 'Aircall',
        description:
            'Provide phone support & create tickets when customers call you.',
        image: '/img/integrations/aircall.png',
        benefits: [],
        categories: [Category.PHONE],
        longDescription:
            '<p>Aircall allows you to receive and place phone calls. In a few clicks, the <a href="http://aircall.io">Aircall</a> +&nbsp;Gorgias integration ensures all relevant call information will be fully synced to a Gorgias ticket. This includes customer information, a link to voice recordings and voicemails, and the agent assigned to the call.<br></p><p><strong>This integration allows you to:&nbsp;</strong></p><ul role="list"><li>Sync call logs to Gorgias</li><li>Automatically assign calls to agents</li><li>See a customer’s Shopify and BigCommerce information when receiving a call</li></ul>',
        screenshots: [
            '/img/integrations/screenshots/aircall-1.png',
            '/img/integrations/screenshots/aircall-2.png',
            '/img/integrations/screenshots/aircall-3.png',
        ],
        pricingPlan: PricingPlan.RECURRING,
        pricingDetails: 'Pricing starting at $30/user/month, billed annually.',
        pricingLink: '',
        company: { name: 'Aircall', url: 'https://aircall.io/' },
        privacyPolicy: 'https://aircall.io/privacy-faqs/',
        setupGuide: 'https://docs.gorgias.com/voice-and-phone/aircall',
    },
    {
        type: IntegrationType.Http,
        title: 'HTTP Integration',
        description:
            'Connect Gorgias to the rest of your tech stack by fetching or sending data using an HTTP integration.',
        image: '/img/integrations/http.png',
        longDescription:
            '<p>HTTP integrations allow you to set up connections between Gorgias and any 3rd party service with a public API.  HTTP integrations are not a replacement for proper apps. Instead, they allow you to enhance current helpdesk functionality and available 3rd party apps.</p><p>If you’re a developer creating a public app, you may want to add an HTTP integration to your app but you will also need to complete <a href="https://developers.gorgias.com/docs/overview" target="_blank" rel="noopener noreferrer">all other required steps</a> to publish your app on the Gorgias App Store.</p>',
        benefits: [
            'Fetch customer data from a public API endpoint and display it next to a ticket;',
            'Send data from a Gorgias ticket to a public endpoint, such as a CDP, CRM, or a Google Sheet;',
            'Subscribe to Gorgias webhooks to trigger an API call on your end;',
            'Initiate actions in an automation tool like Zapier using the available triggers.',
        ],
        categories: [],
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        screenshots: [
            '/img/integrations/screenshots/http-1.jpg',
            '/img/integrations/screenshots/http-2.jpg',
        ],
        pricingPlan: PricingPlan.FREE,
        privacyPolicy: '',
        setupGuide: 'https://docs.gorgias.com/http-integrations-81822',
        supportEmail: 'support@gorgias.com',
    },
    {
        type: IntegrationType.Shopify,
        title: 'Shopify',
        description:
            'Automate basic queries, display customer profiles, manage orders, and drive sales without switching tabs.',
        image: '/img/integrations/shopify.png',
        benefits: [],
        categories: [Category.ECOMMERCE],
        longDescription: `
            <p>Instantly connect to Shopify in under a minute to have customer and order history at your agents’ fingertips. Here are the things you can do with Shopify integration:</p>
            <ul>
                <li>
                    <strong>Stop asking for information you already have.</strong><br />
                    View your customer’s order history as you close out their ticket to ensure speed and accuracy. No more switching between tabs or cutting and pasting
                    <br /><br />
                </li>
                <li>
                    <strong>Actual personalization at scale.</strong><br />
                    We make it easy to insert customer data provided by Shopify. From first name to shipping address, directly into each customer interaction. It’s an automatic and accurate way to get a more personal customer experience.
                    <br /><br />
                </li>
                <li>
                    <strong>Update Shopify orders directly from your helpdesk.</strong><br />
                    Update a shipping address or even issue a partial refund from directly within Gorgias. You can even create and send a draft order without opening a new tab or window.
                    <br /><br />
                </li>
                <li>
                    <strong>Automate your most common tasks.</strong><br />
                    From looking up the most recent orders to sending out an update to some of your most common questions, we make it easy to automate up to 20% of your customer support tasks.
                    <br /><br />
                </li>
                <li>
                    <strong>Detect the intent of what your customers are asking.</strong><br />
                    Gorgias uses advanced machine learning to detect the intents and sentiments of each message. By learning about tracking updates, return policies, and urgency, we help you set priorities and categorize tickets based on what they’re about.
                </li>
            </ul>`,
        screenshots: [
            '/img/integrations/screenshots/shopify-1.png',
            '/img/integrations/screenshots/shopify-2.png',
            '/img/integrations/screenshots/shopify-3.png',
            '/img/integrations/screenshots/shopify-4.png',
        ],
        pricingPlan: PricingPlan.RECURRING,
        pricingDetails: '',
        pricingLink: 'https://www.shopify.com/pricing',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        privacyPolicy: 'https://www.shopify.com/legal/privacy',
        setupGuide: 'https://docs.gorgias.com/ecommerce-integrations/shopify',
    },
    {
        type: IntegrationType.BigCommerce,
        title: 'BigCommerce',
        description:
            'Automate basic queries, display customer profiles, and manage BigCommerce orders without switching tabs.',
        image: '/img/integrations/bigcommerce.svg',
        benefits: [
            'Stop asking for information you already have. View order history and customer data in rich customer profiles, right inside the ticket view. No more switching tabs to copy/paste, or asking customers for information you already have.',
            'Personalize customer messages (even automated ones). Automatically insert customer data (like names, order numbers, and shipping addresses) into your responses. Never choose between a fast response or a personalized answer again.',
            'Manage BigCommerce orders directly from your helpdesk. Create, duplicate, and refund BigCommerce orders within Gorgias. No need to keep BigCommerce open in another tab.',
        ],
        categories: [Category.FEATURED, Category.ECOMMERCE],
        longDescription:
            'Connect to BigCommerce in under a minute to harness the power of customer data and automated customer service.',
        screenshots: [
            '/img/integrations/screenshots/bigcommerce-1.jpg',
            '/img/integrations/screenshots/bigcommerce-2.jpg',
            '/img/integrations/screenshots/bigcommerce-3.jpg',
            '/img/integrations/screenshots/bigcommerce-4.jpg',
        ],
        pricingPlan: PricingPlan.RECURRING,
        pricingDetails: 'Contact BigCommerce for pricing details.',
        pricingLink: 'https://www.bigcommerce.com/essentials/pricing/',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        privacyPolicy: 'https://www.bigcommerce.com/privacy/',
        setupGuide: 'https://docs.gorgias.com/bigcommerce-105241',
    },
    {
        type: IntegrationType.Twitter,
        title: 'Twitter',
        description:
            'Create tickets when customers interact with you via replies or mentions on Twitter.',
        image: '/img/integrations/twitter.png',
        requiredFeature: AccountFeature.TwitterIntegration,
        benefits: [],
        categories: [Category.SOCIAL],
        longDescription:
            '<p>Give your support team the power to interact with customers on Twitter, without having to log into another platform or share credentials with your social media manager. View past Twitter conversations, gain cross-channel message context, and customize your replies to provide exceptional customer support. </p><p><strong>Features of this integration:&nbsp;</strong></p><ul role="list"><li>Create tickets in Gorgias when someone <strong>replies to a tweet</strong> from your brand.</li><li>Create tickets in Gorgias when someone <strong>mentions your brand</strong> in a tweet.</li><li>Tweet back right from the ticket in Gorgias.</li><li>View media attached to tweets, including images, videos, and gifs.</li><li>Open the tweet in Twitter with a single click.</li></ul><p>This integration is currently only available for Advanced and Enterprise plans.</p>',
        screenshots: [
            '/img/integrations/screenshots/twitter-1.png',
            '/img/integrations/screenshots/twitter-2.png',
            '/img/integrations/screenshots/twitter-3.png',
        ],
        pricingPlan: PricingPlan.FREE,
        pricingDetails: '',
        pricingLink: 'https://www.gorgias.com/pricing',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        privacyPolicy: 'https://twitter.com/privacy',
        setupGuide:
            'https://updates.gorgias.com/publications/twitter-replies-mentions-and-quote-tweets-1',
    },
    {
        type: IntegrationType.Magento2,
        title: 'Magento 2',
        description:
            'Display customer profiles & orders next to tickets. Edit orders with macros.',
        image: '/img/integrations/magento.png',
        requiredFeature: AccountFeature.MagentoIntegration,
        benefits: [],
        categories: [Category.ECOMMERCE],
        longDescription:
            '<p>Securely connect with Magento to have your customers’ order history at your agents’ fingertips.<br>Magento is an ecommerce platform built on open source technology which provides online merchants with a flexible shopping cart system, as well as control over the look, content and functionality of their online store.</p><p>The Gorgias plugin for Magento is currently compatible with <strong>Magento 2.2</strong>, <strong>2.3</strong> and <strong>2.4</strong> for all Magento versions:</p><ul><li>Open Source (CE);</li><li>Commerce using on prem (EE);</li><li>Commerce on Cloud (ECE).</li></ul><h5 class="mt-4">Integration benefits</h5><ul><li>Display customer profiles next to tickets;</li><li>Display orders, shipments and credit memos;</li><li>Insert Magento 2 variables in macros;</li><li>Use Magento 2 variables as filters in rules.</li></ul>',
        screenshots: [
            '/img/integrations/screenshots/magento-1.png',
            '/img/integrations/screenshots/magento-2.png',
            '/img/integrations/screenshots/magento-3.png',
        ],
        pricingPlan: PricingPlan.FREE,
        pricingDetails: '',
        pricingLink: 'https://business.adobe.com/products/magento/pricing.html',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        privacyPolicy: 'https://magento.com/',
        setupGuide: 'https://docs.gorgias.com/ecommerce-integrations/magento-2',
    },
    {
        type: IntegrationType.Recharge,
        title: 'Recharge',
        description:
            'Display subscription info. Refund charges & skip monthly payments.',
        image: '/img/integrations/recharge.svg',
        benefits: [],
        categories: [Category.SUBSCRIPTIONS],
        longDescription:
            '<p>Recharge connects the world through seamless payments and empowers thousands of merchants to grow their subscription business. Connect Gorgias and Recharge for a simple way to manage customer subscriptions and customer service from one convenient location. </p><p><strong>With this integration, you’ll be able to:&nbsp;</strong></p><ul role="list"><li>Display Recharge subscriptions next to support tickets in Gorgias, to gather full customer context before replying to questions</li><li>Cancel subscriptions, re-activate subscriptions, or refund a charge (either partially or totally)&nbsp;right from the Gorgias helpdesk</li><li>Embed Recharge data in your Macro replies to automate the most common support questions</li></ul>',
        screenshots: [
            '/img/integrations/screenshots/recharge-1.jpeg',
            '/img/integrations/screenshots/recharge-2.jpeg',
        ],
        pricingPlan: PricingPlan.RECURRING,
        pricingDetails:
            'Starting at 1% + 10¢ per transaction. Get started for free',
        pricingLink: 'https://rechargepayments.com/products/',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        privacyPolicy: 'https://rechargepayments.com/privacy-policy/',
        setupGuide:
            'https://docs.gorgias.com/subscription-integrations/recharge',
    },
    {
        type: IntegrationType.Smile,
        title: 'Smile',
        description:
            'Display customer points and activity. Insert point balance or referral url in macros.',
        image: '/img/integrations/smile.svg',
        benefits: [],
        categories: [Category.LOYALTY],
        longDescription:
            '<p>Smile.io creates and manages reward programs (loyalty points, referrals and VIP programs) to build a fruitful relationship with both your new customers and the most loyal ones.</p><p>&zwj;</p><p>Here’s what you can do with the Smile integration:</p><ul role="list"><li>Display Smile customer profile next to Gorgias tickets</li><li>Insert point balance of referral URL in Macros</li><li>Triage tickets based on VIP tier</li></ul><p>For each customer, the following Smile data is available in Gorgias: point balance, referral URL, VIP tier, state.<br></p>',
        screenshots: [
            '/img/integrations/screenshots/smile-1.jpeg',
            '/img/integrations/screenshots/smile-2.jpeg',
            '/img/integrations/screenshots/smile-3.png',
        ],
        pricingPlan: PricingPlan.RECURRING,
        pricingDetails: 'Starting at $49/month',
        pricingLink: 'https://smile.io/pricing',
        company: { name: 'Smile', url: 'https://smile.io/' },
        privacyPolicy: 'https://smile.io/privacy-policy',
        setupGuide: 'https://docs.gorgias.com/reward-and-loyalty/smile',
    },
    {
        type: IntegrationType.Yotpo,
        title: 'Yotpo',
        description:
            'Yotpo is a user-generated content tool for merchants. It includes customer reviews, visual marketing, loyalty, and referrals.',
        image: '/img/integrations/yotpo.png',
        requiredFeature: AccountFeature.YotpoIntegration,
        benefits: [],
        categories: [
            Category.FEATURED,
            Category.SMS,
            Category.LOYALTY,
            Category.REVIEWS,
        ],
        longDescription:
            '<p>Yotpo is an eCommerce marketing platform with the most advanced solutions for customer reviews, visual marketing, loyalty, referrals, and SMS marketing.</p><p>From approving a product review to updating reward points of a specific customer, allow your support agents to manage product reviews, questions, loyalty plans, and referrals without leaving Gorgias. </p><p><strong>Connect Yotpo with Gorgias to:</strong></p><ul role="list"><li>Display customer’s Yotpo data in Gorgias customer Activity Sidebar such as loyalty points, provided ratings, latest reviews, etc.</li><li>Manage customer loyalty plans (change point balance, assign VIP tier, honor redemptions, and send rewards) from the Gorgias sidebar.</li><li>Respond to a question with an answer either publicly or privately as new tickets.</li><li>Moderate customer reviews (product and site) and questions from within Gorgias as new tickets.</li><li>Request reviews from a customer. </li></ul>',
        screenshots: [
            '/img/integrations/screenshots/yotpo-1.png',
            '/img/integrations/screenshots/yotpo-2.png',
            '/img/integrations/screenshots/yotpo-3.png',
            '/img/integrations/screenshots/yotpo-4.png',
        ],
        pricingPlan: PricingPlan.RECURRING,
        pricingDetails: 'Free and premium plans available.',
        pricingLink: 'https://www.yotpo.com/pricing/',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        privacyPolicy: 'https://www.yotpo.com/privacy-policy/',
        setupGuide:
            'https://docs.gorgias.com/reward-and-loyalty/yotpo-customer-data',
    },
    {
        type: IntegrationType.Klaviyo,
        title: 'Klaviyo - 🗄 DEPRECATED',
        benefits: [],
        categories: [Category.LOYALTY],
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        screenshots: [],
        pricingPlan: PricingPlan.FREE,
        description:
            'Handle your customers, lists and segments from your Klaviyo campaigns via emails or sms.',
        image: '/img/integrations/klaviyo.png',
        longDescription: '',
        privacyPolicy: '',
        setupGuide: '',
    },
    {
        type: IntegrationType.App,
        title: 'More Applications',
        description: '',
        benefits: [],
        categories: [Category.SOCIAL],
        longDescription: '',
        screenshots: [],
        pricingPlan: PricingPlan.FREE,
        pricingDetails: '',
        pricingLink: '',
        company: { name: 'Gorgias', url: 'https://www.gorgias.com/' },
        privacyPolicy: '',
        setupGuide: '',
    },
]

const CHANNELS = [
    IntegrationType.Email,
    IntegrationType.Phone,
    IntegrationType.Sms,
    IntegrationType.GorgiasChat,
]

export const isChannel = (type: unknown) => {
    return CHANNELS.includes(type as IntegrationType)
}

// Import period for tickets
export const GMAIL_IMPORTED_EMAILS_FOR_YEARS = 2
export const OUTLOOK_IMPORTED_EMAILS_FOR_YEARS = 2
export const ZENDESK_IMPORTED_TICKETS_FOR_YEARS = 2

//$TsFixMe fallback values for js files, replace with ContentType enum
export const JSON_CONTENT_TYPE = 'application/json'
export const FORM_CONTENT_TYPE = 'application/x-www-form-urlencoded'

export enum ActionTemplateExecution {
    Front = 'front',
    Back = 'back',
    External = 'external',
}

export type ActionTemplate = {
    execution: ActionTemplateExecution
    name: MacroActionName
    title: string
    notes?: string[]
    integrationType?: string
    arguments?: {
        [key: string]: {
            default?: any
            display_order?: number
            editable?: boolean
            input?: {
                type: string
                step?: number
                options?: any
                allowCustomValue?: boolean
                min?: number
            }
            label?: string | null
            type?: string
            required?: boolean
            format?: string
            enum?: string[]
            items?: any
        }
    }
    validators?: Array<{
        validate: (value: Customer) => unknown
        error: string
    }>
    partialUpdateKeys?: string | string[]
    partialUpdateValues?: string | string[]
    icon?: string
}

/**
 * execution - 'front', 'back' or external, either the action is executed client side, server side or sent to third party
 * name - name of the action (must correspond to action name to be triggered on client side)
 * title - label shown in actions list in macro editor
 * arguments - description of macro action form (and structure of data returned by the form)
 * integrationType - action bound to a type of integration (should nt be available if no integration of this type)
 * getStateData - selector used to retrieve data from reducer corresponding to data updated by the action
 */
export const ACTION_TEMPLATES: ActionTemplate[] = [
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
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.ForwardByEmail,
        title: 'Forward email',
        icon: 'forward',
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
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.AddTags,
        title: 'Add tags',
        partialUpdateKeys: 'tags',
        partialUpdateValues: 'tags',
        icon: 'label',
        arguments: {
            tags: {
                default: '',
                input: {
                    type: 'tags-select',
                },
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.RemoveTags,
        title: 'Remove tags',
        partialUpdateKeys: 'tags',
        partialUpdateValues: 'tags',
        icon: 'label_off',
        arguments: {
            tags: {
                default: '',
                input: {
                    type: 'tags-select',
                },
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.SetStatus,
        title: 'Set status',
        partialUpdateKeys: 'status',
        partialUpdateValues: 'status',
        icon: 'check_box',
        arguments: {
            status: {
                default: 'open',
                input: {
                    type: 'status-select',
                },
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.SetAssignee,
        title: 'Assign an agent',
        partialUpdateKeys: 'assignee_user',
        partialUpdateValues: 'assignee_user',
        icon: 'person',
        arguments: {
            assignee_user: {
                input: {
                    type: 'assignee_user-select',
                },
                default: null,
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.SetTeamAssignee,
        title: 'Assign a team',
        partialUpdateKeys: 'assignee_team',
        partialUpdateValues: 'assignee_team',
        icon: 'groups',
        arguments: {
            assignee_team: {
                type: 'dict',
                default: null,
                label: null,
                display_order: 1,
                editable: true,
                required: true,
                input: {
                    type: 'assignee_team-select',
                },
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.SetSubject,
        title: 'Set subject',
        partialUpdateKeys: 'subject',
        partialUpdateValues: 'subject',
        icon: 'subject',
        arguments: {
            subject: {
                type: 'string',
                default: '',
                display_order: 1,
                editable: true,
                required: true,
                label: null,
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.SnoozeTicket,
        title: 'Snooze for',
        icon: 'snooze',
        partialUpdateKeys: ['snooze_datetime', 'status'],
        partialUpdateValues: ['snooze_datetime', 'status'],
        arguments: {
            snooze_timedelta: {
                type: 'string',
                default: '1d',
                display_order: 1,
                editable: true,
                required: true,
                input: {
                    type: 'timedelta',
                },
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.SetPriority,
        title: 'Set priority',
        partialUpdateKeys: 'priority',
        partialUpdateValues: 'priority',
        icon: 'check_box',
        arguments: {
            priority: {
                default: 'normal',
                input: {
                    type: 'priority-select',
                },
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.AddInternalNote,
        title: 'Send internal note',
        icon: 'note',
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
        execution: ActionTemplateExecution.External,
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
        execution: ActionTemplateExecution.External,
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
        execution: ActionTemplateExecution.External,
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
        execution: ActionTemplateExecution.External,
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
        execution: ActionTemplateExecution.External,
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
        execution: ActionTemplateExecution.External,
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
                        ]),
                    )
                },
                error: "The last order has already been refunded or hasn't been paid for yet.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.External,
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
                        ]),
                    )
                },
                error: "The last order has already been refunded or hasn't been paid for yet.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.External,
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
                    min: 0,
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
                        ]),
                    )
                },
                error: "The last order has already been refunded or hasn't been paid for yet.",
            },
        ],
    },
    {
        execution: ActionTemplateExecution.External,
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
        execution: ActionTemplateExecution.External,
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
                        }),
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
        execution: ActionTemplateExecution.External,
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
        execution: ActionTemplateExecution.External,
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
                    min: 0,
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
                        _get(rechargeIntegration, ['charges', '0', 'status']),
                    )
                },
                error: 'The last charge is not refundable.',
            },
        ],
    },
    {
        execution: ActionTemplateExecution.External,
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
                    min: 0,
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
                        ]),
                    )
                },
                error: 'The last order is not refundable.',
            },
        ],
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.ExcludeFromAutoMerge,
        title: 'Exclude ticket from Auto-Merge',
        icon: 'cancel',
        arguments: {},
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.ExcludeFromCSAT,
        title: 'Exclude ticket from CSAT',
        icon: 'cancel',
        arguments: {},
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.SetCustomFieldValue,
        title: 'Set ticket field',
        icon: 'label',
        arguments: {
            custom_field_id: {
                label: 'Field',
                // the default as a string here allows us to rule out empty actions
                // in src/pages/settings/macros/MacrosSettingsForm.tsx
                default: '',
                editable: false,
                required: false,
                display_order: 1,
                input: {
                    type: 'custom_field-select',
                },
            },
            value: {
                label: 'Value',
                default: '',
                editable: true,
                required: false,
                display_order: 2,
                input: {
                    type: 'custom_field-input',
                },
            },
        },
    },
    {
        execution: ActionTemplateExecution.Back,
        name: MacroActionName.SetCustomerCustomFieldValue,
        title: 'Set customer field',
        icon: 'person',
        arguments: {
            custom_field_id: {
                label: 'Field',
                default: '',
                editable: false,
                required: false,
                display_order: 1,
                input: {
                    type: 'customer_field-select',
                },
            },
            value: {
                label: 'Value',
                default: '',
                editable: true,
                required: false,
                display_order: 2,
                input: {
                    type: 'customer_field-input',
                },
            },
        },
    },
]

export const DEFAULT_ACTIONS = ACTION_TEMPLATES.map<string>(
    (template) => template.name,
)

/*
 * Default currentUser preferences
 */
export const DEFAULT_PREFERENCES = {
    show_macros: false,
    available: true,
    prefill_best_macro: true,
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

export const SENTIMENT_TYPE_UPPER_BOUND = 0.4

export const SENTIMENT_TYPE_LOWER_BOUND = -0.4

/**
 * Text editor used in helpcenter
 */
export const FROALA_KEY =
    'aLF3c1A7B5E5E3E2G2D2xROKLJKYHROLDXDRH1e1YYGRe1Bg1G3I3A2A5D6A3F2E4D2F2=='

const VIDEO_STYLES = 'width="100%" aspect-ratio="16/9"'

export const FROALA_VIDEO_PROVIDERS = [
    // DEFAULT PROVIDERS (with updated `provider` and `iframe` width)
    // Extracted from '/froala-editor/js/plugins/video.min.js'
    {
        test_regex:
            /^.*((youtu.be)|(youtube.com))\/((v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))?\??v?=?([^#\&\?]*).*/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/)?([0-9a-zA-Z_\-]+)(.+)?/g,
        url_text: 'https://www.youtube.com/embed/$1?$2',
        html: `<iframe ${VIDEO_STYLES} src="{url}&wmode=opaque&rel=0" frameborder="0" allowfullscreen></iframe>`,
        provider: 'YouTube',
    },
    {
        test_regex:
            /^.*(?:vimeo.com)\/(?:channels(\/\w+\/)?|groups\/*\/videos\/\u200b\d+\/|video\/|)(\d+)(?:$|\/|\?)/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:[a-zA-Z0-9_\-]+)?(\/[a-zA-Z0-9_\-]+)?/i,
        url_text: 'https://player.vimeo.com/video/$1',
        html: `<iframe ${VIDEO_STYLES} src="{url}" frameborder="0" allowfullscreen></iframe>`,
        provider: 'Vimeo',
    },
    {
        test_regex:
            /^.+(dailymotion.com|dai.ly)\/(video|hub)?\/?([^_]+)[^#]*(#video=([^_&]+))?/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.)?(?:dailymotion\.com|dai\.ly)\/(?:video|hub)?\/?(.+)/g,
        url_text: 'https://www.dailymotion.com/embed/video/$1',
        html: `<iframe ${VIDEO_STYLES} src="{url}" frameborder="0" allowfullscreen></iframe>`,
        provider: 'Dailymotion',
    },
    {
        test_regex: /^.+(screen.yahoo.com)\/[^_&]+/,
        url_regex: '',
        url_text: '',
        html: `<iframe ${VIDEO_STYLES} src="{url}?format=embed" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" allowtransparency="true"></iframe>`,
        provider: 'Yahoo',
    },
    {
        test_regex: /^.+(rutube.ru)\/[^_&]+/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.)?(?:rutube\.ru)\/(?:video)?\/?(.+)/g,
        url_text: 'https://rutube.ru/play/embed/$1',
        html: `<iframe ${VIDEO_STYLES} src="{url}" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true" allowtransparency="true"></iframe>`,
        provider: 'RuTube',
    },
    {
        test_regex: /^(?:.+)vidyard.com\/(?:watch)?\/?([^.&/]+)\/?(?:[^_.&]+)?/,
        url_regex: /^(?:.+)vidyard.com\/(?:watch)?\/?([^.&/]+)\/?(?:[^_.&]+)?/g,
        url_text: 'https://play.vidyard.com/$1',
        html: `<iframe ${VIDEO_STYLES} src="{url}" frameborder="0" allowfullscreen></iframe>`,
        provider: 'Vidyard',
    },

    // CUSTOM PROVIDERS
    {
        test_regex: /^.*(loom.com)\/[^_&]+/,
        url_regex:
            /(?:https?:\/\/)?(?:www\.)?(?:loom\.com)\/(?:share)?\/?(.+)/g,
        url_text: 'https://www.loom.com/embed/$1',
        html: `<iframe ${VIDEO_STYLES} src="{url}" frameborder="0" allowfullscreen="true" mozallowfullscreen="true" webkitallowfullscreen="true"></iframe>`,
        provider: 'Loom',
    },
]

export const HOTSWAP_SDK_URL = 'https://widget.hotswap.app/js/hotswap.js'
