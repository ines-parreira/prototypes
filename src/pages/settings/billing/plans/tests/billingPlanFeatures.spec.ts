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
} from '../../../../../fixtures/subscriptionPlan'
import {Plan} from '../../../../../models/billing/types'

describe('billingPlanFeatures', () => {
    describe('getEnterprisePlanCardFeatures', () => {
        it('should return plan card features for the enterprise plan', () => {
            expect(getEnterprisePlanCardFeatures()).toMatchSnapshot()
        })
    })

    describe('getPlanCardFeaturesForPlan', () => {
        describe.each<[string, Plan]>([
            ['Basic plan', basicPlan],
            ['Pro plan', proPlan],
            ['Advanced plan', advancedPlan],
            ['Enterprise plan', enterprisePlan],
            ['Custom plan', customPlan],
        ])('%s', (suiteName, plan) => {
            it(`should return plan card features`, () => {
                expect(
                    getPlanCardFeaturesForPlan(
                        {...plan, currencySign: '$'},
                        false
                    )
                ).toMatchSnapshot()
            })

            it(`should return legacy plan card features`, () => {
                expect(
                    getPlanCardFeaturesForPlan(
                        {...plan, currencySign: '$'},
                        true
                    )
                ).toMatchSnapshot()
            })
        })
    })
})
