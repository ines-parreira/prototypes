import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import ConvertNavbar from './ConvertNavbar'
import { ConvertNavbarV2 } from './ConvertNavbarV2'

export const ConvertNavbarContainer = () => {
    const showConvertNavbarV2 = useFlag(FeatureFlagKey.RevampNavBarUi)

    return showConvertNavbarV2 ? <ConvertNavbarV2 /> : <ConvertNavbar />
}
