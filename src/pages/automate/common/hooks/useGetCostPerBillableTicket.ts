import useAppSelector from 'hooks/useAppSelector'
import {getCurrentHelpdeskProduct} from 'state/billing/selectors'

export const useGetCostPerBillableTicket = () => {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskProduct)

    if (!currentHelpdeskPlan) return 0

    return (
        currentHelpdeskPlan.amount / 100 / currentHelpdeskPlan.num_quota_tickets
    )
}
