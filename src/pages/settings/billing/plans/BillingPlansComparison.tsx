import React, {useState} from 'react'
import {Map} from 'immutable'
import classNames from 'classnames'
import {CardDeck, Container} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import Button from 'pages/common/components/button/Button'
import Group from 'pages/common/components/layout/Group'
import {
    getHasAutomationAddOn,
    getIsCurrentHelpdeskLegacy,
    makeGetIsAllowedToChangePrice,
    getCurrentHelpdeskProduct,
    getPricesMap,
    getAutomationProduct,
    getIsCurrentHelpdeskCustom,
    getHelpdeskPrices,
} from 'state/billing/selectors'
import {HelpdeskPrice, PlanInterval} from 'models/billing/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {updateSubscription} from 'state/currentAccount/actions'
import {getCurrentSubscription} from 'state/currentAccount/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import SynchronizedScrollTopProvider from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopProvider'
import SynchronizedScrollTopContainer from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'
import {Subscription} from 'state/billing/types'
import TaxDisclaimer from '../TaxDisclaimer'

import css from './BillingPlansComparison.less'
import BillingComparisonPlanCard from './BillingComparisonPlanCard'
import EnterpriseComparisonPlanCard from './EnterpriseComparisonPlanCard'

const PLAN_FEATURES_HEIGHT = 516

type Props = {
    isAutomationAddOnChecked?: boolean
    openedPriceModal?: string
    onSubscriptionChanged: (prevSubscription: Map<any, any>) => void
}

