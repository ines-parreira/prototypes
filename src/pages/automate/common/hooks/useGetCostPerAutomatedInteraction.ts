import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAutomationProduct} from 'state/billing/selectors'

const FIXED_COST_PER_AUTOMATED_INTERACTION = 0.85

export const useGetCostPerAutomatedInteraction = () => {
    const currentAutomatePlan = useAppSelector(getCurrentAutomationProduct)

    if (currentAutomatePlan?.num_quota_tickets) {
        return (
            // because the amount is in cents we need to devide it by 100
            currentAutomatePlan.amount /
            100 /
            currentAutomatePlan.num_quota_tickets
        )
    }

    return FIXED_COST_PER_AUTOMATED_INTERACTION
}
