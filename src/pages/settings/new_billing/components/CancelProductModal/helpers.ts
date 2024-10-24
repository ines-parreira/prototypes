import {ProductType} from 'models/billing/types'

import {HELPDESK_CANCELLATION_SCENARIO} from './scenarios'
import {CancellationScenario} from './types'

export const findCancellationScenarioByProductType = (
    productType: ProductType
): CancellationScenario => {
    switch (productType) {
        case ProductType.Helpdesk:
            return HELPDESK_CANCELLATION_SCENARIO
        default:
            throw new Error(
                `Cancellation script not found for ${productType} product.`
            )
    }
}
