import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { OpportunityType } from '../enums'
import type { Opportunity } from '../utils/mapAiArticlesToOpportunities'
import { useFindOneOpportunity } from './useFindOneOpportunity'
import { useSelectedOpportunity } from './useSelectedOpportunity'

jest.mock('./useFindOneOpportunity')

describe('useSelectedOpportunity', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    const mockOpportunities: Opportunity[] = [
        {
            id: '1',
            key: 'opportunity-1',
            title: 'First Opportunity',
            content: 'Content for first opportunity',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            ticketCount: 5,
        },
        {
            id: '2',
            key: 'opportunity-2',
            title: 'Second Opportunity',
            content: 'Content for second opportunity',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            ticketCount: 10,
        },
    ]

    const mockOpportunityDetails: Opportunity = {
        id: '1',
        key: 'opportunity-1',
        title: 'First Opportunity with Details',
        content: 'Detailed content for first opportunity',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        ticketCount: 5,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should initialize with no selected opportunity', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, false),
            { wrapper },
        )

        expect(result.current.selectedOpportunity).toBeNull()
        expect(result.current.selectedOpportunityId).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })

    it('should return base selected opportunity when useKnowledgeService is false', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, false),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[0])
        expect(result.current.selectedOpportunityId).toBe('1')
        expect(result.current.isLoading).toBe(false)
    })

    it('should not fetch opportunity details when useKnowledgeService is false', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, false),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(mockUseFindOneOpportunity).toHaveBeenCalledWith(1, {
            query: {
                enabled: false,
                refetchOnWindowFocus: false,
            },
        })
    })

    it('should fetch opportunity details when useKnowledgeService is true and opportunity is selected', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, true),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(mockUseFindOneOpportunity).toHaveBeenCalledWith(1, {
            query: {
                enabled: true,
                refetchOnWindowFocus: false,
            },
        })
    })

    it('should not fetch opportunity details when no opportunity is selected', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        renderHook(() => useSelectedOpportunity(mockOpportunities, true), {
            wrapper,
        })

        expect(mockUseFindOneOpportunity).toHaveBeenCalledWith(undefined, {
            query: {
                enabled: false,
                refetchOnWindowFocus: false,
            },
        })
    })

    it('should show loading state when fetching opportunity details', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, true),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(result.current.isLoading).toBe(true)
    })

    it('should return opportunity details when fetched successfully', async () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result, rerender } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, true),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunityDetails,
            isLoading: false,
        })

        rerender()

        await waitFor(() => {
            expect(result.current.selectedOpportunity).toEqual(
                mockOpportunityDetails,
            )
        })
    })

    it('should fallback to base opportunity when opportunity details are loading', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, true),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[0])
        expect(result.current.isLoading).toBe(true)
    })

    it('should return null when selected opportunity is not found in opportunities array', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, false),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('non-existent-id')
        })

        expect(result.current.selectedOpportunity).toBeNull()
    })

    it('should update selected opportunity when selecting a different opportunity', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, false),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[0])

        act(() => {
            result.current.setSelectedOpportunityId('2')
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[1])
    })

    it('should clear selected opportunity when setting id to null', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, false),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[0])

        act(() => {
            result.current.setSelectedOpportunityId(null)
        })

        expect(result.current.selectedOpportunity).toBeNull()
        expect(result.current.selectedOpportunityId).toBeNull()
    })

    it('should switch from base to detailed opportunity when useKnowledgeService changes', async () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result, rerender } = renderHook(
            ({ useKnowledgeService }) =>
                useSelectedOpportunity(mockOpportunities, useKnowledgeService),
            {
                wrapper,
                initialProps: { useKnowledgeService: false },
            },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[0])

        mockUseFindOneOpportunity.mockReturnValue({
            data: mockOpportunityDetails,
            isLoading: false,
        })

        rerender({ useKnowledgeService: true })

        await waitFor(() => {
            expect(result.current.selectedOpportunity).toEqual(
                mockOpportunityDetails,
            )
        })
    })

    it('should not show loading state when useKnowledgeService is false', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(mockOpportunities, false),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(result.current.isLoading).toBe(false)
    })

    it('should handle opportunities array updates correctly', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result, rerender } = renderHook(
            ({ opportunities }) => useSelectedOpportunity(opportunities, false),
            {
                wrapper,
                initialProps: { opportunities: mockOpportunities },
            },
        )

        act(() => {
            result.current.setSelectedOpportunityId('2')
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[1])

        const updatedOpportunities: Opportunity[] = [
            {
                id: '2',
                key: 'opportunity-2',
                title: 'Updated Second Opportunity',
                content: 'Updated content',
                type: OpportunityType.FILL_KNOWLEDGE_GAP,
                ticketCount: 15,
            },
        ]

        rerender({ opportunities: updatedOpportunities })

        expect(result.current.selectedOpportunity).toEqual(
            updatedOpportunities[0],
        )
    })

    it('should return null when selected opportunity is removed from opportunities array', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result, rerender } = renderHook(
            ({ opportunities }) => useSelectedOpportunity(opportunities, false),
            {
                wrapper,
                initialProps: { opportunities: mockOpportunities },
            },
        )

        act(() => {
            result.current.setSelectedOpportunityId('2')
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[1])

        rerender({ opportunities: [mockOpportunities[0]] })

        expect(result.current.selectedOpportunity).toBeNull()
    })
})
