export enum PlanName {
    Starter = 'Starter',
    Basic = 'Basic',
    Pro = 'Pro',
    Advanced = 'Advanced',
    Enterprise = 'Enterprise',
    Custom = 'Custom',
    Free = 'Free',
}

export enum Cadence {
    Month = 'month',
    Quarter = 'quarter',
    Year = 'year',
}

type PlanFeatureMetadata = {
    enabled?: boolean
}

type PlanWithFeatures = {
    cadence: string
    features: Record<string, PlanFeatureMetadata | undefined>
    amount: number
    name: string
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
    featureName: string,
    plans: readonly PlanWithFeatures[],
) => {
    return plans
        .filter((plan) => plan.cadence === Cadence.Month)
        .filter((plan) => plan.features[featureName]?.enabled)
        .sort((a, b) => a.amount - b.amount)
        .find(() => true)?.name
}
