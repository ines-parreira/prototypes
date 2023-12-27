import {automationProduct, helpdeskProduct} from 'fixtures/productPrices'
import {AccountFeature} from '../../state/currentAccount/types'
import {
    getCheapestPriceNameForFeature,
    convertLegacyPlanNameToPublicPlanName,
} from '../paywalls'

const publicPrices = [...helpdeskProduct.prices, ...automationProduct.prices]

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
        'Free plan',
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

describe('getCheapestPriceNameForFeature()', () => {
    it.each(Object.values(AccountFeature))(
        'should return the cheaper plan to access the feature %s',
        (feature) => {
            expect(
                getCheapestPriceNameForFeature(feature, publicPrices)
            ).toMatchSnapshot()
        }
    )

    it('should return undefined when feature not found in the plans', () => {
        expect(
            getCheapestPriceNameForFeature(AccountFeature.InstagramComment, [])
        ).toBe(undefined)
    })
})
