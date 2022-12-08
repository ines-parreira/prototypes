import {
    advancedMonthlyHelpdeskPrice,
    basicMonthlyHelpdeskPrice,
    customHelpdeskPrice,
    legacyBasicHelpdeskPrice,
    proMonthlyHelpdeskPrice,
    starterHelpdeskPrice,
} from 'fixtures/productPrices'
import {HelpdeskPrice} from 'models/billing/types'
import {
    getEnterprisePlanCardFeatures,
    getPlanCardFeaturesForPrices,
} from '../billingPlanFeatures'

describe('billingPlanFeatures', () => {
    describe('getEnterprisePlanCardFeatures', () => {
        it('should return plan card features for the enterprise plan', () => {
            expect(getEnterprisePlanCardFeatures()).toMatchSnapshot()
        })
    })

    describe('getPlanCardFeaturesForPrices', () => {
        it.each<[string, HelpdeskPrice]>([
            ['Starter price', starterHelpdeskPrice],
            ['Basic price', basicMonthlyHelpdeskPrice],
            ['Pro price', proMonthlyHelpdeskPrice],
            ['Advanced price', advancedMonthlyHelpdeskPrice],
            ['Custom price', customHelpdeskPrice],
        ])('should return plan card features for %s', (suiteName, price) => {
            expect(
                getPlanCardFeaturesForPrices([price], true)
            ).toMatchSnapshot()
        })

        it(`should return plan card features for legacy price`, () => {
            expect(
                getPlanCardFeaturesForPrices([legacyBasicHelpdeskPrice], false)
            ).toMatchSnapshot()
        })

        it(`should return plan card features with disabled help center`, () => {
            expect(
                getPlanCardFeaturesForPrices([basicMonthlyHelpdeskPrice], false)
            ).toMatchSnapshot()
        })
    })
})
