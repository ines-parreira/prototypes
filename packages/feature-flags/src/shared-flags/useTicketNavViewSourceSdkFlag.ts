import { FeatureFlagKey } from '../featureFlagKey'
import { useFlagWithLoading } from '../useFlagWithLoading'

export function useTicketNavViewSourceSdkFlagWithLoading(): {
    isLoading: boolean
    value: boolean
} {
    return useFlagWithLoading(FeatureFlagKey.TicketNavViewSourceSdk, false)
}

export function useTicketNavViewSourceSdkFlag(): boolean {
    const { isLoading, value } = useTicketNavViewSourceSdkFlagWithLoading()

    return isLoading ? false : value
}
