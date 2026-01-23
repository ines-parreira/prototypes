import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import GorgiasChatIntegrationAppearanceLegacy from './GorgiasChatIntegrationAppearance'
import GorgiasChatIntegrationAppearanceRevamp from './revamp/GorgiasChatIntegrationAppearance'

type Props = React.ComponentProps<typeof GorgiasChatIntegrationAppearanceLegacy>

function GorgiasChatIntegrationAppearance(props: Props) {
    const isRevampEnabled = useFlag(FeatureFlagKey.ChatSettingsRevamp)

    if (isRevampEnabled) {
        return <GorgiasChatIntegrationAppearanceRevamp {...props} />
    }

    return <GorgiasChatIntegrationAppearanceLegacy {...props} />
}

export default GorgiasChatIntegrationAppearance
