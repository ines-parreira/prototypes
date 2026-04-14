import { BILLING_INTERNAL_PATH } from '@repo/billing'
import { useHistory } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import { isGorgiasApiError } from 'models/api/types'
import { useUpdateInternalSubscription } from 'models/billing/queries'
import type { BillingState, PlanId, ProductType } from 'models/billing/types'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import type { ResolvedPlan } from './useInternalPlanEditor'

const FALLBACK_MESSAGE = 'Failed to update subscription. Please try again.'
const STALE_RESOURCE_MESSAGE =
    'This subscription was modified since you loaded this page.'

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

function dispatchApplyError(
    error: unknown,
    dispatch: ReturnType<typeof useAppDispatch>,
) {
    const message = isGorgiasApiError(error)
        ? error.response.data.error.msg
        : FALLBACK_MESSAGE

    if (isStaleResourceError(error)) {
        dispatch(
            notify({
                status: NotificationStatus.Error,
                message: STALE_RESOURCE_MESSAGE,
                noAutoDismiss: true,
                showDismissButton: true,
                buttons: [
                    {
                        primary: true,
                        name: 'Refresh',
                        onClick: () => window.location.reload(),
                    },
                ],
            }),
        )
        return
    }

    dispatch(
        notify({
            status: NotificationStatus.Error,
            message,
            noAutoDismiss: true,
            showDismissButton: true,
        }),
    )
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
                    message: 'Subscription updated',
                }),
            )
            history.push(BILLING_INTERNAL_PATH)
        } catch (err) {
            dispatchApplyError(err, dispatch)
        }
    }

    return { apply, isSubmitting: isLoading }
}
