import { InvoiceCadence } from '@gorgias/helpdesk-types'

import {
    basicMonthlyAutomationPlan,
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
    convertPlan0,
    smsProduct,
    starterHelpdeskPlan,
    voicePlan0,
} from 'fixtures/plans'

import type { AutomatePlan, HelpdeskPlan } from '../types'
import { Cadence, ProductType } from '../types'
import {
    getCadenceMonths,
    getCadenceName,
    getCheapestPlan,
    getFormattedAmount,
    getInvoiceCadenceName,
    getOverageUnitPriceFormatted,
    getPlanPriceFormatted,
    getPlanUnitsPerCadence,
    getProductInfo,
    getProductLabel,
    isAutomate,
    isHelpdesk,
    isOtherCadenceDowngrade,
    isOtherCadenceUpgrade,
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
        },
    )
})

describe('isAutomate', () => {
    it.each([
        [basicMonthlyHelpdeskPlan, false],
        [basicMonthlyAutomationPlan, true],
    ])(
        'should validate if the price is of AI Agent price',
        (plan, expectedResult) => {
            expect(isAutomate(plan)).toBe(expectedResult)
        },
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
        },
    )
})

describe('getFormattedAmount', () => {
    it('should return a formatted amount', () => {
        expect(getFormattedAmount(1234)).toBe(12.34)
    })
})

describe('getCheapestPrice', () => {
    it('returns cheapest non-null amount amongst prices', () => {
        // Find the cheapest non-zero monthly plan
        const cheapestMonthlyPlan = smsProduct.prices.find(
            (plan) => plan.amount > 0 && plan.cadence === Cadence.Month,
        )
        expect(
            getCheapestPlan(smsProduct.prices, smsProduct.prices[0].cadence),
        ).toEqual(cheapestMonthlyPlan)
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
        },
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
            '$0.40',
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
            `300 tickets/${Cadence.Month}`,
        )
    })
})

describe('getCadenceName', () => {
    it.each(Object.values(Cadence))(
        'it should return a valid name for %s',
        (cadence: Cadence) => {
            expect(getCadenceName(cadence))
        },
    )

    it('should throw an error if given an invalid cadence', () => {
        expect(() => getCadenceName('not a cadence' as Cadence)).toThrow(
            'Invalid cadence value',
        )
    })
})

describe('getInvoiceCadenceName', () => {
    it('should return "Monthly" for InvoiceCadence.Month', () => {
        expect(getInvoiceCadenceName(InvoiceCadence.Month)).toBe('Monthly')
    })

    it('should return "Quarterly" for InvoiceCadence.Quarter', () => {
        expect(getInvoiceCadenceName(InvoiceCadence.Quarter)).toBe('Quarterly')
    })

    it('should return "Biannually" for InvoiceCadence.Biannual', () => {
        expect(getInvoiceCadenceName(InvoiceCadence.Biannual)).toBe(
            'Biannually',
        )
    })

    it('should return "Yearly" for InvoiceCadence.Year', () => {
        expect(getInvoiceCadenceName(InvoiceCadence.Year)).toBe('Yearly')
    })

    it.each(Object.values(InvoiceCadence))(
        'should return a valid name for %s',
        (invoiceCadence: InvoiceCadence) => {
            const result = getInvoiceCadenceName(invoiceCadence)
            expect(result).toBeTruthy()
            expect(typeof result).toBe('string')
        },
    )

    it('should throw an error if given an invalid invoice cadence', () => {
        expect(() =>
            getInvoiceCadenceName('not a cadence' as InvoiceCadence),
        ).toThrow('Invalid invoice cadence value')
    })
})

describe('getCadenceMonths', () => {
    it.each(Object.values(Cadence))(
        'it should return a valid number for %s',
        (cadence: Cadence) => {
            expect(getCadenceMonths(cadence))
        },
    )

    it('should throw an error if given an invalid cadence', () => {
        expect(() => getCadenceMonths('not a cadence' as Cadence)).toThrow(
            'Invalid cadence value',
        )
    })
})

