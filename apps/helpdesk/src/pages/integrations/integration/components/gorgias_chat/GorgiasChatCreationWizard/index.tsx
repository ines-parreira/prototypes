import { lazy, Suspense } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import type { Map } from 'immutable'

import { useFlag } from 'core/flags'

import GorgiasChatCreationWizardLegacy from './GorgiasChatCreationWizard'

const GorgiasChatCreationWizardRevamp = lazy(
    () => import('./revamp/GorgiasChatCreationWizard'),
)

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
    const isRevampEnabled = useFlag(FeatureFlagKey.ChatCreationWizardRevamp)

    const Component = isRevampEnabled
        ? GorgiasChatCreationWizardRevamp
        : GorgiasChatCreationWizardLegacy

    return (
        <Suspense fallback={null}>
            <Component
                integration={integration}
                loading={loading}
                isUpdate={isUpdate}
            />
        </Suspense>
    )
}
