import {
    basicMonthlyHelpdeskPlan,
    basicYearlyHelpdeskPlan,
} from 'fixtures/productPrices'
import {HelpdeskPlan, PlanInterval} from 'models/billing/types'
import {
    PriceForIntervalProps,
    getPriceForInterval,
} from '../getPriceForInterval'

describe('getPriceForInterval', () => {
    const mockPrices: HelpdeskPlan[] = [
        basicMonthlyHelpdeskPlan,
        basicYearlyHelpdeskPlan,
    ]

    const mockCurrentPrice: HelpdeskPlan = basicYearlyHelpdeskPlan

    const setup = (
        props: Partial<PriceForIntervalProps<HelpdeskPlan>> = {}
    ) => {
        const defaultProps: PriceForIntervalProps<HelpdeskPlan> = {
            prices: mockPrices,
            currentPrice: mockCurrentPrice,
            interval: PlanInterval.Month,
            ...props,
        }

        return getPriceForInterval(defaultProps)
    }

    it('should return the price for the given interval if it exists', () => {
        const result = setup()
        expect(result).toBe(basicMonthlyHelpdeskPlan)
    })

    it('should return the currentPrice if the price for the given interval does not exist', () => {
        const result = setup({interval: PlanInterval.Year, prices: []})
        expect(result).toBe(mockCurrentPrice)
    })

    it('should return undefined if the currentPrice is not provided', () => {
        const result = setup({currentPrice: undefined})
        expect(result).toBeUndefined() // The currentPrice is not provided, so the result is undefined
    })
})
