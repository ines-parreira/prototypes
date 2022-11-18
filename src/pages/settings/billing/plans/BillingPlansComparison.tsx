import React, {useState} from 'react'
import {Map} from 'immutable'
import classNames from 'classnames'
import {CardDeck, Container} from 'reactstrap'
import {useAsyncFn} from 'react-use'

import Button from 'pages/common/components/button/Button'
import Group from 'pages/common/components/layout/Group'
import {
    DEPRECATED_getCurrentPlan,
    getEquivalentRegularCurrentPlan,
    getHasAutomationAddOn,
    hasLegacyPlan,
    makeIsAllowedToChangePlan,
    DEPRECATED_getPlans,
} from 'state/billing/selectors'
import {PlanInterval} from 'models/billing/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {Subscription} from 'state/billing/types'
import {updateSubscription} from 'state/currentAccount/actions'
import {setFutureSubscriptionPlan} from 'state/billing/actions'
import {getCurrentSubscription} from 'state/currentAccount/selectors'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import SynchronizedScrollTopProvider from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopProvider'
import SynchronizedScrollTopContainer from 'pages/common/components/SynchronizedScrollTop/SynchronizedScrollTopContainer'
import TaxDisclaimer from '../TaxDisclaimer'

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
    const plans = useAppSelector(DEPRECATED_getPlans)
    const accountHasLegacyPlan = useAppSelector(hasLegacyPlan)
    const currentPlan = useAppSelector(DEPRECATED_getCurrentPlan)
    const regularCurrentPlan = useAppSelector(getEquivalentRegularCurrentPlan)
    const displayedCurrentPlan = regularCurrentPlan || currentPlan
    const currentSubscription = useAppSelector(getCurrentSubscription)
    const isAllowedToChangePlan = useAppSelector(makeIsAllowedToChangePlan)
    const [selectedInterval, setSelectedInterval] = useState<PlanInterval>(
        currentPlan.get('interval') || PlanInterval.Month
    )
    const isCustomPlan = currentPlan.get('custom', false)
    const availablePlans = isCustomPlan
        ? (plans.filter(
              (plan: Map<any, any>) =>
                  !plan.get('is_legacy') &&
                  plan.get('id') === displayedCurrentPlan.get('id')
          ) as Map<any, any>)
        : (plans.filter(
              (plan: Map<any, any>) =>
                  (plan.get('interval') as string) === selectedInterval &&
                  !(plan.get('automation_addon_included') as boolean) &&
                  ((plan.get('public') as boolean) ||
                      (plan.get('id') === displayedCurrentPlan.get('id') &&
                          !accountHasLegacyPlan)) &&
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

    const onPlanChange = (
        planId: string,
        automationAddonEquivalentPlan: string | null,
        isAutomationChecked: boolean
    ) => {
        const id =
            isAutomationChecked && automationAddonEquivalentPlan
                ? automationAddonEquivalentPlan
                : planId
        void handleSubscriptionUpdate(id)
    }

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
                    {accountHasLegacyPlan && (
                        <BillingComparisonPlanCard
                            className={classNames(css.planCard, 'mt-4', {
                                [css.isPublicPlan]: !isCustomPlan,
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
                                    displayedCurrentPlan.get(
                                        'automation_addon_equivalent_plan'
                                    ),
                                    isAutomationChecked
                                )
                            }
                        />
                    )}
                    {availablePlans
                        .map((plan: Map<any, any>) => (
                            <BillingComparisonPlanCard
                                key={plan.get('id')}
                                className={classNames(css.planCard, 'mt-4', {
                                    [css.isPublicPlan]:
                                        accountHasLegacyPlan && !isCustomPlan,
                                })}
                                plan={plan.toJS()}
                                isCurrentPlan={
                                    !accountHasLegacyPlan &&
                                    plan.get('id') ===
                                        displayedCurrentPlan.get('id')
                                }
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
                                        plan.get('id'),
                                        plan.get(
                                            'automation_addon_equivalent_plan'
                                        ),
                                        isAutomationChecked
                                    )
                                }
                                defaultIsPlanChangeModalOpen={
                                    openedPlanModal === plan.get('name')
                                }
                                isAutomationChecked={isAutomationChecked}
                                onAutomationChange={onAutomationChange}
                            />
                        ))
                        .toList()}
                    {!isCustomPlan && (
                        <EnterpriseComparisonPlanCard
                            className={classNames(css.planCard, 'mt-4', {
                                [css.isPublicPlan]: accountHasLegacyPlan,
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

                <TaxDisclaimer className={css.taxDisclaimer} />
            </Container>
        </SynchronizedScrollTopProvider>
    )
}
