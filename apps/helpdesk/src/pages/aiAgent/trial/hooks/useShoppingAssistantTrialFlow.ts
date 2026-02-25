import { useCallback, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { useHistory, useLocation } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useModalManager } from 'hooks/useModalManager'
import { useStartAiAgentTrialMutation } from 'models/aiAgent/queries'
import type { StoreActivation } from 'pages/aiAgent/Activation/hooks/storeActivationReducer'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { extractShopNameFromUrl } from 'pages/aiAgent/utils/extractShopNameFromUrl'
import { getShopNameFromStoreActivations } from 'pages/aiAgent/utils/getShopNameFromStoreActivations'
import { getShopifyIntegrationsSortedByName } from 'state/integrations/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { useAiAgentTrialOnboarding } from './useAiAgentTrialOnboarding'
import { useNotifyTrialExtensionSlackChannel } from './useNotifyTrialExtensionSlackChannel'
import { useStartShoppingAssistantTrial } from './useStartShoppingAssistantTrial'

type UseShoppingAssistantTrialFlowProps = {
    accountDomain: string
    storeActivations: Record<string, StoreActivation>
    onUpgradeModalClose?: () => void
    onSuccessModalOpen?: () => void
    trialType: TrialType
    isOnboarded?: boolean
    source?: string
}

const TRIAL_UPGRADE_MODAL_NAME = 'ShoppingAssistantTrialUpgradeModal'
const UPGRADE_MODAL_NAME = 'ShoppingAssistantUpgradeModal'
const SUCCESS_MODAL_NAME = 'ShoppingAssistantSuccessModal'
const MANAGE_TRIAL_MODAL_NAME = 'ShoppingAssistantManageTrialModal'
const TRIAL_FINISH_SETUP_MODAL_NAME = 'ShoppingAssistantTrialFinishSetupModal'
const TRIAL_REQUEST_MODAL_NAME = 'ShoppingAssistantTrialRequestModal'
const TRIAL_OPT_OUT_MODAL_NAME = 'ShoppingAssistantTrialOptOutModal'

const AI_AGENT_TRIAL_UPGRADE_MODAL_NAME = 'AiAgentTrialUpgradeModal'
const AI_AGENT_UPGRADE_MODAL_NAME = 'AiAgentUpgradeModal'
const AI_AGENT_SUCCESS_MODAL_NAME = 'AiAgentSuccessModal'
const AI_AGENT_MANAGE_TRIAL_MODAL_NAME = 'AiAgentManageTrialModal'
const AI_AGENT_TRIAL_FINISH_SETUP_MODAL_NAME = 'AiAgentTrialFinishSetupModal'
const AI_AGENT_TRIAL_REQUEST_MODAL_NAME = 'AiAgentTrialRequestModal'
const AI_AGENT_OPT_OUT_MODAL_NAME = 'AiAgentTrialOptOutModal'

const NOTIFY_SUCCESS_MESSAGE =
    "We've received your trial extension request! Our team will review it and get back to you within 2 days via email."
const NOTIFY_ERROR_MESSAGE =
    "We couldn't send your trial extension request. Please try again later or contact our billing team via chat or email."

// TODO: [AIFLY-547] remove startTrialDeprecated
export type UseShoppingAssistantTrialFlowReturn = {
    startTrialDeprecated: () => void
    startTrial: (optedInForUpgrade?: boolean) => void
    isLoading: boolean
    isTrialModalOpen: boolean
    isTrialFinishSetupModalOpen: boolean
    isSuccessModalOpen: boolean
    isManageTrialModalOpen: boolean
    isUpgradePlanModalOpen: boolean
    isTrialRequestModalOpen: boolean
    isTrialOptOutModalOpen: boolean
    openTrialOptOutModal: () => void
    closeTrialUpgradeModal: () => void
    onDismissTrialUpgradeModal: () => void
    onDismissUpgradePlanModal: () => void
    closeSuccessModal: () => void
    closeManageTrialModal: () => void
    openTrialUpgradeModal: () => void
    onConfirmTrial: () => void
    openManageTrialModal: () => void
    openUpgradePlanModal: (isTrial: boolean) => void
    closeUpgradePlanModal: () => void
    closeTrialFinishSetupModal: () => void
    openTrialFinishSetupModal: () => void
    openTrialRequestModal: () => void
    closeTrialRequestModal: () => void
    closeTrialOptOutModal: () => void
    onRequestTrialExtension: (trialEndDate: string | null) => Promise<boolean>
    closeAllTrialModals: () => void
}

