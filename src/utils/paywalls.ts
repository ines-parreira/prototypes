import {AccountFeature} from '../state/currentAccount/types'
import {Plan, PlanInterval} from '../models/billing/types'

export const getCheapestPlanForFeature = (
    feature: AccountFeature,
    plans: Record<string, Plan>
): string =>
    Object.values(plans)
        .filter((plan) => plan.interval === PlanInterval.Month)
        .sort((planA, planB) => planA.amount - planB.amount)
        .find((plan) => plan.features[feature])!.name

export const isLegacyPlan = (plan: Plan): boolean =>
    !plan.public && plan.id !== 'enterprise'
