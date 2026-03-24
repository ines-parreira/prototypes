import {
    Cadence,
    convertLegacyPlanNameToPublicPlanName,
    getCheapestPlanNameForFeature,
    PlanName,
} from '../paywalls'

type TestPlan = {
    cadence: string
    features: Record<string, { enabled?: boolean } | undefined>
    amount: number
    name: string
}

describe('convertLegacyPlanNameToPublicPlanName', () => {
    it.each([
        ['Starter', PlanName.Starter],
        ['Basic Plan', PlanName.Basic],
        ['Standard Plan', PlanName.Basic],
        ['Team Plan', PlanName.Pro],
        ['Free plan', PlanName.Free],
        ['Enterprise Plan', PlanName.Enterprise],
        ['Unknown Plan', PlanName.Enterprise],
    ])(
        'converts %s to %s',
        (legacyPlanName: string, expectedPlanName: PlanName) => {
            expect(convertLegacyPlanNameToPublicPlanName(legacyPlanName)).toBe(
                expectedPlanName,
            )
        },
    )
})

describe('getCheapestPlanNameForFeature', () => {
    it('returns the cheapest monthly plan with the feature enabled', () => {
        const plans: readonly TestPlan[] = [
            {
                cadence: Cadence.Year,
                amount: 10,
                name: PlanName.Starter,
                features: {
                    automate: { enabled: true },
                },
            },
            {
                cadence: Cadence.Month,
                amount: 59,
                name: PlanName.Basic,
                features: {
                    automate: { enabled: true },
                },
            },
            {
                cadence: Cadence.Month,
                amount: 49,
                name: PlanName.Pro,
                features: {
                    automate: { enabled: true },
                },
            },
        ]

        expect(getCheapestPlanNameForFeature('automate', plans)).toBe(
            PlanName.Pro,
        )
    })

    it('returns undefined when no monthly plan has the feature enabled', () => {
        const plans: readonly TestPlan[] = [
            {
                cadence: Cadence.Year,
                amount: 20,
                name: PlanName.Basic,
                features: {
                    automate: { enabled: true },
                },
            },
            {
                cadence: Cadence.Month,
                amount: 99,
                name: PlanName.Pro,
                features: {
                    automate: { enabled: false },
                },
            },
        ]

        expect(getCheapestPlanNameForFeature('automate', plans)).toBeUndefined()
    })

    it('returns undefined when the feature metadata is missing', () => {
        const plans: readonly TestPlan[] = [
            {
                cadence: Cadence.Month,
                amount: 39,
                name: PlanName.Basic,
                features: {},
            },
        ]

        expect(getCheapestPlanNameForFeature('automate', plans)).toBeUndefined()
    })
})
