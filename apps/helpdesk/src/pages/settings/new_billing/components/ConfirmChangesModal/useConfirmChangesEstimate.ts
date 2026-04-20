import { useMemo } from 'react'

import type { PlansByProduct, SelectedPlans } from '@repo/billing'
import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useGetBillingEstimatesSubscription } from '@gorgias/helpdesk-queries'
import type { GetBillingEstimatesSubscriptionParams } from '@gorgias/helpdesk-types'

import { ProductType } from 'models/billing/types'

function getEffectivePlanId(
    productType: ProductType,
    selectedPlans: SelectedPlans,
    plansByProduct: PlansByProduct,
): string | undefined {
    const currentPlanId = plansByProduct[productType].current?.plan_id
    const selected = selectedPlans[productType]

    if (!selected?.isSelected) {
        return undefined
    }

    if (selected.plan && selected.plan.plan_id !== currentPlanId) {
        return selected.plan.plan_id
    }

    return currentPlanId
}

export function useConfirmChangesEstimate(
    isOpen: boolean,
    selectedPlans: SelectedPlans,
    plansByProduct: PlansByProduct,
    subscriptionResourceVersion: number,
    subscriptionRenewalRampResourceVersion?: number,
) {
    const isMidCycleUpgradeEnabled = useFlag(
        FeatureFlagKey.MidCycleUpgradeBillingLogic,
    )

    const helpdeskPlanId = getEffectivePlanId(
        ProductType.Helpdesk,
        selectedPlans,
        plansByProduct,
    )

    const params = useMemo<GetBillingEstimatesSubscriptionParams>(
        () => ({
            new_helpdesk_plan_id: helpdeskPlanId ?? '',
            new_automate_plan_id: getEffectivePlanId(
                ProductType.Automation,
                selectedPlans,
                plansByProduct,
            ),
            new_convert_plan_id: getEffectivePlanId(
                ProductType.Convert,
                selectedPlans,
                plansByProduct,
            ),
            new_voice_plan_id: getEffectivePlanId(
                ProductType.Voice,
                selectedPlans,
                plansByProduct,
            ),
            new_sms_plan_id: getEffectivePlanId(
                ProductType.SMS,
                selectedPlans,
                plansByProduct,
            ),
            subscription_resource_version: subscriptionResourceVersion,
            subscription_renewal_ramp_resource_version:
                subscriptionRenewalRampResourceVersion,
        }),
        [
            helpdeskPlanId,
            selectedPlans,
            plansByProduct,
            subscriptionResourceVersion,
            subscriptionRenewalRampResourceVersion,
        ],
    )

    const enabled =
        isOpen &&
        isMidCycleUpgradeEnabled &&
        !!subscriptionResourceVersion &&
        !!helpdeskPlanId

    return useGetBillingEstimatesSubscription(params, {
        query: {
            enabled,
            staleTime: 0,
            retry: false,
        },
    })
}
