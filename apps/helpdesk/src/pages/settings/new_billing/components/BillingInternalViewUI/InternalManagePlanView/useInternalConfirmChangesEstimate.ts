import { useMemo } from 'react'

import { useGetBillingInternalEstimatesSubscription } from '@gorgias/helpdesk-queries'
import type {
    BillingInternalEstimatesSubscription,
    GetBillingInternalEstimatesSubscriptionParams,
} from '@gorgias/helpdesk-types'

import { ProductType } from 'models/billing/types'
import type { Invoice } from 'state/billing/types'

import type { ResolvedPlan } from './useInternalPlanEditor'

const ESTIMATE_FRESHNESS_MS = 5 * 60 * 1000

function getEffectivePlanId(
    resolvedPlan: ResolvedPlan | undefined,
): string | undefined {
    if (!resolvedPlan || resolvedPlan.status === 'removed') return undefined
    return resolvedPlan.plan?.plan_id
}

export function useInternalConfirmChangesEstimate(
    isOpen: boolean,
    resolvedPlans: ResolvedPlan[],
    subscriptionResourceVersion: number,
    subscriptionRenewalRampResourceVersion?: number,
    reactivate?: boolean,
) {
    const plansByProductType = useMemo(() => {
        const map: Partial<Record<ProductType, ResolvedPlan>> = {}
        for (const resolved of resolvedPlans) {
            map[resolved.productType] = resolved
        }
        return map
    }, [resolvedPlans])

    const helpdeskPlanId = getEffectivePlanId(
        plansByProductType[ProductType.Helpdesk],
    )

    // TODO: remove cast once @gorgias/helpdesk-types adds `reactivate` to GetBillingInternalEstimatesSubscriptionParams
    const params = useMemo<
        GetBillingInternalEstimatesSubscriptionParams & { reactivate?: boolean }
    >(
        () => ({
            new_helpdesk_plan_id: helpdeskPlanId ?? '',
            new_automate_plan_id: getEffectivePlanId(
                plansByProductType[ProductType.Automation],
            ),
            new_convert_plan_id: getEffectivePlanId(
                plansByProductType[ProductType.Convert],
            ),
            new_voice_plan_id: getEffectivePlanId(
                plansByProductType[ProductType.Voice],
            ),
            new_sms_plan_id: getEffectivePlanId(
                plansByProductType[ProductType.SMS],
            ),
            subscription_resource_version: subscriptionResourceVersion,
            subscription_renewal_ramp_resource_version:
                subscriptionRenewalRampResourceVersion,
            reactivate: reactivate || undefined,
        }),
        [
            helpdeskPlanId,
            plansByProductType,
            subscriptionResourceVersion,
            subscriptionRenewalRampResourceVersion,
            reactivate,
        ],
    )

    const enabled =
        isOpen && subscriptionResourceVersion != null && !!helpdeskPlanId

    return useGetBillingInternalEstimatesSubscription(
        params as GetBillingInternalEstimatesSubscriptionParams,
        {
            query: {
                enabled,
                staleTime: ESTIMATE_FRESHNESS_MS,
                refetchInterval: ESTIMATE_FRESHNESS_MS,
                retry: false,
                // TODO: remove cast once @gorgias/helpdesk-types adds `current_invoices_to_pay` and `estimated_prorated_credits_charges` to BillingInternalEstimatesSubscription
                select: (response) => {
                    const data =
                        response.data as BillingInternalEstimatesSubscription & {
                            current_invoices_to_pay?: Invoice[] | null
                            estimated_prorated_credits_charges?: object | null
                        }
                    return {
                        ...data,
                        balance_due:
                            data.balance_due == null
                                ? data.balance_due
                                : data.balance_due / 100,
                    }
                },
            },
        },
    )
}
