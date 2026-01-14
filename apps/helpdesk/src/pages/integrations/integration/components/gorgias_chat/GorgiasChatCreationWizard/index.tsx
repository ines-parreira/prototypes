import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import type { Map } from 'immutable'

import GorgiasChatCreationWizardLegacy from './GorgiasChatCreationWizard'
import GorgiasChatCreationWizardRevamp from './revamp/GorgiasChatCreationWizard'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    isUpdate: boolean
}

export default function GorgiasChatCreationWizardSwitcher({
    integration,
    loading,
    isUpdate,
}: Props) {
    const isRevampEnabled = useFlag(FeatureFlagKey.ChatSettingsRevamp)

    const Component = isRevampEnabled
        ? GorgiasChatCreationWizardRevamp
        : GorgiasChatCreationWizardLegacy

    return (
        <Component
            integration={integration}
            loading={loading}
            isUpdate={isUpdate}
        />
    )
}
