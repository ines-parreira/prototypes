import React, {useState} from 'react'
import classNames from 'classnames'

import Button from 'pages/common/components/button/Button'

import css from './SummaryFooter.less'

export type SummaryFooterProps = {
    isPaymentEnabled: boolean
    anyProductChanged: boolean
    anyNewProductSelected: boolean
    anyDowngradedPlanSelected: boolean
    handleSubscribe?: () => void
    periodEnd: string
    hideSubscribeButton?: boolean
    handleConfirmTerms?: (termsChecked: boolean) => void
}

const SummaryFooter = ({
    isPaymentEnabled,
    anyProductChanged,
    anyNewProductSelected,
    anyDowngradedPlanSelected,
    handleSubscribe,
    periodEnd,
    hideSubscribeButton = false,
    handleConfirmTerms,
}: SummaryFooterProps) => {
    const [isTermsChecked, setIsTermsChecked] = useState(false)
    const [isSubscriptionUpdating, setIsSubscriptionUpdating] = useState(false)

    const updateSubscription = () => {
        setIsSubscriptionUpdating(true)
        try {
            void handleSubscribe?.()
        } finally {
            setIsSubscriptionUpdating(false)
        }
    }

    return (
        <div
            className={classNames(css.container, {
                [css.disabled]: !isPaymentEnabled,
            })}
        >
            {anyProductChanged && (
                <>
                    <div className={css.legalText} data-testid="legalText">
                        You agree to be charged in accordance with the
                        subscription plan until you cancel your subscription.
                        Previous charges won't be refunded when you cancel
                        unless it is legally required. Your payment data is
                        encrypted and secure. All amounts shown are in USD.
                    </div>
                    {anyNewProductSelected && (
                        <div className={css.checkboxLegalTerms}>
                            <input
                                type="checkbox"
                                className={css.checkbox}
                                id="terms"
                                disabled={!isPaymentEnabled}
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
                                . Learn about how we use and protect your data
                                in our{' '}
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
                    {anyDowngradedPlanSelected && !anyNewProductSelected && (
                        <div data-testid="downgradeText">
                            Changes to your subscription will apply starting on{' '}
                            <strong>{periodEnd}</strong>.
                        </div>
                    )}
                </>
            )}
            {!hideSubscribeButton && (
                <div className={css.button}>
                    <Button
                        isDisabled={
                            !isPaymentEnabled ||
                            (!isTermsChecked && anyNewProductSelected) ||
                            !anyProductChanged
                        }
                        className={css.button}
                        id="update-subscription"
                        onClick={updateSubscription}
                        isLoading={isSubscriptionUpdating}
                    >
                        Update Subscription
                    </Button>
                </div>
            )}
        </div>
    )
}

export default SummaryFooter
