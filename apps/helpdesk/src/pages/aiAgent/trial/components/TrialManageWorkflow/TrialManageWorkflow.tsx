import { useCallback, useEffect, useState } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { useOptOutSalesTrialUpgradeMutation } from 'models/aiAgent/queries'
import { StoreConfiguration } from 'models/aiAgent/types'
import { useEarlyAccessAutomatePlan } from 'models/billing/queries'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    ModalBodyWrapper,
    ModalFooterWrapper,
    ModalHeaderWrapper,
    ModalWrapper,
} from 'pages/aiAgent/trial/components/ModalWrapper'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import { TrialEndedModal } from 'pages/aiAgent/trial/components/TrialEndedModal/TrialEndedModal'
import { TrialEndingModal } from 'pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useSalesTrialRevampMilestone } from '../../hooks/useSalesTrialRevampMilestone'
import { useShoppingAssistantTrialAccess } from '../../hooks/useShoppingAssistantTrialAccess'

import css from './TrialManageWorkflow.less'

export type TrialManageWorkflowProps = {
    pageName: 'Strategy' | 'Engagement'
    storeConfiguration: StoreConfiguration
}

export const TrialManageWorkflow = ({
    pageName,
    storeConfiguration,
}: TrialManageWorkflowProps) => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { storeActivations } = useStoreActivations()
    const history = useHistory()
    const location = useLocation()
    const [isOptOutModalOpen, setIsOptOutModalOpen] = useState(false)

    const isShoppingAssistantTrialImprovementEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantTrialImprovement,
        false,
    )
    const isShoppingAssistantDuringTrialEnabled = useFlag(
        FeatureFlagKey.ShoppingAssistantDuringTrial,
        false,
    )

    const { hasCurrentStoreTrialStarted, hasCurrentStoreTrialExpired } =
        useShoppingAssistantTrialAccess(storeConfiguration.storeName)

    const { upgradePlanAsync, isLoading: isUpgradePlanLoading } =
        useUpgradePlan()

    const accountDomain = currentAccount.get('domain')

    const {
        isManageTrialModalOpen,
        closeManageTrialModal,
        isUpgradePlanModalOpen,
        openTrialUpgradeModal,
        closeUpgradePlanModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
    })

    const onOptOutClick = () => {
        closeManageTrialModal()
        setIsOptOutModalOpen(true)
    }

    const onUpgradeClick = useCallback(async () => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'upgraded',
        })
        await upgradePlanAsync()
        closeManageTrialModal()
        closeUpgradePlanModal()
    }, [upgradePlanAsync, closeManageTrialModal, closeUpgradePlanModal])

    const trialModalProps = useTrialModalProps({
        pageName,
        storeName: storeConfiguration.storeName,
    })

    const onCloseOptOutModal = () => {
        setIsOptOutModalOpen(false)

        // Add showOptOutFeedback=true to URL
        const newUrlParams = new URLSearchParams(location.search)
        newUrlParams.set('showOptOutFeedback', 'true')
        history.push({
            pathname: location.pathname,
            search: newUrlParams.toString(),
        })
    }

    const displayTrialBanner =
        hasCurrentStoreTrialStarted && !hasCurrentStoreTrialExpired

    useEffect(() => {
        if (displayTrialBanner) {
            logEvent(SegmentEvent.TrialBannerSettingsViewed, {
                type: pageName,
            })
        }
    }, [pageName, displayTrialBanner])

    const { data: earlyAccessPlan } = useEarlyAccessAutomatePlan()

    const trialMilestone = useSalesTrialRevampMilestone()
    if (trialMilestone === 'off') return undefined

    return (
        <>
            {!isShoppingAssistantTrialImprovementEnabled &&
                displayTrialBanner && (
                    <TrialAlertBanner {...trialModalProps.trialStartedBanner} />
                )}

            {!isShoppingAssistantDuringTrialEnabled &&
                isManageTrialModalOpen && (
                    <TrialManageModal
                        {...trialModalProps.trialEndingModal}
                        title="Manage Shopping Assistant trial"
                        onClose={closeManageTrialModal}
                        primaryAction={
                            earlyAccessPlan
                                ? {
                                      label: 'Upgrade Now',
                                      onClick: openTrialUpgradeModal,
                                  }
                                : undefined
                        }
                        secondaryAction={{
                            label: 'Opt Out',
                            onClick: onOptOutClick,
                        }}
                    />
                )}

            {!isShoppingAssistantDuringTrialEnabled &&
                isUpgradePlanModalOpen && (
                    <UpgradePlanModal
                        {...trialModalProps.upgradePlanModal}
                        onClose={closeUpgradePlanModal}
                        onConfirm={onUpgradeClick}
                        onDismiss={closeUpgradePlanModal}
                        isLoading={isUpgradePlanLoading}
                    />
                )}

            {!isShoppingAssistantDuringTrialEnabled && isOptOutModalOpen && (
                <TrialOptOutModalOld onClose={onCloseOptOutModal} />
            )}

            {!isShoppingAssistantDuringTrialEnabled &&
                storeConfiguration.storeName && (
                    <>
                        <TrialEndingModal
                            storeName={storeConfiguration.storeName}
                        />
                        <TrialEndedModal
                            storeName={storeConfiguration.storeName}
                        />
                    </>
                )}
        </>
    )
}

export const TrialOptOutModalOld = ({ onClose }: { onClose: () => void }) => {
    const optOutMutation = useOptOutSalesTrialUpgradeMutation()

    const onOptOutClick = () => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: 'Confirm',
        })
        optOutMutation.mutate([], {
            onSuccess: () => {
                onClose()
            },
        })
    }

    const onDismissClick = () => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: 'Dismiss',
        })
        onClose()
    }

    const onCloseModal = () => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: 'Close',
        })
        onClose()
    }

    return (
        <ModalWrapper
            isOpen
            size="lg"
            toggle={onCloseModal}
            fade
            centered
            contentClassName={css.modal}
        >
            <ModalHeaderWrapper toggle={onCloseModal}>
                Opt out of upgrade?
            </ModalHeaderWrapper>
            <ModalBodyWrapper>
                <div className={css.wrapper}>
                    <div className={css.description}>
                        You won&apos;t be automatically upgraded when your trial
                        ends — you&apos;ll keep access to the Shopping Assistant
                        until your trial expires. If you&apos;d like to turn off
                        the Shopping Assistant sooner, please contact us at{' '}
                        <a
                            href="mailto:support@gorgias.com"
                            className={css.link}
                        >
                            support@gorgias.com
                        </a>
                        .
                    </div>
                </div>
            </ModalBodyWrapper>
            <ModalFooterWrapper>
                <Button
                    onClick={onDismissClick}
                    fillStyle="ghost"
                    intent="secondary"
                    className={css.secondaryActionButton}
                >
                    Dismiss
                </Button>

                <Button
                    className={
                        optOutMutation.isLoading
                            ? undefined
                            : css.primaryActionButton
                    }
                    onClick={onOptOutClick}
                    isLoading={optOutMutation.isLoading}
                >
                    Opt Out
                </Button>
            </ModalFooterWrapper>
        </ModalWrapper>
    )
}
