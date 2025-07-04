import { useBillingState } from './useBillingState'

export function useHasCreditCard(): boolean {
    const state = useBillingState()
    return !!state?.customer?.credit_card
}
