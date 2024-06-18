import {HelpdeskPlan} from 'models/billing/types'
import {isStarterTierPrice} from 'models/billing/utils'

const useAutomatedHelpdeskCancellationFlowAvailable = (
    helpdeskProduct: HelpdeskPlan | null
) => {
    if (!helpdeskProduct) {
        return false
    }

    const isProTierPlan = helpdeskProduct.internal_id.includes('pro')
    const isBasicTierPlan = helpdeskProduct.internal_id.includes('basic')
    const isStarterTierPlan = isStarterTierPrice(helpdeskProduct)

    return isProTierPlan || isBasicTierPlan || isStarterTierPlan
}

export default useAutomatedHelpdeskCancellationFlowAvailable
