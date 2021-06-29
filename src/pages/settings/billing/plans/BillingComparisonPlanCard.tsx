import React, {useState, useRef, ComponentProps} from 'react'
import {Badge, Button, Popover, PopoverHeader, PopoverBody} from 'reactstrap'
import {useSelector} from 'react-redux'
import {Map} from 'immutable'
import classNames from 'classnames'

import {currentPlan as getCurrentPlan} from '../../../../state/billing/selectors'
import {RootState} from '../../../../state/types'
import {AccountFeatures} from '../../../../state/currentAccount/types'
import {isFeatureEnabled} from '../../../../utils/account'

import BillingPlanCard from './BillingPlanCard'
import {PlanCardTheme} from './PlanCard'
import css from './BillingComparisonPlanCard.less'

const PLAN_NAME_TO_BADGE_COLOR: Partial<Record<string, string>> = {
    Basic: 'primary',
    Pro: 'info',
    Advanced: 'success',
    Custom: 'warning',
}

const countFeatures = (features: AccountFeatures) =>
    Object.values(features).filter(isFeatureEnabled).length

type Props = {
    isUpdating: boolean
    defaultIsPlanChangeConfirmationOpen?: boolean
    onPlanChange?: () => void
} & Omit<
    ComponentProps<typeof BillingPlanCard>,
    'footer' | 'headerBadge' | 'theme'
>

export default function BillingComparisonPlanCard({
    plan,
    isCurrentPlan,
    isUpdating,
    onPlanChange,
    defaultIsPlanChangeConfirmationOpen = false,
    ...billingCardProps
}: Props) {
    const [
        isPlanChangeConfirmationOpen,
        setIsPlanChangeConfirmationOpen,
    ] = useState(defaultIsPlanChangeConfirmationOpen)
    const buttonRef = useRef(null)
    const currentPlan = useSelector(getCurrentPlan)
    const currentAccount = useSelector(
        (state: RootState) => state.currentAccount
    )
    const accountHasLegacyFeatures = currentAccount.getIn(
        ['meta', 'has_legacy_features'],
        false
    )
    const isDowngrade =
        !isCurrentPlan &&
        !currentPlan.isEmpty() &&
        countFeatures(plan.features) <
            countFeatures(
                (currentPlan.get(
                    accountHasLegacyFeatures ? 'legacy_features' : 'features'
                ) as Map<any, any>).toJS()
            )
    const canChoosePlan = !isCurrentPlan && !isUpdating
    return (
        <BillingPlanCard
            {...billingCardProps}
            plan={plan}
            isCurrentPlan={isCurrentPlan}
            theme={isCurrentPlan ? PlanCardTheme.Grey : undefined}
            headerBadge={
                isCurrentPlan && (
                    <Badge
                        className={css.currentPlanBadge}
                        color={
                            plan.id === 'enterprise'
                                ? 'warning'
                                : PLAN_NAME_TO_BADGE_COLOR[plan.name]
                        }
                    >
                        CURRENT PLAN
                    </Badge>
                )
            }
            footer={
                <>
                    <Button
                        aria-label="Change plan"
                        innerRef={buttonRef}
                        className={classNames({
                            'btn-loading': isUpdating,
                        })}
                        color="link"
                        disabled={!canChoosePlan}
                        onClick={() => {
                            if (canChoosePlan) {
                                setIsPlanChangeConfirmationOpen(
                                    !isPlanChangeConfirmationOpen
                                )
                            }
                        }}
                    >
                        {isCurrentPlan
                            ? 'Current Plan'
                            : `${
                                  plan.name === currentPlan.get('name')
                                      ? 'Switch'
                                      : isDowngrade
                                      ? 'Downgrade'
                                      : 'Upgrade'
                              } to ${plan.name} Plan`}
                    </Button>
                    {buttonRef.current && (
                        <Popover
                            placement="top"
                            isOpen={isPlanChangeConfirmationOpen}
                            target={buttonRef.current!}
                            toggle={() =>
                                setIsPlanChangeConfirmationOpen(
                                    !isPlanChangeConfirmationOpen
                                )
                            }
                            trigger="legacy"
                        >
                            <PopoverHeader>Are you sure?</PopoverHeader>
                            <PopoverBody>
                                <p>
                                    Are you sure you want to choose the{' '}
                                    {plan.name} plan?
                                    {isDowngrade && (
                                        <>
                                            <b>
                                                This plan does not include some
                                                of the features included in your
                                                existing plan.
                                            </b>{' '}
                                            You might want to keep your existing
                                            plan to not have these features
                                            deactivated.
                                        </>
                                    )}
                                </p>

                                <Button
                                    aria-label="Confirm plan change"
                                    type="button"
                                    color="success"
                                    onClick={() => {
                                        onPlanChange?.()
                                        setIsPlanChangeConfirmationOpen(false)
                                    }}
                                >
                                    Confirm
                                </Button>
                            </PopoverBody>
                        </Popover>
                    )}
                </>
            }
        />
    )
}
