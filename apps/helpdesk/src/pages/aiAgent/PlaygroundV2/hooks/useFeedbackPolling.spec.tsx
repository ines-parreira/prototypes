import type React from 'react'

import { reportError } from '@repo/logging'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useGetFeedback } from 'models/knowledgeService/queries'
import { storeWithActiveSubscriptionWithConvert } from 'pages/settings/new_billing/fixtures'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { useFeedbackPolling } from './useFeedbackPolling'

// Mock dependencies
jest.mock('models/knowledgeService/queries')
jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

const mockUseGetFeedback = jest.mocked(useGetFeedback)
const mockReportError = jest.mocked(reportError)

const mockStore = configureMockStore()
const queryClient = mockQueryClient()

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={mockStore(storeWithActiveSubscriptionWithConvert)}>
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    </Provider>
)

// Mock timers for testing polling behavior
jest.useFakeTimers()

describe('useFeedbackPolling', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.clearAllTimers()
    })

    afterEach(() => {
        jest.runOnlyPendingTimers()
        jest.useRealTimers()
        jest.useFakeTimers()
    })

    afterAll(() => {
        jest.useRealTimers()
    })

    describe('initialization', () => {
        it('should not start polling automatically', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            const { result } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            expect(result.current.isPolling).toBe(false)
            expect(result.current.feedback).toBeNull()
        })
    })

    describe('polling lifecycle', () => {
        it('should stop polling when feedback data is received', async () => {
            const mockFeedbackData = {
                executions: [
                    {
                        executionId: 'test-execution',
                        resources: [],
                        feedback: [],
                    },
                ],
            }

            let mockData = null

            // Start with no data
            mockUseGetFeedback.mockReturnValue({
                data: mockData,
                error: null,
            } as any)

            const { result, rerender } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            // Start polling manually
            act(() => {
                result.current.startPolling()
            })

            expect(result.current.isPolling).toBe(true)

            // Simulate receiving data
            mockData = mockFeedbackData
            mockUseGetFeedback.mockReturnValue({
                data: mockData,
                error: null,
            } as any)

            rerender()

            // Should stop polling when data is received
            await waitFor(() => {
                expect(result.current.isPolling).toBe(false)
                expect(result.current.feedback).toEqual(mockFeedbackData)
            })
        })

        it('should provide startPolling function that can start polling', async () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            const { result } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            // Should not be polling initially
            expect(result.current.isPolling).toBe(false)

            // Start polling manually
            act(() => {
                result.current.startPolling()
            })

            expect(result.current.isPolling).toBe(true)
        })

        it('should provide stopPolling function', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            const { result } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            // Start polling first
            act(() => {
                result.current.startPolling()
            })

            expect(result.current.isPolling).toBe(true)

            // Stop polling
            act(() => {
                result.current.stopPolling()
            })

            expect(result.current.isPolling).toBe(false)
        })
    })

    describe('timeout handling', () => {
        it('should stop polling after 2 minute timeout duration', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            const { result } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            // Start polling
            act(() => {
                result.current.startPolling()
            })

            expect(result.current.isPolling).toBe(true)

            // Fast-forward time by 2 minutes (timeout duration)
            act(() => {
                jest.advanceTimersByTime(2 * 60 * 1000 + 5000) // 2 minutes + 5 seconds
            })

            expect(result.current.isPolling).toBe(false)
        })

        it('should continue polling before timeout is reached', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            const { result } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            // Start polling
            act(() => {
                result.current.startPolling()
            })

            expect(result.current.isPolling).toBe(true)

            // Fast-forward time by 1 minute (less than timeout)
            act(() => {
                jest.advanceTimersByTime(60 * 1000) // 1 minute
            })

            // Should still be polling
            expect(result.current.isPolling).toBe(true)
        })

        it('should not restart polling after timeout expires', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            const { result } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            // Start polling
            act(() => {
                result.current.startPolling()
            })

            expect(result.current.isPolling).toBe(true)

            // Fast-forward past timeout
            act(() => {
                jest.advanceTimersByTime(2 * 60 * 1000 + 1000)
            })

            expect(result.current.isPolling).toBe(false)

            // Wait additional time to ensure no automatic restart
            act(() => {
                jest.advanceTimersByTime(30 * 1000) // 30 more seconds
            })

            expect(result.current.isPolling).toBe(false)
        })

        it('should handle multiple start/stop cycles with timeout', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            const { result } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            // First polling cycle
            act(() => {
                result.current.startPolling()
            })
            expect(result.current.isPolling).toBe(true)

            act(() => {
                result.current.stopPolling()
            })
            expect(result.current.isPolling).toBe(false)

            // Second polling cycle - should handle timeout correctly
            act(() => {
                result.current.startPolling()
            })
            expect(result.current.isPolling).toBe(true)

            // Fast-forward past timeout
            act(() => {
                jest.advanceTimersByTime(2 * 60 * 1000 + 1000)
            })
            expect(result.current.isPolling).toBe(false)
        })
    })

    describe('error handling', () => {
        it('should stop polling and report error when useGetFeedback returns error', async () => {
            const mockError = new Error('API Error')

            // Start with no error
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            const { result, rerender } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            // Start polling
            act(() => {
                result.current.startPolling()
            })

            expect(result.current.isPolling).toBe(true)

            // Simulate error occurring
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: mockError,
            } as any)

            rerender()

            await waitFor(() => {
                expect(result.current.isPolling).toBe(false)
            })

            expect(mockReportError).toHaveBeenCalledWith(
                mockError,
                expect.objectContaining({
                    tags: {
                        team: 'automate-ai-agent',
                        executionId: 'test-execution-id',
                    },
                    extra: {
                        context: 'Error during feedback polling',
                    },
                }),
            )
        })
    })

    describe('polling behavior with useGetFeedback', () => {
        it('should call useGetFeedback with correct parameters when not polling', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            expect(mockUseGetFeedback).toHaveBeenCalledWith(
                {
                    executionId: 'test-execution-id',
                    objectType: 'TICKET',
                },
                expect.objectContaining({
                    enabled: false,
                    refetchInterval: 5000,
                }),
            )
        })

        it('should enable useGetFeedback when polling starts', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            const { result } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            act(() => {
                result.current.startPolling()
            })

            expect(mockUseGetFeedback).toHaveBeenLastCalledWith(
                {
                    executionId: 'test-execution-id',
                    objectType: 'TICKET',
                },
                expect.objectContaining({
                    enabled: true,
                    refetchInterval: 5000,
                }),
            )
        })

        it('should use correct polling interval of 5 seconds', () => {
            mockUseGetFeedback.mockReturnValue({
                data: null,
                error: null,
            } as any)

            renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            expect(mockUseGetFeedback).toHaveBeenCalledWith(
                expect.anything(),
                expect.objectContaining({
                    refetchInterval: 5000, // 5 seconds
                }),
            )
        })
    })

    describe('integration scenarios', () => {
        it('should handle feedback data received before timeout', async () => {
            const mockFeedbackData = {
                executions: [
                    {
                        executionId: 'test-execution-id',
                        feedback: [],
                        resources: [],
                    },
                ],
            }

            let mockData = null

            // Start with no data
            mockUseGetFeedback.mockReturnValue({
                data: mockData,
                error: null,
            } as any)

            const { result, rerender } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            // Start polling
            act(() => {
                result.current.startPolling()
            })
            expect(result.current.isPolling).toBe(true)

            // Simulate receiving data before timeout (after 30 seconds)
            act(() => {
                jest.advanceTimersByTime(30 * 1000) // 30 seconds
            })

            // Data arrives
            mockData = mockFeedbackData
            mockUseGetFeedback.mockReturnValue({
                data: mockData,
                error: null,
            } as any)

            rerender()

            // Should stop polling when data is received
            await waitFor(() => {
                expect(result.current.isPolling).toBe(false)
                expect(result.current.feedback).toEqual(mockFeedbackData)
            })
        })

        it('should handle empty executions array as no data', () => {
            const mockFeedbackDataEmpty = {
                executions: [], // Empty array should not stop polling
            }

            mockUseGetFeedback.mockReturnValue({
                data: mockFeedbackDataEmpty,
                error: null,
            } as any)

            const { result } = renderHook(
                () =>
                    useFeedbackPolling({
                        executionId: 'test-execution-id',
                    }),
                { wrapper },
            )

            act(() => {
                result.current.startPolling()
            })

            // Should still be polling because executions array is empty
            expect(result.current.isPolling).toBe(true)
        })
    })
})
