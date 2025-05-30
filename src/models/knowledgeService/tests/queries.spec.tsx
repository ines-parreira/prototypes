import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'

import { getGorgiasKsApiClient } from 'rest_api/knowledge_service_api/client'
import { Paths } from 'rest_api/knowledge_service_api/client.generated'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderHook } from 'utils/testing/renderHook'

import {
    CACHE_TIME_MS,
    feedbackDefinitionKeys,
    STALE_TIME_MS,
    useGetFeedback,
} from '../queries'

jest.mock('rest_api/knowledge_service_api/client', () => ({
    getGorgiasKsApiClient: jest.fn(),
}))

describe('knowledgeService queries', () => {
    const queryClient = mockQueryClient()

    const mockClient = {
        findFeedbackFeedback: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(getGorgiasKsApiClient as jest.Mock).mockResolvedValue(mockClient)
    })

    const wrapper = ({ children }: { children?: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    describe('feedbackDefinitionKeys', () => {
        it('should generate correct all key', () => {
            expect(feedbackDefinitionKeys.all()).toEqual(['feedback'])
        })

        it('should generate correct lists key', () => {
            expect(feedbackDefinitionKeys.lists()).toEqual(['feedback', 'list'])
        })

        it('should generate correct list key with params', () => {
            const params: Paths.FindFeedbackFeedback.QueryParameters = {
                objectId: 'ticket-123',
                objectType: 'TICKET',
            }
            expect(feedbackDefinitionKeys.list(params)).toEqual([
                'feedback',
                'list',
                params,
            ])
        })

        it('should generate correct get key with id', () => {
            expect(feedbackDefinitionKeys.get('123')).toEqual([
                'feedback',
                '123',
            ])
        })
    })

    describe('useGetFeedback', () => {
        const params: Paths.FindFeedbackFeedback.QueryParameters = {
            objectId: 'ticket-123',
            objectType: 'TICKET',
        }

        const mockResponse = {
            data: {
                executions: [
                    {
                        executionId: 'exec-123',
                        feedback: [
                            {
                                id: 1,
                                feedbackType: 'TICKET_FREEFORM',
                                feedbackValue: 'Test feedback',
                                objectType: 'TICKET',
                                objectId: 'ticket-123',
                                executionId: 'exec-123',
                                targetType: 'TICKET',
                                targetId: 'ticket-123',
                                submittedBy: 0,
                                createdDatetime: '2023-01-01T00:00:00.000Z',
                                updatedDatetime: '2023-01-01T00:00:00.000Z',
                            },
                        ],
                        resources: [],
                    },
                ],
            },
        }

        beforeEach(() => {
            mockClient.findFeedbackFeedback.mockResolvedValue(mockResponse)
        })

        it('should call API with correct parameters', async () => {
            const { result } = renderHook(() => useGetFeedback(params), {
                wrapper,
            })

            // Initial state should be loading
            expect(result.current.isLoading).toBe(true)

            // Wait for the query to complete
            await waitFor(() => expect(result.current.isSuccess).toBe(true))

            // Verify API was called with correct params
            expect(mockClient.findFeedbackFeedback).toHaveBeenCalledWith(
                params,
                {},
                {
                    paramsSerializer: {
                        indexes: false,
                    },
                },
            )

            // Verify data is correct
            expect(result.current.data).toEqual(mockResponse.data)
        })

        it('should use correct stale and cache times', async () => {
            // We need to spy on useQuery's options directly
            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(() => useGetFeedback(params), { wrapper })

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: STALE_TIME_MS,
                    cacheTime: CACHE_TIME_MS,
                }),
            )
        })

        it('should allow overriding query options', async () => {
            const customStaleTime = 5000
            const customRetry = false

            const useQuerySpy = jest.spyOn(
                require('@tanstack/react-query'),
                'useQuery',
            )

            renderHook(
                () =>
                    useGetFeedback(params, {
                        staleTime: customStaleTime,
                        retry: customRetry,
                    }),
                { wrapper },
            )

            expect(useQuerySpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    staleTime: customStaleTime,
                    retry: customRetry,
                }),
            )
        })
    })
})
