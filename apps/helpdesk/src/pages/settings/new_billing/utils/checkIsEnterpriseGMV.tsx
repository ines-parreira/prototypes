import type { CustomerSummary } from '@gorgias/helpdesk-types'
import { CustomerFixedGmvBand } from '@gorgias/helpdesk-types'

export default function checkIsEnterpriseGMV(
    customer?: CustomerSummary | null,
): boolean {
    return !!(
        customer?.fixed_gmv_band &&
        (customer.fixed_gmv_band === CustomerFixedGmvBand.Enterprise1 ||
            customer.fixed_gmv_band === CustomerFixedGmvBand.Enterprise2)
    )
}