const MODAL_NAMES: Record<
    TrialType,
    {
        trialUpgradeModalName: string
        upgradeModalName: string
        successModalName: string
        manageTrialModalName: string
        trialFinishSetupModalName: string
        trialRequestModalName: string
        trialOptOutModalName: string
    }
> = {
    [TrialType.AiAgent]: {
        trialUpgradeModalName: AI_AGENT_TRIAL_UPGRADE_MODAL_NAME,
        upgradeModalName: AI_AGENT_UPGRADE_MODAL_NAME,
        successModalName: AI_AGENT_SUCCESS_MODAL_NAME,
        manageTrialModalName: AI_AGENT_MANAGE_TRIAL_MODAL_NAME,
        trialFinishSetupModalName: AI_AGENT_TRIAL_FINISH_SETUP_MODAL_NAME,
        trialRequestModalName: AI_AGENT_TRIAL_REQUEST_MODAL_NAME,
        trialOptOutModalName: AI_AGENT_OPT_OUT_MODAL_NAME,
    },
    [TrialType.ShoppingAssistant]: {
        trialUpgradeModalName: TRIAL_UPGRADE_MODAL_NAME,
        upgradeModalName: UPGRADE_MODAL_NAME,
        successModalName: SUCCESS_MODAL_NAME,
        manageTrialModalName: MANAGE_TRIAL_MODAL_NAME,
        trialFinishSetupModalName: TRIAL_FINISH_SETUP_MODAL_NAME,
        trialRequestModalName: TRIAL_REQUEST_MODAL_NAME,
        trialOptOutModalName: TRIAL_OPT_OUT_MODAL_NAME,
    },
}

