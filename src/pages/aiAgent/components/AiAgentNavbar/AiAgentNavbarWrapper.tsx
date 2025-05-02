import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import { AiAgentNavbar } from './AiAgentNavbar'
import { AiAgentNavbarV2 } from './AiAgentNavbarV2'

export const AiAgentNavbarWrapper = () => {
    const showStatsNavbarV2 = useFlag(FeatureFlagKey.RevampNavBarUi)

    return <>{showStatsNavbarV2 ? <AiAgentNavbarV2 /> : <AiAgentNavbar />}</>
}
