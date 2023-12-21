import React, {useMemo, useState} from 'react'
import classNames from 'classnames'

import {Link, useHistory} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'

import {reportError} from 'utils/errors'
import {ShopifyBillingStatus} from 'state/currentAccount/types'
import useSessionStorage from 'hooks/useSessionStorage'
import {
    ACTIVATE_PAYMENT_WITH_SHOPIFY_URL,
    BILLING_BASE_PATH,
    BILLING_PAYMENT_CARD_PATH,
    SELECTED_PRODUCTS_SESSION_STORAGE_KEY,
} from '../../constants'
import {SelectedPlans} from '../../views/BillingProcessView/BillingProcessView'
import css from './SummaryFooter.less'

export type SummaryFooterProps = {
    isPaymentEnabled: boolean
    isTrialing: boolean
    isCurrentSubscriptionCanceled?: boolean
    anyProductChanged: boolean
    anyNewProductSelected: boolean
    anyDowngradedPlanSelected: boolean
    updateSubscription?: () => Promise<void | [void, void, void]>
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
}

const SummaryFooter = ({
    isPaymentEnabled,
    isTrialing,
    isCurrentSubscriptionCanceled = false,
    anyProductChanged,
    anyNewProductSelected,
    anyDowngradedPlanSelected,
    updateSubscription,
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
}: SummaryFooterProps) => {
    const [isTermsChecked, setIsTermsChecked] = useState(false)
    const [, setSessionSelectedPlans] = useSessionStorage<SelectedPlans>(
        SELECTED_PRODUCTS_SESSION_STORAGE_KEY
    )
    const history = useHistory()

    const handleUpdateSubscription = async () => {
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
        } catch (error) {
            reportError(error as Error)
        } finally {
            if (selectedPlans) {
                setSessionSelectedPlans(selectedPlans)
            }

            if (
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
                    You will be charged for the products and plan you've
                    selected. Update your product and plan selection{' '}
                    <Link to={BILLING_BASE_PATH}>here</Link>.
                </label>
            )
        } else {
            text =
                "You agree to be charged in accordance with the subscription plan until you cancel your subscription. Previous charges won't be refunded when you cancel unless it is legally required. Your payment data is encrypted and secure. All amounts shown are in USD."
        }

        return (
            <div className={css.legalText} data-testid="legalText">
                {text}
            </div>
        )
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
                                    data-testid="terms"
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
                            <div data-testid="downgradeText">
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
                        onClick={handleUpdateSubscription}
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
