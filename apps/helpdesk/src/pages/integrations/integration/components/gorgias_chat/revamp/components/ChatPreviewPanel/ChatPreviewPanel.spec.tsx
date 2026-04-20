import React, { createRef } from 'react'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ButtonGroupItemProps, ButtonGroupProps } from '@gorgias/axiom'

import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types'

import type { ChatPreviewPanelHandle } from './ChatPreviewPanel'
import { ChatPreviewPanel } from './ChatPreviewPanel'
import type { ChatPreviewHandle } from './components/ChatPreview/ChatPreview'

let mockIsLoaded = true
let mockHasError = false
let mockHasGorgiasChat = true

jest.mock('@gorgias/axiom', () => {
    let capturedOnSelectionChange: ((key: string) => void) | undefined

    return {
        ...jest.requireActual('@gorgias/axiom'),
        ButtonGroup: ({ children, onSelectionChange }: ButtonGroupProps) => {
            capturedOnSelectionChange = onSelectionChange
            return <div>{children}</div>
        },
        ButtonGroupItem: ({ id }: ButtonGroupItemProps) => (
            <button
                data-testid={`button-group-item-${id}`}
                onClick={() => capturedOnSelectionChange?.(id)}
            >
                {id}
            </button>
        ),
    }
})

let mockMountCount = 0

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/components/ChatPreview/ChatPreview',
    () => {
        const React = require('react')

        const mockGorgiasChat = {
            setPage: jest.fn(),
            close: jest.fn(),
            open: jest.fn(),
            setPosition: jest.fn(),
            updateSettings: jest.fn(),
            updateTexts: jest.fn(),
            setLanguage: jest.fn().mockResolvedValue(undefined),
            updateSelfServiceConfiguration: jest.fn(),
            setOrders: jest.fn(),
            setConversationMessages: jest.fn(),
            simulateConversation: jest.fn(),
        }

        let capturedOnLoaded:
            | ((gorgiasChat: NonNullable<Window['GorgiasChat']>) => void)
            | undefined

        const ChatPreview = React.forwardRef(
            (
                props: {
                    appId: string
                    onLoaded?: (
                        gorgiasChat: NonNullable<Window['GorgiasChat']>,
                    ) => void
                },
                ref: React.Ref<ChatPreviewHandle>,
            ) => {
                capturedOnLoaded = props.onLoaded

                React.useEffect(() => {
                    mockMountCount++
                }, [])

                React.useImperativeHandle(ref, () => ({
                    iframeRef: {
                        current: mockHasGorgiasChat
                            ? {
                                  contentWindow: {
                                      GorgiasChat: mockGorgiasChat,
                                      Object,
                                  },
                              }
                            : { contentWindow: {} },
                    },
                    isLoaded: mockIsLoaded,
                    hasError: mockHasError,
                }))
                return <div data-testid="chat-preview" />
            },
        )

        const triggerOnLoaded = () =>
            capturedOnLoaded?.(
                mockGorgiasChat as unknown as NonNullable<
                    Window['GorgiasChat']
                >,
            )

        return { ChatPreview, mockGorgiasChat, triggerOnLoaded }
    },
)

const { mockGorgiasChat } = jest.requireMock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/components/ChatPreview/ChatPreview',
)

