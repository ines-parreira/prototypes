import React, {useCallback, useMemo, useState} from 'react'
import {Modal, ModalBody, ModalHeader} from 'reactstrap'
import classnames from 'classnames'
import {useHistory} from 'react-router-dom'
import css from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModal.less'
import SubscriptionModalFooter from 'pages/settings/new_billing/components/SubscriptionModal/SubscriptionModalFooter'
import {useCurrentPriceIds} from 'pages/settings/new_billing/hooks/useGetCurrentPriceIds'
import {useUpdateSubscription} from 'pages/settings/new_billing/hooks/useUpdateSubscription'
import {
    BILLING_SUPPORT_EMAIL,
    ENTERPRISE_PRICE_ID,
    ZAPIER_BILLING_HOOK,
} from 'pages/settings/new_billing/constants'
import ContactSupportModal from 'pages/settings/new_billing/components/ContactSupportModal'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import {getCurrentUser} from 'state/currentUser/selectors'
import PlanSubscriptionDescription from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription'
import {
    getCurrentHelpdeskInterval,
    getCurrentHelpdeskProduct,
} from 'state/billing/selectors'
import {isStarterTierPrice} from 'models/billing/utils'
import {AutomationPrice, ConvertPrice, ProductType} from 'models/billing/types'

type Props = {
    productType: ProductType
    canduId: string
    prices: AutomationPrice[] | ConvertPrice[]
    confirmLabel?: string
    confirmEnterpriseLabel?: string
    headerDescription: string
    currentPage: string
    defaultPrice: AutomationPrice | ConvertPrice | undefined
    isTrialingSubscription: boolean
    isOpen: boolean
    onClose: () => void
    onSubscribe: () => void
    fade?: boolean
}

const SubscriptionModal = ({
    productType,
    canduId,
    prices,
    confirmLabel = 'Subscribe',
    confirmEnterpriseLabel = 'Contact Us',
    headerDescription,
    currentPage,
    defaultPrice,
    isTrialingSubscription,
    isOpen,
    onClose,
    onSubscribe,
    fade = true,
}: Props) => {
    const [showContactSupportModal, setShowContactSupportModal] =
        useState(false)
    const [selectedPrice, setSelectedPrice] = useState(defaultPrice)
    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(false)

    const history = useHistory()
    const currentPriceIds = useCurrentPriceIds()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const helpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')

    const {isLoading: isSubscriptionUpdating, handleSubscriptionUpdate} =
        useUpdateSubscription()

    const isStarterPlan = isStarterTierPrice(helpdeskPrice)

    const isEnterprisePlan = useMemo(
        () => selectedPrice?.price_id === ENTERPRISE_PRICE_ID,
        [selectedPrice]
    )

    const onConfirm = useCallback(async () => {
        if (selectedPrice?.price_id) {
            await handleSubscriptionUpdate([
                ...currentPriceIds,
                selectedPrice.price_id,
            ])
                .then(() => onSubscribe && onSubscribe())
                .finally(() => currentPage && history.push(currentPage))
        }
    }, [
        selectedPrice,
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
                toggle={onClose}
                className={classnames(css.modal, css.wide)}
                fade={fade}
                centered
            >
                <ModalHeader toggle={onClose}>{headerDescription}</ModalHeader>
                <ModalBody className={css.modalBody} data-candu-id={canduId}>
                    <PlanSubscriptionDescription
                        productType={productType}
                        isStarterPlan={isStarterPlan}
                        isTrialing={isTrialingSubscription}
                        isEnterprisePlan={isEnterprisePlan}
                        prices={prices}
                        interval={interval}
                        selectedPrice={selectedPrice}
                        setSelectedPrice={setSelectedPrice}
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
