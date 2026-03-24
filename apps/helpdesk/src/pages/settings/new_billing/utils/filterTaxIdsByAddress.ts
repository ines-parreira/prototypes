import { TAX_ID_VALIDATION } from '@repo/billing'
import mapValues from 'lodash/mapValues'

import type {
    BillingContactUpdatePayload,
    TaxIdType,
} from 'state/billing/types'

export const filterTaxIdsByAddress = (
    taxIds: BillingContactUpdatePayload['tax_ids'],
    address: {
        country?: string
        state?: string | null
    },
): BillingContactUpdatePayload['tax_ids'] => {
    return mapValues(taxIds, (value, type) => {
        const validation = TAX_ID_VALIDATION[type as TaxIdType]

        if (
            address.country &&
            validation?.countries.includes(address.country)
        ) {
            const states = validation?.states

            if (!states || (address.state && states.includes(address.state))) {
                return value
            }
        }

        return undefined
    })
}
