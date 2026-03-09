import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SyncUrlModal } from './SyncUrlModal'
import { useListenToDocumentEvent } from './utils'

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(() => ({ shopName: 'test-shop' })),
}))

jest.mock('hooks/useAppDispatch', () => ({
    __esModule: true,
    default: jest.fn(() => jest.fn()),
}))

jest.mock(
    '../../AiAgentScrapedDomainContent/hooks/useIngestionDomainBannerDismissed',
    () => ({
        useIngestionDomainBannerDismissed: jest.fn(() => ({
            resetBanner: jest.fn(),
            dismissBanner: jest.fn(),
        })),
    }),
)

jest.mock('../../hooks/useSyncUrl', () => ({
    useSyncUrl: jest.fn(() => ({
        syncUrl: jest.fn().mockResolvedValue(undefined),
        validateUrl: jest.fn(() => null),
        urlIngestionLogs: [],
    })),
}))

jest.mock(
    'pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames',
    () => ({
        __esModule: true,
        default: jest.fn(() => ({
            customDomainHostnames: [],
        })),
    }),
)

jest.mock('./utils', () => ({
    ...jest.requireActual('./utils'),
    useListenToDocumentEvent: jest.fn(),
}))

jest.mock('../../AiAgentScrapedDomainContent/utils', () => ({
    ...jest.requireActual('../../AiAgentScrapedDomainContent/utils'),
    isSyncLessThan24Hours: jest.fn(() => false),
    getNextSyncDate: jest.fn(() => '01/15/25 10:00 AM'),
}))

jest.mock('../../hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: jest.fn(() => ({
        routes: {
            knowledge: '/test-shop/settings/ai-agent/knowledge',
        },
    })),
}))

const mockUseListenToDocumentEvent =
    useListenToDocumentEvent as jest.MockedFunction<
        typeof useListenToDocumentEvent
    >

