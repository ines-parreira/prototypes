import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Map} from 'immutable'
import classNames from 'classnames'
import {Button, ButtonGroup, CardDeck, Container} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import {
    getCurrentPlan,
    hasLegacyPlan,
    makeIsAllowedToChangePlan,
    getPlans,
} from '../../../../state/billing/selectors'
import {openChat} from '../../../../utils'
import {PlanInterval} from '../../../../models/billing/types'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {Subscription} from '../../../../state/billing/types'
import {updateSubscription} from '../../../../state/currentAccount/actions'
import {setFutureSubscriptionPlan} from '../../../../state/billing/actions'
import {getCurrentSubscription} from '../../../../state/currentAccount/selectors'
import useAppDispatch from '../../../../hooks/useAppDispatch'

import css from './BillingPlansComparison.less'
import BillingComparisonPlanCard from './BillingComparisonPlanCard'
import PlanCard, {PlanCardTheme} from './PlanCard'
import {getEnterprisePlanCardFeatures} from './billingPlanFeatures'

type Props = {
    openedPlanPopover?: string
    onSubscriptionChanged: (prevSubscription: Map<any, any>) => void
}

export default function BillingPlansComparison({
    openedPlanPopover,
    onSubscriptionChanged,
}: Props) {
    const dispatch = useAppDispatch()
    const plans = useSelector(getPlans)
    const accountHasLegacyPlan = useSelector(hasLegacyPlan)
    const currentPlan = useSelector(getCurrentPlan)
    const currentSubscription = useSelector(getCurrentSubscription)
    const isAllowedToChangePlan = useSelector(makeIsAllowedToChangePlan)
    const [selectedInterval, setSelectedInterval] = useState<PlanInterval>(
        currentPlan.get('interval') || PlanInterval.Month
    )
    const isCustomPlan = currentPlan.get('custom', false)
    const availablePlans = isCustomPlan
        ? (plans.filter(
              (plan: Map<any, any>) => plan.get('id') === currentPlan.get('id')
          ) as Map<any, any>)
        : (plans.filter(
              (plan: Map<any, any>) =>
                  (plan.get('interval') as string) === selectedInterval &&
                  (plan.get('public') as boolean)
          ) as Map<any, any>)

    const handleIntervalToggle = () => {
        setSelectedInterval(
            selectedInterval === PlanInterval.Month
                ? PlanInterval.Year
                : PlanInterval.Month
        )
    }

    const [
        {loading: isSubscriptionUpdating},
        handleSubscriptionUpdate,
    ] = useAsyncFn(
        async (planId?: string) => {
            // https://linear.app/gorgias/issue/COR-1140/update-react-use-dependency
            if (!planId) {
                return
            }
            if (!isAllowedToChangePlan(planId)) {
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

            dispatch(setFutureSubscriptionPlan(planId))
            await dispatch(
                updateSubscription({
                    plan: planId,
                } as Subscription)
            )
            onSubscriptionChanged(currentSubscription)
        },
        [onSubscriptionChanged]
    )

    return (
        <Container
            fluid
            className={classNames('page-container', css.planContainer)}
        >
            <div className={css.intervalToggle}>
                <ButtonGroup>
                    <Button
                        aria-label="Monthly interval"
                        onClick={handleIntervalToggle}
                        color={
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
                        color={
                            selectedInterval === PlanInterval.Year
                                ? 'primary'
                                : 'secondary'
                        }
                    >
                        Yearly
                    </Button>
                </ButtonGroup>
            </div>
            <CardDeck className={classNames('mb-5')}>
                <>
                    {accountHasLegacyPlan && (
                        <BillingComparisonPlanCard
                            className="mt-4"
                            plan={currentPlan.toJS()}
                            isCurrentPlan
                            isUpdating={isSubscriptionUpdating}
                        />
                    )}
                    {availablePlans
                        .mapEntries((entry) => {
                            const [planId, plan] = entry as [
                                string,
                                Map<any, any>
                            ]
                            const isCurrentPlan =
                                !accountHasLegacyPlan &&
                                plan.get('id') === currentPlan.get('id')
                            return [
                                planId,
                                <BillingComparisonPlanCard
                                    key={planId.split('-')[0]}
                                    className="mt-4"
                                    plan={plan.toJS()}
                                    isCurrentPlan={isCurrentPlan}
                                    isUpdating={isSubscriptionUpdating}
                                    onPlanChange={() => {
                                        void handleSubscriptionUpdate(planId)
                                    }}
                                    defaultIsPlanChangeConfirmationOpen={
                                        openedPlanPopover === plan.get('name')
                                    }
                                />,
                            ]
                        })
                        .toList()}
                </>
                {!isCustomPlan && (
                    <PlanCard
                        className="mt-4"
                        planName="Enterprise"
                        theme={PlanCardTheme.Gold}
                        price="Custom price"
                        features={getEnterprisePlanCardFeatures()}
                        footer={
                            <Button
                                aria-label="Contact us"
                                color="link"
                                onClick={(event) => {
                                    openChat((event as unknown) as Event)
                                }}
                            >
                                Contact us
                            </Button>
                        }
                    />
                )}
            </CardDeck>
        </Container>
    )
}
