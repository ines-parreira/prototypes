import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { Plan, ProductType } from 'models/billing/types'
import { Cadence } from 'models/billing/types'
import {
    getPlanPriceFormatted,
    getProductInfo,
    getProductLabel,
} from 'models/billing/utils'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import type { Value } from 'pages/common/forms/SelectField/types'
import CounterText from 'pages/settings/new_billing/components/CounterText'
import css from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription.less'
import SummaryFooter from 'pages/settings/new_billing/components/SummaryFooter/SummaryFooter'
import { NewSummaryPaymentSection } from 'pages/settings/new_billing/components/SummaryPaymentSection/NewSummaryPaymentSection'
import {
    ENTERPRISE_PLAN_ID,
    PRODUCT_SUBSCRIPTION_DESCRIPTION,
} from 'pages/settings/new_billing/constants'
import { useIsPaymentEnabled } from 'pages/settings/new_billing/hooks/useIsPaymentEnabled'
import type { ProductSubscriptionDescription } from 'pages/settings/new_billing/types'
import { formatNumTickets } from 'pages/settings/new_billing/utils/formatAmount'

export type PlanSubscriptionDescriptionProps = {
    productType: ProductType
    availablePlans: Plan[]
    tagline?: string
    isTrialing: boolean
    isEnterprisePlan: boolean
    cadence?: Cadence
    selectedPlan: Plan | undefined
    setSelectedPlan: React.Dispatch<React.SetStateAction<Plan | undefined>>
    setIsSubscriptionEnabled: React.Dispatch<React.SetStateAction<boolean>>
    trackingSource: string
    isYearlyPlan: boolean
}

const PlanSubscriptionDescription = ({
    productType,
    availablePlans,
    tagline,
    isTrialing,
    isEnterprisePlan,
    cadence = Cadence.Month,
    selectedPlan,
    setSelectedPlan,
    setIsSubscriptionEnabled,
    trackingSource,
    isYearlyPlan,
}: PlanSubscriptionDescriptionProps) => {
    const ref = useRef(null)
    const isPaymentEnabled = !!useIsPaymentEnabled()
    const [isTermsChecked, setIsTermsChecked] = useState(false)
    const filteredPlans = useMemo(
        () => availablePlans.filter((plan) => plan.cadence === cadence),
        [availablePlans, cadence],
    )

    const productInfo = useMemo(
        () => getProductInfo(productType, selectedPlan),
        [productType, selectedPlan],
    )
    const descriptionInfo: ProductSubscriptionDescription = useMemo(
        () => PRODUCT_SUBSCRIPTION_DESCRIPTION[productType],
        [productType],
    )

    const formatOptionLabel = useCallback((plan: Plan) => {
        const label = getProductLabel(plan)
        if (label) {
            return label
        }

        return formatNumTickets(plan.num_quota_tickets ?? 0)
    }, [])

    const options = useMemo(() => {
        return [
            ...filteredPlans.map((plan) => ({
                value: plan.plan_id ?? '',
                label: formatOptionLabel(plan),
            })),
            {
                value: ENTERPRISE_PLAN_ID,
                label: `${formatNumTickets(
                    filteredPlans[filteredPlans.length - 1]
                        ?.num_quota_tickets ?? 0,
                )}+`,
            },
        ]
    }, [filteredPlans, formatOptionLabel])

    const handleSelectProductPlan = (plan_id: Value) => {
        const selectedPlan = filteredPlans.find(
            (plan) => plan.plan_id === plan_id,
        )

        const enterprisePlan = {
            ...filteredPlans[filteredPlans.length - 1],
            plan_id: ENTERPRISE_PLAN_ID,
            name: 'Enterprise',
        }
        setSelectedPlan(selectedPlan ?? enterprisePlan)
    }

    useEffect(() => {
        setIsSubscriptionEnabled(
            isTrialing || (isTermsChecked && isPaymentEnabled),
        )
    }, [isTrialing, isTermsChecked, isPaymentEnabled, setIsSubscriptionEnabled])

    const isSummaryFooterVisible = useMemo(() => {
        return (
            !isEnterprisePlan &&
            !isTrialing &&
            !isYearlyPlan &&
            isPaymentEnabled
        )
    }, [isEnterprisePlan, isTrialing, isPaymentEnabled, isYearlyPlan])

    return (
        <div className={css.container}>
            <div className={css.card}>
                <div className={css.cardHeader}>
                    <div className={css.title}>
                        {tagline || (
                            <>Ready to upgrade with {productInfo.title}?</>
                        )}
                    </div>
                </div>
                <div className={css.features}>
                    {descriptionInfo?.features?.map((info, index) => (
                        <div
                            className={css.feature}
                            key={`${productInfo.title}-feature-${index}`}
                        >
                            <i className="material-icons rounded">check</i>
                            <div>{info}</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className={css.card}>
                <div className={css.cardHeader}>
                    <div className={css.title}>Select a plan</div>
                    {descriptionInfo?.detailsLink && (
                        <a
                            className={css.link}
                            href={descriptionInfo?.detailsLink?.url}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            {descriptionInfo?.detailsLink?.label}
                            <i className={`${css.linkIcon} material-icons`}>
                                open_in_new
                            </i>
                        </a>
                    )}
                </div>
                {isYearlyPlan ? (
                    <div className={css.enterpriseDescription}>
                        Contact our team to subscribe to a custom plan.
                    </div>
                ) : (
                    <div className={css.selectedPlan}>
                        <div className={css.selector}>
                            <SelectField
                                options={options}
                                id={`priceSelect_${productType}`}
                                aria-label="Plan"
                                placeholder="Select a plan"
                                value={selectedPlan?.plan_id}
                                fullWidth
                                onChange={handleSelectProductPlan}
                                showSelectedOption
                            />
                            <div className={css.counter} ref={ref}>
                                <div>
                                    <CounterText
                                        plan={selectedPlan}
                                        type={productType}
                                        cadence={cadence}
                                    />
                                </div>
                                <i
                                    id="priceSelectInfo"
                                    className="material-icons"
                                >
                                    info_outlined
                                </i>
                                <Tooltip
                                    placement="top-start"
                                    target="priceSelectInfo"
                                    className={css.tooltip}
                                    container={ref}
                                >
                                    {productInfo.tooltip}
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
                                    {getPlanPriceFormatted(selectedPlan)}/
                                    {cadence}
                                </strong>
                            )}
                        </div>
                    </div>
                )}
                {isEnterprisePlan && !isYearlyPlan && (
                    <div className={css.enterpriseDescription}>
                        Contact our team to subscribe to an Enterprise plan.
                    </div>
                )}
                <div
                    className={classNames(css.payment, {
                        [css.show]: !isPaymentEnabled,
                    })}
                >
                    <NewSummaryPaymentSection
                        className={css.summaryPaymentSection}
                        trackingSource={trackingSource}
                    />
                </div>
                {isSummaryFooterVisible && (
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

export default PlanSubscriptionDescription
