import {advancedPlan, basicPlan, proPlan} from '../../fixtures/subscriptionPlan'
import {AccountFeature} from '../../state/currentAccount/types'
import {Plan} from '../../models/billing/types'
import {getCheapestPlanNameForFeature} from '../paywalls'

const publicPlans: Record<string, Plan> = {
    [basicPlan.id]: basicPlan,
    [proPlan.id]: proPlan,
    [advancedPlan.id]: advancedPlan,
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