describe('SyncUrlModal', () => {
    let eventCallback: (event?: Event) => void
    let queryClient: QueryClient

    const defaultProps = {
        helpCenterId: 1,
        existingUrls: [] as string[],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        })

        mockUseListenToDocumentEvent.mockImplementation(
            (eventName, callback) => {
                eventCallback = callback
            },
        )
    })

    const renderComponent = (props = defaultProps) => {
        return render(
            <QueryClientProvider client={queryClient}>
                <SyncUrlModal {...props} />
            </QueryClientProvider>,
        )
    }

    describe('modal visibility', () => {
        it('is closed by default', () => {
            renderComponent()

            expect(
                screen.queryByRole('heading', { name: 'Add URL' }),
            ).not.toBeInTheDocument()
        })

        it('opens when OPEN_SYNC_URL_MODAL event is dispatched', async () => {
            renderComponent()

            act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('heading', { name: 'Add URL' }),
            ).toBeInTheDocument()
        })

        it('opens with pre-populated URL when event contains source data', async () => {
            renderComponent()

            const mockEvent = {
                detail: { source: 'https://example.com/page' },
            } as CustomEvent

            act(() => {
                eventCallback?.(mockEvent)
            })

            expect(
                screen.getByRole('heading', { name: 'Sync URL' }),
            ).toBeInTheDocument()
        })

        it('closes when Cancel button is clicked', async () => {
            renderComponent()

            act(() => {
                eventCallback?.()
            })

            const cancelButton = screen.getByRole('button', { name: 'Cancel' })
            await act(() => userEvent.click(cancelButton))

            await waitFor(() => {
                expect(
                    screen.queryByRole('heading', { name: 'Add URL' }),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('add URL mode', () => {
        it('renders add URL title and instructions', async () => {
            renderComponent()

            act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('heading', { name: 'Add URL' }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Add a single-page URL to sync/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    /URLs from your Gorgias Help Center are not supported/,
                ),
            ).toBeInTheDocument()
        })

        it('renders URL input field', async () => {
            renderComponent()

            act(() => {
                eventCallback?.()
            })

            expect(
                screen.getByRole('textbox', { name: 'URL' }),
            ).toBeInTheDocument()
        })

        it('updates URL value when user types', async () => {
            renderComponent()

            act(() => {
                eventCallback?.()
            })

            const input = screen.getByRole('textbox', { name: 'URL' })
            await act(() => userEvent.type(input, 'https://example.com'))

            expect(input).toHaveValue('https://example.com')
        })

        it('validates URL after debounce delay', async () => {
            const { useSyncUrl } = jest.requireMock('../../hooks/useSyncUrl')
            const validateUrl = jest.fn(() => 'Invalid URL')

            useSyncUrl.mockReturnValue({
                syncUrl: jest.fn(),
                validateUrl,
                urlIngestionLogs: [],
            })

            renderComponent()

            act(() => {
                eventCallback?.()
            })

            const input = screen.getByRole('textbox', { name: 'URL' })
            await act(() => userEvent.type(input, 'invalid-url'))

            await waitFor(
                () => {
                    expect(validateUrl).toHaveBeenCalledWith('invalid-url')
                },
                { timeout: 600 },
            )
        })

        it('clears error when user starts typing', async () => {
            const { useSyncUrl } = jest.requireMock('../../hooks/useSyncUrl')
            const validateUrl = jest
                .fn()
                .mockReturnValueOnce('Invalid URL')
                .mockReturnValueOnce(null)

            useSyncUrl.mockReturnValue({
                syncUrl: jest.fn(),
                validateUrl,
                urlIngestionLogs: [],
            })

            renderComponent()

            act(() => {
                eventCallback?.()
            })

            const input = screen.getByRole('textbox', { name: 'URL' })
            await act(() => userEvent.type(input, 'invalid'))

            await waitFor(() => {
                expect(screen.getByText('Invalid URL')).toBeInTheDocument()
            })

            await act(() => userEvent.type(input, '-fixed'))

            expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument()
        })

        it('triggers sync when Enter key is pressed', async () => {
            const { useSyncUrl } = jest.requireMock('../../hooks/useSyncUrl')
            const syncUrl = jest.fn().mockResolvedValue(undefined)

            useSyncUrl.mockReturnValue({
                syncUrl,
                validateUrl: jest.fn(() => null),
                urlIngestionLogs: [],
            })

            renderComponent()

            act(() => {
                eventCallback?.()
            })

            const input = screen.getByRole('textbox', { name: 'URL' })
            await act(async () => {
                await userEvent.type(input, 'https://example.com{Enter}')
            })

            await waitFor(() => {
                expect(syncUrl).toHaveBeenCalledWith('https://example.com')
            })
        })

        it('shows "existing URL" link when duplicate URL is entered', async () => {
            const duplicateUrl = 'https://example.com/existing'
            const { useSyncUrl } = jest.requireMock('../../hooks/useSyncUrl')
            const encodedUrl = encodeURIComponent(duplicateUrl)
            const existingUrlLink = `http://localhost/test-shop/settings/ai-agent/knowledge/sources?filter=url&folder=${encodedUrl}`
            const validateUrl = jest.fn(() => (
                <>
                    This URL is already synced. To sync new version, re sync the{' '}
                    <a
                        href={existingUrlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            textDecoration: 'underline',
                        }}
                    >
                        existing URL
                    </a>
                    .
                </>
            ))

            useSyncUrl.mockReturnValue({
                syncUrl: jest.fn(),
                validateUrl,
                urlIngestionLogs: [],
            })

            renderComponent({
                ...defaultProps,
                existingUrls: [duplicateUrl],
            })

            act(() => {
                eventCallback?.()
            })

            const input = screen.getByRole('textbox', { name: 'URL' })
            await act(() => userEvent.type(input, duplicateUrl))

            await waitFor(
                () => {
                    expect(
                        screen.getByText(/This URL is already synced/i),
                    ).toBeInTheDocument()
                },
                { timeout: 600 },
            )

            const link = screen.getByText('existing URL')
            expect(link).toBeInTheDocument()
        })

        it('has correct href for "existing URL" link', async () => {
            const duplicateUrl2 = 'https://example.com/existing'
            const { useSyncUrl } = jest.requireMock('../../hooks/useSyncUrl')
            const encodedUrl2 = encodeURIComponent(duplicateUrl2)
            const existingUrlLink2 = `http://localhost/test-shop/settings/ai-agent/knowledge/sources?filter=url&folder=${encodedUrl2}`
            const validateUrl2 = jest.fn(() => (
                <>
                    This URL is already synced. To sync new version, re sync the{' '}
                    <a
                        href={existingUrlLink2}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            textDecoration: 'underline',
                        }}
                    >
                        existing URL
                    </a>
                    .
                </>
            ))

            useSyncUrl.mockReturnValue({
                syncUrl: jest.fn(),
                validateUrl: validateUrl2,
                urlIngestionLogs: [],
            })

            renderComponent({
                ...defaultProps,
                existingUrls: [duplicateUrl2],
            })

            act(() => {
                eventCallback?.()
            })

            const input = screen.getByRole('textbox', { name: 'URL' })
            await act(() => userEvent.type(input, duplicateUrl2))

            await waitFor(
                () => {
                    expect(screen.getByText('existing URL')).toBeInTheDocument()
                },
                { timeout: 600 },
            )

            const link = screen.getByText('existing URL')
            expect(link).toHaveAttribute(
                'href',
                `http://localhost/test-shop/settings/ai-agent/knowledge/sources?filter=url&folder=${encodedUrl2}`,
            )
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        })
    })

    describe('resync mode', () => {
        it('renders sync URL title and warning text', async () => {
            renderComponent()

            const mockEvent = {
                detail: { source: 'https://example.com/page' },
            } as CustomEvent

            act(() => {
                eventCallback?.(mockEvent)
            })

            expect(
                screen.getByRole('heading', { name: 'Sync URL' }),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/Syncing will replace all existing snippets/),
            ).toBeInTheDocument()
            expect(
                screen.getByText(/This action cannot be undone/),
            ).toBeInTheDocument()
        })

        it('does not show URL input field', async () => {
            renderComponent()

            const mockEvent = {
                detail: { source: 'https://example.com/page' },
            } as CustomEvent

            act(() => {
                eventCallback?.(mockEvent)
            })

            expect(
                screen.queryByRole('textbox', { name: 'URL' }),
            ).not.toBeInTheDocument()
        })

        it('does not trigger sync when Enter key is pressed', async () => {
            const { useSyncUrl } = jest.requireMock('../../hooks/useSyncUrl')
            const syncUrl = jest.fn().mockResolvedValue(undefined)

            useSyncUrl.mockReturnValue({
                syncUrl,
                validateUrl: jest.fn(() => null),
                urlIngestionLogs: [],
            })

            renderComponent()

            const mockEvent = {
                detail: { source: 'https://example.com/page' },
            } as CustomEvent

            act(() => {
                eventCallback?.(mockEvent)
            })

            act(() => {
                const event = new KeyboardEvent('keydown', { key: 'Enter' })
                window.dispatchEvent(event)
            })

            expect(syncUrl).not.toHaveBeenCalled()
        })

        it('skips validation when syncing', async () => {
            const { useSyncUrl } = jest.requireMock('../../hooks/useSyncUrl')
            const syncUrl = jest.fn().mockResolvedValue(undefined)
            const validateUrl = jest.fn()

            useSyncUrl.mockReturnValue({
                syncUrl,
                validateUrl,
                urlIngestionLogs: [],
            })

            renderComponent()

            const mockEvent = {
                detail: { source: 'https://example.com/page' },
            } as CustomEvent

            act(() => {
                eventCallback?.(mockEvent)
            })

            const syncButton = screen.getByRole('button', { name: /sync/i })
            await act(() => userEvent.click(syncButton))

            await waitFor(() => {
                expect(syncUrl).toHaveBeenCalled()
            })

            expect(validateUrl).not.toHaveBeenCalled()
        })
    })

    describe('sync button states', () => {
        it('is disabled when URL is empty', async () => {
            renderComponent()

            act(() => {
                eventCallback?.()
            })

            const syncButton = screen.getByRole('button', { name: /sync/i })
            expect(syncButton).toBeDisabled()
        })

        it('allows sync when URL is provided via Enter key', async () => {
            const { useSyncUrl } = jest.requireMock('../../hooks/useSyncUrl')
            const syncUrl = jest.fn().mockResolvedValue(undefined)

            useSyncUrl.mockReturnValue({
                syncUrl,
                validateUrl: jest.fn(() => null),
                urlIngestionLogs: [],
            })

            renderComponent()

            act(() => {
                eventCallback?.()
            })

            const input = screen.getByRole('textbox', { name: 'URL' })
            await act(async () => {
                await userEvent.type(input, 'https://example.com{Enter}')
            })

            await waitFor(() => {
                expect(syncUrl).toHaveBeenCalledWith('https://example.com')
            })
        })

        it('is disabled when synced less than 24 hours ago', async () => {
            const { isSyncLessThan24Hours } = jest.requireMock(
                '../../AiAgentScrapedDomainContent/utils',
            )
            const { useSyncUrl } = jest.requireMock('../../hooks/useSyncUrl')

            isSyncLessThan24Hours.mockReturnValue(true)
            useSyncUrl.mockReturnValue({
                syncUrl: jest.fn(),
                validateUrl: jest.fn(() => null),
                urlIngestionLogs: [
                    {
                        url: 'https://example.com/page',
                        latest_sync: new Date().toISOString(),
                    },
                ],
            })

            renderComponent()

            const mockEvent = {
                detail: { source: 'https://example.com/page' },
            } as CustomEvent

            act(() => {
                eventCallback?.(mockEvent)
            })

            const syncButton = screen.getByRole('button', { name: /sync/i })
            expect(syncButton).toBeDisabled()
        })
    })
})