describe('ChatPreviewPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockIsLoaded = true
        mockHasError = false
        mockHasGorgiasChat = true
        mockMountCount = 0
    })

    const renderComponent = (
        appId: string | null = 'test-app-id',
        props?: Partial<React.ComponentProps<typeof ChatPreviewPanel>>,
    ) => {
        const ref = createRef<ChatPreviewPanelHandle>()
        const result = render(
            <ChatPreviewPanel ref={ref} appId={appId} {...props} />,
        )
        return { ...result, ref }
    }

    describe('rendering', () => {
        it('renders the "Chat preview" label', () => {
            renderComponent()

            expect(screen.getByText('Chat preview')).toBeInTheDocument()
        })

        it('renders ChatPreview when appId is provided', () => {
            renderComponent('some-app-id')

            expect(screen.getByTestId('chat-preview')).toBeInTheDocument()
        })

        it('does not render ChatPreview when appId is null', () => {
            renderComponent(null)

            expect(screen.queryByTestId('chat-preview')).not.toBeInTheDocument()
        })

        it('renders headerActions instead of the default ButtonGroup when provided', () => {
            render(
                <ChatPreviewPanel
                    ref={createRef()}
                    appId="test-app-id"
                    headerActions={<div>Custom actions</div>}
                />,
            )

            expect(screen.getByText('Custom actions')).toBeInTheDocument()
            expect(
                screen.queryByTestId('button-group-item-homepage'),
            ).not.toBeInTheDocument()
        })

        it('renders a warning banner when appId is null', () => {
            renderComponent(null)

            expect(
                screen.getByText(
                    'Connect a Chat or Help Center to your store to use this feature.',
                ),
            ).toBeInTheDocument()
        })

        it('does not render warning banner when appId is provided', () => {
            renderComponent('some-app-id')

            expect(
                screen.queryByText(
                    'Connect a Chat or Help Center to your store to use this feature.',
                ),
            ).not.toBeInTheDocument()
        })

        it('renders custom headerActions when provided', () => {
            renderComponent('some-app-id', {
                headerActions: <button>Custom Action</button>,
            })

            expect(
                screen.getByRole('button', { name: 'Custom Action' }),
            ).toBeInTheDocument()
        })
    })

    describe('page navigation', () => {
        it('calls displayPage and openChat when the homepage button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByTestId('button-group-item-homepage'))

            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith(
                'homepage',
                undefined,
            )
            expect(mockGorgiasChat.open).toHaveBeenCalled()
        })

        it('calls displayPage and openChat when the conversation button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByTestId('button-group-item-conversation'),
            )

            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith(
                'conversation',
                undefined,
            )
            expect(mockGorgiasChat.open).toHaveBeenCalled()
        })
    })

    describe('imperative handle', () => {
        it('exposes all required methods on the ref', () => {
            const { ref } = renderComponent()

            expect(ref.current?.displayPage).toBeDefined()
            expect(ref.current?.updatePosition).toBeDefined()
            expect(ref.current?.updateSettings).toBeDefined()
            expect(ref.current?.updateTexts).toBeDefined()
            expect(ref.current?.closeChat).toBeDefined()
            expect(ref.current?.openChat).toBeDefined()
            expect(ref.current?.updateWorkflowEntryPoints).toBeDefined()
            expect(ref.current?.reloadPreview).toBeDefined()
        })

        it('displayPage calls GorgiasChat.setPage', () => {
            const { ref } = renderComponent()

            ref.current?.displayPage('conversation')

            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith(
                'conversation',
                undefined,
            )
        })

        it('openChat calls GorgiasChat.open', () => {
            const { ref } = renderComponent()

            ref.current?.openChat()

            expect(mockGorgiasChat.open).toHaveBeenCalled()
        })

        it('closeChat calls GorgiasChat.close', () => {
            const { ref } = renderComponent()

            ref.current?.closeChat()

            expect(mockGorgiasChat.close).toHaveBeenCalled()
        })

        it('updatePosition calls GorgiasChat.setPosition', () => {
            const { ref } = renderComponent()

            const testPosition = {
                alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                offsetX: 0,
                offsetY: 0,
            }

            ref.current?.updatePosition(testPosition)

            expect(mockGorgiasChat.setPosition).toHaveBeenCalledWith(
                testPosition,
            )
        })

        it('updateSettings calls GorgiasChat.updateSettings', () => {
            const { ref } = renderComponent()
            const settings = { decoration: { mainColor: '#ff0000' } }

            ref.current?.updateSettings(settings)

            expect(mockGorgiasChat.updateSettings).toHaveBeenCalledWith(
                settings,
            )
        })

        it('updateTexts calls GorgiasChat.updateTexts with the provided texts', () => {
            const { ref } = renderComponent()
            const texts = { title: 'Hello', subtitle: 'World' }

            ref.current?.updateTexts(texts)

            expect(mockGorgiasChat.updateTexts).toHaveBeenCalledWith(
                expect.objectContaining(texts),
            )
        })

        it('updateWorkflowEntrypoints calls GorgiasChat.updateSelfServiceConfiguration with the provided entrypoints', () => {
            const { ref } = renderComponent()
            const entrypoints = [{ id: 'flow-1' }, { id: 'flow-2' }] as any

            ref.current?.updateWorkflowEntryPoints(entrypoints)

            expect(
                mockGorgiasChat.updateSelfServiceConfiguration,
            ).toHaveBeenCalledWith({ workflowsEntrypoints: entrypoints })
        })

        it('reloadPreview causes ChatPreview to remount', () => {
            const { ref } = renderComponent()
            expect(mockMountCount).toBe(1)

            act(() => {
                ref.current?.reloadPreview()
            })

            expect(mockMountCount).toBe(2)
        })

        it('updatePreviewOrders calls GorgiasChat.setOrders', () => {
            const { ref } = renderComponent()
            const options = { orders: { '#1001': { name: '#1001' } as any } }

            ref.current?.updatePreviewOrders(options)

            expect(mockGorgiasChat.setOrders).toHaveBeenCalledWith(options)
        })

        it('setConversationMessages calls gorgiasChat.setConversationMessages', () => {
            const { ref } = renderComponent()
            const messages = [
                { text: 'Hello', isHtml: false, fromAgent: false },
            ]

            ref.current?.setConversationMessages(messages)

            expect(
                mockGorgiasChat.setConversationMessages,
            ).toHaveBeenCalledWith(messages)
        })

        it('setConversationMessages falls back to simulateConversation when not available on gorgiasChat', () => {
            const savedFn = mockGorgiasChat.setConversationMessages
            mockGorgiasChat.setConversationMessages = undefined as any

            const { ref } = renderComponent()
            const messages = [
                { text: 'Hello', isHtml: false, fromAgent: false },
            ]

            ref.current?.setConversationMessages(messages)

            expect(mockGorgiasChat.simulateConversation).toHaveBeenCalledWith(
                messages,
                0,
            )

            mockGorgiasChat.setConversationMessages = savedFn
        })
    })

    describe('withGorgiasChat guards', () => {
        it('does not call GorgiasChat when isLoaded is false', () => {
            mockIsLoaded = false
            const { ref } = renderComponent()

            ref.current?.closeChat()

            expect(mockGorgiasChat.close).not.toHaveBeenCalled()
        })

        it('does not call GorgiasChat when hasError is true', () => {
            mockHasError = true
            const { ref } = renderComponent()

            ref.current?.openChat()

            expect(mockGorgiasChat.open).not.toHaveBeenCalled()
        })

        it('does not call GorgiasChat when GorgiasChat is not present in the iframe window', () => {
            mockHasGorgiasChat = false
            const { ref } = renderComponent()

            ref.current?.closeChat()

            expect(mockGorgiasChat.close).not.toHaveBeenCalled()
        })

        it('does not call GorgiasChat.updateSelfServiceConfiguration when isLoaded is false', () => {
            mockIsLoaded = false
            const { ref } = renderComponent()

            ref.current?.updateWorkflowEntryPoints([])

            expect(
                mockGorgiasChat.updateSelfServiceConfiguration,
            ).not.toHaveBeenCalled()
        })

        it('does not call GorgiasChat.updateSelfServiceConfiguration when hasError is true', () => {
            mockHasError = true
            const { ref } = renderComponent()

            ref.current?.updateWorkflowEntryPoints([])

            expect(
                mockGorgiasChat.updateSelfServiceConfiguration,
            ).not.toHaveBeenCalled()
        })

        it('does not call GorgiasChat.updateSelfServiceConfiguration when GorgiasChat is not present in the iframe window', () => {
            mockHasGorgiasChat = false
            const { ref } = renderComponent()

            ref.current?.updateWorkflowEntryPoints([])

            expect(
                mockGorgiasChat.updateSelfServiceConfiguration,
            ).not.toHaveBeenCalled()
        })
    })

    describe('displayPage with orders', () => {
        it('calls GorgiasChat.setPage with "orders"', () => {
            const { ref } = renderComponent()

            ref.current?.displayPage('orders')

            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith(
                'orders',
                undefined,
            )
        })

        it('does not update the button group selection when navigating to orders', async () => {
            const user = userEvent.setup()
            renderComponent()

            const { ref } = renderComponent()
            ref.current?.displayPage('orders')

            await user.click(
                screen.getAllByTestId('button-group-item-conversation')[0],
            )
            jest.clearAllMocks()

            ref.current?.displayPage('orders')

            expect(mockGorgiasChat.open).not.toHaveBeenCalled()
        })
    })
})
