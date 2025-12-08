import flowsIcon from 'assets/img/icons/flows.svg'
import orderManagementIcon from 'assets/img/icons/order-management.svg'
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
            title: 'All-in-one support inbox',
            description:
                'Powerful inbox to respond to customer support tickets from all your channels',
            icon: 'all_inbox',
        },
        {
            title: 'Ecommerce control panel',
            description:
                'Ability to refund, cancel, or approve return requests — all from one place',
            icon: 'shopping_cart',
        },
        {
            title: 'Integrations with 100+ ecommerce tools',
            description:
                'All customer data at your fingertips in the support ticket sidebar',
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
            title: 'AI Agent',
            icon: 'auto_awesome',
            description: 'Your virtual agent for automated support',
        },
        {
            title: 'Flows',
            iconUrl: flowsIcon,
            description: 'Build interactive, personalized resolutions',
        },
        {
            title: 'Order Management',
            iconUrl: orderManagementIcon,
            description: 'Let customers manage and track orders',
        },
        {
            title: 'Article Recommendation',
            icon: 'menu_book',
            description: 'Answer customer questions with AI',
        },
        {
            title: 'Automation statistics',
            icon: 'bar_chart',
            description: 'Measure and track your automation performance',
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
            title: 'Up to 49% increase in sales on targeted products',
            icon: 'trending_up',
            description:
                'Drive revenue with AI-powered product recommendations',
        },
        {
            title: 'Campaign analytics',
            icon: 'bar_chart',
            description: 'Track performance and optimize your campaigns',
        },
        {
            title: 'Smart targeting',
            icon: 'filter_alt',
            description: 'Reach the right customers at the right time',
        },
        {
            title: 'A/B testing',
            icon: 'science',
            description: 'Test and optimize your conversion strategies',
        },
        {
            title: 'Personalized experiences',
            icon: 'person',
            description: 'Deliver tailored shopping experiences',
        },
    ],
    reasonsToCanduContents: [],
    productDisplayName: 'Convert',
}
