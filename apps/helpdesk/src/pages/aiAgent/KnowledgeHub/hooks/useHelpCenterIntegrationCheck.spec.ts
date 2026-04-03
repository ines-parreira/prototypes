import { reportError } from '@repo/logging'
import { renderHook } from '@testing-library/react'

import { SentryTeam } from 'common/const/sentryTeamNames'
import type { HelpCenter } from 'models/helpCenter/types'
import { useAiAgentHelpCenterState } from 'pages/aiAgent/hooks/useAiAgentHelpCenter'

import { useHelpCenterIntegrationCheck } from './useHelpCenterIntegrationCheck'

jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter')
jest.mock('@repo/logging', () => ({
    reportError: jest.fn(),
}))

const mockUseAiAgentHelpCenterState =
    useAiAgentHelpCenterState as jest.MockedFunction<
        typeof useAiAgentHelpCenterState
    >

const mockReportError = reportError as jest.MockedFunction<typeof reportError>

const createMockHelpCenter = (
    overrides: Partial<HelpCenter> = {},
): HelpCenter =>
    ({
        id: 1,
        shop_integration_id: 123,
        shop_name: 'test-shop',
        type: 'snippet',
        ...overrides,
    }) as HelpCenter

function setupMocks({
    snippetHelpCenter,
    guidanceHelpCenter,
    snippetLoading = false,
    guidanceLoading = false,
}: {
    snippetHelpCenter?: HelpCenter
    guidanceHelpCenter?: HelpCenter
    snippetLoading?: boolean
    guidanceLoading?: boolean
}) {
    mockUseAiAgentHelpCenterState.mockImplementation(({ helpCenterType }) => {
        if (helpCenterType === 'snippet') {
            return {
                helpCenter: snippetHelpCenter,
                isLoading: snippetLoading,
            }
        }
        return {
            helpCenter: guidanceHelpCenter,
            isLoading: guidanceLoading,
        }
    })
}

