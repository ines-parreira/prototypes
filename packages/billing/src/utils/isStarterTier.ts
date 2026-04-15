import type { HelpdeskPlan } from '../types'

export function isStarterTier(
    plan: HelpdeskPlan | undefined,
): plan is HelpdeskPlan {
    return !!plan?.plan_id.startsWith('starter-')
}
