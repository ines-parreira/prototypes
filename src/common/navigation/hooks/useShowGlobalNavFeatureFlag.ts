import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'

export function useDesktopOnlyShowGlobalNavFeatureFlag() {
    const hasGlobalNav = useFlag<boolean>(
        FeatureFlagKey.GlobalNavigation,
        false
    )

    const isMobileResolution = useIsMobileResolution()

    return hasGlobalNav && !isMobileResolution
}

export function useShowGlobalNavFeatureFlag() {
    const hasGlobalNav = useFlag<boolean>(
        FeatureFlagKey.GlobalNavigation,
        false
    )

    return hasGlobalNav
}
