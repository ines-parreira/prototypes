import type { ReactNode } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { AxiosError } from 'axios'

import * as queries from '../../queries'
import { useUpdateProductAdditionalInfoWithTracking } from '../useUpdateProductAdditionalInfoWithTracking'

jest.mock('@repo/logging')
jest.mock('../../queries')

describe('useUpdateProductAdditionalInfoWithTracking', () => {
    let queryClient: QueryClient
    const mockLogEvent = logEvent as jest.MockedFunction<typeof logEvent>
    let capturedOptions: any

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })
        jest.clearAllMocks()
        capturedOptions = null

        // Mock useUpdateProductAdditionalInfo to capture the options and return a mutation
        ;(
            queries.useUpdateProductAdditionalInfo as jest.Mock
        ).mockImplementation((options) => {
            capturedOptions = options
            return {
                mutateAsync: async (variables: any) => {
                    try {
                        const result = { success: true }
                        if (capturedOptions?.onSuccess) {
                            await capturedOptions.onSuccess(
                                result,
                                variables,
                                undefined,
                            )
                        }
                        return result
                    } catch (error) {
                        if (capturedOptions?.onError) {
                            await capturedOptions.onError(
                                error,
                                variables,
                                undefined,
                            )
                        }
                        throw error
                    }
                },
            }
        })
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    describe('type logic (create vs update)', () => {
        it('should set type="create" when initialValue is null', async () => {
            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: null,
                    }),
                { wrapper },
            )

            await result.current.mutateAsync({
                objectType: 'product' as any,
                sourceType: 'shopify' as any,
                integrationId: 123,
                externalId: 'prod_456',
                key: 'ai_agent_extended_context' as any,
                data: {
                    data: { rich_text: '<p>Test content</p>' },
                    version: '2024-01-01',
                },
            })

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentProductAdditionalInfoSaved,
                    expect.objectContaining({
                        integrationId: 123,
                        type: 'create',
                    }),
                )
            })
        })

        it('should set type="create" when initialValue is undefined', async () => {
            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: undefined,
                    }),
                { wrapper },
            )

            await result.current.mutateAsync({
                objectType: 'product' as any,
                sourceType: 'shopify' as any,
                integrationId: 123,
                externalId: 'prod_456',
                key: 'ai_agent_extended_context' as any,
                data: {
                    data: { rich_text: '<p>Test content</p>' },
                    version: '2024-01-01',
                },
            })

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentProductAdditionalInfoSaved,
                    expect.objectContaining({
                        type: 'create',
                    }),
                )
            })
        })

        it('should set type="create" when rich_text is empty HTML like <div><br /></div>', async () => {
            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: { rich_text: '<div><br /></div>' },
                    }),
                { wrapper },
            )

            await result.current.mutateAsync({
                objectType: 'product' as any,
                sourceType: 'shopify' as any,
                integrationId: 123,
                externalId: 'prod_456',
                key: 'ai_agent_extended_context' as any,
                data: {
                    data: { rich_text: '<p>New content</p>' },
                    version: '2024-01-01',
                },
            })

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentProductAdditionalInfoSaved,
                    expect.objectContaining({
                        type: 'create',
                    }),
                )
            })
        })

        it('should set type="create" when rich_text is empty HTML like <div></div>', async () => {
            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: { rich_text: '<div></div>' },
                    }),
                { wrapper },
            )

            await result.current.mutateAsync({
                objectType: 'product' as any,
                sourceType: 'shopify' as any,
                integrationId: 123,
                externalId: 'prod_456',
                key: 'ai_agent_extended_context' as any,
                data: {
                    data: { rich_text: '<p>New content</p>' },
                    version: '2024-01-01',
                },
            })

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentProductAdditionalInfoSaved,
                    expect.objectContaining({
                        type: 'create',
                    }),
                )
            })
        })

        it('should set type="update" when rich_text has actual content', async () => {
            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: { rich_text: '<p>Existing content</p>' },
                    }),
                { wrapper },
            )

            await result.current.mutateAsync({
                objectType: 'product' as any,
                sourceType: 'shopify' as any,
                integrationId: 123,
                externalId: 'prod_456',
                key: 'ai_agent_extended_context' as any,
                data: {
                    data: { rich_text: '<p>Updated content</p>' },
                    version: '2024-01-01',
                },
            })

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentProductAdditionalInfoSaved,
                    expect.objectContaining({
                        type: 'update',
                    }),
                )
            })
        })
    })

    describe('success events', () => {
        it('should log AiAgentProductAdditionalInfoSaved with correct properties on success', async () => {
            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: null,
                    }),
                { wrapper },
            )

            await result.current.mutateAsync({
                objectType: 'product' as any,
                sourceType: 'shopify' as any,
                integrationId: 123,
                externalId: 'prod_456',
                key: 'ai_agent_extended_context' as any,
                data: {
                    data: { rich_text: '<p>Test content</p>' },
                    version: '2024-01-01',
                },
            })

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentProductAdditionalInfoSaved,
                    expect.objectContaining({
                        integrationId: 123,
                        type: 'create',
                        contentLengthFormattedText: expect.any(Number),
                        contentLengthPlainText: expect.any(Number),
                    }),
                )
            })
        })

        it('should include both HTML and plain text lengths', async () => {
            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: null,
                    }),
                { wrapper },
            )

            const htmlContent = '<p>Test content</p>'
            await result.current.mutateAsync({
                objectType: 'product' as any,
                sourceType: 'shopify' as any,
                integrationId: 123,
                externalId: 'prod_456',
                key: 'ai_agent_extended_context' as any,
                data: {
                    data: { rich_text: htmlContent },
                    version: '2024-01-01',
                },
            })

            await waitFor(() => {
                const call = mockLogEvent.mock.calls[0]
                expect(call[0]).toBe(
                    SegmentEvent.AiAgentProductAdditionalInfoSaved,
                )
                const properties = call[1] as any

                // HTML length should be greater than plain text length due to tags
                expect(properties.contentLengthFormattedText).toBe(
                    htmlContent.length,
                )
                expect(properties.contentLengthPlainText).toBeLessThan(
                    properties.contentLengthFormattedText,
                )
                expect(properties.contentLengthPlainText).toBeGreaterThan(0)
            })
        })

        it('should set type="update" when updating existing content', async () => {
            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 456,
                        initialValue: { rich_text: '<p>Existing content</p>' },
                    }),
                { wrapper },
            )

            await result.current.mutateAsync({
                objectType: 'product' as any,
                sourceType: 'shopify' as any,
                integrationId: 456,
                externalId: 'prod_789',
                key: 'ai_agent_extended_context' as any,
                data: {
                    data: { rich_text: '<p>Updated content</p>' },
                    version: '2024-01-01',
                },
            })

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentProductAdditionalInfoSaved,
                    expect.objectContaining({
                        integrationId: 456,
                        type: 'update',
                        contentLengthFormattedText: expect.any(Number),
                        contentLengthPlainText: expect.any(Number),
                    }),
                )
            })
        })
    })

    describe('error events', () => {
        it('should log AiAgentProductAdditionalInfoSaveFailed with error details on failure', async () => {
            const mockError: Partial<AxiosError> = {
                response: {
                    status: 400,
                    data: {
                        error: { msg: 'Validation failed' },
                    },
                } as any,
                message: 'Request failed',
            }

            // Override the default mock to throw an error
            ;(
                queries.useUpdateProductAdditionalInfo as jest.Mock
            ).mockImplementation((options) => {
                capturedOptions = options
                return {
                    mutateAsync: async (variables: any) => {
                        if (capturedOptions?.onError) {
                            await capturedOptions.onError(
                                mockError,
                                variables,
                                undefined,
                            )
                        }
                        throw mockError
                    },
                }
            })

            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: null,
                    }),
                { wrapper },
            )

            try {
                await result.current.mutateAsync({
                    objectType: 'product' as any,
                    sourceType: 'shopify' as any,
                    integrationId: 123,
                    externalId: 'prod_456',
                    key: 'ai_agent_extended_context' as any,
                    data: {
                        data: { rich_text: '<p>Test content</p>' },
                        version: '2024-01-01',
                    },
                })
            } catch {
                // Expected to throw
            }

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentProductAdditionalInfoSaveFailed,
                    expect.objectContaining({
                        integrationId: 123,
                        type: 'create',
                        contentLengthFormattedText: expect.any(Number),
                        contentLengthPlainText: expect.any(Number),
                        errorCode: 400,
                        errorMessage: 'Validation failed',
                    }),
                )
            })
        })

        it('should fallback to error.message when response data unavailable', async () => {
            const mockError = {
                message: 'Network error',
            }

            // Override the default mock to throw an error
            ;(
                queries.useUpdateProductAdditionalInfo as jest.Mock
            ).mockImplementation((options) => {
                capturedOptions = options
                return {
                    mutateAsync: async (variables: any) => {
                        if (capturedOptions?.onError) {
                            await capturedOptions.onError(
                                mockError,
                                variables,
                                undefined,
                            )
                        }
                        throw mockError
                    },
                }
            })

            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: null,
                    }),
                { wrapper },
            )

            try {
                await result.current.mutateAsync({
                    objectType: 'product' as any,
                    sourceType: 'shopify' as any,
                    integrationId: 123,
                    externalId: 'prod_456',
                    key: 'ai_agent_extended_context' as any,
                    data: {
                        data: { rich_text: '<p>Test content</p>' },
                        version: '2024-01-01',
                    },
                })
            } catch {
                // Expected to throw
            }

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalledWith(
                    SegmentEvent.AiAgentProductAdditionalInfoSaveFailed,
                    expect.objectContaining({
                        errorCode: undefined,
                        errorMessage: 'Network error',
                    }),
                )
            })
        })
    })

    describe('callback composition', () => {
        it('should call custom onSuccess callback after logging event', async () => {
            const customOnSuccess = jest.fn()

            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: null,
                        overrides: {
                            onSuccess: customOnSuccess,
                        },
                    }),
                { wrapper },
            )

            await result.current.mutateAsync({
                objectType: 'product' as any,
                sourceType: 'shopify' as any,
                integrationId: 123,
                externalId: 'prod_456',
                key: 'ai_agent_extended_context' as any,
                data: {
                    data: { rich_text: '<p>Test content</p>' },
                    version: '2024-01-01',
                },
            })

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalled()
                expect(customOnSuccess).toHaveBeenCalled()
            })
        })

        it('should call custom onError callback after logging event', async () => {
            const mockError = {
                message: 'Test error',
            }

            const customOnError = jest.fn()

            // Override the default mock to throw an error
            ;(
                queries.useUpdateProductAdditionalInfo as jest.Mock
            ).mockImplementation((options) => {
                capturedOptions = options
                return {
                    mutateAsync: async (variables: any) => {
                        if (capturedOptions?.onError) {
                            await capturedOptions.onError(
                                mockError,
                                variables,
                                undefined,
                            )
                        }
                        throw mockError
                    },
                }
            })

            const { result } = renderHook(
                () =>
                    useUpdateProductAdditionalInfoWithTracking({
                        integrationId: 123,
                        initialValue: null,
                        overrides: {
                            onError: customOnError,
                        },
                    }),
                { wrapper },
            )

            try {
                await result.current.mutateAsync({
                    objectType: 'product' as any,
                    sourceType: 'shopify' as any,
                    integrationId: 123,
                    externalId: 'prod_456',
                    key: 'ai_agent_extended_context' as any,
                    data: {
                        data: { rich_text: '<p>Test content</p>' },
                        version: '2024-01-01',
                    },
                })
            } catch {
                // Expected to throw
            }

            await waitFor(() => {
                expect(mockLogEvent).toHaveBeenCalled()
                expect(customOnError).toHaveBeenCalled()
            })
        })
    })
})
