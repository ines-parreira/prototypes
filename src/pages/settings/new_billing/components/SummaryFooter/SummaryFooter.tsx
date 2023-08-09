import React, {useMemo, useState} from 'react'
import classNames from 'classnames'

import {Link, useHistory} from 'react-router-dom'
import Button from 'pages/common/components/button/Button'

import {reportError} from 'utils/errors'
import {BILLING_BASE_PATH, BILLING_PAYMENT_CARD_PATH} from '../../constants'
import css from './SummaryFooter.less'

export type SummaryFooterProps = {
    isPaymentEnabled: boolean
    isTrialing: boolean
    anyProductChanged: boolean
    anyNewProductSelected: boolean
    anyDowngradedPlanSelected: boolean
    updateSubscription?: () => Promise<void | [void, void]>
    periodEnd: string
    hideSubscribeButton?: boolean
    isPaymentMethodFooter?: boolean
    isPaymentMethodValid?: boolean
    handleConfirmTerms?: (termsChecked: boolean) => void
    ctaText: string
}

const SummaryFooter = ({
    isPaymentEnabled,
    isTrialing,
    anyProductChanged,
    anyNewProductSelected,
    anyDowngradedPlanSelected,
    updateSubscription,
    periodEnd,
    hideSubscribeButton = false,
    isPaymentMethodFooter = false,
    isPaymentMethodValid = true,
    handleConfirmTerms,
    ctaText,
}: SummaryFooterProps) => {
    const [isTermsChecked, setIsTermsChecked] = useState(false)
    const [isSubscriptionUpdating, setIsSubscriptionUpdating] = useState(false)
    const history = useHistory()

    const handleUpdateSubscription = async () => {
        setIsSubscriptionUpdating(true)
        try {
            await updateSubscription?.()
        } catch (error) {
            reportError(error as Error)
        } finally {
            setIsSubscriptionUpdating(false)

            if (isTrialing && !isPaymentMethodFooter) {
                history.push(BILLING_PAYMENT_CARD_PATH)
            } else {
                history.push(BILLING_BASE_PATH)
            }
        }
    }

    const legalText = useMemo(() => {
        let text

        if (isTrialing) {
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
    }, [isTrialing, isPaymentMethodFooter])

    return (
        <div
            className={classNames(css.container, {
                [css.disabled]: !isTrialing && !isPaymentEnabled,
            })}
        >
            {anyProductChanged && (
                <>
                    {legalText}
                    {(!isTrialing || isPaymentMethodFooter) &&
                        anyNewProductSelected && (
                            <div className={css.checkboxLegalTerms}>
                                <input
                                    type="checkbox"
                                    className={css.checkbox}
                                    id="terms"
                                    disabled={!isTrialing && !isPaymentEnabled}
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
                            isTrialing
                                ? !isPaymentMethodValid ||
                                  (!isTermsChecked &&
                                      anyNewProductSelected &&
                                      isPaymentMethodFooter)
                                : !isPaymentEnabled ||
                                  (!isTermsChecked && anyNewProductSelected) ||
                                  !anyProductChanged
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
