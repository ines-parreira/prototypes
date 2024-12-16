import type {BillingContactDetailResponse} from 'state/billing/types'

export const getIsMissingBillingtInformation = (
    state?: BillingContactDetailResponse
): boolean => {
    return (
        !!state &&
        (!state.email ||
            !state.shipping.address.country ||
            !state.shipping.address.postal_code ||
            (state.shipping.address.country === 'US' &&
                !state.shipping.address.state))
    )
}
