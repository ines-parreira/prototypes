import React, { createRef } from 'react'

import { render } from '@repo/testing'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ChatPreviewHandle } from '../ChatPreview/ChatPreview'
import { ChatPreviewDefault } from './ChatPreviewDefault'

const mockRefetch = jest.fn()
let mockQueryReturn: {
    data:
        | { snippet: string; snippetVersion: string; appKey: string }
        | undefined
    isLoading: boolean
    isError: boolean
    refetch: jest.Mock
}

jest.mock('models/integration/queries', () => ({
    useGetPreviewInstallationSnippet: () => mockQueryReturn,
}))

jest.mock(
    '../ChatPreview/ChatPreviewBootstrapScript.js?raw',
    () => 'console.log("bootstrap")',
    {
        virtual: true,
    },
)

const validSnippet = `<script id="gorgias-chat-widget-install-v3" src="https://example.com/bundle-loader/preview"></script>`

const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
})

const renderComponent = (
    props: { onLoaded?: (gc: Window['GorgiasChat']) => void } = {},
) => {
    const ref = createRef<ChatPreviewHandle>()
    const result = render(
        <QueryClientProvider client={queryClient}>
            <ChatPreviewDefault ref={ref} {...props} />
        </QueryClientProvider>,
    )
    return { ...result, ref }
}

