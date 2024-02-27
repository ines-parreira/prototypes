import {ProductType} from '../../../../../models/billing/types'
import {HELPDESK_CANCELLATION_REASONS} from './constants'

import {CancellationScenario} from './types'

export const HELPDESK_CANCELLATION_SCENARIO: CancellationScenario = {
    reasons: HELPDESK_CANCELLATION_REASONS,
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
}
