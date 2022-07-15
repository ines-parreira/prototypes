import {
    getEnterprisePlanCardFeatures,
    getPlanCardFeaturesForPlan,
} from '../billingPlanFeatures'
import {
    advancedPlan,
    basicPlan,
    customPlan,
    enterprisePlan,
    proPlan,
    starterPlan,
} from '../../../../../fixtures/subscriptionPlan'
import {Plan} from '../../../../../models/billing/types'

describe('billingPlanFeatures', () => {
    describe('getEnterprisePlanCardFeatures', () => {
        it('should return plan card features for the enterprise plan', () => {
            expect(getEnterprisePlanCardFeatures()).toMatchSnapshot()
        })
    })

    describe('getPlanCardFeaturesForPlan', () => {
        it.each<[string, Plan]>([
            ['Starter plan', starterPlan],
            ['Basic plan', basicPlan],
            ['Pro plan', proPlan],
            ['Advanced plan', advancedPlan],
            ['Enterprise plan', enterprisePlan],
            ['Custom plan', customPlan],
        ])(
            'should return plan card features for %s plan',
            (suiteName, plan) => {
                expect(
                    getPlanCardFeaturesForPlan({
                        plan: {...plan, currencySign: '$'},
                        enableHardCodedFeatures: true,
                    })
                ).toMatchSnapshot()
            }
        )

        it(`should return plan card features for legacy plan`, () => {
            expect(
                getPlanCardFeaturesForPlan({
                    plan: {...basicPlan, currencySign: '$'},
                    enableHardCodedFeatures: false,
                })
            ).toMatchSnapshot()
        })

        it(`should return plan card features with disabled help center`, () => {
            expect(
                getPlanCardFeaturesForPlan({
                    plan: {...basicPlan, currencySign: '$'},
                    enableHardCodedFeatures: false,
                })
            ).toMatchSnapshot()
        })
    })
})
