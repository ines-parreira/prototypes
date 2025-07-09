import { useCallback, useEffect, useState } from 'react'

import { useHistory, useLocation } from 'react-router-dom'

import { Button } from '@gorgias/merchant-ui-kit'

import { logEvent } from 'common/segment/segment'
import { SegmentEvent } from 'common/segment/types'
import useAppSelector from 'hooks/useAppSelector'
import { StoreConfiguration } from 'models/aiAgent/types'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import {
    ModalBodyWrapper,
    ModalFooterWrapper,
    ModalHeaderWrapper,
    ModalWrapper,
} from 'pages/aiAgent/trial/components/ModalWrapper'
import { TrialAlertBanner } from 'pages/aiAgent/trial/components/TrialAlertBanner/TrialAlertBanner'
import {
    TrialEndedModal,
    TrialEndingTomorrowModal,
} from 'pages/aiAgent/trial/components/TrialEndingModal/TrialEndingModal'
import { TrialManageModal } from 'pages/aiAgent/trial/components/TrialManageModal/TrialManageModal'
import { UpgradePlanModal } from 'pages/aiAgent/trial/components/UpgradePlanModal/UpgradePlanModal'
import { useIsTrialStarted } from 'pages/aiAgent/trial/hooks/useIsTrialStarted'
import { useOptOutPlan } from 'pages/aiAgent/trial/hooks/useOptOutPlan'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import css from './TrialManageWorkflow.less'

export type TrialManageWorkflowProps = {
    pageName: 'Strategy' | 'Engagement'
    storeConfiguration?: StoreConfiguration
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

    const hasActiveTrial = useIsTrialStarted({ storeConfiguration })

    const { upgradePlan, isLoading: isUpgradePlanLoading } = useUpgradePlan()

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

    const onUpgradeClick = useCallback(() => {
        logEvent(SegmentEvent.PricingModalClicked, {
            type: 'upgraded',
        })
        upgradePlan()
        closeManageTrialModal()
        closeUpgradePlanModal()
    }, [upgradePlan, closeManageTrialModal, closeUpgradePlanModal])

    const trialModalProps = useTrialModalProps({ pageName })

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

    useEffect(() => {
        if (hasActiveTrial) {
            logEvent(SegmentEvent.TrialBannerSettingsViewed, {
                type: pageName,
            })
        }
    }, [pageName, hasActiveTrial])

    return (
        <>
            {hasActiveTrial && (
                <TrialAlertBanner {...trialModalProps.trialStartedBanner} />
            )}

            {isManageTrialModalOpen && (
                <TrialManageModal
                    {...trialModalProps.manageTrialModal}
                    title="Manage Shopping Assistant trial"
                    onClose={closeManageTrialModal}
                    primaryAction={{
                        label: 'Upgrade Now',
                        onClick: openTrialUpgradeModal,
                    }}
                    secondaryAction={{
                        label: 'Opt Out',
                        onClick: onOptOutClick,
                    }}
                />
            )}
            {isUpgradePlanModalOpen && (
                <UpgradePlanModal
                    {...trialModalProps.upgradePlanModal}
                    onClose={closeUpgradePlanModal}
                    onConfirm={onUpgradeClick}
                    onDismiss={closeUpgradePlanModal}
                    isLoading={isUpgradePlanLoading}
                />
            )}
            {isOptOutModalOpen && (
                <TrialOptOutModal onClose={onCloseOptOutModal} />
            )}

            <TrialEndedModal />
            <TrialEndingTomorrowModal />
        </>
    )
}

export const TrialOptOutModal = ({ onClose }: { onClose: () => void }) => {
    const { optOutPlan, isLoading: isOptOutPlanLoading } = useOptOutPlan()

    const onOptOutClick = () => {
        logEvent(SegmentEvent.TrialOptOutModalClicked, {
            CTA: 'Confirm',
        })
        optOutPlan(undefined, {
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
                        the Shopping Assistant sooner, please contact the
                        support team.
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
                        isOptOutPlanLoading
                            ? undefined
                            : css.primaryActionButton
                    }
                    onClick={onOptOutClick}
                    isLoading={isOptOutPlanLoading}
                >
                    Opt Out
                </Button>
            </ModalFooterWrapper>
        </ModalWrapper>
    )
}
