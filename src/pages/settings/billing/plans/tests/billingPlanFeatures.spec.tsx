import {
    advancedMonthlyHelpdeskPlan,
    basicMonthlyHelpdeskPlan,
    customHelpdeskPlan,
    legacyBasicHelpdeskPlan,
    proMonthlyAutomationPlan,
    proMonthlyHelpdeskPlan,
    starterHelpdeskPlan,
} from 'fixtures/productPrices'
import {HelpdeskPlan} from 'models/billing/types'
import {
    getEnterprisePlanCardFeatures,
    getPlanCardFeaturesForPrices,
} from '../billingPlanFeatures'

describe('billingPlanFeatures', () => {
    describe('getPlanCardFeaturesForPrices', () => {
        it('should return the features for prices', () => {
            expect(
                getPlanCardFeaturesForPrices([
                    proMonthlyHelpdeskPlan,
                    proMonthlyAutomationPlan,
                ])
            ).toMatchSnapshot()
        })

        it('should return the features for prices with hardcoded features', () => {
            expect(
                getPlanCardFeaturesForPrices(
                    [proMonthlyHelpdeskPlan, proMonthlyAutomationPlan],
                    true
                )
            ).toMatchSnapshot()
        })

        it.each<[string, HelpdeskPlan]>([
            ['Starter price', starterHelpdeskPlan],
            ['Basic price', basicMonthlyHelpdeskPlan],
            ['Pro price', proMonthlyHelpdeskPlan],
            ['Advanced price', advancedMonthlyHelpdeskPlan],
            ['Custom price', customHelpdeskPlan],
        ])('should return plan card features for %s', (suiteName, price) => {
            expect(
                getPlanCardFeaturesForPrices([price], true)
            ).toMatchSnapshot()
        })

        it(`should return plan card features for legacy price`, () => {
            expect(
                getPlanCardFeaturesForPrices([legacyBasicHelpdeskPlan], false)
            ).toMatchSnapshot()
        })

        it(`should return plan card features with disabled help center`, () => {
            expect(
                getPlanCardFeaturesForPrices([basicMonthlyHelpdeskPlan], false)
            ).toMatchSnapshot()
        })
    })

    describe('getEnterprisePlanCardFeatures', () => {
        it('should return plan card features for the enterprise plan', () => {
            expect(getEnterprisePlanCardFeatures()).toMatchSnapshot()
        })
    })
})
