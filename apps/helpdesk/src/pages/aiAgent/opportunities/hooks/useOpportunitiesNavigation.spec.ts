import { renderHook } from '@testing-library/react'

import { OpportunityType } from 'pages/aiAgent/opportunities/enums'
import type { Opportunity } from 'pages/aiAgent/opportunities/utils/mapAiArticlesToOpportunities'

import { useOpportunitiesNavigation } from './useOpportunitiesNavigation'

describe('useOpportunitiesNavigation', () => {
    const mockOpportunities: Opportunity[] = [
        {
            id: '1',
            key: 'ai_1',
            title: 'First Opportunity',
            content: 'First content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '2',
            key: 'ai_2',
            title: 'Second Opportunity',
            content: 'Second content',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
        },
        {
            id: '3',
            key: 'ai_3',
            title: 'Third Opportunity',
            content: 'Third content',
            type: OpportunityType.RESOLVE_CONFLICT,
        },
    ]

    describe('early return conditions', () => {
        it('returns default state when selectedOpportunity is null', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: null,
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current).toEqual({
                isFirst: true,
                isLast: true,
                position: 0,
            })
        })

        it('returns default state when opportunities is empty array', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: [],
                }),
            )

            expect(result.current).toEqual({
                isFirst: true,
                isLast: true,
                position: 0,
            })
        })

        it('returns default state when both selectedOpportunity and opportunities are null/empty', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: null,
                    opportunities: [],
                }),
            )

            expect(result.current).toEqual({
                isFirst: true,
                isLast: true,
                position: 0,
            })
        })

        it('returns default state when selectedOpportunity is undefined', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: undefined as any,
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current).toEqual({
                isFirst: true,
                isLast: true,
                position: 0,
            })
        })

        it('returns default state when opportunities has zero length', () => {
            // This specifically tests the opportunities.length === 0 condition
            const emptyArray: Opportunity[] = []
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: emptyArray,
                }),
            )

            expect(result.current).toEqual({
                isFirst: true,
                isLast: true,
                position: 0,
            })
        })
    })

    describe('normal navigation cases', () => {
        it('returns correct navigation state for first opportunity', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current).toEqual({
                isFirst: true,
                isLast: false,
                position: 0,
            })
        })

        it('returns correct navigation state for middle opportunity', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[1],
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current).toEqual({
                isFirst: false,
                isLast: false,
                position: 1,
            })
        })

        it('returns correct navigation state for last opportunity', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[2],
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current).toEqual({
                isFirst: false,
                isLast: true,
                position: 2,
            })
        })

        it('returns correct navigation state for single opportunity', () => {
            const singleOpportunity = [mockOpportunities[0]]
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: singleOpportunity,
                }),
            )

            expect(result.current).toEqual({
                isFirst: true,
                isLast: true,
                position: 0,
            })
        })

        it('returns correct position when selectedOpportunity is not found in opportunities', () => {
            const nonExistentOpportunity: Opportunity = {
                id: 'non-existent',
                key: 'non-existent',
                title: 'Non-existent',
                content: 'Content',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
            }

            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: nonExistentOpportunity,
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current).toEqual({
                isFirst: false,
                isLast: false,
                position: -1,
            })
        })
    })
})