describe('useHelpCenterIntegrationCheck', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('isSnippetIntegrationMissing', () => {
        it('returns false when snippet help center has a valid shop_integration_id', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter({
                    shop_integration_id: 123,
                }),
                guidanceHelpCenter: createMockHelpCenter({
                    type: 'guidance',
                    shop_integration_id: 456,
                }),
            })

            const { result } = renderHook(() =>
                useHelpCenterIntegrationCheck('test-shop'),
            )

            expect(result.current.isSnippetIntegrationMissing).toBe(false)
        })

        it('returns true when snippet help center has shop_integration_id === null', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter({
                    shop_integration_id: null,
                }),
                guidanceHelpCenter: createMockHelpCenter({
                    type: 'guidance',
                    shop_integration_id: 456,
                }),
            })

            const { result } = renderHook(() =>
                useHelpCenterIntegrationCheck('test-shop'),
            )

            expect(result.current.isSnippetIntegrationMissing).toBe(true)
        })

        it('returns false when snippet help center is still loading', () => {
            setupMocks({
                snippetHelpCenter: undefined,
                guidanceHelpCenter: undefined,
                snippetLoading: true,
                guidanceLoading: true,
            })

            const { result } = renderHook(() =>
                useHelpCenterIntegrationCheck('test-shop'),
            )

            expect(result.current.isSnippetIntegrationMissing).toBe(false)
        })
    })

    describe('isGuidanceIntegrationMissing', () => {
        it('returns false when guidance help center has a valid shop_integration_id', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter({
                    shop_integration_id: 123,
                }),
                guidanceHelpCenter: createMockHelpCenter({
                    type: 'guidance',
                    shop_integration_id: 456,
                }),
            })

            const { result } = renderHook(() =>
                useHelpCenterIntegrationCheck('test-shop'),
            )

            expect(result.current.isGuidanceIntegrationMissing).toBe(false)
        })

        it('returns true when guidance help center has shop_integration_id === null', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter({
                    shop_integration_id: 123,
                }),
                guidanceHelpCenter: createMockHelpCenter({
                    type: 'guidance',
                    shop_integration_id: null,
                }),
            })

            const { result } = renderHook(() =>
                useHelpCenterIntegrationCheck('test-shop'),
            )

            expect(result.current.isGuidanceIntegrationMissing).toBe(true)
        })
    })

    describe('isLoading', () => {
        it('returns true when either help center is loading', () => {
            setupMocks({
                snippetHelpCenter: undefined,
                guidanceHelpCenter: undefined,
                snippetLoading: true,
                guidanceLoading: false,
            })

            const { result } = renderHook(() =>
                useHelpCenterIntegrationCheck('test-shop'),
            )

            expect(result.current.isLoading).toBe(true)
        })

        it('returns false when both help centers are loaded', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter(),
                guidanceHelpCenter: createMockHelpCenter({ type: 'guidance' }),
            })

            const { result } = renderHook(() =>
                useHelpCenterIntegrationCheck('test-shop'),
            )

            expect(result.current.isLoading).toBe(false)
        })
    })

    describe('Sentry error reporting', () => {
        it('reports error when snippet help center has null shop_integration_id', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter({
                    id: 10,
                    shop_integration_id: null,
                }),
                guidanceHelpCenter: createMockHelpCenter({
                    type: 'guidance',
                    shop_integration_id: 456,
                }),
            })

            renderHook(() => useHelpCenterIntegrationCheck('test-shop'))

            expect(mockReportError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining(
                        'snippet help center has null shop_integration_id',
                    ),
                }),
                expect.objectContaining({
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: expect.objectContaining({
                        helpCenterId: 10,
                        helpCenterType: 'snippet',
                    }),
                }),
            )
        })

        it('reports error when guidance help center has null shop_integration_id', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter({
                    shop_integration_id: 123,
                }),
                guidanceHelpCenter: createMockHelpCenter({
                    id: 20,
                    type: 'guidance',
                    shop_integration_id: null,
                }),
            })

            renderHook(() => useHelpCenterIntegrationCheck('test-shop'))

            expect(mockReportError).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining(
                        'guidance help center has null shop_integration_id',
                    ),
                }),
                expect.objectContaining({
                    tags: { team: SentryTeam.CONVAI_KNOWLEDGE },
                    extra: expect.objectContaining({
                        helpCenterId: 20,
                        helpCenterType: 'guidance',
                    }),
                }),
            )
        })

        it('reports errors for both when both have null shop_integration_id', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter({
                    id: 10,
                    shop_integration_id: null,
                }),
                guidanceHelpCenter: createMockHelpCenter({
                    id: 20,
                    type: 'guidance',
                    shop_integration_id: null,
                }),
            })

            renderHook(() => useHelpCenterIntegrationCheck('test-shop'))

            expect(mockReportError).toHaveBeenCalledTimes(2)
        })

        it('does not report error when help centers are still loading', () => {
            setupMocks({
                snippetHelpCenter: undefined,
                guidanceHelpCenter: undefined,
                snippetLoading: true,
                guidanceLoading: true,
            })

            renderHook(() => useHelpCenterIntegrationCheck('test-shop'))

            expect(mockReportError).not.toHaveBeenCalled()
        })

        it('does not report duplicate errors on re-render', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter({
                    shop_integration_id: null,
                }),
                guidanceHelpCenter: createMockHelpCenter({
                    type: 'guidance',
                    shop_integration_id: 456,
                }),
            })

            const { rerender } = renderHook(() =>
                useHelpCenterIntegrationCheck('test-shop'),
            )

            rerender()
            rerender()

            const snippetErrorCalls = mockReportError.mock.calls.filter(
                ([error]) =>
                    error instanceof Error && error.message.includes('snippet'),
            )
            expect(snippetErrorCalls).toHaveLength(1)
        })

        it('does not report error when shop_integration_id is valid', () => {
            setupMocks({
                snippetHelpCenter: createMockHelpCenter({
                    shop_integration_id: 123,
                }),
                guidanceHelpCenter: createMockHelpCenter({
                    type: 'guidance',
                    shop_integration_id: 456,
                }),
            })

            renderHook(() => useHelpCenterIntegrationCheck('test-shop'))

            expect(mockReportError).not.toHaveBeenCalled()
        })
    })
})
