import {
    basicHelpdeskPriceFeatures,
    automationPriceFeatures,
    basicMonthlyHelpdeskPrice,
    basicMonthlyAutomationPrice,
    products,
} from 'fixtures/productPrices'
import {
    createAutomationPlanFromProducts,
    createHelpdeskPlanFromProducts,
    getFullPrice,
    getPricesByPlanId,
    isHelpdeskPrice,
    getFormattedAmount,
} from '../utils'

describe('getFullPrice', () => {
    it('should return the full price from discounted price and the percentage of discount presented in decimal', () => {
        const result = getFullPrice(1000, 0.2)
        expect(result).toBe(1250)
    })

    it('should return the discount price as full price if there is no discount', () => {
        const result = getFullPrice(1000, 0)
        expect(result).toBe(1000)
    })

    it('should throw if the discount is a value lesser than 0 or equal to 1 or bigger', () => {
        expect(() => getFullPrice(1000, -1)).toThrow()
        expect(() => getFullPrice(1000, 1)).toThrow()
        expect(() => getFullPrice(1000, 2)).toThrow()
    })
})

describe('createHelpdeskPlanFromProducts', () => {
    const helpdeskPlan = {
        id: 'basic-monthly-usd-4',
        amount: 60,
        cost_per_ticket: 0.4,
        currency: 'usd',
        features: basicHelpdeskPriceFeatures,
        free_tickets: 300,
        integrations: 150,
        interval: 'month',
        is_legacy: false,
        limits: {
            messages: {default: 100, max: 100, min: 75},
            tickets: {default: 100, max: 100, min: 75},
        },
        name: 'Basic',
        order: 2,
        phone_limits: {billing: 50},
        public: true,
        trial_period_days: 7,
        automation_addon_equivalent_plan: null,
        automation_addon_discount: 0,
        currencySign: '$',
    }

    it('should create a helpdesk plan from product price when no equivalent automation product price is provided', () => {
        expect(
            createHelpdeskPlanFromProducts(basicMonthlyHelpdeskPrice)
        ).toEqual(helpdeskPlan)
    })

    it('should create a helpdesk plan with an equivalent addon plan id from helpdesk and automation product price', () => {
        expect(
            createHelpdeskPlanFromProducts(
                basicMonthlyHelpdeskPrice,
                basicMonthlyAutomationPrice
            )
        ).toEqual({
            ...helpdeskPlan,
            automation_addon_equivalent_plan:
                'basic-automation-full-price-monthly-usd-4',
        })
    })
})

describe('createAutomationPlanFromProducts', () => {
    it('should create an automation plan from helpdesk and automation product prices', () => {
        const automationPlan = {
            amount: 90,
            cost_per_ticket: 0.6,
            currency: 'usd',
            features: {
                ...basicHelpdeskPriceFeatures,
                ...automationPriceFeatures,
            },
            free_tickets: 300,
            integrations: 150,
            interval: 'month',
            is_legacy: false,
            limits: {
                messages: {default: 100, max: 100, min: 75},
                tickets: {default: 100, max: 100, min: 75},
            },
            name: 'Basic',
            order: 2,
            phone_limits: {billing: 50},
            public: true,
            trial_period_days: 7,
            automation_addon_discount: 0,
            automation_addon_included: true,
            id: 'basic-automation-full-price-monthly-usd-4',
            automation_addon_equivalent_plan: 'basic-monthly-usd-4',
            currencySign: '$',
        }

        expect(
            createAutomationPlanFromProducts(
                basicMonthlyAutomationPrice,
                basicMonthlyHelpdeskPrice
            )
        ).toEqual(automationPlan)
    })
})

describe('getPricesByPlanId', () => {
    it('should return the corresponding price for a no-addon base plan', () => {
        expect(getPricesByPlanId(products, 'basic-monthly-usd-4')).toEqual({
            prices: [basicMonthlyHelpdeskPrice.price_id],
        })
    })

    it('should return the corresponding prices for a plan with an automation addon', () => {
        expect(
            getPricesByPlanId(
                products,
                'basic-automation-full-price-monthly-usd-4'
            )
        ).toEqual({
            prices: [
                basicMonthlyHelpdeskPrice.price_id,
                basicMonthlyAutomationPrice.price_id,
            ],
        })
    })

    it('should return no price for a non-existing plan', () => {
        expect(getPricesByPlanId(products, 'foo-plan')).toEqual({
            prices: [],
        })
    })
})

describe('isHelpdeskPrice', () => {
    it.each([
        [basicMonthlyHelpdeskPrice, true],
        [basicMonthlyAutomationPrice, false],
    ])(
        'should validate if the price is of helpdesk price',
        (price, expectedResult) => {
            expect(isHelpdeskPrice(price)).toBe(expectedResult)
        }
    )
})

describe('getFormattedAmount', () => {
    it('should return a formatted amount', () => {
        expect(getFormattedAmount(1234)).toBe(12.34)
    })
})
