import { BILLING_INTERNAL_PATH } from '@repo/billing'
import { useHistory } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import { useUpdateInternalSubscription } from 'models/billing/queries'
import type { BillingState, PlanId, ProductType } from 'models/billing/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import type { ResolvedPlan } from './useInternalPlanEditor'

function buildNewPlans(
    resolvedPlans: ResolvedPlan[],
): Partial<Record<ProductType, PlanId>> {
    const newPlans: Partial<Record<ProductType, PlanId>> = {}
    for (const { productType, plan, status } of resolvedPlans) {
        if (status !== 'removed' && plan) {
            newPlans[productType] = plan.plan_id
        }
    }
    return newPlans
}

export function useApplyInternalPlanChanges(
    billingState: BillingState | undefined,
    resolvedPlans: ResolvedPlan[],
) {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const { mutateAsync, isLoading } = useUpdateInternalSubscription()

    async function apply(generateInvoice: boolean) {
        if (!billingState) return
        try {
            await mutateAsync({
                current_resource_version:
                    billingState.subscription.resource_version,
                new_plans: buildNewPlans(resolvedPlans),
                invoice: { generate: generateInvoice },
            })

            dispatch(
                notify({
                    status: NotificationStatus.Success,
                    message: 'Subscription updated successfully.',
                }),
            )
            history.push(BILLING_INTERNAL_PATH)
        } catch {
            dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message: 'Failed to update subscription. Please try again.',
                }),
            )
        }
    }

    return { apply, isSubmitting: isLoading }
}
