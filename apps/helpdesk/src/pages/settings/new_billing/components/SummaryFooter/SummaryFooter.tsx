import type React from 'react'
import { useMemo, useState } from 'react'

import type { SelectedPlans } from '@repo/billing'
import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_BASE_PATH,
    BILLING_PAYMENT_CARD_PATH,
} from '@repo/billing'
import { reportError } from '@repo/logging'
import classNames from 'classnames'
import { Link, useHistory } from 'react-router-dom'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import { ShopifyBillingStatus } from 'state/currentAccount/types'
import { notify } from 'state/notifications/actions'
import type { Notification } from 'state/notifications/types'
import {
    NotificationStatus,
    NotificationStyle,
} from 'state/notifications/types'

import css from './SummaryFooter.less'

export type SummaryFooterProps = {
    isPaymentEnabled: boolean
    isTrialing: boolean
    isCurrentSubscriptionCanceled?: boolean
    anyProductChanged: boolean
    anyNewProductSelected: boolean
    anyDowngradedPlanSelected: boolean
    updateSubscription?: () => Promise<void | [void, void] | [void, void, void]>
    onOpenConfirmationModal?: () => void
    startSubscription?: () => Promise<void | [void, void]>
    periodEnd: string
    hideSubscribeButton?: boolean
    isPaymentMethodFooter?: boolean
    isPaymentMethodValid?: boolean
    handleConfirmTerms?: (termsChecked: boolean) => void
    ctaText: string
    selectedPlans?: SelectedPlans
    hasCreditCard?: boolean
    shouldPayWithShopify?: boolean
    shopifyBillingStatus?: ShopifyBillingStatus
    isSubscriptionUpdating?: boolean
    setUpdateProcessStarted?: (isStarted: boolean) => void
    autoUpgradeChanged?: boolean
    noRedirect?: boolean
    setSessionSelectedPlans?: React.Dispatch<SelectedPlans>
}

