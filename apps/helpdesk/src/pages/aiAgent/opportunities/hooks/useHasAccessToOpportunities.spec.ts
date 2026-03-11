import { renderHook } from '@testing-library/react'

import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

import { useHasAccessToOpportunities } from './useHasAccessToOpportunities'

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')

const mockUseTrialAccess = useTrialAccess as jest.Mock

describe('useHasAccessToOpportunities', () => {
    beforeEach(() => {
        mockUseTrialAccess.mockReturnValue(createMockTrialAccess())
    })

    it('passes shopName to useTrialAccess', () => {
        renderHook(() => useHasAccessToOpportunities('my-shop'))

        expect(mockUseTrialAccess).toHaveBeenCalledWith('my-shop')
    })

    describe('USD6+ plan', () => {
        it('returns true when plan generation is exactly 6', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    currentAutomatePlan: { generation: 6 },
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(true)
        })

        it('returns true when plan generation is above 6', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    currentAutomatePlan: { generation: 8 },
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(true)
        })

        it('returns false when plan generation is below 6', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    currentAutomatePlan: { generation: 5 },
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })

        it('returns true regardless of trial status when on USD6+ plan', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    currentAutomatePlan: { generation: 6 },
                    hasAnyTrialActive: false,
                    hasCurrentStoreTrialActive: false,
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(true)
        })
    })

    describe('ShoppingAssistant trial', () => {
        it('returns true when hasCurrentStoreTrialActive is true and trialType is ShoppingAssistant', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    hasCurrentStoreTrialActive: true,
                    trialType: TrialType.ShoppingAssistant,
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(true)
        })

        it('returns true when current store trial is active and trialType is ShoppingAssistant (with shopName)', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    hasCurrentStoreTrialActive: true,
                    trialType: TrialType.ShoppingAssistant,
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(true)
        })

        it('returns false when trial is active but trialType is not ShoppingAssistant', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    hasAnyTrialActive: true,
                    trialType: TrialType.AiAgent,
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })

        it('returns false when trialType is ShoppingAssistant but no trial is active', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    hasAnyTrialActive: false,
                    trialType: TrialType.ShoppingAssistant,
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })

        it('returns false when shopName is provided but only hasAnyTrialActive is true (not store-specific)', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    hasAnyTrialActive: true,
                    hasCurrentStoreTrialActive: false,
                    trialType: TrialType.ShoppingAssistant,
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })

        it('returns false when hasCurrentStoreTrialActive is false even if hasAnyTrialActive is true', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    hasAnyTrialActive: true,
                    hasCurrentStoreTrialActive: false,
                    trialType: TrialType.ShoppingAssistant,
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })
    })

    describe('no access', () => {
        it('returns false when no plan and no active trial', () => {
            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })
    })
})
