import {AutomationPrice} from 'models/billing/types'
import {
    convertSecondsToHours,
    formatOnBlur,
    formatOnFocus,
    formatValue,
    getAutomateSubscriptionPrice,
    getFirstResponseTimeWithAutomate,
    getResolutionTimeWithAutomate,
} from '../utils'

describe('convertSecondsToHours', () => {
    it('should convert seconds to hours', () => {
        const seconds = 3600 // 1 hour
        const expectedHours = '1'
        const result = convertSecondsToHours(seconds)
        expect(result).toBe(expectedHours)
    })
})

describe('formatOnBlur', () => {
    it('should format value on blur', () => {
        const setValue = jest.fn()
        const val = '123456'
        const expectedValue = '123456hrs'
        formatOnBlur(setValue, val)
        expect(setValue).toHaveBeenCalledWith(expectedValue)
    })
})

describe('formatOnFocus', () => {
    it('should format value on focus', () => {
        const setValue = jest.fn()
        const val = '123456'
        const expectedValue = 123456
        formatOnFocus(setValue, val)
        expect(setValue).toHaveBeenCalledWith(expectedValue)
    })
})

describe('formatValue', () => {
    it('should format value', () => {
        const val = '123456'
        const expectedValue = '123,456'
        const result = formatValue(val)
        expect(result).toBe(expectedValue)
    })
})

describe('getAutomateSubscriptionPrice', () => {
    it('should get the Automate subscription price', () => {
        const automateSubscriptionPrices = [
            {
                num_quota_tickets: 1000,
                amount: 1000,
            },
            {
                num_quota_tickets: 2000,
                amount: 2000,
            },
        ]
        const numberOfClosedTickets = 2500
        const expectedPrice = 10
        const result = getAutomateSubscriptionPrice(
            automateSubscriptionPrices as AutomationPrice[],
            numberOfClosedTickets
        )
        expect(result).toBe(expectedPrice)

        const numberOfClosedTickets2 = 4500
        const expectedPrice2 = 20
        const result2 = getAutomateSubscriptionPrice(
            automateSubscriptionPrices as AutomationPrice[],
            numberOfClosedTickets2
        )
        expect(result2).toBe(expectedPrice2)
    })
})

describe('getFirstResponseTimeWithAutomate', () => {
    it('should get the first response time with automate', () => {
        const val = 12
        const expectedTime = 8.4 // 12 * 0.7
        const result = getFirstResponseTimeWithAutomate(val)
        expect(result).toBe(expectedTime)
    })
})

describe('getResolutionTimeWithAutomate', () => {
    it('should get the resolution time with automate', () => {
        const val = 12
        const expectedTime = 8.4 // 12 * 0.7
        const result = getResolutionTimeWithAutomate(val)
        expect(result).toBe(expectedTime)
    })
})