const SummaryFooter = ({
    isPaymentEnabled,
    isTrialing,
    isCurrentSubscriptionCanceled = false,
    anyProductChanged,
    anyNewProductSelected,
    anyDowngradedPlanSelected,
    updateSubscription,
    onOpenConfirmationModal,
    startSubscription,
    periodEnd,
    hideSubscribeButton = false,
    isPaymentMethodFooter = false,
    isPaymentMethodValid = true,
    handleConfirmTerms,
    ctaText,
    selectedPlans,
    hasCreditCard = true,
    shouldPayWithShopify = false,
    shopifyBillingStatus,
    isSubscriptionUpdating = false,
    setUpdateProcessStarted,
    autoUpgradeChanged = false,
    noRedirect = false,
    setSessionSelectedPlans,
}: SummaryFooterProps) => {
    const [isTermsChecked, setIsTermsChecked] = useState(false)
    const history = useHistory()
    const dispatch = useAppDispatch()

    const handleSubmit = async () => {
        if (onOpenConfirmationModal) {
            onOpenConfirmationModal()
            return
        }

        try {
            setUpdateProcessStarted?.(true)
            await updateSubscription?.()

            // Start the subscription if it was previously canceled and the customer has the payment method set
            if (
                isCurrentSubscriptionCanceled &&
                (hasCreditCard ||
                    (shouldPayWithShopify &&
                        shopifyBillingStatus === ShopifyBillingStatus.Active))
            ) {
                await startSubscription?.()
            }
            const notification: Notification = {
                status: NotificationStatus.Success,
                style: NotificationStyle.Alert,
                showDismissButton: true,
                dismissAfter: 5000,
                message: 'Your subscription has successfully been updated.',
            }
            void dispatch(notify(notification))

            if (selectedPlans && setSessionSelectedPlans) {
                setSessionSelectedPlans(selectedPlans)
            }

            if (noRedirect) {
                // Do nothing
            } else if (
                (isTrialing ||
                    (isCurrentSubscriptionCanceled && !hasCreditCard)) &&
                !isPaymentMethodFooter
            ) {
                history.push(BILLING_PAYMENT_CARD_PATH)
            } else if (
                shouldPayWithShopify &&
                shopifyBillingStatus !== ShopifyBillingStatus.Active
            ) {
                history.push(ACTIVATE_PAYMENT_WITH_SHOPIFY_URL)
            } else {
                history.push(BILLING_BASE_PATH)
            }
        } catch (error) {
            reportError(error as Error)
            setUpdateProcessStarted?.(false)
        }
    }

    const legalText = useMemo(() => {
        let text

        if (isTrialing || isCurrentSubscriptionCanceled) {
            if (!isPaymentMethodFooter) {
                return null
            }

            text = (
                <label>
                    {`You will be charged for the products and plan you've
                    selected. Update your product and plan selection `}
                    <Link to={BILLING_BASE_PATH}>here</Link>.
                </label>
            )
        } else {
            text =
                "You agree to be charged in accordance with the subscription plan until you cancel your subscription. Previous charges won't be refunded when you cancel unless it is legally required. Your payment data is encrypted and secure. All amounts shown are in USD."
        }

        return <div className={css.legalText}>{text}</div>
    }, [isTrialing, isCurrentSubscriptionCanceled, isPaymentMethodFooter])

    return (
        <div
            className={classNames(css.container, 'rounded', {
                [css.disabled]:
                    !isTrialing &&
                    !isCurrentSubscriptionCanceled &&
                    !isPaymentEnabled,
            })}
        >
            {(anyProductChanged || autoUpgradeChanged) && (
                <>
                    {legalText}
                    {((!isTrialing && !isCurrentSubscriptionCanceled) ||
                        isPaymentMethodFooter) &&
                        anyNewProductSelected && (
                            <div className={css.checkboxLegalTerms}>
                                <input
                                    type="checkbox"
                                    className={css.checkbox}
                                    id="terms"
                                    disabled={
                                        !isTrialing &&
                                        !isCurrentSubscriptionCanceled &&
                                        !isPaymentEnabled
                                    }
                                    checked={isTermsChecked}
                                    onChange={() => {
                                        setIsTermsChecked(!isTermsChecked)
                                        handleConfirmTerms?.(!isTermsChecked)
                                    }}
                                />

                                <label
                                    htmlFor="terms"
                                    className={css.termsLabel}
                                >
                                    I agree to the{' '}
                                    <a
                                        href="https://www.gorgias.com/legal/master-subscription-agreement"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Gorgias Master Subscription Agreement
                                    </a>{' '}
                                    and{' '}
                                    <a
                                        href="https://www.gorgias.com/legal/terms-of-use"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Terms
                                    </a>
                                    . Learn about how we use and protect your
                                    data in our{' '}
                                    <a
                                        href="https://www.gorgias.com/legal/privacy"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Privacy Policy
                                    </a>
                                    .
                                </label>
                            </div>
                        )}
                    {!isTrialing &&
                        anyDowngradedPlanSelected &&
                        !anyNewProductSelected && (
                            <div>
                                Changes to your subscription will apply starting
                                on <strong>{periodEnd}</strong>.
                            </div>
                        )}
                </>
            )}
            {!hideSubscribeButton && (
                <div className={css.button}>
                    <Button
                        isDisabled={
                            isTrialing || isCurrentSubscriptionCanceled
                                ? !isPaymentMethodValid ||
                                  (!isTermsChecked &&
                                      anyNewProductSelected &&
                                      isPaymentMethodFooter)
                                : !isPaymentEnabled ||
                                  (!isTermsChecked && anyNewProductSelected) ||
                                  !(anyProductChanged || autoUpgradeChanged)
                        }
                        className={css.button}
                        id="update-subscription"
                        onClick={() => {
                            void handleSubmit()
                        }}
                        isLoading={isSubscriptionUpdating}
                    >
                        {ctaText}
                    </Button>
                </div>
            )}
        </div>
    )
}

export default SummaryFooter
