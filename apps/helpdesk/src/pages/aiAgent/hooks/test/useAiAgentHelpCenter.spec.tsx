import type { ReactNode } from 'react'
import React from 'react'

import { reportError } from '@repo/logging'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useGetHelpCenterList } from 'models/helpCenter/queries'

import { useAiAgentHelpCenter } from '../useAiAgentHelpCenter'

jest.mock('models/helpCenter/queries')
jest.mock('@repo/logging')

const mockUseGetHelpCenterList = useGetHelpCenterList as jest.Mock
const mockReportError = reportError as jest.Mock

describe('useAiAgentHelpCenter', () => {
    let queryClient: QueryClient

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        })
        jest.clearAllMocks()
    })

    const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )

    describe('when help center is not found', () => {
        it('should NOT report error when FAQ help center is not found', () => {
            // Mock the hook to simulate empty data with onSuccess callback
            mockUseGetHelpCenterList.mockImplementation((params, options) => {
                // Call onSuccess synchronously for testing
                if (options?.onSuccess) {
                    options.onSuccess({ data: { data: [] } })
                }
                return {
                    data: { data: { data: [] } },
                }
            })

            const { result } = renderHook(
                () =>
                    useAiAgentHelpCenter({
                        shopName: 'test-shop',
                        helpCenterType: 'faq',
                    }),
                { wrapper },
            )

            // FAQ help centers are optional, should NOT report error
            expect(mockReportError).not.toHaveBeenCalled()
            expect(result.current).toBeUndefined()
        })

        it('should report error when guidance help center is not found', () => {
            // Mock the hook to simulate empty data with onSuccess callback
            mockUseGetHelpCenterList.mockImplementation((params, options) => {
                // Call onSuccess synchronously for testing
                if (options?.onSuccess) {
                    options.onSuccess({ data: { data: [] } })
                }
                return {
                    data: { data: { data: [] } },
                }
            })

            const { result } = renderHook(
                () =>
                    useAiAgentHelpCenter({
                        shopName: 'test-shop',
                        helpCenterType: 'guidance',
                    }),
                { wrapper },
            )

            expect(mockReportError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'guidance Help Center not found for shop: test-shop',
                }),
                expect.objectContaining({
                    tags: { team: SentryTeam.AI_AGENT },
                    extra: {
                        context:
                            'Error during fetching of guidance help center',
                    },
                    level: 'error',
                }),
            )

            expect(result.current).toBeUndefined()
        })

        it('should report error when snippet help center is not found', () => {
            // Mock the hook to simulate empty data with onSuccess callback
            mockUseGetHelpCenterList.mockImplementation((params, options) => {
                // Call onSuccess synchronously for testing
                if (options?.onSuccess) {
                    options.onSuccess({ data: { data: [] } })
                }
                return {
                    data: { data: { data: [] } },
                }
            })

            const { result } = renderHook(
                () =>
                    useAiAgentHelpCenter({
                        shopName: 'test-shop',
                        helpCenterType: 'snippet',
                    }),
                { wrapper },
            )

            expect(mockReportError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        'snippet Help Center not found for shop: test-shop',
                }),
                expect.objectContaining({
                    tags: { team: SentryTeam.AI_AGENT },
                    extra: {
                        context: 'Error during fetching of snippet help center',
                    },
                    level: 'error',
                }),
            )

            expect(result.current).toBeUndefined()
        })
    })

    describe('when help center is found', () => {
        it('should return the help center data and not report error', () => {
            const mockHelpCenter = {
                id: 1,
                name: 'Test Help Center',
                type: 'faq',
            }

            mockUseGetHelpCenterList.mockImplementation((params, options) => {
                // Call onSuccess with data
                if (options?.onSuccess) {
                    options.onSuccess({ data: { data: [mockHelpCenter] } })
                }
                return {
                    data: { data: { data: [mockHelpCenter] } },
                }
            })

            const { result } = renderHook(
                () =>
                    useAiAgentHelpCenter({
                        shopName: 'test-shop',
                        helpCenterType: 'faq',
                    }),
                { wrapper },
            )

            expect(result.current).toEqual(mockHelpCenter)
            expect(mockReportError).not.toHaveBeenCalled()
        })
    })

    describe('query configuration', () => {
        it('should configure query with correct parameters', () => {
            mockUseGetHelpCenterList.mockReturnValue({
                data: undefined,
            })

            renderHook(
                () =>
                    useAiAgentHelpCenter({
                        shopName: 'test-shop',
                        helpCenterType: 'snippet',
                    }),
                { wrapper },
            )

            expect(mockUseGetHelpCenterList).toHaveBeenCalledWith(
                {
                    type: 'snippet',
                    per_page: 1,
                    shop_name: 'test-shop',
                },
                expect.objectContaining({
                    staleTime: 1000 * 60 * 5, // 5 minutes
                }),
            )
        })
    })
})
