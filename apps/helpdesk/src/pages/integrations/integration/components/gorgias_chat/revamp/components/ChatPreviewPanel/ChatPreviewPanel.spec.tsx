import { createRef } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { ButtonGroupItemProps, ButtonGroupProps } from '@gorgias/axiom'

import { Language } from 'constants/languages'
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
        }

        const ChatPreview = React.forwardRef(
            (_props: { appId: string }, ref: React.Ref<ChatPreviewHandle>) => {
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

        return { ChatPreview, mockGorgiasChat }
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
            expect(ref.current?.updateTexts).toBeDefined()
            expect(ref.current?.closeChat).toBeDefined()
            expect(ref.current?.openChat).toBeDefined()
            expect(ref.current?.updateLanguage).toBeDefined()
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

        it('updateTexts calls GorgiasChat.updateTexts with the provided texts', () => {
            const { ref } = renderComponent()
            const texts = { title: 'Hello', subtitle: 'World' }

            ref.current?.updateTexts(texts)

            expect(mockGorgiasChat.updateTexts).toHaveBeenCalledWith(
                expect.objectContaining(texts),
            )
        })

        it('updateLanguage calls GorgiasChat.setLanguage with the provided language', async () => {
            const { ref } = renderComponent()

            await ref.current?.updateLanguage(Language.French)

            expect(mockGorgiasChat.setLanguage).toHaveBeenCalledWith(
                Language.French,
            )
        })

        it('updateLanguage resolves when setLanguage resolves', async () => {
            const { ref } = renderComponent()

            await expect(
                ref.current?.updateLanguage(Language.EnglishUs),
            ).resolves.toBeUndefined()
        })

        it('updateLanguage resolves when setLanguage is not defined on gorgiasChat', async () => {
            mockGorgiasChat.setLanguage = undefined as any
            const { ref } = renderComponent()

            await expect(
                ref.current?.updateLanguage(Language.French),
            ).resolves.toBeUndefined()
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

        it('updateLanguage resolves when isLoaded is false', async () => {
            mockIsLoaded = false
            const { ref } = renderComponent()

            await expect(
                ref.current?.updateLanguage(Language.French),
            ).resolves.toBeUndefined()
        })

        it('updateLanguage resolves when hasError is true', async () => {
            mockHasError = true
            const { ref } = renderComponent()

            await expect(
                ref.current?.updateLanguage(Language.French),
            ).resolves.toBeUndefined()
        })

        it('updateLanguage resolves when GorgiasChat is not present in the iframe window', async () => {
            mockHasGorgiasChat = false
            const { ref } = renderComponent()

            await expect(
                ref.current?.updateLanguage(Language.French),
            ).resolves.toBeUndefined()
        })
    })
})
