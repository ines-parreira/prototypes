import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { getHasAutomate } from 'state/billing/selectors'

export const useAiAgentItemEnabled = () => {
    const hasAutomate = useAppSelector(getHasAutomate)
    const hasAiAgentStandaloneMenu = useFlag<boolean>(
        FeatureFlagKey.ConvAiStandaloneMenu,
        false,
    )
    const hasAiAgentPreview = useFlag<boolean>(
        FeatureFlagKey.AIAgentPreviewModeAllowed,
        false,
    )

    return hasAiAgentStandaloneMenu && (hasAutomate || hasAiAgentPreview)
}
