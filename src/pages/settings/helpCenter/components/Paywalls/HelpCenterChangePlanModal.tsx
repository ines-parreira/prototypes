import React, {useMemo, useState} from 'react'
import {useAsyncFn} from 'react-use'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import BillingPlanCard from 'pages/settings/billing/plans/BillingPlanCard'
import ChangePlanModal from 'pages/settings/billing/plans/ChangePlanModal'
import {updateSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    getAutomationPricesMap,
    getCurrentAutomationProduct,
} from 'state/billing/selectors'
import {getFormattedAmount, getFullPrice} from 'models/billing/utils'

import {getPlanCardFeaturesForPrices} from 'pages/settings/billing/plans/billingPlanFeatures'
import TotalAmount from 'pages/settings/billing/plans/TotalAmount'
import AutomationAmount from 'pages/settings/billing/plans/AutomationAmount'
import {getActiveIntegrations} from 'state/integrations/selectors'

import {HelpdeskPrice} from '../../../../../models/billing/types'
import OpenChatButton from './components/OpenChatButton'

type Props = {
    isOpen: boolean
    helpdeskPrice: HelpdeskPrice
    onClose: () => void
}

const HelpCenterChangePlanModal = ({
    helpdeskPrice,
    isOpen,
    onClose,
}: Props): JSX.Element => {
    const dispatch = useAppDispatch()
    const currentAutomationPrice = useAppSelector(getCurrentAutomationProduct)
    const [isModalAutomationChecked, setModalIsAutomationChecked] = useState(
        !!currentAutomationPrice
    )
    const pricesMap = useAppSelector(getAutomationPricesMap)
    const automationPrice = useMemo(
        () => helpdeskPrice.addons && pricesMap[helpdeskPrice.addons[0]],
        [helpdeskPrice.addons, pricesMap]
    )
    const addOnAmount = useMemo(
        () =>
            automationPrice?.amount != null
                ? Math.abs(getFormattedAmount(automationPrice.amount))
                : '?',
        [automationPrice?.amount]
    )
    const addOnDiscount = automationPrice?.automation_addon_discount
    const features = useMemo(
        () =>
            getPlanCardFeaturesForPrices(
                isModalAutomationChecked && automationPrice
                    ? [helpdeskPrice, automationPrice]
                    : [helpdeskPrice]
            ),
        [automationPrice, helpdeskPrice, isModalAutomationChecked]
    )
    const activeIntegrations = useAppSelector(getActiveIntegrations)

    const fullAddOnAmount = useMemo(() => {
        return typeof addOnAmount === 'number' && addOnDiscount
            ? getFullPrice(addOnAmount, addOnDiscount)
            : undefined
    }, [addOnAmount, addOnDiscount])

    const [{loading: isSubscriptionUpdating}, handleSubscriptionUpdate] =
        useAsyncFn(async (prices: string[]) => {
            if ((helpdeskPrice.integrations || 0) < activeIntegrations.size) {
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

            await dispatch(
                updateSubscription({
                    prices,
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
                    amount={getFormattedAmount(helpdeskPrice.amount)}
                    currency={helpdeskPrice.currency}
                    features={features}
                    interval={helpdeskPrice.interval}
                    name={helpdeskPrice.name}
                    className={className}
                    renderBody={renderBody}
                    footer={
                        <>
                            <AutomationAmount
                                addOnAmount={addOnAmount}
                                currency={helpdeskPrice.currency}
                                editable={
                                    !!automationPrice || addOnAmount != null
                                }
                                fullAddOnAmount={fullAddOnAmount}
                                interval={helpdeskPrice.interval}
                                isAutomationChecked={isModalAutomationChecked}
                                onAutomationChange={() =>
                                    setModalIsAutomationChecked(
                                        !isModalAutomationChecked
                                    )
                                }
                            />
                            <TotalAmount
                                addOnAmount={addOnAmount}
                                amount={getFormattedAmount(
                                    helpdeskPrice.amount
                                )}
                                currency={helpdeskPrice.currency}
                                interval={helpdeskPrice.interval}
                                isAutomationChecked={isModalAutomationChecked}
                            />
                        </>
                    }
                />
            )}
            onConfirm={() => {
                void handleSubscriptionUpdate(
                    isModalAutomationChecked && automationPrice
                        ? [helpdeskPrice.price_id, automationPrice.price_id]
                        : [helpdeskPrice.price_id]
                )
                onClose()
            }}
            isUpdating={isSubscriptionUpdating}
        />
    )
}

export default HelpCenterChangePlanModal
