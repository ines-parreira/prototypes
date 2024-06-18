import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import classNames from 'classnames'
import {PlanInterval, Plan, ProductType} from 'models/billing/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {
    formatAmount,
    formatNumTickets,
} from 'pages/settings/new_billing/utils/formatAmount'
import {
    ENTERPRISE_PRICE_ID,
    PRODUCT_INFO,
    PRODUCT_SUBSCRIPTION_DESCRIPTION,
} from 'pages/settings/new_billing/constants'
import {Value} from 'pages/common/forms/SelectField/types'
import Tooltip from 'pages/common/components/Tooltip'
import useAppDispatch from 'hooks/useAppDispatch'
import {fetchCreditCard} from 'state/billing/actions'
import SummaryPaymentSection from 'pages/settings/new_billing/components/SummaryPaymentSection/SummaryPaymentSection'

import SummaryFooter from 'pages/settings/new_billing/components/SummaryFooter/SummaryFooter'
import {getProductLabel} from 'models/billing/utils'
import css from 'pages/settings/new_billing/components/SubscriptionModal/PlanSubscriptionDescription.less'
import CounterText from 'pages/settings/new_billing/components/CounterText'
import {ProductSubscriptionDescription} from 'pages/settings/new_billing/types'

export type PlanSubscriptionDescriptionProps = {
    productType: ProductType
    prices: Plan[]
    tagline?: string
    isTrialing: boolean
    isEnterprisePlan: boolean
    interval?: PlanInterval
    selectedPrice: Plan | undefined
    setSelectedPrice: React.Dispatch<React.SetStateAction<Plan | undefined>>
    setIsSubscriptionEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

const PlanSubscriptionDescription = ({
    productType,
    prices,
    tagline,
    isTrialing,
    isEnterprisePlan,
    interval = PlanInterval.Month,
    selectedPrice,
    setSelectedPrice,
    setIsSubscriptionEnabled,
}: PlanSubscriptionDescriptionProps) => {
    const dispatch = useAppDispatch()
    const ref = useRef(null)
    const [isCreditCardFetched, setIsCreditCardFetched] = useState(false)
    const [isPaymentEnabled, setIsPaymentEnabled] = useState(false)
    const [isTermsChecked, setIsTermsChecked] = useState(false)
    const filteredPrices = useMemo(
        () => prices.filter((price) => price.interval === interval),
        [prices, interval]
    )

    const productInfo = useMemo(() => PRODUCT_INFO[productType], [productType])
    const descriptionInfo: ProductSubscriptionDescription = useMemo(
        () => PRODUCT_SUBSCRIPTION_DESCRIPTION[productType],
        [productType]
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
            ...filteredPrices.map((price) => ({
                value: price.price_id ?? '',
                label: formatOptionLabel(price),
            })),
            {
                value: ENTERPRISE_PRICE_ID,
                label: `${formatNumTickets(
                    filteredPrices[filteredPrices.length - 1]
                        ?.num_quota_tickets ?? 0
                )}+`,
            },
        ]
    }, [filteredPrices, formatOptionLabel])

    const handleSelectProductPlan = (price_id: Value) => {
        const plan = filteredPrices.find((price) => price.price_id === price_id)

        const enterprisePlan = {
            ...filteredPrices[filteredPrices.length - 1],
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
            isTrialing ||
                (isTermsChecked && isPaymentEnabled && isCreditCardFetched)
        )
    }, [
        isTrialing,
        isTermsChecked,
        isPaymentEnabled,
        isCreditCardFetched,
        setIsSubscriptionEnabled,
    ])

    const isSummaryFooterVisible = useMemo(() => {
        return !isEnterprisePlan && !isTrialing && isPaymentEnabled
    }, [isEnterprisePlan, isTrialing, isPaymentEnabled])

    return (
        <div
            className={css.container}
            data-testid={`${productInfo.title.toLowerCase()}ModalDescription`}
        >
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
                <div className={css.selectedPlan}>
                    <div className={css.selector}>
                        <SelectField
                            options={options}
                            id="priceSelect"
                            placeholder="Select a plan"
                            value={selectedPrice?.price_id}
                            fullWidth
                            onChange={handleSelectProductPlan}
                            showSelectedOption
                        />
                        <div className={css.counter} ref={ref}>
                            <div>
                                <CounterText
                                    price={selectedPrice}
                                    type={productType}
                                    interval={interval}
                                />
                            </div>
                            <i id="priceSelectInfo" className="material-icons">
                                info_outlined
                            </i>
                            <Tooltip
                                placement="top-start"
                                target="priceSelectInfo"
                                className={css.tooltip}
                                appNode={ref}
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
                                {formatAmount(
                                    (selectedPrice?.amount ?? 0) / 100,
                                    null
                                )}
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
