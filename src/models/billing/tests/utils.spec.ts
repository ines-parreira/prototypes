import {
    basicMonthlyHelpdeskPlan,
    basicMonthlyAutomationPlan,
    smsProduct,
    starterHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    convertPlan0,
    voicePlan0,
} from 'fixtures/productPrices'

import {
    getCheapestPrice,
    getFormattedAmount,
    getOverageUnitPriceFormatted,
    getPlanPriceFormatted,
    getPlanUnitsPerCadence,
    getProductLabel,
    isAutomate,
    isHelpdesk,
    isStarterTier,
} from '../utils'

describe('isHelpdesk', () => {
    it.each([
        [basicMonthlyHelpdeskPlan, true],
        [basicMonthlyAutomationPlan, false],
    ])(
        'should validate if the price is of helpdesk price',
        (price, expectedResult) => {
            expect(isHelpdesk(price)).toBe(expectedResult)
        }
    )
})

describe('isAutomate', () => {
    it.each([
        [basicMonthlyHelpdeskPlan, false],
        [basicMonthlyAutomationPlan, true],
    ])(
        'should validate if the price is of Automate price',
        (plan, expectedResult) => {
            expect(isAutomate(plan)).toBe(expectedResult)
        }
    )
})

describe('isStarterTierPrice', () => {
    it.each([
        [basicMonthlyHelpdeskPlan, false],
        [basicYearlyHelpdeskPlan, false],
        [starterHelpdeskPlan, true],
    ])(
        'should validate if the price is of Starter tier',
        (price, expectedResult) => {
            expect(isStarterTier(price)).toBe(expectedResult)
        }
    )
})

describe('getFormattedAmount', () => {
    it('should return a formatted amount', () => {
        expect(getFormattedAmount(1234)).toBe(12.34)
    })
})

describe('getCheapestPrice', () => {
    it('returns cheapest non-null amount amongst prices', () => {
        expect(
            getCheapestPrice(smsProduct.prices, smsProduct.prices[0].interval)
        ).toEqual(smsProduct.prices[0])
    })
})

describe('getProductLabel', () => {
    it.each([
        [basicMonthlyHelpdeskPlan, undefined],
        [voicePlan0, 'Trial'],
        [convertPlan0, 'Pay as you go'],
    ])(
        'should return the product label for the given price and type',
        (plan, expectedResult) => {
            expect(getProductLabel(plan)).toBe(expectedResult)
        }
    )
})

describe('getPlanPriceFormatted', () => {
    it('returns the plan price formatted', () => {
        expect(getPlanPriceFormatted(basicMonthlyHelpdeskPlan)).toEqual('$60')
    })

    it('returns the price formatted even with no plan', () => {
        expect(getPlanPriceFormatted(null)).toEqual('$0')
        expect(getPlanPriceFormatted(undefined)).toEqual('$0')
    })
})

describe('getOverageUnitPriceFormatted', () => {
    it('returns the overage unit price formatted', () => {
        expect(getOverageUnitPriceFormatted(basicMonthlyHelpdeskPlan)).toEqual(
            '$0.40'
        )
    })

    it('returns a overage unit price formatted even if not plan', () => {
        expect(getOverageUnitPriceFormatted(null)).toEqual('$0')
        expect(getOverageUnitPriceFormatted(undefined)).toEqual('$0')
    })
})

describe('getPlanUnitsPerCadence', () => {
    it('returns the correct string', () => {
        expect(getPlanUnitsPerCadence(basicMonthlyHelpdeskPlan)).toEqual(
            '300 tickets/month'
        )
    })
})
