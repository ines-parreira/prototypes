import React, {useEffect, useMemo, useState} from 'react'
import classNames from 'classnames'
import {AutomationPrice, PlanInterval} from 'models/billing/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {
    formatAmount,
    formatNumTickets,
} from 'pages/settings/new_billing/utils/formatAmount'
import {
    ENTERPRISE_PRICE_ID,
    PRICING_DETAILS_URL,
    PRODUCT_INFO,
} from 'pages/settings/new_billing/constants'
import {Value} from 'pages/common/forms/SelectField/types'
import Tooltip from 'pages/common/components/Tooltip'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchCreditCard} from 'state/billing/actions'
import SummaryPaymentSection from 'pages/settings/new_billing/components/SummaryPaymentSection/SummaryPaymentSection'

import SummaryFooter from 'pages/settings/new_billing/components/SummaryFooter/SummaryFooter'
import css from './AutomationPlanSubscriptionDescription.less'

export type AutomationPlanSubscriptionDescriptionProps = {
    automationPrices: AutomationPrice[]
    isStarterPlan: boolean
    isTrialing: boolean
    isEnterprisePlan: boolean
    interval?: PlanInterval
    selectedPrice: AutomationPrice
    setSelectedPrice: React.Dispatch<React.SetStateAction<AutomationPrice>>
    setIsSubscriptionEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

const AutomationPlanSubscriptionDescription = ({
    automationPrices,
    isStarterPlan,
    isTrialing,
    isEnterprisePlan,
    interval = PlanInterval.Month,
    selectedPrice,
    setSelectedPrice,
    setIsSubscriptionEnabled,
}: AutomationPlanSubscriptionDescriptionProps) => {
    const dispatch = useAppDispatch()
    const [isCreditCardFetched, setIsCreditCardFetched] = useState(false)
    const [isPaymentEnabled, setIsPaymentEnabled] = useState(false)
    const [isTermsChecked, setIsTermsChecked] = useState(false)
    const filteredAutomationPrices = useMemo(
        () => automationPrices.filter((price) => price.interval === interval),
        [automationPrices, interval]
    )

    const options = useMemo(() => {
        return [
            ...filteredAutomationPrices.map((price) => ({
                value: price.price_id ?? '',
                label: formatNumTickets(price.num_quota_tickets ?? 0),
            })),
            {
                value: ENTERPRISE_PRICE_ID,
                label: `${formatNumTickets(
                    filteredAutomationPrices[
                        filteredAutomationPrices.length - 1
                    ]?.num_quota_tickets ?? 0
                )}+`,
            },
        ]
    }, [filteredAutomationPrices])

    const handleSelectProductPlan = (price_id: Value) => {
        const plan = filteredAutomationPrices.find(
            (price) => price.price_id === price_id
        )

        const enterprisePlan = {
            ...filteredAutomationPrices[filteredAutomationPrices.length - 1],
            price_id: ENTERPRISE_PRICE_ID,
            name: 'Enterprise',
        }
        setSelectedPrice(plan ?? enterprisePlan)
    }

    // fetch card
    useEffect(() => {
        const fetchCard = async () => {
            await dispatch(fetchCreditCard())
            setIsCreditCardFetched(true)
        }

        void fetchCard()
    }, [dispatch])

    useEffect(() => {
        setIsSubscriptionEnabled(
            isTermsChecked &&
                isPaymentEnabled &&
                isCreditCardFetched &&
                !isStarterPlan
        )
    }, [
        isTermsChecked,
        isPaymentEnabled,
        isCreditCardFetched,
        setIsSubscriptionEnabled,
        isStarterPlan,
    ])

    return (
        <div className={css.container} data-testid="automationModalDescription">
            <div className={css.card}>
                <Alert
                    icon={
                        <i className={classNames('material-icons', css.icon)}>
                            auto_awesome
                        </i>
                    }
                    className={css.alert}
                >
                    Unlock these features by subscribing to{' '}
                    <strong>Automation</strong>
                </Alert>
                <div className={css.features}>
                    <div className={css.feature}>
                        <i className="material-icons">contact_support</i>
                        <div>Automate FAQs and product recommendations</div>
                    </div>
                    <div className={css.feature}>
                        <i className="material-icons-outlined">
                            assignment_return
                        </i>
                        <div>
                            Automate order tracking and return/cancellation
                            requests
                        </div>
                    </div>
                    <div className={css.feature}>
                        <i className="material-icons">insights</i>
                        <div>
                            Measure automation performance with a powerful
                            dashboard
                        </div>
                    </div>
                </div>
            </div>
            <div className={css.card}>
                <div className={css.cardHeader}>
                    <div className={css.title}>Select a plan</div>
                    <a
                        href={PRICING_DETAILS_URL}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        See Plans Details
                    </a>
                </div>
                <div className={css.selectedPlan}>
                    <div className={css.selector}>
                        <SelectField
                            options={options}
                            id="priceSelect"
                            placeholder="Select a plan"
                            value={selectedPrice.price_id}
                            fullWidth
                            onChange={handleSelectProductPlan}
                            showSelectedOption
                            disabled={isStarterPlan}
                        />
                        <div className={css.counter}>
                            <div>
                                {PRODUCT_INFO.automation.counter}/{interval}
                            </div>
                            <i id="priceSelectInfo" className="material-icons">
                                info_outlined
                            </i>
                            <Tooltip
                                placement="top-start"
                                target="priceSelectInfo"
                            >
                                {PRODUCT_INFO.automation.tooltip}
                            </Tooltip>
                        </div>
                    </div>
                    <div className={css.planPrice}>
                        {isEnterprisePlan ? (
                            <div className={css.enterprisePrice}>
                                Enterprise
                            </div>
                        ) : (
                            <strong>
                                {formatAmount(selectedPrice.amount / 100, null)}
                                /{interval}
                            </strong>
                        )}
                    </div>
                </div>
                {isEnterprisePlan && (
                    <div className={css.enterpriseDescription}>
                        Contact our team to subscribe to an Enterprise plan.
                    </div>
                )}
                {isStarterPlan && (
                    <>
                        <Alert type={AlertType.Error} icon>
                            You're on a Starter plan. Upgrade your Helpdesk
                            subscription to unlock Automation.
                        </Alert>
                        <div className={css.starterDescription}>
                            Please upgrade your Helpdesk plan to Basic, Pro,
                            Advanced or Enterprise in order to subscribe to
                            Automation.
                        </div>
                    </>
                )}
                <div
                    className={classNames(css.payment, {
                        [css.show]: !isPaymentEnabled && isCreditCardFetched,
                    })}
                >
                    <SummaryPaymentSection
                        isCreditCardFetched={isCreditCardFetched}
                        setIsPaymentEnabled={setIsPaymentEnabled}
                        isPaymentInformationView
                        hasSmallFont
                    />
                </div>
                {!isEnterprisePlan && !isStarterPlan && isPaymentEnabled && (
                    <SummaryFooter
                        isPaymentEnabled={isPaymentEnabled}
                        isTrialing={isTrialing}
                        anyDowngradedPlanSelected={false}
                        anyNewProductSelected={true}
                        anyProductChanged={true}
                        periodEnd=""
                        hideSubscribeButton
                        handleConfirmTerms={(termsChecked) =>
                            setIsTermsChecked(termsChecked)
                        }
                        ctaText="Update Subscription"
                    />
                )}
            </div>
        </div>
    )
}

export default AutomationPlanSubscriptionDescription
