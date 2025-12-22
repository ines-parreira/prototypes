import type { BillingContactDetailResponse } from 'state/billing/types'

import { reportCRMGrowthError } from './reportCRMGrowthError'

// Countries where our customers do not use postal codes. See: https://docs.google.com/spreadsheets/d/1sPiWPJyLXqjd0x6i13H36gX22GzrFECBk74j_8z4VRY/edit?gid=1085738161#gid=1085738161
const COUNTRIES_WITHOUT_POSTAL_CODES = new Set(['AE', 'AW', 'HK', 'JM', 'QA'])

const requiresPostalCode = (country: string): boolean => {
    return !COUNTRIES_WITHOUT_POSTAL_CODES.has(country)
}

export const getIsMissingBillingInformation = (
    state?: BillingContactDetailResponse,
): boolean => {
    // Runtime validation: shipping or shipping.address can be undefined even though
    // TypeScript types indicate they're required.
    // Related Sentry issue: https://gorgias.sentry.io/issues/7121302754
    if (!state || !state.shipping || !state.shipping.address) {
        if (state) {
            reportCRMGrowthError(
                new Error(
                    'Unexpected undefined shipping or address in billing state',
                ),
                JSON.stringify({
                    billingState: state,
                }),
            )
        }
        return false
    }

    const { email, shipping } = state
    const { country, postal_code, state: usState } = shipping.address

    if (!email || !country) {
        return true
    }

    // Check postal code only for countries that require it
    if (requiresPostalCode(country) && !postal_code) {
        return true
    }

    if (country === 'US' && !usState) {
        return true
    }

    return false
}
