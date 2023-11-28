import useAppSelector from 'hooks/useAppSelector'
import {getCurrentHelpdeskProduct} from 'state/billing/selectors'

export const useGetCostPerBillableTicket = () => {
    const helpdesk = useAppSelector(getCurrentHelpdeskProduct)

    if (!helpdesk) return 0

    return helpdesk.amount / 100 / helpdesk.num_quota_tickets
}
