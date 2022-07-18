import {
    advancedPlan,
    basicPlan,
    proPlan,
    basicAutomationPlan,
    proAutomationPlan,
    starterPlan,
} from '../../fixtures/subscriptionPlan'
import {AccountFeature} from '../../state/currentAccount/types'
import {Plan} from '../../models/billing/types'
import {
    getCheapestPlanNameForFeature,
    convertLegacyPlanNameToPublicPlanName,
} from '../paywalls'

const publicPlans: Record<string, Plan> = {
    [starterPlan.id]: starterPlan,
    [basicPlan.id]: basicPlan,
    [proPlan.id]: proPlan,
    [advancedPlan.id]: advancedPlan,
    [basicAutomationPlan.id]: basicAutomationPlan,
    [proAutomationPlan.id]: proAutomationPlan,
}

describe('getCheapestPlanNameForFeature()', () => {
    it.each(Object.values(AccountFeature))(
        'should return the cheaper plan to access the feature %s',
        (feature) => {
            expect(
                getCheapestPlanNameForFeature(feature, publicPlans)
            ).toMatchSnapshot()
        }
    )

    it('should return null when feature not found in the plans', () => {
        expect(
            getCheapestPlanNameForFeature(AccountFeature.InstagramComment, {})
        ).toBe(null)
    })
})

describe('convertLegacyPlanNameToPublicPlanName()', () => {
    const planNames = [
        'Custom',
        'Basic',
        'Advanced',
        'Pro',
        'Starter',
        'Basic Plan',
        'Pro Plan',
        'Advanced Plan',
        'Standard Plan',
        'Team Plan',
    ]
    it.each(planNames)(
        'should return the public name for the legacy name %s',
        (name) => {
            expect(
                convertLegacyPlanNameToPublicPlanName(name)
            ).toMatchSnapshot()
        }
    )
})