describe('isOtherCadenceUpgrade', () => {
    const cadenceValues = Object.values(Cadence)
    const cadenceCartesianProduct = cadenceValues.flatMap((a) =>
        cadenceValues.map((b) => [a, b]),
    )

    it.each(cadenceCartesianProduct)(
        'it should return if %s could be upgraded to %s',
        (cadence: Cadence, other: Cadence) => {
            const isUpgrade = isOtherCadenceUpgrade(cadence, other)
            expect(isUpgrade).toEqual(
                getCadenceMonths(cadence) < getCadenceMonths(other),
            )
        },
    )

    const cadencePlusInvalidOptions = [
        ...cadenceValues.map((a) => [a, 'not a cadence' as Cadence]),
        ...cadenceValues.map((b) => ['not a cadence' as Cadence, b]),
    ]

    it.each(cadencePlusInvalidOptions)(
        'should throw an error if given an invalid cadence (cadence: %s, other: %s)',
        (cadence: Cadence, other: Cadence) => {
            expect(() => isOtherCadenceUpgrade(cadence, other)).toThrow(
                'Invalid cadence value',
            )
        },
    )
})

describe('isOtherCadenceDowngrade', () => {
    const cadenceValues = Object.values(Cadence)
    const cadenceCartesianProduct = cadenceValues.flatMap((a) =>
        cadenceValues.map((b) => [a, b]),
    )

    it.each(cadenceCartesianProduct)(
        'it should return if %s could be downgraded to %s',
        (cadence: Cadence, other: Cadence) => {
            const isDowngrade = isOtherCadenceDowngrade(cadence, other)
            expect(isDowngrade).toEqual(
                getCadenceMonths(cadence) > getCadenceMonths(other),
            )
        },
    )

    const cadencePlusInvalidOptions = [
        ...cadenceValues.map((a) => [a, 'not a cadence' as Cadence]),
        ...cadenceValues.map((b) => ['not a cadence' as Cadence, b]),
    ]

    it.each(cadencePlusInvalidOptions)(
        'should throw an error if given an invalid cadence (cadence: %s, other: %s)',
        (cadence: Cadence, other: Cadence) => {
            expect(() => isOtherCadenceDowngrade(cadence, other)).toThrow(
                'Invalid cadence value',
            )
        },
    )
})

describe('getProductInfo', () => {
    const basicMonthlyHelpdeskPlanGen5: HelpdeskPlan = {
        ...basicMonthlyHelpdeskPlan,
        generation: 5,
    }

    const basicMonthlyHelpdeskPlanGen4: HelpdeskPlan = {
        ...basicMonthlyHelpdeskPlan,
        generation: 4,
    }

    const basicMonthlyAutomationPlanGen6: AutomatePlan = {
        ...basicMonthlyAutomationPlan,
        generation: 6,
    }
    const basicMonthlyAutomationPlanGen5: AutomatePlan = {
        ...basicMonthlyAutomationPlan,
        generation: 5,
    }

    it.each([4, undefined])(
        'returns helpdesk information without mentioning AI Agent for generation 4',
        (generation: number | undefined) => {
            const plan =
                generation === undefined
                    ? basicMonthlyHelpdeskPlan
                    : basicMonthlyHelpdeskPlanGen4

            const helpdeskProductInfo = getProductInfo(
                ProductType.Helpdesk,
                plan,
            )
            expect(helpdeskProductInfo.tooltip).toBe(
                'Tickets with a response sent from Gorgias by human agents or rules.',
            )
        },
    )

    it('returns helpdesk information including mentioning AI Agent for generation 5', () => {
        const helpdeskProductInfo = getProductInfo(
            ProductType.Helpdesk,
            basicMonthlyHelpdeskPlanGen5,
        )
        expect(helpdeskProductInfo.tooltip).toBe(
            'Tickets with a response sent from Gorgias by any sender (human agents, rules, or AI Agent).',
        )
    })

    it.each([5, 6, undefined])(
        'returns automate information without mention of helpdesk tickets',
        (generation: number | undefined) => {
            const plan =
                generation === undefined
                    ? basicMonthlyAutomationPlan
                    : {
                          5: basicMonthlyAutomationPlanGen5,
                          6: basicMonthlyAutomationPlanGen6,
                      }[generation]

            const automationProductInfo = getProductInfo(
                ProductType.Automation,
                plan,
            )
            expect(automationProductInfo.tooltip).toBe(
                'Tickets fully resolved by AI Agent and automations, without human intervention.',
            )
        },
    )
})
