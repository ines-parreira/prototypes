import { ActiveContent, Navbar } from 'common/navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'

import StatsNavbarView from './components/StatsNavbarView'
import { StatsNavbarViewV2 } from './components/StatsNavbarViewV2/StatsNavbarViewV2'

export default function StatsNavbarContainer() {
    const showStatsNavbarV2 = useFlag(FeatureFlagKey.RevampNavBarUi)

    return (
        <Navbar activeContent={ActiveContent.Statistics} title="Statistics">
            {showStatsNavbarV2 ? <StatsNavbarViewV2 /> : <StatsNavbarView />}
        </Navbar>
    )
}
