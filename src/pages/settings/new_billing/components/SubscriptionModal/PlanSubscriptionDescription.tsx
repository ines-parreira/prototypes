import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import classNames from 'classnames'
import {PlanInterval, Price, ProductType} from 'models/billing/types'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
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
    prices: Price[]
    tagline: string
    isStarterPlan: boolean
    isTrialing: boolean
    isEnterprisePlan: boolean
    interval?: PlanInterval
    selectedPrice: Price | undefined
    setSelectedPrice: React.Dispatch<React.SetStateAction<Price | undefined>>
    setIsSubscriptionEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

const PlanSubscriptionDescription = ({
    productType,
    prices,
    tagline,
    isStarterPlan,
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

    const formatOptionLabel = useCallback(
        (price: Price) => {
            const label = getProductLabel(price, productType)
            if (label) {
                return label
            }

            return formatNumTickets(price.num_quota_tickets ?? 0)
        },
        [productType]
    )

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
                            disabled={isStarterPlan}
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
                {isStarterPlan && (
                    <>
                        <Alert type={AlertType.Error} icon>
                            You're on a Starter plan. Upgrade your Helpdesk
                            subscription to unlock {productInfo.title}.
                        </Alert>
                        <div className={css.starterDescription}>
                            Please upgrade your Helpdesk plan to Basic, Pro,
                            Advanced or Enterprise in order to subscribe to
                            {productInfo.title}.
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

export default PlanSubscriptionDescription
