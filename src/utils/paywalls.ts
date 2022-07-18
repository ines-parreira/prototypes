import {AccountFeature} from '../state/currentAccount/types'
import {Plan, PlanInterval} from '../models/billing/types'

import {isFeatureEnabled} from './account'

export enum PlanName {
    Starter = 'Starter',
    Basic = 'Basic',
    Pro = 'Pro',
    Advanced = 'Advanced',
    Enterprise = 'Enterprise',
}

export const convertLegacyPlanNameToPublicPlanName = (
    legacyPlanName: string
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
          ].includes(name as PlanName)
        ? PlanName.Enterprise
        : (name as PlanName)
}

export const getCheapestPlanNameForFeature = (
    featureName: AccountFeature,
    plans: Record<string, Plan>
): string | null => {
    const plan = Object.values(plans)
        .filter((plan) => plan.interval === PlanInterval.Month)
        .sort((planA, planB) => planA.amount - planB.amount)
        .find(
            (plan) =>
                plan.features[featureName] &&
                isFeatureEnabled(plan.features[featureName])
        )
    return plan ? plan.name : null
}
