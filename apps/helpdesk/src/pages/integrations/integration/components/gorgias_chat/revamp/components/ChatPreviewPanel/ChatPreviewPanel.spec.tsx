import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ButtonGroupItemProps, ButtonGroupProps } from '@gorgias/axiom'

import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types'

import type { ChatPreviewPanelHandle } from './ChatPreviewPanel'
import { ChatPreviewPanel } from './ChatPreviewPanel'
import type { ChatPreviewHandle } from './components/ChatPreview/ChatPreview'

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
        }

        const ChatPreview = React.forwardRef(
            (_props: { appId: string }, ref: React.Ref<ChatPreviewHandle>) => {
                React.useImperativeHandle(ref, () => ({
                    iframeRef: {
                        current: {
                            contentWindow: {
                                GorgiasChat: mockGorgiasChat,
                            },
                        },
                    },
                }))
                return <div data-testid="chat-preview" />
            },
        )

        return { ChatPreview, mockGorgiasChat }
    },
)

const { mockGorgiasChat } = jest.requireMock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/components/ChatPreview/ChatPreview',
)

describe('ChatPreviewPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (appId: string | null = 'test-app-id') => {
        const ref = createRef<ChatPreviewPanelHandle>()
        const result = render(<ChatPreviewPanel ref={ref} appId={appId} />)
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
    })

    describe('page navigation', () => {
        it('calls displayPage and openChat when the homepage button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByTestId('button-group-item-homepage'))

            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith('homepage')
            expect(mockGorgiasChat.open).toHaveBeenCalled()
        })

        it('calls displayPage and openChat when the conversation button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByTestId('button-group-item-conversation'),
            )

            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith('conversation')
            expect(mockGorgiasChat.open).toHaveBeenCalled()
        })
    })

    describe('imperative handle', () => {
        it('exposes all required methods on the ref', () => {
            const { ref } = renderComponent()

            expect(ref.current?.displayPage).toBeDefined()
            expect(ref.current?.updatePosition).toBeDefined()
            expect(ref.current?.updateSettings).toBeDefined()
            expect(ref.current?.closeChat).toBeDefined()
            expect(ref.current?.openChat).toBeDefined()
        })

        it('displayPage calls GorgiasChat.setPage', () => {
            const { ref } = renderComponent()

            ref.current?.displayPage('conversation')

            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith('conversation')
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
    })
})
