import React, {useState} from 'react'
import {useSelector} from 'react-redux'
import {Map} from 'immutable'
import classNames from 'classnames'
import {Button, ButtonGroup, CardDeck, Container} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import {
    DEPRECATED_getCurrentPlan,
    getEquivalentRegularCurrentPlan,
    getHasAutomationAddOn,
    hasLegacyPlan,
    makeIsAllowedToChangePlan,
    DEPRECATED_getPlans,
} from '../../../../state/billing/selectors'
import {PlanInterval} from '../../../../models/billing/types'
import {getEquivalentAutomationPlanId} from '../../../../models/billing/utils'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {Subscription} from '../../../../state/billing/types'
import {updateSubscription} from '../../../../state/currentAccount/actions'
import {setFutureSubscriptionPlan} from '../../../../state/billing/actions'
import {getCurrentSubscription} from '../../../../state/currentAccount/selectors'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import SynchronizedScrollTopProvider from '../../../common/components/SynchronizedScrollTop/SynchronizedScrollTopProvider'
import SynchronizedScrollTopContainer from '../../../common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'

import css from './BillingPlansComparison.less'
import BillingComparisonPlanCard from './BillingComparisonPlanCard'
import EnterpriseComparisonPlanCard from './EnterpriseComparisonPlanCard'

const PLAN_FEATURES_HEIGHT = 516

type Props = {
    isAutomationAddOnChecked?: boolean
    openedPlanModal?: string
    onSubscriptionChanged: (prevSubscription: Map<any, any>) => void
}

export default function BillingPlansComparison({
    isAutomationAddOnChecked = false,
    openedPlanModal,
    onSubscriptionChanged,
}: Props) {
    const dispatch = useAppDispatch()
    const plans = useSelector(DEPRECATED_getPlans)
    const accountHasLegacyPlan = useSelector(hasLegacyPlan)
    const currentPlan = useSelector(DEPRECATED_getCurrentPlan)
    const regularCurrentPlan = useSelector(getEquivalentRegularCurrentPlan)
    const displayedCurrentPlan = regularCurrentPlan || currentPlan

    const currentSubscription = useSelector(getCurrentSubscription)
    const isAllowedToChangePlan = useSelector(makeIsAllowedToChangePlan)
    const [selectedInterval, setSelectedInterval] = useState<PlanInterval>(
        currentPlan.get('interval') || PlanInterval.Month
    )
    const isCustomPlan = currentPlan.get('custom', false)
    const availablePlans = isCustomPlan
        ? (plans.filter(
              (plan: Map<any, any>) =>
                  (plan.get('public') as boolean) &&
                  plan.get('id') === displayedCurrentPlan.get('id')
          ) as Map<any, any>)
        : (plans.filter(
              (plan: Map<any, any>) =>
                  (plan.get('interval') as string) === selectedInterval &&
                  !(plan.get('automation_addon_included') as boolean) &&
                  (plan.get('public') as boolean) &&
                  !(plan.get('custom') as boolean)
          ) as Map<any, any>)

    const handleIntervalToggle = () => {
        setSelectedInterval(
            selectedInterval === PlanInterval.Month
                ? PlanInterval.Year
                : PlanInterval.Month
        )
    }

    const [{loading: isSubscriptionUpdating}, handleSubscriptionUpdate] =
        useAsyncFn(
            async (planId: string) => {
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

    const onPlanChange = (planId: string, isAutomationChecked: boolean) => {
        const id = isAutomationChecked
            ? getEquivalentAutomationPlanId(planId)
            : planId
        void handleSubscriptionUpdate(id)
    }

    const hasAutomationAddOn = useSelector(getHasAutomationAddOn)
    const [isAutomationChecked, setIsAutomationChecked] = useState(
        hasAutomationAddOn || isAutomationAddOnChecked
    )

    const onAutomationChange = () =>
        setIsAutomationChecked(!isAutomationChecked)

    return (
        <SynchronizedScrollTopProvider>
            <Container fluid className={css.planContainer}>
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
                                className={classNames('mt-4', {
                                    [css.planCard]: !isCustomPlan,
                                })}
                                plan={displayedCurrentPlan.toJS()}
                                isCurrentPlan
                                isUpdating={isSubscriptionUpdating}
                                renderBody={(features) => (
                                    <SynchronizedScrollTopContainer
                                        height={PLAN_FEATURES_HEIGHT}
                                    >
                                        {features}
                                    </SynchronizedScrollTopContainer>
                                )}
                                isAutomationChecked={isAutomationChecked}
                                onAutomationChange={onAutomationChange}
                                onPlanChange={(isAutomationChecked) =>
                                    onPlanChange(
                                        displayedCurrentPlan.get('id'),
                                        isAutomationChecked
                                    )
                                }
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
                                    plan.get('id') ===
                                        displayedCurrentPlan.get('id')
                                return [
                                    planId,
                                    <BillingComparisonPlanCard
                                        key={planId.split('-')[0]}
                                        className={classNames('mt-4', {
                                            [css.planCard]:
                                                accountHasLegacyPlan &&
                                                !isCustomPlan,
                                        })}
                                        plan={plan.toJS()}
                                        isCurrentPlan={isCurrentPlan}
                                        isUpdating={isSubscriptionUpdating}
                                        renderBody={(features) => (
                                            <SynchronizedScrollTopContainer
                                                height={PLAN_FEATURES_HEIGHT}
                                            >
                                                {features}
                                            </SynchronizedScrollTopContainer>
                                        )}
                                        onPlanChange={(isAutomationChecked) =>
                                            onPlanChange(
                                                planId,
                                                isAutomationChecked
                                            )
                                        }
                                        defaultIsPlanChangeModalOpen={
                                            openedPlanModal === plan.get('name')
                                        }
                                        isAutomationChecked={
                                            isAutomationChecked
                                        }
                                        onAutomationChange={onAutomationChange}
                                    />,
                                ]
                            })
                            .toList()}
                    </>
                    {!isCustomPlan && (
                        <EnterpriseComparisonPlanCard
                            className={classNames('mt-4', {
                                [css.planCard]: accountHasLegacyPlan,
                            })}
                            isUpdating={isSubscriptionUpdating}
                            defaultIsPlanChangeModalOpen={
                                openedPlanModal === 'Enterprise'
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
            </Container>
        </SynchronizedScrollTopProvider>
    )
}
