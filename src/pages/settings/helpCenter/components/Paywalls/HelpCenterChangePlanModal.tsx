import React, {useMemo, useState} from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useAsyncFn from 'hooks/useAsyncFn'
import BillingPlanCard from 'pages/settings/billing/plans/BillingPlanCard'
import ChangePlanModal from 'pages/settings/billing/plans/ChangePlanModal'
import {updateSubscription} from 'state/currentAccount/actions'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {
    getAutomatePricesMap,
    getCurrentAutomateProduct,
} from 'state/billing/selectors'
import {getFormattedAmount, getFullPrice} from 'models/billing/utils'

import {getPlanCardFeaturesForPrices} from 'pages/settings/billing/plans/billingPlanFeatures'
import TotalAmount from 'pages/settings/billing/plans/TotalAmount'
import AutomateAmount from 'pages/settings/billing/plans/AutomateAmount'
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
    const currentAutomatePrice = useAppSelector(getCurrentAutomateProduct)
    const [isModalAutomateChecked, setModalIsAutomateChecked] = useState(
        !!currentAutomatePrice
    )
    const pricesMap = useAppSelector(getAutomatePricesMap)
    const automatePrice = useMemo(
        () => helpdeskPrice.addons && pricesMap[helpdeskPrice.addons[0]],
        [helpdeskPrice.addons, pricesMap]
    )
    const addOnAmount = useMemo(
        () =>
            automatePrice?.amount != null
                ? Math.abs(getFormattedAmount(automatePrice.amount))
                : '?',
        [automatePrice?.amount]
    )
    const addOnDiscount = automatePrice?.automation_addon_discount
    const features = useMemo(
        () =>
            getPlanCardFeaturesForPrices(
                isModalAutomateChecked && automatePrice
                    ? [helpdeskPrice, automatePrice]
                    : [helpdeskPrice]
            ),
        [automatePrice, helpdeskPrice, isModalAutomateChecked]
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
                            <AutomateAmount
                                addOnAmount={addOnAmount}
                                currency={helpdeskPrice.currency}
                                editable={
                                    !!automatePrice || addOnAmount != null
                                }
                                fullAddOnAmount={fullAddOnAmount}
                                interval={helpdeskPrice.interval}
                                isAutomateChecked={isModalAutomateChecked}
                                onAutomateChange={() =>
                                    setModalIsAutomateChecked(
                                        !isModalAutomateChecked
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
                                isAutomationChecked={isModalAutomateChecked}
                            />
                        </>
                    }
                />
            )}
            onConfirm={() => {
                void handleSubscriptionUpdate(
                    isModalAutomateChecked && automatePrice
                        ? [helpdeskPrice.price_id, automatePrice.price_id]
                        : [helpdeskPrice.price_id]
                )
                onClose()
            }}
            isUpdating={isSubscriptionUpdating}
        />
    )
}

export default HelpCenterChangePlanModal
