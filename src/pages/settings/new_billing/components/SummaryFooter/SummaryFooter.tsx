import React, {useMemo} from 'react'
import classNames from 'classnames'
import moment from 'moment'

import Button from 'pages/common/components/button/Button'
import useAppSelector from 'hooks/useAppSelector'
import {getCurrentUsage} from 'state/billing/selectors'
import {DATE_FORMAT} from '../../constants'

import css from './SummaryFooter.less'

export type SummaryFooterProps = {
    isPaymentEnabled: boolean
    anyProductChanged: boolean
    anyNewProductSelected: boolean
    anyDowngradedPlanSelected: boolean
    handleSubscribe: () => void
}

const SummaryFooter = ({
    isPaymentEnabled,
    anyProductChanged,
    anyNewProductSelected,
    anyDowngradedPlanSelected,
    handleSubscribe,
}: SummaryFooterProps) => {
    const currentUsage = useAppSelector(getCurrentUsage)
    const [isTermsChecked, setIsTermsChecked] = React.useState(false)

    const periodEnd = useMemo(
        () =>
            moment(currentUsage.getIn(['meta', 'end_datetime'])).format(
                DATE_FORMAT
            ),
        [currentUsage]
    )

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
                                onChange={() =>
                                    setIsTermsChecked(!isTermsChecked)
                                }
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
                        <div
                            className={css.donwngradeText}
                            data-testid="downgradeText"
                        >
                            Changes to your subscription will apply starting on{' '}
                            <strong>{periodEnd}</strong>.
                        </div>
                    )}
                </>
            )}
            <div className={css.button}>
                <Button
                    isDisabled={
                        !isPaymentEnabled ||
                        (!isTermsChecked && anyNewProductSelected) ||
                        !anyProductChanged
                    }
                    className={css.button}
                    id="update-subscription"
                    onClick={handleSubscribe}
                >
                    Update Subscription
                </Button>
            </div>
        </div>
    )
}

export default SummaryFooter
