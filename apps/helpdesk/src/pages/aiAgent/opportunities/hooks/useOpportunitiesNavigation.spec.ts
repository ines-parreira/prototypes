import { renderHook } from '@testing-library/react'

import { OpportunityType } from 'pages/aiAgent/opportunities/enums'
import type { Opportunity } from 'pages/aiAgent/opportunities/types'
import { ResourceType } from 'pages/aiAgent/opportunities/types'

import { useOpportunitiesNavigation } from './useOpportunitiesNavigation'

describe('useOpportunitiesNavigation', () => {
    const mockOpportunities: Opportunity[] = [
        {
            id: '1',
            key: 'ai_1',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: 'First Opportunity',
            resources: [
                {
                    title: 'First Opportunity',
                    content: 'First content',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                },
            ],
        },
        {
            id: '2',
            key: 'ai_2',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            insight: 'Second Opportunity',
            resources: [
                {
                    title: 'Second Opportunity',
                    content: 'Second content',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                },
            ],
        },
        {
            id: '3',
            key: 'ai_3',
            type: OpportunityType.RESOLVE_CONFLICT,
            insight: 'Third Opportunity',
            resources: [
                {
                    title: 'Third Opportunity',
                    content: 'Third content',
                    type: ResourceType.GUIDANCE,
                    isVisible: true,
                },
            ],
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

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(0)
            expect(result.current.totalNavigable).toBe(3)
        })

        it('returns default state when opportunities is empty array', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: [],
                }),
            )

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(0)
            expect(result.current.totalNavigable).toBe(0)
        })

        it('returns default state when both selectedOpportunity and opportunities are null/empty', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: null,
                    opportunities: [],
                }),
            )

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(0)
            expect(result.current.totalNavigable).toBe(0)
        })

        it('returns default state when selectedOpportunity is undefined', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: undefined as unknown as Opportunity,
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(0)
        })

        it('returns default state when opportunities has zero length', () => {
            const emptyArray: Opportunity[] = []
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: emptyArray,
                }),
            )

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(0)
            expect(result.current.totalNavigable).toBe(0)
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

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(false)
            expect(result.current.position).toBe(0)
            expect(result.current.totalNavigable).toBe(3)
        })

        it('returns correct navigation state for middle opportunity', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[1],
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current.isFirst).toBe(false)
            expect(result.current.isLast).toBe(false)
            expect(result.current.position).toBe(1)
            expect(result.current.totalNavigable).toBe(3)
        })

        it('returns correct navigation state for last opportunity', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[2],
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current.isFirst).toBe(false)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(2)
            expect(result.current.totalNavigable).toBe(3)
        })

        it('returns correct navigation state for single opportunity', () => {
            const singleOpportunity = [mockOpportunities[0]]
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: singleOpportunity,
                }),
            )

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(0)
            expect(result.current.totalNavigable).toBe(1)
        })

        it('returns correct position when selectedOpportunity is not found in opportunities', () => {
            const nonExistentOpportunity: Opportunity = {
                id: 'non-existent',
                key: 'non-existent',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                insight: 'Non-existent',
                resources: [
                    {
                        title: 'Non-existent',
                        content: 'Content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            }

            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: nonExistentOpportunity,
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(0)
            expect(result.current.totalNavigable).toBe(3)
        })
    })

    describe('getNextIndex and getPrevIndex', () => {
        it('returns correct next index for first opportunity', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current.getNextIndex()).toBe(1)
            expect(result.current.getPrevIndex()).toBeUndefined()
        })

        it('returns correct indices for middle opportunity', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[1],
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current.getNextIndex()).toBe(2)
            expect(result.current.getPrevIndex()).toBe(0)
        })

        it('returns correct prev index for last opportunity', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[2],
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current.getNextIndex()).toBeUndefined()
            expect(result.current.getPrevIndex()).toBe(1)
        })

        it('returns undefined for both when opportunity not found', () => {
            const nonExistentOpportunity: Opportunity = {
                id: 'non-existent',
                key: 'non-existent',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                insight: 'Non-existent opportunity',
                resources: [
                    {
                        title: 'Non-existent',
                        content: 'Content',
                        type: ResourceType.GUIDANCE,
                        isVisible: true,
                    },
                ],
            }

            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: nonExistentOpportunity,
                    opportunities: mockOpportunities,
                }),
            )

            expect(result.current.getNextIndex()).toBeUndefined()
            expect(result.current.getPrevIndex()).toBeUndefined()
        })
    })

    describe('allowedOpportunityIds filtering', () => {
        it('filters totalNavigable when allowedOpportunityIds is provided', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: mockOpportunities,
                    allowedOpportunityIds: [1, 3],
                }),
            )

            expect(result.current.totalNavigable).toBe(2)
        })

        it('returns all opportunities count when allowedOpportunityIds is undefined', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: mockOpportunities,
                    allowedOpportunityIds: undefined,
                }),
            )

            expect(result.current.totalNavigable).toBe(3)
        })

        it('calculates position correctly within filtered opportunities', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[2],
                    opportunities: mockOpportunities,
                    allowedOpportunityIds: [1, 3],
                }),
            )

            expect(result.current.position).toBe(1)
            expect(result.current.isFirst).toBe(false)
            expect(result.current.isLast).toBe(true)
        })

        it('returns isFirst and isLast true when selected opportunity is not in allowed list', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[1],
                    opportunities: mockOpportunities,
                    allowedOpportunityIds: [1, 3],
                }),
            )

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(0)
        })

        it('returns zero totalNavigable when allowedOpportunityIds is empty array', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: mockOpportunities,
                    allowedOpportunityIds: [],
                }),
            )

            expect(result.current.isFirst).toBe(true)
            expect(result.current.isLast).toBe(true)
            expect(result.current.position).toBe(0)
            expect(result.current.totalNavigable).toBe(0)
        })

        it('navigates only between allowed opportunities', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[0],
                    opportunities: mockOpportunities,
                    allowedOpportunityIds: [1, 3],
                }),
            )

            // From id '1' (index 0), next should be id '3' (index 2 in original array)
            expect(result.current.getNextIndex()).toBe(2)
            expect(result.current.getPrevIndex()).toBeUndefined()
        })

        it('returns correct prev index when navigating filtered opportunities', () => {
            const { result } = renderHook(() =>
                useOpportunitiesNavigation({
                    selectedOpportunity: mockOpportunities[2],
                    opportunities: mockOpportunities,
                    allowedOpportunityIds: [1, 3],
                }),
            )

            // From id '3' (index 2), prev should be id '1' (index 0 in original array)
            expect(result.current.getPrevIndex()).toBe(0)
            expect(result.current.getNextIndex()).toBeUndefined()
        })
    })
})
