import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { Detail as LegacyDetail } from './Detail'
import { DetailV2 } from './DetailV2'

function Detail() {
    const isNewUsersListEnabled = useFlag(FeatureFlagKey.NewUsersListPage)
    return isNewUsersListEnabled ? <DetailV2 /> : <LegacyDetail />
}

export { Detail }
