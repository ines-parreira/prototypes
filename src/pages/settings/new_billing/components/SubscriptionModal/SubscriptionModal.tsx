import React, {useCallback, useMemo, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {Modal, ModalBody, ModalHeader} from 'reactstrap'

import {useAppNode} from 'appNode'
import useAppSelector from 'hooks/useAppSelector'
import {Plan, ProductType} from 'models/billing/types'
import ContactSupportModal from 'pages/settings/new_billing/components/ContactSupportModal'
import PlanSubscriptionDescription from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import SubscriptionModalFooter from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModalFooter'
import {
    BILLING_SUPPORT_EMAIL,
    ENTERPRISE_PRICE_ID,
    ZAPIER_BILLING_HOOK,
} from 'pages/settings/new_billing/constants'
import {useCurrentPriceIds} from 'pages/settings/new_billing/hooks/useGetCurrentPriceIds'
import {useUpdateSubscription} from 'pages/settings/new_billing/hooks/useUpdateSubscription'
import {getCurrentHelpdeskInterval} from 'state/billing/selectors'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'

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
}: Props) => {
    const [showContactSupportModal, setShowContactSupportModal] =
        useState(false)
    const [selectedPlan, setSelectedPlan] = useState(defaultPlan)
    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(false)

    const history = useHistory()
    const currentPriceIds = useCurrentPriceIds()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const cadence = useAppSelector(getCurrentHelpdeskInterval)
    const appNode = useAppNode()

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')

    const {isLoading: isSubscriptionUpdating, handleSubscriptionUpdate} =
        useUpdateSubscription()

    const isEnterprisePlan = useMemo(
        () => selectedPlan?.price_id === ENTERPRISE_PRICE_ID,
        [selectedPlan]
    )

    const onConfirm = useCallback(async () => {
        if (selectedPlan?.price_id) {
            await handleSubscriptionUpdate([
                ...currentPriceIds,
                selectedPlan.price_id,
            ])
                .then(() => onSubscribe && onSubscribe())
                .finally(() => currentPage && history.push(currentPage))
        }
    }, [
        selectedPlan,
        handleSubscriptionUpdate,
        currentPriceIds,
        onSubscribe,
        currentPage,
        history,
    ])

    const confirmButtonLabel = useMemo(
        () => (isEnterprisePlan ? confirmEnterpriseLabel : confirmLabel),
        [isEnterprisePlan, confirmEnterpriseLabel, confirmLabel]
    )

    const onConfirmEnterprise = useCallback(() => {
        setShowContactSupportModal(true)
        onClose()
    }, [onClose])

    const onCloseEnterprise = () => {
        setShowContactSupportModal(false)
    }

    const onConfirmCallback = useMemo(
        () => (isEnterprisePlan ? onConfirmEnterprise : onConfirm),
        [isEnterprisePlan, onConfirmEnterprise, onConfirm]
    )

    const isDisabled = useMemo(() => {
        return !isEnterprisePlan && !isSubscriptionEnabled
    }, [isEnterprisePlan, isSubscriptionEnabled])

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
                        interval={cadence}
                        selectedPlan={selectedPlan}
                        setSelectedPlan={setSelectedPlan}
                        setIsSubscriptionEnabled={setIsSubscriptionEnabled}
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
            {isEnterprisePlan && (
                <ContactSupportModal
                    isOpen={showContactSupportModal}
                    handleOnClose={onCloseEnterprise}
                    domain={domain}
                    from={from}
                    to={BILLING_SUPPORT_EMAIL}
                    subject={`New Enterprise plan request - ${domain}}`}
                    zapierHook={ZAPIER_BILLING_HOOK}
                />
            )}
        </>
    )
}

export default SubscriptionModal
