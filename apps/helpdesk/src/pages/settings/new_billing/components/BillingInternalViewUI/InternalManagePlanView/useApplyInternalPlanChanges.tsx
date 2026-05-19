import { BILLING_INTERNAL_PATH } from '@repo/billing'
import { useHistory } from 'react-router-dom'

import { Button, toast } from '@gorgias/axiom'

import { isGorgiasApiError } from 'models/api/types'
import { useUpdateInternalSubscription } from 'models/billing/queries'
import type { BillingState, PlanId, ProductType } from 'models/billing/types'

import type { ResolvedPlan } from './useInternalPlanEditor'

const FALLBACK_MESSAGE = 'Failed to update subscription. Please try again.'
const STALE_RESOURCE_MESSAGE =
    'This subscription was modified since you loaded this page.'
const refreshSubscriptionButton = (
    <Button
        onClick={() => window.location.reload()}
        size="sm"
        variant="tertiary"
    >
        Refresh
    </Button>
)

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

function isStaleResourceError(error: unknown): boolean {
    if (!isGorgiasApiError(error)) return false
    const msg = error.response.data.error.msg
    return typeof msg === 'string' && msg.includes('subscription got modified')
}

function showApplyErrorToast(error: unknown) {
    const message = isGorgiasApiError(error)
        ? error.response.data.error.msg
        : FALLBACK_MESSAGE

    if (isStaleResourceError(error)) {
        toast.error(STALE_RESOURCE_MESSAGE, {
            duration: Infinity,
            inlineActions: refreshSubscriptionButton,
        })
        return
    }

    toast.error(message, { duration: Infinity })
}

export function useApplyInternalPlanChanges(
    billingState: BillingState | undefined,
    resolvedPlans: ResolvedPlan[],
) {
    const history = useHistory()
    const { mutateAsync, isLoading } = useUpdateInternalSubscription()

    async function apply(generateInvoice: boolean, reactivate?: boolean) {
        if (!billingState) return
        try {
            await mutateAsync({
                current_resource_version:
                    billingState.subscription.resource_version,
                subscription_renewal_ramp_resource_version:
                    billingState.subscription.schedule_resource_version ??
                    undefined,
                new_plans: buildNewPlans(resolvedPlans),
                invoice: { generate: generateInvoice },
                reactivate,
            })

            toast.success('Subscription updated')
            history.push(BILLING_INTERNAL_PATH)
        } catch (err) {
            showApplyErrorToast(err)
        }
    }

    return { apply, isSubmitting: isLoading }
}
