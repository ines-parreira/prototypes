import type { CustomerSummary } from '@gorgias/helpdesk-types'
import {
    CustomerFixedGmvBand,
    DEPRECATEDCustomerFixedGmvBand,
} from '@gorgias/helpdesk-types'

export default function checkIsEnterpriseGMV(
    customer?: CustomerSummary | null,
): boolean {
    return !!(
        customer?.fixed_gmv_band &&
        (customer.fixed_gmv_band === CustomerFixedGmvBand.Enterprise ||
            customer.fixed_gmv_band === CustomerFixedGmvBand.NamedAccounts ||
            customer.fixed_gmv_band ===
                DEPRECATEDCustomerFixedGmvBand.Enterprise1 ||
            customer.fixed_gmv_band ===
                DEPRECATEDCustomerFixedGmvBand.Enterprise2)
    )
}
