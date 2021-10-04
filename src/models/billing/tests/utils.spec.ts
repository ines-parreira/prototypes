import {
    getEquivalentAutomationPlanId,
    getEquivalentRegularPlanId,
} from '../utils'

describe('getEquivalentAutomationPlanId', () => {
    it('should return automation plan id from regular id', () => {
        const result = getEquivalentAutomationPlanId('custom-yearly-usd-2-6')
        expect(result).toBe('custom-automation-yearly-usd-2-6')
    })

    it('should return automation plan id from automation id', () => {
        const result = getEquivalentAutomationPlanId(
            'custom-automation-yearly-usd-2-6'
        )
        expect(result).toBe('custom-automation-yearly-usd-2-6')
    })
})

describe('getEquivalentRegularPlanId', () => {
    it('should return regular plan id from regular id', () => {
        const result = getEquivalentRegularPlanId('custom-yearly-usd-2-6')
        expect(result).toBe('custom-yearly-usd-2-6')
    })

    it('should return regular plan id from automation id', () => {
        const result = getEquivalentRegularPlanId(
            'custom-automation-yearly-usd-2-6'
        )
        expect(result).toBe('custom-yearly-usd-2-6')
    })
})
