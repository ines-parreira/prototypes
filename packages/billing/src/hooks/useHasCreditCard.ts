import { useBillingState } from './useBillingState'

export function useHasCreditCard(): boolean {
    const state = useBillingState()
    return !!state.data?.customer?.credit_card
}
