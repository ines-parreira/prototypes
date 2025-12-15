import { ProductType } from 'models/billing/types'

import {
    HELPDESK_REASONS_TO_CANDU_CONTENTS,
    ProductCancellationReasons,
} from './constants'
import type { CancellationScenario } from './types'

export const HELPDESK_CANCELLATION_SCENARIO: CancellationScenario = {
    reasons: ProductCancellationReasons,
    productsToCancel: [
        ProductType.Helpdesk,
        ProductType.Automation,
        ProductType.SMS,
        ProductType.Voice,
        ProductType.Convert,
    ],
    features: [
        {
            title: 'Your all-in-one inbox',
            description: 'Respond to every customer message from one place.',
            icon: 'all_inbox',
        },
        {
            title: 'Your ecommerce dashboard',
            description:
                'Process refunds, cancellations, and returns with a click.',
            icon: 'shopping_cart',
        },
        {
            title: 'Your 100+ ecommerce integrations',
            description: 'View customer data right next to your tickets.',
            icon: 'widgets',
        },
    ],
    reasonsToCanduContents: HELPDESK_REASONS_TO_CANDU_CONTENTS,
    productDisplayName: 'Helpdesk',
}

export const AI_AGENT_CANCELLATION_SCENARIO: CancellationScenario = {
    reasons: ProductCancellationReasons,
    productsToCancel: [ProductType.Automation],
    features: [
        {
            title: 'Autonomous ticket resolution',
            icon: 'auto_awesome',
            description:
                'Instantly resolve up to 60% of customer inquiries with AI trained on your brand.',
        },
        {
            title: 'Actions across 100+ ecommerce tools',
            icon: 'webhook',
            description:
                'Process refunds, edit subscriptions, and send updates automatically.',
        },
        {
            title: 'Revenue-generating conversations',
            icon: 'shopping_cart',
            description:
                'Turn support chats into personalized, repeat purchase opportunities.',
        },
    ],
    reasonsToCanduContents: [],
    productDisplayName: 'AI Agent',
}

export const CONVERT_CANCELLATION_SCENARIO: CancellationScenario = {
    reasons: ProductCancellationReasons,
    productsToCancel: [ProductType.Convert],
    features: [
        {
            title: 'Up to 49% more sales on targeted products',
            icon: 'trending_up',
            description:
                'Turn browsers into buyers with personalized offers and education.',
        },
        {
            title: 'Advanced targeting with Shopify data',
            icon: 'data_usage',
            description:
                'Trigger campaigns based on cart value, purchase history, and customer behavior.',
        },
        {
            title: 'Direct connection to live support',
            icon: 'record_voice_over',
            description:
                'Seamlessly hand off engaged shoppers to agents who can close the sale.',
        },
    ],
    reasonsToCanduContents: [],
    productDisplayName: 'Convert',
}

export const SMS_CANCELLATION_SCENARIO: CancellationScenario = {
    reasons: ProductCancellationReasons,
    productsToCancel: [ProductType.SMS],
    features: [
        {
            title: '98% open rate — 5x higher than email',
            icon: 'auto_awesome',
            description:
                'Reach customers instantly on the channel they prefer.',
        },
        {
            title: 'Automated replies powered by Shopify data',
            icon: 'webhook',
            description:
                'Pull order updates and tracking info to resolve issues fast.',
        },
        {
            title: '73% of shoppers buy after receiving a text',
            icon: 'shopping_cart',
            description:
                'Drive repeat sales with timely product links and discounts.',
        },
    ],
    reasonsToCanduContents: [],
    productDisplayName: 'SMS',
}

export const VOICE_CANCELLATION_SCENARIO: CancellationScenario = {
    reasons: ProductCancellationReasons,
    productsToCancel: [ProductType.Voice],
    features: [
        {
            title: 'Unified phone support with full customer context',
            icon: 'phone',
            description:
                'See orders, tickets, and subscriptions before picking up the call.',
        },
        {
            title: 'Shopify-powered call handling',
            icon: 'webhook',
            description:
                'Create orders, issue refunds, and recommend products without switching tools.',
        },
        {
            title: 'AI transcripts and call analytics',
            icon: 'archive',
            description:
                'Get auto-summarized calls and insights that improve team performance.',
        },
    ],
    reasonsToCanduContents: [],
    productDisplayName: 'Voice',
}
