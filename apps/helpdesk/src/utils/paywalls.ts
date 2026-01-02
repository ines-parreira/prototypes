import type { AutomatePlan, HelpdeskPlan } from '../models/billing/types'
import { Cadence } from '../models/billing/types'
import type {
    AccountFeature,
    AccountFeatureMetadata,
} from '../state/currentAccount/types'

export enum PlanName {
    Starter = 'Starter',
    Basic = 'Basic',
    Pro = 'Pro',
    Advanced = 'Advanced',
    Enterprise = 'Enterprise',
    Custom = 'Custom',
    Free = 'Free',
}

export const convertLegacyPlanNameToPublicPlanName = (
    legacyPlanName: string,
): PlanName => {
    const name = legacyPlanName.split(' ')[0]

    return name === 'Standard'
        ? PlanName.Basic
        : name === 'Team'
          ? PlanName.Pro
          : ![
                  PlanName.Starter,
                  PlanName.Basic,
                  PlanName.Pro,
                  PlanName.Advanced,
                  PlanName.Custom,
                  PlanName.Free,
              ].includes(name as PlanName)
            ? PlanName.Enterprise
            : (name as PlanName)
}

export const getCheapestPlanNameForFeature = (
    featureName: AccountFeature,
    plans: (HelpdeskPlan | AutomatePlan)[],
) => {
    return plans
        .filter((plan) => plan.cadence === Cadence.Month)
        .filter(
            (plan) =>
                (
                    plan.features as Record<
                        AccountFeature,
                        AccountFeatureMetadata
                    >
                )[featureName]?.enabled,
        )
        .sort((a, b) => a.amount - b.amount)
        .find(() => true)?.name
}
