import { useMemo } from 'react'

import { useGetBillingInternalEstimatesSubscription } from '@gorgias/helpdesk-queries'
import type { GetBillingInternalEstimatesSubscriptionParams } from '@gorgias/helpdesk-types'

import { ProductType } from 'models/billing/types'

import type { ResolvedPlan } from './useInternalPlanEditor'

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

    const params = useMemo<GetBillingInternalEstimatesSubscriptionParams>(
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
        }),
        [
            helpdeskPlanId,
            plansByProductType,
            subscriptionResourceVersion,
            subscriptionRenewalRampResourceVersion,
        ],
    )

    const enabled =
        isOpen && subscriptionResourceVersion != null && !!helpdeskPlanId

    return useGetBillingInternalEstimatesSubscription(params, {
        query: {
            enabled,
            staleTime: 0,
            retry: false,
            select: (response) => ({
                ...response.data,
                balance_due:
                    response.data.balance_due == null
                        ? response.data.balance_due
                        : response.data.balance_due / 100,
            }),
        },
    })
}
