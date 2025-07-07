import { useCallback, useMemo, useState } from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import useAppSelector from 'hooks/useAppSelector'
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
import { useShoppingAssistantTrialAccess } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialAccess'
import { useShoppingAssistantTrialFlow } from 'pages/aiAgent/trial/hooks/useShoppingAssistantTrialFlow'
import { useTrialModalProps } from 'pages/aiAgent/trial/hooks/useTrialModalProps'
import { useUpgradePlan } from 'pages/aiAgent/trial/hooks/useUpgradePlan'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import css from './TrialManageWorkflow.less'

export const TrialManageWorkflow = () => {
    const currentAccount = useAppSelector(getCurrentAccountState)
    const { trialStartedBanner, manageTrialModal } = useTrialModalProps({})
    const { storeActivations } = useStoreActivations()
    const [isOptOutModalOpen, setIsOptOutModalOpen] = useState(false)

    const { upgradePlan, isLoading: isUpgradePlanLoading } = useUpgradePlan()

    const { canSeeTrialStartedBanner, canBookDemo } =
        useShoppingAssistantTrialAccess()

    const accountDomain = currentAccount.get('domain')

    const {
        openManageTrialModal,
        isManageTrialModalOpen,
        closeManageTrialModal,
    } = useShoppingAssistantTrialFlow({
        accountDomain,
        storeActivations,
    })

    const handleManageTrial = () => {
        openManageTrialModal()
    }

    const onOptOutClick = () => {
        closeManageTrialModal()
        setIsOptOutModalOpen(true)
    }

    const onUpgradeClick = useCallback(() => {
        upgradePlan()
        closeManageTrialModal()
    }, [upgradePlan, closeManageTrialModal])

    const primaryAction = useMemo(() => {
        if (canBookDemo) {
            return {
                label: 'Book a demo',
                onClick: () => {
                    window.open(
                        'https://www.gorgias.com/demo/customers/automate',
                        '_blank',
                    )
                },
            }
        }

        return {
            label: isUpgradePlanLoading ? 'Upgrading...' : 'Upgrade Now',
            isLoading: isUpgradePlanLoading,
            onClick: onUpgradeClick,
        }
    }, [canBookDemo, isUpgradePlanLoading, onUpgradeClick])

    return (
        <>
            {canSeeTrialStartedBanner && (
                <TrialAlertBanner
                    {...trialStartedBanner}
                    primaryAction={primaryAction}
                    secondaryAction={{
                        label: 'Manage Trial',
                        onClick: handleManageTrial,
                    }}
                />
            )}
            {isManageTrialModalOpen && (
                <TrialManageModal
                    title="Manage Shopping Assistant trial"
                    description={manageTrialModal.description}
                    advantages={manageTrialModal.advantages}
                    secondaryDescription={manageTrialModal.secondaryDescription}
                    onClose={closeManageTrialModal}
                    primaryAction={{
                        label: 'Upgrade Now',
                        isLoading: isUpgradePlanLoading,
                        onClick: onUpgradeClick,
                    }}
                    secondaryAction={{
                        label: 'Opt Out',
                        onClick: onOptOutClick,
                    }}
                />
            )}
            {isOptOutModalOpen && (
                <TrialOptOutModal onClose={() => setIsOptOutModalOpen(false)} />
            )}

            <TrialEndedModal />
            <TrialEndingTomorrowModal />

            {/* This is used to track the opt out feedback */}
            <div data-candu-id="shopping-assistant-opt-out-feedback" />
        </>
    )
}

export const TrialOptOutModal = ({ onClose }: { onClose: () => void }) => {
    return (
        <ModalWrapper
            isOpen
            size="lg"
            toggle={onClose}
            fade
            centered
            contentClassName={css.modal}
        >
            <ModalHeaderWrapper toggle={onClose}>
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
                    onClick={onClose}
                    fillStyle="ghost"
                    intent="secondary"
                    className={css.secondaryActionButton}
                >
                    Dismiss
                </Button>

                <Button className={css.primaryActionButton} onClick={onClose}>
                    Opt Out
                </Button>
            </ModalFooterWrapper>
        </ModalWrapper>
    )
}
