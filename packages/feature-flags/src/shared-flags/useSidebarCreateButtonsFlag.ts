import { FeatureFlagKey } from '../featureFlagKey'
import { useFlagWithLoading } from '../useFlagWithLoading'

export function useSidebarCreateButtonsFlag(): boolean {
    const { value } = useFlagWithLoading(
        FeatureFlagKey.SidebarCreateButtons,
        false,
    )
    return value
}
