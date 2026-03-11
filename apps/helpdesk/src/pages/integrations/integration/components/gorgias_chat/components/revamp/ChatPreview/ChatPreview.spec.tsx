import { createRef } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import type { ChatPreviewHandle } from './ChatPreview'
import { ChatPreview } from './ChatPreview'

jest.mock('models/integration/queries', () => ({
    useGetInstallationSnippet: jest.fn(),
}))

const mockUseGetInstallationSnippet = jest.requireMock(
    'models/integration/queries',
).useGetInstallationSnippet

const SNIPPET_WITH_SCRIPT =
    '<script src="https://chat.example.com/chat.js"></script>'

const renderComponent = (appId = 'test-app-id') => {
    const queryClient = mockQueryClient()
    const ref = createRef<ChatPreviewHandle>()

    const result = render(
        <QueryClientProvider client={queryClient}>
            <ChatPreview ref={ref} appId={appId} />
        </QueryClientProvider>,
    )

    return { ...result, ref }
}

describe('ChatPreview', () => {
    describe('loading state', () => {
        it('should show loading when snippet is loaded but widget has not yet signalled ready', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
            })

            renderComponent()

            expect(screen.getByText('Loading Preview...')).toBeInTheDocument()
        })

        it('should not show the iframe while the widget is loading', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
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
            })

            renderComponent()

            expect(
                screen.getByText('Chat preview could not be loaded.'),
            ).toBeInTheDocument()
        })

        it('should show error state when a helpdesk-chat-preview-error message is received', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
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
                    screen.getByText('Chat preview could not be loaded.'),
                ).toBeInTheDocument()
            })
        })

        it('should show error state when snippet has no script with a src', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: '<div>no script here</div>' },
                isLoading: false,
                isError: false,
            })

            renderComponent()

            await waitFor(() => {
                expect(
                    screen.getByText('Chat preview could not be loaded.'),
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
            })

            renderComponent()

            expect(screen.getByText('Loading Preview...')).toBeInTheDocument()

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            await waitFor(() => {
                expect(
                    screen.queryByText('Loading Preview...'),
                ).not.toBeInTheDocument()
            })

            expect(
                screen.getByTitle('helpdesk-chat-preview-iframe'),
            ).toBeVisible()
        })
    })

    describe('appId change', () => {
        it('should reset to loading state when appId changes', async () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
            })

            const queryClient = mockQueryClient()
            const { rerender } = render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="app-1" />
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
                    screen.queryByText('Loading Preview...'),
                ).not.toBeInTheDocument()
            })

            rerender(
                <QueryClientProvider client={queryClient}>
                    <ChatPreview appId="app-2" />
                </QueryClientProvider>,
            )

            await waitFor(() => {
                expect(
                    screen.getByText('Loading Preview...'),
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
            })

            renderComponent()

            const iframe = screen.getByTitle('helpdesk-chat-preview-iframe')
            expect(iframe).toHaveAttribute(
                'sandbox',
                'allow-scripts allow-same-origin',
            )
        })
    })

    describe('displayPage imperative handle', () => {
        it('should call GorgiasChat.open and setPage on the iframe contentWindow', () => {
            mockUseGetInstallationSnippet.mockReturnValue({
                data: { snippet: SNIPPET_WITH_SCRIPT },
                isLoading: false,
                isError: false,
            })

            const { ref } = renderComponent()

            const mockOpen = jest.fn()
            const mockSetPage = jest.fn()

            const iframe = screen.getByTitle(
                'helpdesk-chat-preview-iframe',
            ) as HTMLIFrameElement

            Object.defineProperty(iframe, 'contentWindow', {
                value: {
                    GorgiasChat: {
                        open: mockOpen,
                        setPage: mockSetPage,
                    },
                },
                writable: true,
            })

            act(() => {
                ref.current?.displayPage('homepage')
            })

            expect(mockOpen).toHaveBeenCalled()
            expect(mockSetPage).toHaveBeenCalledWith('homepage')
        })
    })
})