describe('ChatPreviewDefault', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryReturn = {
            data: {
                snippet: validSnippet,
                snippetVersion: 'v3',
                appKey: 'preview',
            },
            isLoading: false,
            isError: false,
            refetch: mockRefetch,
        }
    })

    describe('loading state', () => {
        it('shows loading indicator when snippet is loading', () => {
            mockQueryReturn.isLoading = true
            mockQueryReturn.data = undefined
            renderComponent()

            expect(screen.getByText('Loading preview...')).toBeInTheDocument()
        })

        it('shows loading indicator when snippet loaded but iframe not yet loaded', () => {
            renderComponent()

            expect(screen.getByText('Loading preview...')).toBeInTheDocument()
        })
    })

    describe('error state', () => {
        it('shows error state when snippet fetch fails', () => {
            mockQueryReturn.isError = true
            renderComponent()

            expect(
                screen.getByText("Couldn't load preview."),
            ).toBeInTheDocument()
        })

        it('shows error state when snippet has no script src', () => {
            mockQueryReturn.data = {
                snippet: '<div>no script here</div>',
                snippetVersion: 'v3',
                appKey: 'preview',
            }
            renderComponent()

            expect(
                screen.getByText("Couldn't load preview."),
            ).toBeInTheDocument()
        })

        it('calls refetch when reload button is clicked after snippet error', async () => {
            const user = userEvent.setup()
            mockQueryReturn.isError = true
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /reload preview/i }),
            )

            expect(mockRefetch).toHaveBeenCalled()
        })

        it('does not refetch on reload when error is not from snippet fetch', async () => {
            const user = userEvent.setup()
            mockQueryReturn.data = {
                snippet: '<div>no script</div>',
                snippetVersion: 'v3',
                appKey: 'preview',
            }
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: /reload preview/i }),
            )

            expect(mockRefetch).not.toHaveBeenCalled()
        })
    })

    describe('iframe rendering', () => {
        it('renders an iframe with the correct title', () => {
            renderComponent()

            expect(
                screen.getByTitle('helpdesk-chat-preview-iframe'),
            ).toBeInTheDocument()
        })

        it('hides iframe when not loaded', () => {
            renderComponent()

            const iframe = screen.getByTitle('helpdesk-chat-preview-iframe')
            expect(iframe).toHaveStyle({ display: 'none' })
        })
    })

    describe('message handling', () => {
        it('sets loaded state when receiving helpdesk-chat-preview-loaded message', () => {
            const onLoaded = jest.fn()
            renderComponent({ onLoaded })

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            const iframe = screen.getByTitle('helpdesk-chat-preview-iframe')
            expect(iframe).not.toHaveStyle({ display: 'none' })
        })

        it('sets error state when receiving helpdesk-chat-preview-error message', () => {
            renderComponent()

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-error' },
                    }),
                )
            })

            expect(
                screen.getByText("Couldn't load preview."),
            ).toBeInTheDocument()
        })

        it('calls onLoaded when helpdesk-chat-preview-loaded is received', () => {
            const onLoaded = jest.fn()
            renderComponent({ onLoaded })

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            expect(onLoaded).toHaveBeenCalledTimes(1)
        })

        it('calls onLoaded with GorgiasChat and gorgiasChatConfiguration from the iframe contentWindow', () => {
            const onLoaded = jest.fn()
            const { container } = renderComponent({ onLoaded })

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

            expect(onLoaded).toHaveBeenCalledWith(mockGorgiasChat, mockConfig)
        })

        it('calls onLoaded with undefined args when the iframe has no contentWindow globals', () => {
            const onLoaded = jest.fn()
            renderComponent({ onLoaded })

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            expect(onLoaded).toHaveBeenCalledWith(undefined, undefined)
        })

        it('calls onLoaded with undefined args when the iframe contentWindow is null', () => {
            const onLoaded = jest.fn()
            const { container } = renderComponent({ onLoaded })

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

            expect(onLoaded).toHaveBeenCalledWith(undefined, undefined)
        })

        it('does not call onLoaded or set error state when message event has no data', () => {
            const onLoaded = jest.fn()
            renderComponent({ onLoaded })

            act(() => {
                window.dispatchEvent(new MessageEvent('message'))
            })

            expect(onLoaded).not.toHaveBeenCalled()
            expect(
                screen.queryByText("Couldn't load preview."),
            ).not.toBeInTheDocument()
        })

        it('does not throw when loaded message arrives without an onLoaded prop', () => {
            renderComponent()

            expect(() => {
                act(() => {
                    window.dispatchEvent(
                        new MessageEvent('message', {
                            data: { type: 'helpdesk-chat-preview-loaded' },
                        }),
                    )
                })
            }).not.toThrow()
        })

        it('does not call onLoaded or change error state for unrelated message types', () => {
            const onLoaded = jest.fn()
            renderComponent({ onLoaded })

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

        it('does not call onLoaded after the component is unmounted', () => {
            const onLoaded = jest.fn()
            const { unmount } = renderComponent({ onLoaded })

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

        it('uses the latest onLoaded callback after a re-render', () => {
            const firstOnLoaded = jest.fn()
            const secondOnLoaded = jest.fn()
            const ref = createRef<ChatPreviewHandle>()

            const { rerender } = render(
                <QueryClientProvider client={queryClient}>
                    <ChatPreviewDefault ref={ref} onLoaded={firstOnLoaded} />
                </QueryClientProvider>,
            )

            rerender(
                <QueryClientProvider client={queryClient}>
                    <ChatPreviewDefault ref={ref} onLoaded={secondOnLoaded} />
                </QueryClientProvider>,
            )

            act(() => {
                window.dispatchEvent(
                    new MessageEvent('message', {
                        data: { type: 'helpdesk-chat-preview-loaded' },
                    }),
                )
            })

            expect(secondOnLoaded).toHaveBeenCalledTimes(1)
            expect(firstOnLoaded).not.toHaveBeenCalled()
        })
    })

    describe('imperative handle', () => {
        it('exposes isLoaded as false initially', () => {
            const { ref } = renderComponent()

            expect(ref.current?.isLoaded).toBe(false)
        })

        it('exposes hasError as false initially', () => {
            const { ref } = renderComponent()

            expect(ref.current?.hasError).toBe(false)
        })

        it('exposes hasError as true when snippet fetch fails', () => {
            mockQueryReturn.isError = true
            const { ref } = renderComponent()

            expect(ref.current?.hasError).toBe(true)
        })

        it('exposes iframeRef', () => {
            const { ref } = renderComponent()

            expect(ref.current?.iframeRef).toBeDefined()
        })
    })

    describe('cleanup', () => {
        it('removes message event listener on unmount', () => {
            const removeListenerSpy = jest.spyOn(window, 'removeEventListener')
            const { unmount } = renderComponent()

            unmount()

            expect(removeListenerSpy).toHaveBeenCalledWith(
                'message',
                expect.any(Function),
            )
            removeListenerSpy.mockRestore()
        })
    })
})
