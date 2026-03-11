import { renderHook } from '@testing-library/react'

import type { Trial } from 'models/aiAgent/types'
import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { useTrialAccess } from 'pages/aiAgent/trial/hooks/useTrialAccess'

import { useHasAccessToOpportunities } from './useHasAccessToOpportunities'

jest.mock('pages/aiAgent/trial/hooks/useTrialAccess')

const mockUseTrialAccess = useTrialAccess as jest.Mock

const FUTURE_DATE = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
const PAST_DATE = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

const makeStoreTrial = (
    shopName: string,
    overrides?: Partial<Trial['trial']>,
): Trial => ({
    shopName,
    shopType: 'shopify',
    type: TrialType.ShoppingAssistant,
    trial: {
        startDatetime: '2026-02-01T00:00:00Z',
        endDatetime: FUTURE_DATE,
        account: {
            optInDatetime: '2026-02-01T00:00:00Z',
            optOutDatetime: null,
            plannedUpgradeDatetime: null,
            actualUpgradeDatetime: null,
            actualTerminationDatetime: null,
        },
        ...overrides,
    },
})

describe('useHasAccessToOpportunities', () => {
    beforeEach(() => {
        mockUseTrialAccess.mockReturnValue(
            createMockTrialAccess({ trials: [] }),
        )
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
                    trials: [],
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
                    trials: [],
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
                    trials: [],
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
                    trials: [],
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(true)
        })
    })

    describe('ShoppingAssistant trial', () => {
        it('returns true when endDatetime is in the future and not terminated', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trials: [makeStoreTrial('my-shop')],
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(true)
        })

        it('returns false when endDatetime is in the past even if not terminated', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trials: [
                        makeStoreTrial('my-shop', { endDatetime: PAST_DATE }),
                    ],
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })

        it('returns false when actualTerminationDatetime is set even if endDatetime is in the future', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trials: [
                        makeStoreTrial('my-shop', {
                            account: {
                                optInDatetime: null,
                                optOutDatetime: null,
                                plannedUpgradeDatetime: null,
                                actualUpgradeDatetime: null,
                                actualTerminationDatetime: PAST_DATE,
                            },
                        }),
                    ],
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })

        it('returns false when no trial matches the shopName', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trials: [makeStoreTrial('other-shop')],
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })

        it('returns false when only an AiAgent trial exists for the shop', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({
                    trials: [
                        {
                            ...makeStoreTrial('my-shop'),
                            type: TrialType.AiAgent,
                        },
                    ],
                }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })

        it('returns false when trials is empty', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({ trials: [] }),
            )

            const { result } = renderHook(() =>
                useHasAccessToOpportunities('my-shop'),
            )

            expect(result.current).toBe(false)
        })

        it('returns false when trials is undefined', () => {
            mockUseTrialAccess.mockReturnValue(
                createMockTrialAccess({ trials: undefined }),
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
