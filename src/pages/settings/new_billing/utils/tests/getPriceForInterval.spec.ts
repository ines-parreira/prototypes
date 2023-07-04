import {
    basicMonthlyHelpdeskPrice,
    basicYearlyHelpdeskPrice,
} from 'fixtures/productPrices'
import {HelpdeskPrice, PlanInterval} from 'models/billing/types'
import {
    PriceForIntervalProps,
    getPriceForInterval,
} from '../getPriceForInterval'

describe('getPriceForInterval', () => {
    const mockPrices: HelpdeskPrice[] = [
        basicMonthlyHelpdeskPrice,
        basicYearlyHelpdeskPrice,
    ]

    const mockCurrentPrice: HelpdeskPrice = basicYearlyHelpdeskPrice

    const setup = (
        props: Partial<PriceForIntervalProps<HelpdeskPrice>> = {}
    ) => {
        const defaultProps: PriceForIntervalProps<HelpdeskPrice> = {
            prices: mockPrices,
            currentPrice: mockCurrentPrice,
            interval: PlanInterval.Month,
            ...props,
        }

        return getPriceForInterval(defaultProps)
    }

    it('should return the price for the given interval if it exists', () => {
        const result = setup()
        expect(result).toBe(basicMonthlyHelpdeskPrice)
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
