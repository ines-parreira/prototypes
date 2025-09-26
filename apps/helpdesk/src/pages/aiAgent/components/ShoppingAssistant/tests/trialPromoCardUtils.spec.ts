import { TrialType } from '../types/ShoppingAssistant'
import { getPromoCardTitle } from '../utils/trialPromoCardUtils'

describe('getPromoCardTitle', () => {
    const createMockData = (overrides = {}) => ({
        isExpandingTrialExperienceMilestone2Enabled: false,
        trialType: TrialType.AiAgent,
        isTrialProgress: false,
        canSeeTrialCTA: false,
        isOnboarded: true,
        ...overrides,
    })

    describe('AI Agent trial type', () => {
        it('should return "AI Agent trial" when trial is in progress', () => {
            const mockData = createMockData({
                isTrialProgress: true,
            })

            const result = getPromoCardTitle(
                mockData.isExpandingTrialExperienceMilestone2Enabled,
                mockData.trialType,
                mockData.isTrialProgress,
                mockData.canSeeTrialCTA,
                mockData.isOnboarded,
            )

            expect(result).toBe('AI Agent trial')
        })

        it('should return "AI Agent" when user can see trial CTA and not in progress', () => {
            const mockData = createMockData({
                canSeeTrialCTA: true,
            })

            const result = getPromoCardTitle(
                mockData.isExpandingTrialExperienceMilestone2Enabled,
                mockData.trialType,
                mockData.isTrialProgress,
                mockData.canSeeTrialCTA,
                mockData.isOnboarded,
            )

            expect(result).toBe('AI Agent')
        })

        it('should return "Try AI Agent for free" when cannot see trial CTA and trial is not in progress', () => {
            const mockData = createMockData()

            const result = getPromoCardTitle(
                mockData.isExpandingTrialExperienceMilestone2Enabled,
                mockData.trialType,
                mockData.isTrialProgress,
                mockData.canSeeTrialCTA,
                mockData.isOnboarded,
            )

            expect(result).toBe('Try AI Agent for free')
        })
    })

    describe('Shopping Assistant trial type', () => {
        describe('when feature flag is disabled', () => {
            it('should return "Unlock new AI Agent skills" regardless of other conditions', () => {
                const mockData = createMockData({
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: false,
                })

                const result = getPromoCardTitle(
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.trialType,
                    mockData.isTrialProgress,
                    mockData.canSeeTrialCTA,
                    mockData.isOnboarded,
                )

                expect(result).toBe('Unlock new AI Agent skills')
            })
        })

        describe('when feature flag is enabled', () => {
            it('should return "Shopping Assistant trial" when trial is in progress', () => {
                const mockData = createMockData({
                    isExpandingTrialExperienceMilestone2Enabled: true,
                    trialType: TrialType.ShoppingAssistant,
                    isTrialProgress: true,
                })

                const result = getPromoCardTitle(
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.trialType,
                    mockData.isTrialProgress,
                    mockData.canSeeTrialCTA,
                    mockData.isOnboarded,
                )

                expect(result).toBe('Shopping Assistant trial')
            })

            it('should return "AI Agent & Shopping Assistant" when AI agent is not onboarded and trial is not in progress', () => {
                const mockData = createMockData({
                    isExpandingTrialExperienceMilestone2Enabled: true,
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: false,
                })

                const result = getPromoCardTitle(
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.trialType,
                    mockData.isTrialProgress,
                    mockData.canSeeTrialCTA,
                    mockData.isOnboarded,
                )

                expect(result).toBe('AI Agent & Shopping Assistant')
            })

            it('should return "Unlock new AI Agent skills" when AI agent is onboarded and trial is not in progress', () => {
                const mockData = createMockData({
                    isExpandingTrialExperienceMilestone2Enabled: true,
                    trialType: TrialType.ShoppingAssistant,
                })

                const result = getPromoCardTitle(
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.trialType,
                    mockData.isTrialProgress,
                    mockData.canSeeTrialCTA,
                    mockData.isOnboarded,
                )

                expect(result).toBe('Unlock new AI Agent skills')
            })

            it('should return "Unlock new AI Agent skills" when isOnboarded is undefined', () => {
                const mockData = createMockData({
                    isExpandingTrialExperienceMilestone2Enabled: true,
                    trialType: TrialType.ShoppingAssistant,
                    isOnboarded: undefined,
                })

                const result = getPromoCardTitle(
                    mockData.isExpandingTrialExperienceMilestone2Enabled,
                    mockData.trialType,
                    mockData.isTrialProgress,
                    mockData.canSeeTrialCTA,
                    mockData.isOnboarded,
                )

                expect(result).toBe('Unlock new AI Agent skills')
            })
        })
    })
})