export default function BillingPlansComparison({
    isAutomationAddOnChecked = false,
    openedPriceModal,
    onSubscriptionChanged,
}: Props) {
    const dispatch = useAppDispatch()
    const pricesMap = useAppSelector(getPricesMap)
    const helpdeskPrices = useAppSelector(getHelpdeskPrices)
    const automationProduct = useAppSelector(getAutomationProduct)
    const currentHelpdeskProduct = useAppSelector(getCurrentHelpdeskProduct)
    const isCurrentHelpdeskLegacy = useAppSelector(getIsCurrentHelpdeskLegacy)
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const getIsAllowedToChangePrice = useAppSelector(
        makeGetIsAllowedToChangePrice
    )
    const [selectedInterval, setSelectedInterval] = useState<PlanInterval>(
        currentHelpdeskProduct?.interval || PlanInterval.Month
    )
    const isCurrentHelpdeskCustom = useAppSelector(getIsCurrentHelpdeskCustom)
    const availablePrices = isCurrentHelpdeskCustom
        ? helpdeskPrices.filter(
              (price) =>
                  !price.is_legacy &&
                  price.price_id === currentHelpdeskProduct?.price_id
          )
        : helpdeskPrices.filter(
              (price) =>
                  price.interval === selectedInterval &&
                  !price.custom &&
                  (price.public ||
                      (price.price_id === currentHelpdeskProduct?.price_id &&
                          !isCurrentHelpdeskLegacy))
          )

    const handleIntervalToggle = () => {
        setSelectedInterval(
            selectedInterval === PlanInterval.Month
                ? PlanInterval.Year
                : PlanInterval.Month
        )
    }

    const [{loading: isSubscriptionChanging}, handleSubscriptionChange] =
        useAsyncFn(
            async (priceId: string, isAutomationChecked: boolean) => {
                if (!getIsAllowedToChangePrice(priceId)) {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message:
                                'You cannot change your current plan because you have too many active integrations. ' +
                                'Delete or deactivate a few integrations and try again.',
                        })
                    )
                    return
                }
                const automationPrice = automationProduct.prices.find((price) =>
                    (pricesMap[priceId] as HelpdeskPrice).addons?.includes(
                        price.price_id
                    )
                )

                await dispatch(
                    updateSubscription({
                        prices: [priceId].concat(
                            isAutomationChecked && automationPrice
                                ? [automationPrice.price_id]
                                : []
                        ),
                    } as Subscription)
                )
                onSubscriptionChanged(currentSubscription)
            },
            [
                automationProduct,
                dispatch,
                getIsAllowedToChangePrice,
                onSubscriptionChanged,
            ]
        )

    const hasAutomationAddOn = useAppSelector(getHasAutomationAddOn)
    const [isAutomationChecked, setIsAutomationChecked] = useState(
        hasAutomationAddOn || isAutomationAddOnChecked
    )

    const onAutomationChange = () =>
        setIsAutomationChecked(!isAutomationChecked)

    return (
        <SynchronizedScrollTopProvider>
            <Container fluid className={css.planContainer}>
                <div className={css.intervalToggle}>
                    <Group>
                        <Button
                            aria-label="Monthly interval"
                            onClick={handleIntervalToggle}
                            intent={
                                selectedInterval === PlanInterval.Month
                                    ? 'primary'
                                    : 'secondary'
                            }
                        >
                            Monthly
                        </Button>
                        <Button
                            aria-label="Yearly interval"
                            onClick={handleIntervalToggle}
                            intent={
                                selectedInterval === PlanInterval.Year
                                    ? 'primary'
                                    : 'secondary'
                            }
                        >
                            Yearly
                        </Button>
                    </Group>
                </div>
                <CardDeck className={css.cardDeck}>
                    {isCurrentHelpdeskLegacy && (
                        <BillingComparisonPlanCard
                            className={classNames(css.planCard, 'mt-4', {
                                [css.isPublicPlan]: !isCurrentHelpdeskCustom,
                            })}
                            helpdeskPrice={currentHelpdeskProduct!}
                            isCurrentPrice
                            isUpdating={isSubscriptionChanging}
                            renderBody={(features) => (
                                <SynchronizedScrollTopContainer
                                    height={PLAN_FEATURES_HEIGHT}
                                >
                                    {features}
                                </SynchronizedScrollTopContainer>
                            )}
                            isAutomationChecked={isAutomationChecked}
                            onAutomationChange={onAutomationChange}
                            onPriceChange={(isAutomationChecked) => {
                                if (currentHelpdeskProduct) {
                                    void handleSubscriptionChange(
                                        currentHelpdeskProduct.price_id,
                                        isAutomationChecked
                                    )
                                }
                            }}
                        />
                    )}
                    {availablePrices.map((price) => (
                        <BillingComparisonPlanCard
                            key={price.price_id}
                            className={classNames(css.planCard, 'mt-4', {
                                [css.isPublicPlan]:
                                    isCurrentHelpdeskLegacy &&
                                    !isCurrentHelpdeskCustom,
                            })}
                            helpdeskPrice={price}
                            isCurrentPrice={
                                !isCurrentHelpdeskLegacy &&
                                price.price_id ===
                                    currentHelpdeskProduct?.price_id
                            }
                            isUpdating={isSubscriptionChanging}
                            renderBody={(features) => (
                                <SynchronizedScrollTopContainer
                                    height={PLAN_FEATURES_HEIGHT}
                                >
                                    {features}
                                </SynchronizedScrollTopContainer>
                            )}
                            onPriceChange={(isAutomationChecked) =>
                                handleSubscriptionChange(
                                    price.price_id,
                                    isAutomationChecked
                                )
                            }
                            defaultIsPriceChangeModalOpen={
                                openedPriceModal === price.name
                            }
                            isAutomationChecked={isAutomationChecked}
                            onAutomationChange={onAutomationChange}
                        />
                    ))}
                    {!isCurrentHelpdeskCustom && (
                        <EnterpriseComparisonPlanCard
                            className={classNames(css.planCard, 'mt-4', {
                                [css.isPublicPlan]: isCurrentHelpdeskLegacy,
                            })}
                            isUpdating={isSubscriptionChanging}
                            defaultIsPriceChangeModalOpen={
                                openedPriceModal === 'Enterprise'
                            }
                            renderBody={(features) => (
                                <SynchronizedScrollTopContainer
                                    height={PLAN_FEATURES_HEIGHT}
                                >
                                    {features}
                                </SynchronizedScrollTopContainer>
                            )}
                        />
                    )}
                </CardDeck>

                <TaxDisclaimer className={css.taxDisclaimer} />
            </Container>
        </SynchronizedScrollTopProvider>
    )
}
