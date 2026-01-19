import type React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { OpportunityType } from '../enums'
import type { Opportunity, OpportunityListItem } from '../types'
import { useFindOneOpportunity } from './useFindOneOpportunity'
import { useSelectedOpportunity } from './useSelectedOpportunity'

jest.mock('./useFindOneOpportunity')

const mockHistoryReplace = jest.fn()
jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    useHistory: () => ({
        replace: mockHistoryReplace,
        push: jest.fn(),
    }),
}))

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

    const defaultHookParams = {
        shopIntegrationId: 789,
        opportunities: [] as (Opportunity | OpportunityListItem)[],
        useKnowledgeService: false,
        shopType: 'shopify',
        shopName: 'test-shop',
    }

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

    const mockOpportunityListItems: OpportunityListItem[] = [
        {
            id: '1',
            key: 'ks_1',
            insight: 'Customer frequently asks about return policy',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            ticketCount: 5,
        },
        {
            id: '2',
            key: 'ks_2',
            insight: 'Customer frequently asks about shipping',
            type: OpportunityType.FILL_KNOWLEDGE_GAP,
            ticketCount: 10,
        },
    ]

    const mockOpportunityDetails: Opportunity = {
        id: '1',
        key: 'ks_1',
        title: 'First Opportunity with Details',
        content: 'Detailed content for first opportunity',
        type: OpportunityType.FILL_KNOWLEDGE_GAP,
        ticketCount: 5,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient.clear()
    })

    it('should initialize with no selected opportunity when opportunities array is empty', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () => useSelectedOpportunity(defaultHookParams),
            { wrapper },
        )

        expect(result.current.selectedOpportunity).toBeNull()
        expect(result.current.selectedOpportunityId).toBeNull()
        expect(result.current.isLoading).toBe(false)
    })

    it('should auto-select first opportunity when opportunities are provided', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunities,
                }),
            { wrapper },
        )

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[0])
        expect(result.current.selectedOpportunityId).toBe('1')
        expect(result.current.isLoading).toBe(false)
    })

    it('should return base selected opportunity when useKnowledgeService is false', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunities,
                }),
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
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunities,
                }),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(mockUseFindOneOpportunity).toHaveBeenCalledWith(
            defaultHookParams.shopIntegrationId,
            1,
            {
                query: {
                    enabled: false,
                    refetchOnWindowFocus: false,
                },
            },
        )
    })

    it('should fetch opportunity details when useKnowledgeService is true and opportunity is selected', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunityListItems,
                    useKnowledgeService: true,
                }),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(mockUseFindOneOpportunity).toHaveBeenCalledWith(
            defaultHookParams.shopIntegrationId,
            1,
            {
                query: {
                    enabled: true,
                    refetchOnWindowFocus: false,
                },
            },
        )
    })

    it('should not fetch opportunity details when no opportunity is selected', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        renderHook(
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    useKnowledgeService: true,
                }),
            {
                wrapper,
            },
        )

        expect(mockUseFindOneOpportunity).toHaveBeenCalledWith(
            defaultHookParams.shopIntegrationId,
            undefined,
            {
                query: {
                    enabled: false,
                    refetchOnWindowFocus: false,
                },
            },
        )
    })

    it('should show loading state when fetching opportunity details', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunityListItems,
                    useKnowledgeService: true,
                }),
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
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunityListItems,
                    useKnowledgeService: true,
                }),
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

    it('should return null when opportunity details are loading in KS flow', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: true,
        })

        const { result } = renderHook(
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunityListItems,
                    useKnowledgeService: true,
                }),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('1')
        })

        expect(result.current.selectedOpportunity).toBeNull()
        expect(result.current.isLoading).toBe(true)
    })

    it('should return null when selected opportunity is not found in opportunities array', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunities,
                }),
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
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunities,
                }),
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

    it('should re-select first opportunity when setting id to null while opportunities exist', () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result } = renderHook(
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunities,
                }),
            { wrapper },
        )

        act(() => {
            result.current.setSelectedOpportunityId('2')
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[1])

        act(() => {
            result.current.setSelectedOpportunityId(null)
        })

        expect(result.current.selectedOpportunity).toEqual(mockOpportunities[0])
        expect(result.current.selectedOpportunityId).toBe('1')
    })

    it('should switch from base to detailed opportunity when useKnowledgeService changes', async () => {
        const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
        mockUseFindOneOpportunity.mockReturnValue({
            data: undefined,
            isLoading: false,
        })

        const { result, rerender } = renderHook(
            ({ useKnowledgeService }) =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunities,
                    useKnowledgeService,
                }),
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
            () =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities: mockOpportunities,
                }),
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
            ({ opportunities }) =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities,
                }),
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
            ({ opportunities }) =>
                useSelectedOpportunity({
                    ...defaultHookParams,
                    opportunities,
                }),
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

    describe('URL parameter handling', () => {
        it('should initialize with initialOpportunityId from URL', () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        opportunities: mockOpportunities,
                        initialOpportunityId: '2',
                    }),
                { wrapper },
            )

            expect(result.current.selectedOpportunityId).toBe('2')
            expect(result.current.selectedOpportunity).toEqual(
                mockOpportunities[1],
            )
        })

        it('should fetch opportunity details from API when initialOpportunityId is not in loaded list', () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: mockOpportunityDetails,
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        opportunities: mockOpportunityListItems,
                        useKnowledgeService: true,
                        initialOpportunityId: '999',
                    }),
                { wrapper },
            )

            expect(mockUseFindOneOpportunity).toHaveBeenCalledWith(
                defaultHookParams.shopIntegrationId,
                999,
                {
                    query: {
                        enabled: true,
                        refetchOnWindowFocus: false,
                    },
                },
            )
            expect(result.current.selectedOpportunityId).toBe('999')
        })

        it('should not fallback when no opportunities are available', () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
            })

            const { result } = renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        useKnowledgeService: true,
                        initialOpportunityId: '999',
                    }),
                { wrapper },
            )

            expect(result.current.selectedOpportunityId).toBe('999')
        })

        it('should display opportunity details when accessing via direct URL', async () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: mockOpportunityDetails,
                isLoading: false,
                isError: false,
            })

            const { result } = renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        useKnowledgeService: true,
                        initialOpportunityId: '1',
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.selectedOpportunity).toEqual(
                    mockOpportunityDetails,
                )
            })
        })

        it('should update URL when opportunity is selected', () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        opportunities: mockOpportunities,
                    }),
                { wrapper },
            )

            expect(mockHistoryReplace).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/test-shop/opportunities/1',
            )
        })

        it('should not update URL when selectedOpportunityId matches initialOpportunityId', () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        opportunities: mockOpportunities,
                        initialOpportunityId: '1',
                    }),
                { wrapper },
            )

            expect(mockHistoryReplace).not.toHaveBeenCalled()
        })
    })

    describe('free tier filtering with allowedOpportunityIds', () => {
        it('should only select from allowed opportunities when allowedOpportunityIds is provided', () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        opportunities: mockOpportunities,
                        allowedOpportunityIds: [2],
                    }),
                { wrapper },
            )

            expect(result.current.selectedOpportunityId).toBe('2')
        })

        it('should not preselect any opportunity when allowedOpportunityIds is empty', () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        opportunities: mockOpportunities,
                        allowedOpportunityIds: [],
                    }),
                { wrapper },
            )

            expect(result.current.selectedOpportunityId).toBeNull()
            expect(result.current.selectedOpportunity).toBeNull()
        })

        it('should select first opportunity when allowedOpportunityIds is undefined (premium user)', () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        opportunities: mockOpportunities,
                        allowedOpportunityIds: undefined,
                    }),
                { wrapper },
            )

            expect(result.current.selectedOpportunityId).toBe('1')
        })

        it('should fallback to first allowed opportunity when initialOpportunityId fails', async () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
            })

            const { result } = renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        opportunities: mockOpportunityListItems,
                        useKnowledgeService: true,
                        initialOpportunityId: '999',
                        allowedOpportunityIds: [2],
                    }),
                { wrapper },
            )

            await waitFor(() => {
                expect(result.current.selectedOpportunityId).toBe('2')
            })
        })

        it('should redirect to first allowed opportunity when selecting a restricted one', () => {
            const mockUseFindOneOpportunity = useFindOneOpportunity as jest.Mock
            mockUseFindOneOpportunity.mockReturnValue({
                data: undefined,
                isLoading: false,
            })

            const { result } = renderHook(
                () =>
                    useSelectedOpportunity({
                        ...defaultHookParams,
                        opportunities: mockOpportunities,
                        allowedOpportunityIds: [2],
                    }),
                { wrapper },
            )

            expect(result.current.selectedOpportunityId).toBe('2')

            act(() => {
                result.current.setSelectedOpportunityId('1')
            })

            expect(result.current.selectedOpportunityId).toBe('2')
        })
    })
})
