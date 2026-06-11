import { FeatureFlagKey } from '../featureFlagKey'
import { useFlagWithLoading } from '../useFlagWithLoading'

export function useDefaultViewsSourceSdkFlagWithLoading(): {
    isLoading: boolean
    value: boolean
} {
    return useFlagWithLoading(FeatureFlagKey.DefaultViewsSourceSdk, false)
}

export function useDefaultViewsSourceSdkFlag(): boolean {
    const { isLoading, value } = useDefaultViewsSourceSdkFlagWithLoading()

    return isLoading ? false : value
}
