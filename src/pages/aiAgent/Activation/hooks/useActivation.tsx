import { useEffect, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useNotify } from 'hooks/useNotify'
import {
    ActivationManageButton,
    type ActivationManageButtonBorderedProps,
    type ActivationManageButtonFlatProps,
    type LegacyActivationManageButtonProps,
} from 'pages/aiAgent/Activation/components/ActivationManageButton/ActivationManageButton'
import { AiAgentActivationModal } from 'pages/aiAgent/Activation/components/AiAgentActivationModal/AiAgentActivationModal'
import { EarlyAccessModal } from 'pages/aiAgent/Activation/components/EarlyAccessModal/EarlyAccessModal'

import { useActivationModalDisclosure } from './useActivationModalDisclosure'
import { useEarlyAccessModalState } from './useEarlyAccessModalState'
import { useStoreActivations } from './useStoreActivations'

export const useActivation = (
    // TODO: Remove pageName to use window.location.pathname instead
    pageName: string,
    options: {
        autoDisplayEarlyAccessDisabled?: boolean
    } = {},
) => {
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
        pageName,
        withStoresKnowledgeStatus: isModalVisible,
        withChatIntegrationsStatus: isModalVisible,
    })

    const hasActivationEnabled = useFlag(FeatureFlagKey.AiAgentActivation)
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

    let activationButtonProps:
        | Omit<LegacyActivationManageButtonProps, 'onClick'>
        | Omit<ActivationManageButtonBorderedProps, 'onClick'>
        | Omit<ActivationManageButtonFlatProps, 'onClick'>
    if (hasAiAgentNewActivationXp) {
        if (pageName === 'overview') {
            activationButtonProps = {
                hasAiAgentNewActivationXp,
                variant: 'bordered',
            } satisfies Omit<ActivationManageButtonBorderedProps, 'onClick'>
        } else {
            // We check only the 1st store because when not on overview we have only 1 store.
            const firstStoreActivation = Object.values(storeActivations).at(0)

            // Live = email or chat not deactivated
            const aiAgentIsLive =
                !firstStoreActivation?.configuration
                    .emailChannelDeactivatedDatetime ||
                !firstStoreActivation?.configuration
                    .chatChannelDeactivatedDatetime

            activationButtonProps = {
                hasAiAgentNewActivationXp,
                variant: 'flat',
                status: aiAgentIsLive ? 'live' : 'off',
            } satisfies Omit<ActivationManageButtonFlatProps, 'onClick'>
        }
    } else {
        activationButtonProps = {
            hasAiAgentNewActivationXp,
            progress: progressPercentage,
            variant: pageName === 'overview' ? 'bordered' : 'flat',
        } satisfies Omit<LegacyActivationManageButtonProps, 'onClick'>
    }

    return {
        isOnNewPlan,
        showEarlyAccessModal,
        showActivationModal: () => setIsModalVisible(true),
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
        activationButton: hasActivationEnabled ? (
            <ActivationManageButton
                onClick={() => {
                    setIsModalVisible(true)
                    logEvent(SegmentEvent.AiAgentActivateMainButtonClicked, {
                        page: pageName,
                    })
                }}
                {...activationButtonProps}
            />
        ) : null,
        earlyAccessModal: (
            <EarlyAccessModal
                isLoading={isLoading}
                isUpgrading={isSubscriptionUpdating}
                isOpen={isPreviewModalVisible}
                onClose={() => {
                    closeEarlyAccessModal('clicked-on-cross-or-outside')
                }}
                onUpgradeClick={async () => {
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
                            changeSales(
                                storeNameToSaveOnSubscriptionUpdate,
                                true,
                            )
                            shouldSaveAfterUpgrade.current = true
                        }
                    } catch {
                        closeEarlyAccessModal('upgrade-failed')
                    }
                }}
                currentPlan={currentPlan}
                helpdeskPlan={helpdeskPlan}
                earlyAccessPlan={earlyAccessPlan}
                userIsAdmin={isCurrentUserAdmin}
            />
        ),
    }
}
