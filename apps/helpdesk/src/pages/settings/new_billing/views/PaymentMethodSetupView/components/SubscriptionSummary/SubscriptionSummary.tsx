import type { SelectedPlans } from '@repo/billing'
import { SELECTED_PRODUCTS_SESSION_STORAGE_KEY } from '@repo/billing'
import { useSessionStorage } from '@repo/hooks'
import type { FieldValues, SubmitHandler } from 'react-hook-form'
import { useFormContext, useFormState } from 'react-hook-form'

import useAppSelector from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import Card from 'pages/settings/new_billing/components/Card'
import { FormSubmitButtonError } from 'pages/settings/new_billing/components/FormSubmitButton/FormSubmitButtonError'
import SummaryFooter from 'pages/settings/new_billing/components/SummaryFooter'
import { SummaryItem } from 'pages/settings/new_billing/components/SummaryItem'
import SummaryTotal from 'pages/settings/new_billing/components/SummaryTotal'
import { useBillingPlans } from 'pages/settings/new_billing/hooks/useBillingPlan'
import { isTrialing as getIsTrialing } from 'state/currentAccount/selectors'

import css from './SubscriptionSummary.less'

export type ISubscriptionSummaryProps<
    TFields extends FieldValues = FieldValues,
> = {
    dispatchBillingError: (error: unknown) => void
    onValidSubmit: SubmitHandler<TFields>
}

export function SubscriptionSummary<TFields extends FieldValues>({
    dispatchBillingError,
    onValidSubmit,
}: ISubscriptionSummaryProps<TFields>) {
    const { isSubmitting } = useFormState()

    const [selectedPlansFromSessionStorage] = useSessionStorage<SelectedPlans>(
        SELECTED_PRODUCTS_SESSION_STORAGE_KEY,
    )

    const isTrialing = useAppSelector(getIsTrialing)

    const {
        currentHelpdeskPlan,
        helpdeskAvailablePlans,
        currentAutomatePlan,
        automateAvailablePlans,
        currentSmsPlan,
        smsAvailablePlans,
        currentConvertPlan,
        convertAvailablePlans,
        currentVoicePlan,
        voiceAvailablePlans,
        anyDowngradedPlanSelected,
        totalProductAmount,
        cadence,
        isSubscriptionCanceled,
        selectedPlans: selectedPlansFromState,
    } = useBillingPlans({
        dispatchBillingError,
        filterByCadence: true,
    })

    const handleUpdateSubscription =
        useHandleUpdateSubscription<TFields>(onValidSubmit)

    if (
        !isTrialing &&
        (!isSubscriptionCanceled || !selectedPlansFromSessionStorage)
    ) {
        // If user is not trialing and either the subscription is active or no plans are selected.
        return null
    }

    const selectedPlans = isSubscriptionCanceled
        ? selectedPlansFromSessionStorage
        : selectedPlansFromState

    return (
        <Card title="Summary">
            <div className={css.summary}>
                <div className={css.summaryHeader}>
                    <div>PRODUCT</div>
                    <div>PRICE</div>
                </div>
                <SummaryItem
                    productType={ProductType.Helpdesk}
                    cadence={cadence}
                    currentPlan={currentHelpdeskPlan}
                    availablePlans={helpdeskAvailablePlans}
                    selectedPlans={selectedPlans}
                />
                <SummaryItem
                    productType={ProductType.Automation}
                    cadence={cadence}
                    currentPlan={currentAutomatePlan}
                    availablePlans={automateAvailablePlans}
                    selectedPlans={selectedPlans}
                />
                <SummaryItem
                    productType={ProductType.Voice}
                    cadence={cadence}
                    currentPlan={currentVoicePlan}
                    availablePlans={voiceAvailablePlans}
                    selectedPlans={selectedPlans}
                />
                <SummaryItem
                    productType={ProductType.SMS}
                    cadence={cadence}
                    currentPlan={currentSmsPlan}
                    availablePlans={smsAvailablePlans}
                    selectedPlans={selectedPlans}
                />
                <SummaryItem
                    productType={ProductType.Convert}
                    cadence={cadence}
                    currentPlan={currentConvertPlan}
                    availablePlans={convertAvailablePlans}
                    selectedPlans={selectedPlans}
                />
                <SummaryTotal
                    selectedPlans={selectedPlans}
                    totalProductAmount={totalProductAmount}
                    cadence={cadence}
                    currency={helpdeskAvailablePlans?.[0].currency}
                />
            </div>
            <h2 className={css.startSubscriptionTitle}>
                Start your subscription today
            </h2>
            <SummaryFooter
                isPaymentEnabled={true}
                isTrialing={isTrialing}
                isCurrentSubscriptionCanceled={isSubscriptionCanceled}
                isPaymentMethodFooter={true}
                anyProductChanged={true}
                anyNewProductSelected={true}
                anyDowngradedPlanSelected={!!anyDowngradedPlanSelected}
                periodEnd={''}
                updateSubscription={handleUpdateSubscription}
                isSubscriptionUpdating={isSubmitting}
                ctaText={`Subscribe now`}
                noRedirect
            />
            <FormSubmitButtonError />
        </Card>
    )
}

// We need to throw validation errors to stop the SummaryFooter from starting a subscription
function useHandleUpdateSubscription<TFields extends FieldValues>(
    onValidSubmit: ISubscriptionSummaryProps<TFields>['onValidSubmit'],
) {
    const { handleSubmit } = useFormContext<TFields>()

    return () =>
        new Promise<void>(async (resolve, reject) => {
            try {
                await handleSubmit(onValidSubmit, (validationErrors) => {
                    reject(
                        Object.values(validationErrors)[0] ??
                            new Error('Unknown validation error'),
                    )
                })(undefined)

                resolve()
            } catch (error) {
                reject(error)
            }
        })
}
