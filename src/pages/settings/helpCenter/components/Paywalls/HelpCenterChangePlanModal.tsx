import React, {useState} from 'react'
import {useAsyncFn} from 'react-use'
import {Map} from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import BillingPlanCard from 'pages/settings/billing/plans/BillingPlanCard'
import ChangePlanModal from 'pages/settings/billing/plans/ChangePlanModal'
import {PlanWithCurrencySign, SubscriptionPlan} from 'state/billing/types'
import {setFutureSubscriptionPlan} from 'state/billing/actions'
import {updateSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {getPlan, isAllowedToChangePlan} from 'state/billing/selectors'

import TotalAmount from 'pages/settings/billing/plans/TotalAmount'
import AutomationAmount from 'pages/settings/billing/plans/AutomationAmount'

import OpenChatButton from './components/OpenChatButton'

type Props = {
    isOpen: boolean
    currentPlan: Map<any, any>
    suitablePlanWithoutAutomationAddOn: PlanWithCurrencySign
    onClose: () => void
}

const HelpCenterChangePlanModal = ({
    currentPlan,
    suitablePlanWithoutAutomationAddOn,
    isOpen,
    onClose,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const hasAutomationAddOn = !!currentPlan.get('automation_addon_included')
    const [isModalAutomationChecked, setModalIsAutomationChecked] =
        useState(hasAutomationAddOn)

    const suitablePlanWithAutomationAddOn = useAppSelector(
        getPlan(
            suitablePlanWithoutAutomationAddOn.automation_addon_equivalent_plan!
        )
    )
    const addOnAmount = suitablePlanWithAutomationAddOn.get('amount')
        ? Math.abs(
              suitablePlanWithAutomationAddOn.get('amount') -
                  suitablePlanWithoutAutomationAddOn.amount
          )
        : '?'

    const [{loading: isSubscriptionUpdating}, handleSubscriptionUpdate] =
        useAsyncFn(async (planId: SubscriptionPlan) => {
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
                })
            )
        })

    return (
        <ChangePlanModal
            isOpen={isOpen}
            confirmLabel="Confirm Upgrade"
            description={
                <span>
                    It seems like you are currently in a legacy plan. To be able
                    to create a Help Center you need to update to a more recent
                    version and you can do it directly from here! Any questions?{' '}
                    <OpenChatButton label="Get in touch!" />
                </span>
            }
            header="Review your change"
            onClose={onClose}
            renderComparedPlan={({className, renderBody}) => (
                <BillingPlanCard
                    plan={suitablePlanWithoutAutomationAddOn}
                    className={className}
                    renderBody={renderBody}
                    footer={
                        <>
                            <AutomationAmount
                                addOnAmount={addOnAmount}
                                plan={suitablePlanWithoutAutomationAddOn}
                                isAutomationChecked={isModalAutomationChecked}
                                onAutomationChange={() =>
                                    setModalIsAutomationChecked(
                                        !isModalAutomationChecked
                                    )
                                }
                            />
                            <TotalAmount
                                addOnAmount={addOnAmount}
                                plan={suitablePlanWithoutAutomationAddOn}
                                isAutomationChecked={isModalAutomationChecked}
                            />
                        </>
                    }
                />
            )}
            onConfirm={() => {
                handleSubscriptionUpdate?.(
                    isModalAutomationChecked
                        ? suitablePlanWithAutomationAddOn.get('id')
                        : suitablePlanWithoutAutomationAddOn.id
                )
                onClose()
            }}
            isUpdating={isSubscriptionUpdating}
        />
    )
}

export default HelpCenterChangePlanModal
