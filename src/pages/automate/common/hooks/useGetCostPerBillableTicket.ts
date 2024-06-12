import useAppSelector from 'hooks/useAppSelector'
import {getCurrentHelpdeskPlan} from 'state/billing/selectors'

export const useGetCostPerBillableTicket = () => {
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)

    if (!currentHelpdeskPlan) return 0

    return (
        currentHelpdeskPlan.amount / 100 / currentHelpdeskPlan.num_quota_tickets
    )
}
