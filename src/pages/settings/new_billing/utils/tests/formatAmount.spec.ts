import {formatAmount, formatNumTickets} from '../formatAmount' // Replace 'yourFile' with the actual file name

describe('formatAmount', () => {
    it('should format amount with currency when currency is provided', () => {
        const amount = 1000
        const currency = 'USD'
        const formatted = formatAmount(amount, currency)
        expect(formatted).toBe('$1,000')
    })

    it('should format amount with default currency when currency is null', () => {
        const amount = 2000
        const currency = null
        const formatted = formatAmount(amount, currency)
        expect(formatted).toBe('$2,000')
    })
})

describe('formatNumTickets', () => {
    it('should format number of tickets without decimal places', () => {
        const numTickets = 10.5
        const formatted = formatNumTickets(numTickets)
        expect(formatted).toBe('11')
    })

    it('should format number of tickets without decimal places for whole numbers and with thousands separator', () => {
        const numTickets = 1500
        const formatted = formatNumTickets(numTickets)
        expect(formatted).toBe('1,500')
    })
})
