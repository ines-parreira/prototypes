import { renderHook } from '@testing-library/react'

import { usePromoCardVideoContent } from '../hooks/usePromoCardVideoContent'
import { TrialType } from '../types/ShoppingAssistant'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

describe('usePromoCardVideoContent', () => {
    const mockUseFlag = jest.mocked(require('core/flags').useFlag)
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseFlag.mockReturnValue(true)
    })

    describe('When AI Agent trial', () => {
        it('should return AI Agent trial video content with trial promo video', () => {
            const { result } = renderHook(() =>
                usePromoCardVideoContent({
                    trialType: TrialType.AiAgent,
                    isAiAgentTrial: true,
                    isAIAgentOnboarded: false,
                }),
            )

            expect(result.current).toEqual({
                poster: 'test-file-stub',
                alt: 'AI Agent Demo',
                videoUrl: 'test-file-stub',
                className: expect.stringContaining('videoThumbnailAiAgent'),
            })
        })

        it('should return AI Agent trial video content regardless of AI Agent onboarding status', () => {
            const { result } = renderHook(() =>
                usePromoCardVideoContent({
                    trialType: TrialType.AiAgent,
                    isAiAgentTrial: true,
                    isAIAgentOnboarded: true,
                }),
            )

            expect(result.current).toEqual({
                poster: 'test-file-stub',
                alt: 'AI Agent Demo',
                videoUrl: 'test-file-stub',
                className: expect.stringContaining('videoThumbnailAiAgent'),
            })
        })

        it('should return AI Agent trial video content when AI Agent onboarding status is unknown', () => {
            const { result } = renderHook(() =>
                usePromoCardVideoContent({
                    trialType: TrialType.AiAgent,
                    isAiAgentTrial: true,
                    isAIAgentOnboarded: undefined,
                }),
            )

            expect(result.current).toEqual({
                poster: 'test-file-stub',
                alt: 'AI Agent Demo',
                videoUrl: 'test-file-stub',
                className: expect.stringContaining('videoThumbnailAiAgent'),
            })
        })
    })

    describe('When Shopping Assistant Trial', () => {
        describe('When AI Agent is not onboarded', () => {
            it('should return AI Agent preview video content', () => {
                const { result } = renderHook(() =>
                    usePromoCardVideoContent({
                        trialType: TrialType.ShoppingAssistant,
                        isAiAgentTrial: false,
                        isAIAgentOnboarded: false,
                    }),
                )

                expect(result.current).toEqual({
                    poster: 'test-file-stub',
                    alt: 'Shopping Assistant Demo',
                    videoUrl: 'test-file-stub',
                    className: expect.stringContaining('videoThumbnailAiAgent'),
                })
            })
        })

        describe('When AI Agent is onboarded', () => {
            it('should return default Shopping Assistant video content', () => {
                const { result } = renderHook(() =>
                    usePromoCardVideoContent({
                        trialType: TrialType.ShoppingAssistant,
                        isAiAgentTrial: false,
                        isAIAgentOnboarded: true,
                    }),
                )

                expect(result.current).toEqual({
                    poster: 'test-file-stub',
                    alt: 'Shopping Assistant Demo',
                    videoUrl: 'test-file-stub',
                    className: expect.stringContaining('videoThumbnail'),
                })
            })
        })

        describe('When AI Agent onboarding status is unknown', () => {
            it('should return default Shopping Assistant video content', () => {
                const { result } = renderHook(() =>
                    usePromoCardVideoContent({
                        trialType: TrialType.ShoppingAssistant,
                        isAiAgentTrial: false,
                        isAIAgentOnboarded: undefined,
                    }),
                )

                expect(result.current).toEqual({
                    poster: 'test-file-stub',
                    alt: 'Shopping Assistant Demo',
                    videoUrl: 'test-file-stub',
                    className: expect.stringContaining('videoThumbnail'),
                })
            })
        })
    })

    describe('When feature flag is disabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
        })

        describe('When AI Agent trial', () => {
            it('should return AI Agent trial video content', () => {
                const { result } = renderHook(() =>
                    usePromoCardVideoContent({
                        trialType: TrialType.AiAgent,
                        isAiAgentTrial: true,
                        isAIAgentOnboarded: false,
                    }),
                )

                expect(result.current).toEqual({
                    poster: 'test-file-stub',
                    alt: 'AI Agent Demo',
                    videoUrl: 'test-file-stub',
                    className: expect.stringContaining('videoThumbnailAiAgent'),
                })
            })
        })

        describe('When Shopping Assistant Trial', () => {
            it('should return default Shopping Assistant video content regardless of AI Agent onboarding status', () => {
                const { result } = renderHook(() =>
                    usePromoCardVideoContent({
                        trialType: TrialType.ShoppingAssistant,
                        isAiAgentTrial: false,
                        isAIAgentOnboarded: false,
                    }),
                )

                expect(result.current).toEqual({
                    poster: 'test-file-stub',
                    alt: 'Shopping Assistant Demo',
                    videoUrl: 'test-file-stub',
                    className: expect.stringContaining('videoThumbnail'),
                })
            })

            it('should return default Shopping Assistant video content when AI Agent is onboarded', () => {
                const { result } = renderHook(() =>
                    usePromoCardVideoContent({
                        trialType: TrialType.ShoppingAssistant,
                        isAiAgentTrial: false,
                        isAIAgentOnboarded: true,
                    }),
                )

                expect(result.current).toEqual({
                    poster: 'test-file-stub',
                    alt: 'Shopping Assistant Demo',
                    videoUrl: 'test-file-stub',
                    className: expect.stringContaining('videoThumbnail'),
                })
            })

            it('should return default Shopping Assistant video content when AI Agent onboarding status is unknown', () => {
                const { result } = renderHook(() =>
                    usePromoCardVideoContent({
                        trialType: TrialType.ShoppingAssistant,
                        isAiAgentTrial: false,
                        isAIAgentOnboarded: undefined,
                    }),
                )

                expect(result.current).toEqual({
                    poster: 'test-file-stub',
                    alt: 'Shopping Assistant Demo',
                    videoUrl: 'test-file-stub',
                    className: expect.stringContaining('videoThumbnail'),
                })
            })
        })
    })
})
