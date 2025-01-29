import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'

export function useDesktopOnlyShowGlobalNavFeatureFlag() {
    const hasGlobalNav = useFlag(FeatureFlagKey.GlobalNavigation)

    const isMobileResolution = useIsMobileResolution()

    return hasGlobalNav && !isMobileResolution
}

export function useShowGlobalNavFeatureFlag() {
    const hasGlobalNav = useFlag(FeatureFlagKey.GlobalNavigation)

    return hasGlobalNav
}
