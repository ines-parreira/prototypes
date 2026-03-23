import { formatIntentName } from './utils'

describe('formatIntentName', () => {
    it('capitalizes each part and joins with " / "', () => {
        expect(formatIntentName('order::status')).toBe('Order / Status')
    })

    it('capitalizes multi-word parts', () => {
        expect(formatIntentName('order::missing item')).toBe(
            'Order / Missing Item',
        )
    })

    it('handles names without a namespace separator', () => {
        expect(formatIntentName('other')).toBe('Other')
    })

    it('handles more than two parts', () => {
        expect(formatIntentName('a::b::c')).toBe('A / B / C')
    })

    it('handles names with special characters like "&"', () => {
        expect(formatIntentName('promotion & discount::information')).toBe(
            'Promotion & Discount / Information',
        )
    })
})
