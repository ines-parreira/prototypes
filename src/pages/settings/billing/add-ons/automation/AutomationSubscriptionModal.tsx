import React, {ElementType, useMemo, useRef, useState} from 'react'
import {Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import classnames from 'classnames'
import {useAsyncFn} from 'react-use'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {hasRole} from 'utils'
import {UserRole} from 'config/types/user'

import useAppDispatch from 'hooks/useAppDispatch'
import {
    getAutomationProduct,
    getCurrentHelpdeskInterval,
    getCurrentHelpdeskProduct,
    getCurrentProducts,
    getHasAutomationAddOn,
} from 'state/billing/selectors'
import {updateSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getCurrentUser} from 'state/currentUser/selectors'
import Button from 'pages/common/components/button/Button'
import Tooltip from 'pages/common/components/Tooltip'
import useAppSelector from 'hooks/useAppSelector'

import {FeatureFlagKey} from 'config/featureFlags'
import {isStarterTierPrice} from 'models/billing/utils'
import {
    BILLING_SUPPORT_EMAIL,
    ENTERPRISE_PRICE_ID,
    ZAPIER_BILLING_HOOK,
} from 'pages/settings/new_billing/constants'
import ContactSupportModal from 'pages/settings/new_billing/components/ContactSupportModal/ContactSupportModal'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import AutomationPlanSubscriptionDescription from './AutomationPlanSubscriptionDescription'
import AutomationSubscriptionDescription from './AutomationSubscriptionDescription'
import css from './AutomationSubscriptionModal.less'

type Props = {
    confirmLabel: string
    footer?: ElementType
    image?: string
    headerDescription?: string
    isOpen: boolean
    onClose: () => void
    onSubscribe?: () => void
    fade?: boolean
}
type FooterProps = {
    onConfirm: () => void
    isUpdating: boolean
    isDisabled?: boolean
}

const DefaultFooter = ({
    confirmLabel,
    isUpdating,
    isDisabled,
    onClose,
    onConfirm,
}: Pick<Props, 'confirmLabel' | 'onClose'> & FooterProps) => {
    const buttonWrapper = useRef<HTMLDivElement>(null)
    const currentUser = useAppSelector(getCurrentUser)
    const userIsAdmin = hasRole(currentUser, UserRole.Admin)

    return (
        <ModalFooter className={css.footer}>
            <Button intent="secondary" onClick={onClose}>
                Cancel
            </Button>
            <div ref={buttonWrapper}>
                <Button
                    isLoading={isUpdating}
                    onClick={onConfirm}
                    isDisabled={!userIsAdmin || isDisabled}
                >
                    {confirmLabel}
                </Button>
            </div>
            {!userIsAdmin && (
                <Tooltip target={buttonWrapper}>
                    Reach out to an admin to upgrade.
                </Tooltip>
            )}
        </ModalFooter>
    )
}

const AutomationSubscriptionModal = ({
    confirmLabel,
    footer: Footer = DefaultFooter,
    image,
    headerDescription,
    isOpen,
    onClose,
    onSubscribe,
    fade = true,
}: Props) => {
    const dispatch = useAppDispatch()
    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const helpdeskPrice = useAppSelector(getCurrentHelpdeskProduct)
    const currentAccount = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector(getCurrentUser)

    const from: string = currentUser.get('email')
    const domain: string = currentAccount.get('domain')

    const currentProducts = useAppSelector(getCurrentProducts)

    const currentPriceIds: string[] = currentProducts
        ? [
              currentProducts.helpdesk?.price_id,
              currentProducts.automation?.price_id || '',
          ].filter(Boolean)
        : []

    const [{loading: isSubscriptionUpdating}, handleSubscriptionUpdate] =
        useAsyncFn(async (prices: string[]) => {
            try {
                await dispatch(updateSubscription({prices}))
                onClose()
            } catch (error) {
                void dispatch(
                    notify({
                        status: NotificationStatus.Error,
                        message: error,
                    })
                )
            }
        }, [])
    const header = headerDescription
        ? headerDescription
        : hasAutomationAddOn
        ? 'Manage Automation Add-on'
        : 'Subscribe to Automation'

    const onConfirm = () => {
        if (hasAccessToNewBilling) {
            selectedPrice?.price_id &&
                handleSubscriptionUpdate([
                    ...currentPriceIds,
                    selectedPrice.price_id,
                ]).then(() => onSubscribe && onSubscribe())
        } else {
            helpdeskPrice?.addons &&
                handleSubscriptionUpdate([
                    helpdeskPrice.price_id,
                    helpdeskPrice.addons[0],
                ]).then(() => onSubscribe && onSubscribe())
        }
    }

    const handleUnsubscribeClick = () => {
        helpdeskPrice && void handleSubscriptionUpdate([helpdeskPrice.price_id])
    }

    const isStarterPlan = isStarterTierPrice(helpdeskPrice)

    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]
    const interval = useAppSelector(getCurrentHelpdeskInterval)
    const automationPrices = useAppSelector(getAutomationProduct)?.prices
    const [selectedPrice, setSelectedPrice] = useState(automationPrices?.[0])
    const [isSubscriptionEnabled, setIsSubscriptionEnabled] = useState(false)
    const [showContactSupportModal, setShowContactSupportModal] =
        useState(false)

    const isEnterprisePlan = useMemo(
        () => selectedPrice?.price_id === ENTERPRISE_PRICE_ID,
        [selectedPrice]
    )

    const onConfirmEnterprise = () => {
        setShowContactSupportModal(true)
        onClose()
    }

    const onCloseEnterprise = () => {
        setShowContactSupportModal(false)
    }

    return (
        <>
            <Modal
                isOpen={isOpen}
                toggle={onClose}
                className={classnames(css.modal, {
                    [css.wide]: hasAccessToNewBilling,
                })}
                fade={fade}
                centered
            >
                <ModalHeader toggle={onClose}>{header}</ModalHeader>
                <ModalBody
                    className={css.modalBody}
                    data-candu-id={
                        hasAutomationAddOn
                            ? 'cancel-automation-addon-modal-body'
                            : 'manage-automation-addon-modal-body'
                    }
                >
                    {!hasAccessToNewBilling ? (
                        <AutomationSubscriptionDescription />
                    ) : (
                        <AutomationPlanSubscriptionDescription
                            isStarterPlan={isStarterPlan}
                            isEnterprisePlan={isEnterprisePlan}
                            automationPrices={automationPrices}
                            interval={interval}
                            selectedPrice={selectedPrice}
                            setSelectedPrice={setSelectedPrice}
                            setIsSubscriptionEnabled={setIsSubscriptionEnabled}
                        />
                    )}
                    {!!image && (
                        <img
                            alt="automation features"
                            src={image}
                            className={css.image}
                        />
                    )}
                </ModalBody>
                {hasAutomationAddOn ? (
                    <ModalFooter
                        className={classnames(
                            css.footer,
                            css.footerUnsubscribe
                        )}
                    >
                        <Button
                            intent="destructive"
                            onClick={handleUnsubscribeClick}
                            isLoading={isSubscriptionUpdating}
                        >
                            Cancel subscription
                        </Button>
                        <Button intent="secondary" onClick={onClose}>
                            OK
                        </Button>
                    </ModalFooter>
                ) : isEnterprisePlan ? (
                    <Footer
                        confirmLabel="Contact Us"
                        isUpdating={isSubscriptionUpdating}
                        onClose={onClose}
                        onConfirm={onConfirmEnterprise}
                    />
                ) : hasAccessToNewBilling ? (
                    <Footer
                        confirmLabel={confirmLabel}
                        isUpdating={isSubscriptionUpdating}
                        isDisabled={!isSubscriptionEnabled}
                        onClose={onClose}
                        onConfirm={onConfirm}
                    />
                ) : (
                    <Footer
                        confirmLabel={confirmLabel}
                        isUpdating={isSubscriptionUpdating}
                        isDisabled={false}
                        onClose={onClose}
                        onConfirm={onConfirm}
                    />
                )}
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

export default AutomationSubscriptionModal
