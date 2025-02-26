import { isAiAgentOnboarding } from './isAiAgentOnboarding'

describe('isAiAgentOnboarding', () => {
    it('should return true for base onboarding path', () => {
        expect(isAiAgentOnboarding('/app/ai-agent/onboarding')).toBe(true)
    })

    it('should return true for shop-specific onboarding path', () => {
        expect(
            isAiAgentOnboarding('/app/ai-agent/shopify/store-name/onboarding'),
        ).toBe(true)
    })

    it('should return false for unrelated paths', () => {
        expect(isAiAgentOnboarding('/app/home')).toBe(false)
        expect(isAiAgentOnboarding('/app/ai-agent/dashboard')).toBe(false)
        expect(isAiAgentOnboarding('/app/ai-agent/onboarding-steps')).toBe(
            false,
        )
    })

    it('should return false for similar but incorrect paths', () => {
        expect(isAiAgentOnboarding('/app/ai-agent/onboarding/extra')).toBe(
            false,
        )
        expect(isAiAgentOnboarding('/app/ai-agent//onboarding')).toBe(false)
    })

    it('should handle edge cases', () => {
        expect(isAiAgentOnboarding('')).toBe(false)
        expect(isAiAgentOnboarding('/')).toBe(false)
        expect(isAiAgentOnboarding('/app/')).toBe(false)
        expect(isAiAgentOnboarding('/random/path')).toBe(false)
    })
})