export const useShoppingAssistantTrialFlow = ({
    accountDomain,
    storeActivations,
    onUpgradeModalClose,
    onSuccessModalOpen,
    trialType,
    isOnboarded,
    source,
}: UseShoppingAssistantTrialFlowProps): UseShoppingAssistantTrialFlowReturn => {
    const isAiAgentTrial = trialType === TrialType.AiAgent
    const isExpandingTrialExperienceMilestone2Enabled = useFlag(
        FeatureFlagKey.AiAgentExpandingTrialExperienceMilestone2,
        false,
    )
    const {
        trialUpgradeModalName,
        upgradeModalName,
        successModalName,
        manageTrialModalName,
        trialFinishSetupModalName,
        trialRequestModalName,
        trialOptOutModalName,
    } = MODAL_NAMES[trialType]

    const trialModal = useModalManager(trialUpgradeModalName, {
        autoDestroy: false,
    })
    const upgradeModal = useModalManager(upgradeModalName, {
        autoDestroy: false,
    })
    const successModal = useModalManager(successModalName, {
        autoDestroy: false,
    })
    const manageTrialModal = useModalManager(manageTrialModalName, {
        autoDestroy: false,
    })
    const trialFinishSetupModal = useModalManager(trialFinishSetupModalName, {
        autoDestroy: false,
    })
    const trialRequestModal = useModalManager(trialRequestModalName, {
        autoDestroy: false,
    })
    const trialOptOutModal = useModalManager(trialOptOutModalName, {
        autoDestroy: false,
    })

    const dispatch = useAppDispatch()
    const history = useHistory()
    const location = useLocation()
    const notifySlackChannel = useNotifyTrialExtensionSlackChannel()
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    useEffectOnce(() => {
        const searchParams = new URLSearchParams(location.search)
        const modalName = searchParams.get('modal_name')
        const modalVersion = searchParams.get('modal_version')

        if (modalName === 'opt-in' && modalVersion === 'ai-agent-trial') {
            logEvent(SegmentEvent.PricingModalViewed, {
                type: 'Trial',
                trialType,
                source: source ?? 'url_params',
            })
            trialModal.openModal(trialUpgradeModalName)
        }
    })

    // Always try to get store when possible
    const routeShopName = extractShopNameFromUrl(window.location.href)
    const shopName = useMemo(
        () =>
            getShopNameFromStoreActivations(storeActivations) || // we have this during trial after onboarding
            routeShopName || // before trial or onboarding is finished we need to rely on the route
            storeIntegrations[0]?.name || // in case we are on the stats page, we assume the first store
            '',
        [routeShopName, storeActivations, storeIntegrations],
    )
    const { routes } = useAiAgentNavigation({ shopName })

    const { mutateAsync: triggerTrialMutation, isLoading } =
        useStartShoppingAssistantTrial({
            onError: () => {
                trialModal.closeModal(trialUpgradeModalName)
            },
        })

    const { mutateAsync: triggerAiAgentTrialMutation } =
        useStartAiAgentTrialMutation({
            onError: () => {
                trialModal.closeModal(trialUpgradeModalName)
            },
        })

    const { startOnboardingWizard } = useAiAgentTrialOnboarding({
        shopName,
    })

    const startTrialDeprecated = () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'trial_started',
            trialType,
        })
        triggerTrialMutation(
            {
                accountDomain,
                storeActivations,
            },
            {
                onSuccess: () => {
                    // Close upgrade modal and open success modal
                    trialModal.closeModal(trialUpgradeModalName)
                    successModal.openModal(successModalName)

                    // Call optional callbacks
                    onUpgradeModalClose?.()
                    onSuccessModalOpen?.()
                },
            },
        )
    }

    const startShoppingAssistantTrial = () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'trial_started',
            trialType,
            ...(source && { source }),
        })
        triggerTrialMutation(
            {
                accountDomain,
                storeActivations,
            },
            {
                onSuccess: () => {
                    // Close upgrade modal and open finish setup modal
                    trialModal.closeModal(trialUpgradeModalName)
                    trialFinishSetupModal.openModal(trialFinishSetupModalName)

                    onUpgradeModalClose?.()
                },
            },
        )
    }

    const startAiAgentTrial = (optedInForUpgrade?: boolean) => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'ai_agent_trial_started',
            trialType,
            ...(source && { source }),
        })
        triggerAiAgentTrialMutation(['shopify', shopName, optedInForUpgrade], {
            onSuccess: async () => {
                trialModal.closeModal(trialUpgradeModalName)
                onUpgradeModalClose?.()
                openTrialFinishSetupModal()
            },
        })
    }

    const onDismissTrialUpgradeModal = () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'current_plan',
            trialType,
        })
        trialModal.closeModal(trialUpgradeModalName)
        onUpgradeModalClose?.()
    }

    const closeTrialUpgradeModal = () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'closed',
            trialType,
        })
        trialModal.closeModal(trialUpgradeModalName)
        onUpgradeModalClose?.()
    }

    const onDismissUpgradePlanModal = () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'current_plan',
            trialType,
        })
        upgradeModal.closeModal(upgradeModalName)
    }

    const closeUpgradePlanModal = () => {
        upgradeModal.closeModal(upgradeModalName)
    }

    const closeManageTrialModal = () => {
        manageTrialModal.closeModal(manageTrialModalName)
    }

    const closeSuccessModal = () => {
        history.push(routes.customerEngagement)
        successModal.closeModal(successModalName)
    }

    const openManageTrialModal = () => {
        manageTrialModal.openModal(manageTrialModalName)
    }

    const openTrialUpgradeModal = () => {
        logEvent(SegmentEvent.PricingModalViewed, {
            type: 'Trial',
            trialType,
            ...(source && { source }),
        })
        trialModal.openModal(trialUpgradeModalName)
    }

    const openUpgradePlanModal = (isTrial: boolean) => {
        logEvent(SegmentEvent.PricingModalViewed, {
            type: isTrial ? 'Trial' : 'Upgrade',
            trialType,
            ...(source && { source }),
        })
        upgradeModal.openModal(upgradeModalName)
    }

    const onConfirmTrial = () => {
        if (Object.keys(storeActivations).length > 1) {
            history.push(routes.customerEngagement)
        } else {
            openTrialUpgradeModal()
        }
    }

    const closeTrialFinishSetupModal = useCallback(() => {
        if (
            isAiAgentTrial ||
            (isOnboarded === false &&
                isExpandingTrialExperienceMilestone2Enabled)
        ) {
            void startOnboardingWizard()
        } else {
            history.push(routes.customerEngagement)
        }

        trialFinishSetupModal.closeModal(trialFinishSetupModalName)
    }, [
        isAiAgentTrial,
        isOnboarded,
        isExpandingTrialExperienceMilestone2Enabled,
        routes.customerEngagement,
        history,
        trialFinishSetupModal,
        trialFinishSetupModalName,
        startOnboardingWizard,
    ])

    const openTrialFinishSetupModal = () => {
        trialFinishSetupModal.openModal(trialFinishSetupModalName)
    }

    const openTrialRequestModal = () => {
        logEvent(SegmentEvent.PricingModalViewed, {
            type: 'Notify',
            trialType,
            ...(source && { source }),
        })
        trialRequestModal.openModal(trialRequestModalName)
    }

    const closeTrialRequestModal = () => {
        trialRequestModal.closeModal(trialRequestModalName)
    }

    const openTrialOptOutModal = () => {
        trialOptOutModal.openModal(trialOptOutModalName)
    }

    const closeTrialOptOutModal = () => {
        trialOptOutModal.closeModal(trialOptOutModalName)
    }

    const onRequestTrialExtension = (
        trialEndDate: string | null,
    ): Promise<boolean> => {
        logEvent(SegmentEvent.TrialManageTrialExtensionRequestClicked, {
            CTA: 'Request Trial Extension',
            trialType,
        })
        return notifySlackChannel(trialType, trialEndDate).then((isSent) => {
            if (isSent) {
                dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: NOTIFY_SUCCESS_MESSAGE,
                    }),
                )
                return true
            }

            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: NOTIFY_ERROR_MESSAGE,
                }),
            )
            return false
        })
    }

    const closeAllTrialModals = () => {
        trialModal.closeModal(trialUpgradeModalName)
        upgradeModal.closeModal(upgradeModalName)
        successModal.closeModal(successModalName)
        manageTrialModal.closeModal(manageTrialModalName)
        trialFinishSetupModal.closeModal(trialFinishSetupModalName)
        trialRequestModal.closeModal(trialRequestModalName)
        trialOptOutModal.closeModal(trialOptOutModalName)
    }

    const startTrial = isAiAgentTrial
        ? startAiAgentTrial
        : startShoppingAssistantTrial

    return {
        startTrialDeprecated,
        startTrial,
        isLoading,
        isUpgradePlanModalOpen: upgradeModal.isOpen(upgradeModalName),
        isTrialModalOpen: trialModal.isOpen(trialUpgradeModalName),
        isSuccessModalOpen: successModal.isOpen(successModalName),
        isManageTrialModalOpen: manageTrialModal.isOpen(manageTrialModalName),
        closeTrialUpgradeModal,
        onDismissTrialUpgradeModal,
        onDismissUpgradePlanModal,
        closeSuccessModal,
        closeManageTrialModal,
        openTrialUpgradeModal,
        onConfirmTrial,
        openManageTrialModal,
        openUpgradePlanModal,
        closeUpgradePlanModal,
        closeTrialFinishSetupModal,
        openTrialFinishSetupModal,
        isTrialFinishSetupModalOpen: trialFinishSetupModal.isOpen(
            trialFinishSetupModalName,
        ),
        isTrialRequestModalOpen: trialRequestModal.isOpen(
            trialRequestModalName,
        ),
        openTrialOptOutModal,
        isTrialOptOutModalOpen: trialOptOutModal.isOpen(trialOptOutModalName),
        openTrialRequestModal,
        closeTrialRequestModal,
        closeTrialOptOutModal,
        onRequestTrialExtension,
        closeAllTrialModals,
    }
}
