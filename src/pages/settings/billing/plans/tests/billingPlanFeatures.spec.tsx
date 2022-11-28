import {
    proMonthlyAutomationPrice,
    proMonthlyHelpdeskPrice,
} from 'fixtures/productPrices'
import {getPlanCardFeaturesForPrices} from '../billingPlanFeatures'

describe('billingPlanFeatures', () => {
    describe('getPlanCardFeaturesForPrices', () => {
        it('should return the features for prices', () => {
            expect(
                getPlanCardFeaturesForPrices([
                    proMonthlyHelpdeskPrice,
                    proMonthlyAutomationPrice,
                ])
            ).toMatchSnapshot()
        })

        it('should return the features for prices with hardcoded features', () => {
            expect(
                getPlanCardFeaturesForPrices(
                    [proMonthlyHelpdeskPrice, proMonthlyAutomationPrice],
                    true
                )
            ).toMatchSnapshot()
        })
    })
})
