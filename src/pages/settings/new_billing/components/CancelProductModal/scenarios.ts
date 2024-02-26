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
}
