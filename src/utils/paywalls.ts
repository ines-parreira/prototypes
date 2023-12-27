import {
    AccountFeature,
    AccountFeatureMetadata,
} from '../state/currentAccount/types'
import {
    AutomationPrice,
    HelpdeskPrice,
    PlanInterval,
} from '../models/billing/types'

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
              PlanName.Custom,
              PlanName.Free,
          ].includes(name as PlanName)
        ? PlanName.Enterprise
        : (name as PlanName)
}

export const getCheapestPriceNameForFeature = (
    featureName: AccountFeature,
    prices: (HelpdeskPrice | AutomationPrice)[]
) => {
    return prices
        .filter((price) => price.interval === PlanInterval.Month)
        .find(
            (price) =>
                (
                    price.features as Record<
                        AccountFeature,
                        AccountFeatureMetadata
                    >
                )[featureName]?.enabled
        )?.name
}
