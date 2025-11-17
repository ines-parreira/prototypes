import type { CurrentPlans } from '@gorgias/helpdesk-queries'

export type {
    BillingState,
    BasePlan,
    CurrentPlans,
} from '@gorgias/helpdesk-queries'

export type BillingPlanName = keyof CurrentPlans

export { useBillingState } from './hooks/useBillingState'
export { useBillingPlans } from './hooks/useBillingPlans'
export { useBillingPlan } from './hooks/useBillingPlan'
export { useHasBillingPlan } from './hooks/useHasBillingPlan'
export { useHasCreditCard } from './hooks/useHasCreditCard'
