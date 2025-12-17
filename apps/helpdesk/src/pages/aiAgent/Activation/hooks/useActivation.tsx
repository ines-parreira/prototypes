import { useEffect, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useLocation } from 'react-router-dom'

import { atLeastOneStoreHasActiveTrialOnSpecificStores } from 'hooks/aiAgent/useCanUseAiSalesAgent'
import { useNotify } from 'hooks/useNotify'
import { AiAgentActivationModal } from 'pages/aiAgent/Activation/components/AiAgentActivationModal/AiAgentActivationModal'
import { EarlyAccessModal } from 'pages/aiAgent/Activation/components/EarlyAccessModal/EarlyAccessModal'

import { useActivationModalDisclosure } from './useActivationModalDisclosure'
import { useEarlyAccessModalState } from './useEarlyAccessModalState'
import { useStoreActivations } from './useStoreActivations'

export const useActivation = (
    options: {
        autoDisplayEarlyAccessDisabled?: boolean
    } = {},
) => {
    const location = useLocation()
    const pageName = location.pathname
    const hasAiAgentNewActivationXp = useFlag(
        FeatureFlagKey.AiAgentNewActivationXp,
    )
    const { isModalVisible, setIsModalVisible, closeModal } =
        useActivationModalDisclosure()

    const {
        storeActivations,
        progressPercentage,
        changeSales,
        changeSupport,
        changeSupportChat,
        changeSupportEmail,
        saveStoreConfigurations,
        isSaveLoading,
        isFetchLoading,
        migrateToNewPricing,
        endTrial,
    } = useStoreActivations({
        withStoresKnowledgeStatus: isModalVisible,
        withChatIntegrationsStatus: isModalVisible,
    })

    const hasActivationEnabled = useFlag(FeatureFlagKey.AiAgentActivation)
    const atLeastOneStoreHasActiveTrial =
        atLeastOneStoreHasActiveTrialOnSpecificStores(storeActivations)

    const {
        isOnNewPlan,
        setIsPreviewModalVisible,
        isPreviewModalVisible,
        isCurrentUserAdmin,
        currentPlan,
        helpdeskPlan,
        earlyAccessPlan,
        isLoading,
        handleSubscriptionUpdate,
        isSubscriptionUpdating,
    } = useEarlyAccessModalState({
        atLeastOneStoreHasActiveTrial,
        hasActivationEnabled,
        autoDisplayDisabled: options.autoDisplayEarlyAccessDisabled,
    })

    const closeEarlyAccessModal = (reason: string) => {
        setIsPreviewModalVisible(false)
        logEvent(SegmentEvent.AiAgentActivatePreviewPricingModalClosed, {
            page: pageName,
            reason,
        })
    }

    const notify = useNotify()

    useEffect(() => {
        if (isPreviewModalVisible) {
            logEvent(SegmentEvent.AiAgentActivateEarlyAccessModalViewed, {
                page: pageName,
            })
        }
    }, [isPreviewModalVisible, pageName])

    const [
        storeNameToSaveOnSubscriptionUpdate,
        setStoreNameToSaveOnSubscriptionUpdate,
    ] = useState<string | undefined>(undefined)

    const shouldSaveAfterUpgrade = useRef(false)
    useEffect(() => {
        if (shouldSaveAfterUpgrade.current) {
            const saveConfigurations = async () => {
                shouldSaveAfterUpgrade.current = false
                await saveStoreConfigurations()
            }
            saveConfigurations()
        }
    }, [saveStoreConfigurations])

    const showEarlyAccessModal = () => setIsPreviewModalVisible(true)

    const onUpgradePlanClick = async () => {
        try {
            await handleSubscriptionUpdate()
            if (hasAiAgentNewActivationXp) {
                await migrateToNewPricing()
            } else {
                // if feature flag is not enabled, we need to use dedicated function
                await endTrial()
            }

            closeEarlyAccessModal('upgraded')

            if (storeNameToSaveOnSubscriptionUpdate) {
                changeSales(storeNameToSaveOnSubscriptionUpdate, true)
                shouldSaveAfterUpgrade.current = true
            }
        } catch {
            closeEarlyAccessModal('upgrade-failed')
        }
    }

    return {
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal: () => setIsModalVisible(true),
        onUpgradePlanClick,
        activationModal: (
            <AiAgentActivationModal
                onLearnMoreClick={showEarlyAccessModal}
                isOpen={isModalVisible}
                isSaveLoading={isSaveLoading}
                isFetchLoading={isFetchLoading}
                onClose={() => {
                    closeModal()
                    logEvent(SegmentEvent.AiAgentActivateCloseActivationModal, {
                        page: pageName,
                        reason: 'clicked-on-cancel-or-clicked-outside',
                    })
                }}
                progressPercentage={progressPercentage}
                storeActivations={storeActivations}
                onSalesChange={(
                    storeName: string,
                    newValue: boolean,
                    onTrial?: boolean,
                ) => {
                    if (newValue && !isOnNewPlan && !onTrial) {
                        setStoreNameToSaveOnSubscriptionUpdate(storeName)
                        setIsPreviewModalVisible(true)
                    } else {
                        changeSales(storeName, newValue)
                    }
                }}
                onSupportChange={changeSupport}
                onSupportChatChange={changeSupportChat}
                onSupportEmailChange={changeSupportEmail}
                onSaveClick={async () => {
                    try {
                        await saveStoreConfigurations()
                        await notify.success(
                            'Successfully updated activation status for AI Agent',
                        )
                    } catch {
                        await notify.error(
                            'Changes to AI Agent activation status could not be successfully saved. Please try again.',
                        )
                    }
                    closeModal()
                }}
                hasAiAgentNewActivationXp={hasAiAgentNewActivationXp}
            />
        ),
        earlyAccessModal: (
            <EarlyAccessModal
                isLoading={isLoading}
                isUpgrading={isSubscriptionUpdating}
                isOpen={false} // [AIFLY-955] due to clash with AI Agent trial,temporarily disable to prevent showing until future of this is decided
                onClose={() => {
                    closeEarlyAccessModal('clicked-on-cross-or-outside')
                }}
                onUpgradeClick={onUpgradePlanClick}
                currentPlan={currentPlan}
                helpdeskPlan={helpdeskPlan}
                earlyAccessPlan={earlyAccessPlan}
                userIsAdmin={isCurrentUserAdmin}
            />
        ),
    }
}
