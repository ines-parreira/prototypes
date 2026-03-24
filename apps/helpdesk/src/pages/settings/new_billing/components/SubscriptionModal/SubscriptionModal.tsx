import type React from 'react'
import { useCallback, useMemo, useState } from 'react'

import { BILLING_SUPPORT_EMAIL, ZAPIER_BILLING_HOOK } from '@repo/billing'
import { useHistory } from 'react-router-dom'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

import { useAppNode } from 'appNode'
import useAppSelector from 'hooks/useAppSelector'
import type { Plan, ProductType } from 'models/billing/types'
import { isEnterprise, isYearlyContractPlan } from 'models/billing/utils'
import ContactSupportModal from 'pages/settings/new_billing/components/ContactSupportModal'
import PlanSubscriptionDescription from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import SubscriptionModalFooter from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModalFooter'
import { useCurrentPlanIds } from 'pages/settings/new_billing/hooks/useGetCurrentPriceIds'
import { useUpdateSubscription } from 'pages/settings/new_billing/hooks/useUpdateSubscription'
import {
    getCurrentHelpdeskCadence,
    getCurrentHelpdeskPlan,
} from 'state/billing/selectors'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getCurrentUser } from 'state/currentUser/selectors'

import css from './SubscriptionModal.less'

type Props = {
    productType: ProductType
    canduId: string
    availablePlans: Plan[]
    confirmLabel?: string
    confirmEnterpriseLabel?: string
    headerDescription: string
    tagline: string
    currentPage: string
    defaultPlan: Plan | undefined
    isTrialingSubscription: boolean
    isOpen: boolean
    onClose: () => void
    onSubscribe: () => void
    topModalComponent?: React.ReactNode
    fade?: boolean
    trackingSource: string
}

const SubscriptionModal = ({
    productType,
    canduId,
    availablePlans,
    confirmLabel = 'Subscribe',
    confirmEnterpriseLabel = 'Contact Us',
    headerDescription,
    tagline,
    currentPage,
    defaultPlan,
    isTrialingSubscription,
    isOpen,
    onClose,
    onSubscribe,
    topModalComponent,
    fade = true,
    trackingSource,
}: Props) => {
    const [showContactSupportModal, setShowContactSupportModal] =
        useState(false)
    const [selectedPlan, setSelectedPlan] = useState(defaultPlan)
    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(false)

    const history = useHistory()
    const currentPlanIds = useCurrentPlanIds()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const cadence = useAppSelector(getCurrentHelpdeskCadence)
    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const isYearlyPlan = isYearlyContractPlan(currentHelpdeskPlan)
    const appNode = useAppNode()

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')

    const { isLoading: isSubscriptionUpdating, handleSubscriptionUpdate } =
        useUpdateSubscription()

    const isEnterprisePlan = useMemo(
        () => isEnterprise(selectedPlan),
        [selectedPlan],
    )

    const onConfirm = useCallback(async () => {
        if (selectedPlan?.plan_id) {
            await handleSubscriptionUpdate([
                ...currentPlanIds,
                selectedPlan.plan_id,
            ])
                .then(() => onSubscribe && onSubscribe())
                .finally(() => currentPage && history.push(currentPage))
        }
    }, [
        selectedPlan,
        handleSubscriptionUpdate,
        currentPlanIds,
        onSubscribe,
        currentPage,
        history,
    ])

    const confirmButtonLabel = useMemo(
        () =>
            isEnterprisePlan || isYearlyPlan
                ? confirmEnterpriseLabel
                : confirmLabel,
        [isEnterprisePlan, isYearlyPlan, confirmEnterpriseLabel, confirmLabel],
    )

    const onConfirmEnterprise = useCallback(() => {
        setShowContactSupportModal(true)
        onClose()
    }, [onClose])

    const onCloseEnterprise = () => {
        setShowContactSupportModal(false)
    }

    const onConfirmCallback = useMemo(
        () =>
            isEnterprisePlan || isYearlyPlan ? onConfirmEnterprise : onConfirm,
        [isEnterprisePlan, isYearlyPlan, onConfirmEnterprise, onConfirm],
    )

    const isDisabled = useMemo(() => {
        return !isEnterprisePlan && !isSubscriptionEnabled && !isYearlyPlan
    }, [isEnterprisePlan, isSubscriptionEnabled, isYearlyPlan])

    return (
        <>
            <Modal
                isOpen={isOpen}
                size="lg"
                toggle={onClose}
                fade={fade}
                centered
                container={appNode ?? undefined}
            >
                <ModalHeader toggle={onClose}>{headerDescription}</ModalHeader>
                <ModalBody className={css.modalBody} data-candu-id={canduId}>
                    {topModalComponent}
                    <PlanSubscriptionDescription
                        productType={productType}
                        isTrialing={isTrialingSubscription}
                        isEnterprisePlan={isEnterprisePlan}
                        availablePlans={availablePlans}
                        tagline={tagline}
                        cadence={cadence}
                        selectedPlan={selectedPlan}
                        setSelectedPlan={setSelectedPlan}
                        setIsSubscriptionEnabled={setIsSubscriptionEnabled}
                        trackingSource={trackingSource}
                        isYearlyPlan={isYearlyPlan}
                    />
                </ModalBody>
                <SubscriptionModalFooter
                    confirmLabel={confirmButtonLabel}
                    isUpdating={isSubscriptionUpdating}
                    isDisabled={isDisabled}
                    onClose={onClose}
                    onConfirm={onConfirmCallback}
                />
            </Modal>
            {(isEnterprisePlan || isYearlyPlan) && (
                <ContactSupportModal
                    isOpen={showContactSupportModal}
                    handleOnClose={onCloseEnterprise}
                    domain={domain}
                    from={from}
                    to={BILLING_SUPPORT_EMAIL}
                    subject={
                        isEnterprisePlan
                            ? `New Enterprise plan request - ${domain}`
                            : `New custom plan request for yearly contract subscription - ${domain}`
                    }
                    zapierHook={ZAPIER_BILLING_HOOK}
                />
            )}
        </>
    )
}

export default SubscriptionModal
