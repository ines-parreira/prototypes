import { createRef } from 'react'
import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import type { ChatPreviewHandle } from './ChatPreview'
import { ChatPreview } from './ChatPreview'

jest.mock('models/integration/queries', () => ({
    useGetInstallationSnippet: jest.fn(),
}))

const mockUseGetInstallationSnippet = jest.requireMock(
    'models/integration/queries',
).useGetInstallationSnippet

const mockRefetchInstallationSnippet = jest.fn()

const SNIPPET_WITH_SCRIPT =
    '<script src="https://chat.example.com/chat.js"></script>'

const renderComponent = (
    props: Partial<ComponentProps<typeof ChatPreview>> = {},
) => {
    const queryClient = mockQueryClient()
    const ref = createRef<ChatPreviewHandle>()

    const result = render(
        <QueryClientProvider client={queryClient}>
            <ChatPreview
                ref={ref}
                appId="test-app-id"
                onLoaded={() => {}}
                {...props}
            />
        </QueryClientProvider>,
    )

    return { ...result, ref }
}

describe('ChatPreview', () => {
    beforeEach(() => {
        mockRefetchInstallationSnippet.mockReset()
    })

    describe('loading state', () => {
        it('should show loading when snippet is loaded but widget has not yet signalled ready', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            expect(screen.getByLabelText('Loading preview')).toBeInTheDocument()
        })

        it('should not show the iframe while the widget is loading', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            const iframe = screen.getByTitle('helpdesk-chat-preview-iframe')
            expect(iframe).not.toBeVisible()
        })
    })

    describe('error state', () => {
        it('should show error state when snippet fetch fails', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            expect(
                screen.getByText("Couldn't load preview."),
            ).toBeInTheDocument()
        })

        it('should show error state when a helpdesk-chat-preview-error message is received', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-error' },
                    }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByText("Couldn't load preview."),
                ).toBeInTheDocument()
            })
        })

        it('should return to loading state when reload button is clicked', async () => {
            const user = userEvent.setup()
            mockUseGetInstallationSnippet.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /reload preview/i }),
            )

            expect(screen.getByText('Loading preview...')).toBeInTheDocument()
        })

        it('should refetch the snippet when reload is clicked after a snippet fetch failure', async () => {
            const user = userEvent.setup()
            mockUseGetInstallationSnippet.mockReturnValue({
                data: undefined,
                isLoading: false,
                isError: true,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /reload preview/i }),
            )

            expect(mockRefetchInstallationSnippet).toHaveBeenCalledTimes(1)
        })

        it('should not refetch the snippet when reload is clicked after a widget error', async () => {
            const user = userEvent.setup()
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-error' },
                    }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /reload preview/i }),
                ).toBeInTheDocument()
            })

            await user.click(
                screen.getByRole('button', { name: /reload preview/i }),
            )

            expect(mockRefetchInstallationSnippet).not.toHaveBeenCalled()
        })

        it('should show error state when snippet has no script with a src', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: '<div>no script here</div>' },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText("Couldn't load preview."),
                ).toBeInTheDocument()
            })
        })
    })

    describe('widget loaded state', () => {
        it('should hide loading and show iframe when helpdesk-chat-preview-loaded message is received', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            expect(screen.getByLabelText('Loading preview')).toBeInTheDocument()

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('Loading preview'),
                ).not.toBeInTheDocument()
            })

            expect(
                screen.getByTitle('helpdesk-chat-preview-iframe'),
            ).toBeVisible()
        })
    })

    describe('message event listener', () => {
        it('calls onLoaded when helpdesk-chat-preview-loaded is received', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const onLoaded = jest.fn()
            const queryClient = mockQueryClient()
            render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="test-app-id" onLoaded={onLoaded} />
                </QueryClientProvider>,
            )

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            await waitFor(() => {
                expect(onLoaded).toHaveBeenCalledTimes(1)
            })
        })

        it('calls onLoaded with GorgiasChat and gorgiasChatConfiguration from the iframe contentWindow', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const onLoaded = jest.fn()
            const queryClient = mockQueryClient()
            const { container } = render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="test-app-id" onLoaded={onLoaded} />
                </QueryClientProvider>,
            )

            const iframe = container.querySelector('iframe')!
            const mockGorgiasChat = { setPage: jest.fn() }
            const mockConfig = { featureFlags: {} }
            Object.defineProperty(iframe, 'contentWindow', {
                value: {
                    GorgiasChat: mockGorgiasChat,
                    gorgiasChatConfiguration: mockConfig,
                },
                configurable: true,
            })

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            await waitFor(() => {
                expect(onLoaded).toHaveBeenCalledWith(
                    mockGorgiasChat,
                    mockConfig,
                )
            })
        })

        it('calls onLoaded with undefined args when the iframe has no contentWindow globals', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const onLoaded = jest.fn()
            const queryClient = mockQueryClient()
            render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="test-app-id" onLoaded={onLoaded} />
                </QueryClientProvider>,
            )

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            await waitFor(() => {
                expect(onLoaded).toHaveBeenCalledWith(undefined, undefined)
            })
        })

        it('calls onLoaded with undefined args when the iframe contentWindow is null', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const onLoaded = jest.fn()
            const queryClient = mockQueryClient()
            const { container } = render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="test-app-id" onLoaded={onLoaded} />
                </QueryClientProvider>,
            )

            const iframe = container.querySelector('iframe')!
            Object.defineProperty(iframe, 'contentWindow', {
                value: null,
                configurable: true,
            })

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            await waitFor(() => {
                expect(onLoaded).toHaveBeenCalledWith(undefined, undefined)
            })
        })

        it('does not call onLoaded or set error state when message event has no data', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const onLoaded = jest.fn()
            const queryClient = mockQueryClient()
            render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="test-app-id" onLoaded={onLoaded} />
                </QueryClientProvider>,
            )

            act(() => {
                window.dispatchEvent(new MessageEvent('message'))
            })

            expect(onLoaded).not.toHaveBeenCalled()
            expect(
                screen.queryByText("Couldn't load preview."),
            ).not.toBeInTheDocument()
        })

        it('does not call onLoaded or change error state for unrelated message types', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const onLoaded = jest.fn()
            const queryClient = mockQueryClient()
            render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="test-app-id" onLoaded={onLoaded} />
                </QueryClientProvider>,
            )

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'some-unrelated-message' },
                    }),
                )
            })

            expect(onLoaded).not.toHaveBeenCalled()
            expect(
                screen.queryByText("Couldn't load preview."),
            ).not.toBeInTheDocument()
        })

        it('does not call onLoaded after the component is unmounted', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const onLoaded = jest.fn()
            const queryClient = mockQueryClient()
            const { unmount } = render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="test-app-id" onLoaded={onLoaded} />
                </QueryClientProvider>,
            )

            unmount()

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            expect(onLoaded).not.toHaveBeenCalled()
        })

        it('uses the latest onLoaded callback after a re-render', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const firstOnLoaded = jest.fn()
            const secondOnLoaded = jest.fn()
            const queryClient = mockQueryClient()

            const { rerender } = render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="test-app-id" onLoaded={firstOnLoaded} />
                </QueryClientProvider>,
            )

            rerender(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview
                        appId="test-app-id"
                        onLoaded={secondOnLoaded}
                    />
                </QueryClientProvider>,
            )

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            await waitFor(() => {
                expect(secondOnLoaded).toHaveBeenCalledTimes(1)
            })
            expect(firstOnLoaded).not.toHaveBeenCalled()
        })
    })

    describe('appId change', () => {
        it('should reset to loading state when appId changes', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const queryClient = mockQueryClient()
            const { rerender } = render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="app-1" onLoaded={() => {}} />
                </QueryClientProvider>,
            )

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.queryByLabelText('Loading preview'),
                ).not.toBeInTheDocument()
            })

            rerender(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="app-2" onLoaded={() => {}} />
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByLabelText('Loading preview'),
                ).toBeInTheDocument()
            })
        })
    })

    describe('iframe', () => {
        it('should render iframe with sandbox attribute', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            renderComponent()

            const iframe = screen.getByTitle('helpdesk-chat-preview-iframe')
            expect(iframe).toHaveAttribute(
                'sandbox',
                'allow-scripts allow-same-origin',
            )
        })

        it('should set srcDoc with an html tag', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
            })

            renderComponent()

            const iframe = screen.getByTitle('helpdesk-chat-preview-iframe')
            expect(iframe).toHaveAttribute(
                'srcdoc',
                expect.stringContaining('<html>'),
            )
            expect(iframe).toHaveAttribute(
                'srcdoc',
                expect.stringContaining('</html>'),
            )
        })

        it('should set srcDoc with a body tag', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
            })

            renderComponent()

            const iframe = screen.getByTitle('helpdesk-chat-preview-iframe')
            expect(iframe).toHaveAttribute(
                'srcdoc',
                expect.stringContaining('<body>'),
            )
            expect(iframe).toHaveAttribute(
                'srcdoc',
                expect.stringContaining('</body>'),
            )
        })

        it('should include the chat window height override when fitChatWindowHeight is true', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
            })

            renderComponent({ fitChatWindowHeight: true })

            const iframe = screen.getByTitle('helpdesk-chat-preview-iframe')
            expect(iframe).toHaveAttribute(
                'srcdoc',
                expect.stringContaining(
                    '#chat-window { height: calc(100% - 100px) !important; }',
                ),
            )
        })

        it('should not include the chat window height override by default', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
            })

            renderComponent()

            const iframe = screen.getByTitle('helpdesk-chat-preview-iframe')
            expect(iframe).toHaveAttribute(
                'srcdoc',
                expect.not.stringContaining(
                    '#chat-window { height: calc(100% - 100px) !important; }',
                ),
            )
        })
    })

    describe('useImperativeHandle', () => {
        it('should expose iframeRef pointing to the rendered iframe element', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const { ref } = renderComponent()

            expect(ref.current?.iframeRef.current).toBe(
                screen.getByTitle('helpdesk-chat-preview-iframe'),
            )
        })

        it('should expose isLoaded as false before the widget signals ready', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const { ref } = renderComponent()

            expect(ref.current?.isLoaded).toBe(false)
        })

        it('should expose isLoaded as true after the widget signals ready', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const { ref } = renderComponent()

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            await waitFor(() => {
                expect(ref.current?.isLoaded).toBe(true)
            })
        })

        it('should expose hasError as false initially', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const { ref } = renderComponent()

            expect(ref.current?.hasError).toBe(false)
        })

        it('should expose hasError as true after the widget signals an error', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
                refetch: mockRefetchInstallationSnippet,
            })

            const { ref } = renderComponent()

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-error' },
                    }),
                )
            })

            await waitFor(() => {
                expect(ref.current?.hasError).toBe(true)
            })
        })
    })
})
