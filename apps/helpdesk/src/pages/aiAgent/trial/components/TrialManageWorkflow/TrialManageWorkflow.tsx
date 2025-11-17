import { useEffect } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'

import { useFlag } from 'core/flags'
import type { StoreConfiguration } from 'models/aiAgent/types'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import { useSalesTrialRevampMilestone } from '../../hooks/useSalesTrialRevampMilestone'

export type TrialManageWorkflowProps = {
    pageName: 'Strategy' | 'Engagement'
    storeConfiguration: StoreConfiguration
}

export const TrialManageWorkflow = ({
    pageName,
    storeConfiguration,
}: TrialManageWorkflowProps) => {
    const isShoppingAssistantTrialImprovementEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialImprovement,
        false,
    )

    const {
        hasCurrentStoreTrialStarted,
        hasCurrentStoreTrialExpired,
        trialType,
    } = useTrialAccess(storeConfiguration.storeName)

    const trialModalProps = useTrialModalProps({
        pageName,
        storeName: storeConfiguration.storeName,
    })

    const displayTrialBanner =
        hasCurrentStoreTrialStarted && !hasCurrentStoreTrialExpired

    useEffect(() => {
        if (displayTrialBanner) {
            logEvent(SegmentEvent.TrialBannerSettingsViewed, {
                type: pageName,
                trialType,
            })
        }
    }, [pageName, displayTrialBanner, trialType])

    const trialMilestone = useSalesTrialRevampMilestone()
    if (trialMilestone === 'off') return undefined

    return (
        <>
            {!isShoppingAssistantTrialImprovementEnabled &&
                displayTrialBanner && (
                    <TrialAlertBanner {...trialModalProps.trialStartedBanner} />
                )}
        </>
    )
}
