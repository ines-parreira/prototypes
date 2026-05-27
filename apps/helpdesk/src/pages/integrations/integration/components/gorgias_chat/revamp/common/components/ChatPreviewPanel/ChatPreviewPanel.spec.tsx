import React, { createRef } from 'react'

import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'
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
    const React = jest.requireActual<typeof import('react')>('react')
    const actualAxiom =
        jest.requireActual<typeof import('@gorgias/axiom')>('@gorgias/axiom')
    const ButtonGroupContext = React.createContext<
        ((key: string) => void) | undefined
    >(undefined)

    return {
        ...actualAxiom,
        ButtonGroup: ({ children, onSelectionChange }: ButtonGroupProps) => {
            return (
                <ButtonGroupContext.Provider value={onSelectionChange}>
                    <div>{children}</div>
                </ButtonGroupContext.Provider>
            )
        },
        ButtonGroupItem: (props: ButtonGroupItemProps) => {
            const onSelectionChange = React.useContext(ButtonGroupContext)
            return (
                <button
                    data-testid={`button-group-item-${props.id}`}
                    onClick={() => onSelectionChange?.(props.id)}
                >
                    {'children' in props ? props.children : props.id}
                </button>
            )
        },
    }
})

let mockMountCount = 0

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/components/ChatPreview/ChatPreview',
    () => {
        const React = require('react')

        const mockGorgiasChat = {
            setPage: jest.fn(),
            close: jest.fn(),
            open: jest.fn(),
            setPosition: jest.fn(),
            updateSettings: jest.fn(),
            updateTexts: jest.fn(),
            updateSSPTexts: jest.fn(),
            setLanguage: jest.fn().mockResolvedValue(undefined),
            updateSelfServiceConfiguration: jest.fn(),
            setOrders: jest.fn(),
            setConversationMessages: jest.fn(),
            simulateConversation: jest.fn(),
            setCustomBusinessHours: jest.fn(),
        }

        const mockGorgiasChatConfiguration = {
            featureFlags: {} as Record<string, unknown>,
        }

        let capturedOnLoaded:
            | ((
                  gorgiasChat: Window['GorgiasChat'],
                  gorgiasChatConfiguration: Window['gorgiasChatConfiguration'],
              ) => void)
            | undefined

        const ChatPreview = React.forwardRef(
            (
                props: {
                    appId: string
                    onLoaded?: (
                        gorgiasChat: Window['GorgiasChat'],
                        gorgiasChatConfiguration: Window['gorgiasChatConfiguration'],
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
                                      gorgiasChatConfiguration:
                                          mockGorgiasChatConfiguration,
                                      Object,
                                  },
                              }
                            : { contentWindow: null },
                    },
                    isLoaded: mockIsLoaded,
                    hasError: mockHasError,
                }))
                return <div data-testid="chat-preview" />
            },
        )

        const triggerOnLoaded = (
            gorgiasChat: Window['GorgiasChat'] = mockGorgiasChat as unknown as NonNullable<
                Window['GorgiasChat']
            >,
            gorgiasChatConfiguration: Window['gorgiasChatConfiguration'] = mockGorgiasChatConfiguration as unknown as Window['gorgiasChatConfiguration'],
        ) => capturedOnLoaded?.(gorgiasChat, gorgiasChatConfiguration)

        return {
            ChatPreview,
            mockGorgiasChat,
            mockGorgiasChatConfiguration,
            triggerOnLoaded,
        }
    },
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/components/ChatPreviewDefault/ChatPreviewDefault',
    () => {
        const React = require('react')

        const ChatPreviewDefault = React.forwardRef(
            (
                props: {
                    onLoaded?: (
                        gorgiasChat: NonNullable<Window['GorgiasChat']>,
                    ) => void
                },
                ref: React.Ref<ChatPreviewHandle>,
            ) => {
                React.useImperativeHandle(ref, () => ({
                    iframeRef: { current: null },
                    isLoaded: mockIsLoaded,
                    hasError: mockHasError,
                }))
                return <div data-testid="chat-preview-default" />
            },
        )

        return { ChatPreviewDefault }
    },
)

const { mockGorgiasChat, mockGorgiasChatConfiguration, triggerOnLoaded } =
    jest.requireMock(
        'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/components/ChatPreview/ChatPreview',
    )

describe('ChatPreviewPanel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockIsLoaded = true
        mockHasError = false
        mockHasGorgiasChat = true
        mockMountCount = 0
        mockGorgiasChatConfiguration.featureFlags = {}
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
            expect(ref.current?.updateSSPTexts).toBeDefined()
            expect(ref.current?.closeChat).toBeDefined()
            expect(ref.current?.openChat).toBeDefined()
            expect(ref.current?.updateWorkflowEntryPoints).toBeDefined()
            expect(ref.current?.updateOrderManagementFlows).toBeDefined()
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

        it('displayPage("homepage") still fires after a non-tab page transition', () => {
            const { ref } = renderComponent()

            act(() => {
                ref.current?.displayPage('reported-issue', {
                    orderName: '#1001',
                    reasonKey: 'reasonOther',
                })
            })
            act(() => {
                ref.current?.displayPage('homepage')
            })

            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith(
                'reported-issue',
                { orderName: '#1001', reasonKey: 'reasonOther' },
            )
            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith(
                'homepage',
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

        it('updateSSPTexts calls GorgiasChat.updateSSPTexts with the provided texts', () => {
            const { ref } = renderComponent()
            const texts = { reasonOther: 'Other', reasonLate: 'Late' }

            ref.current?.updateSSPTexts(texts)

            expect(mockGorgiasChat.updateSSPTexts).toHaveBeenCalledWith(
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

        it('updateOrderManagementFlows calls GorgiasChat.updateSelfServiceConfiguration with the provided flows', () => {
            const { ref } = renderComponent()
            const flows = {
                track_order: true,
                cancel_order: false,
                return_order: false,
                report_issue: false,
            }

            ref.current?.updateOrderManagementFlows(flows)

            expect(
                mockGorgiasChat.updateSelfServiceConfiguration,
            ).toHaveBeenCalledWith({ flows })
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
                {
                    text: 'Hello',
                    isHtml: false,
                    fromAgent: false,
                    isBot: false,
                },
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
                {
                    text: 'Hello',
                    isHtml: false,
                    fromAgent: false,
                    isBot: false,
                },
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

    describe('withHeader prop', () => {
        it('does not render header when withHeader is false', () => {
            renderComponent('test-app-id', { withHeader: false })

            expect(screen.queryByText('Chat preview')).not.toBeInTheDocument()
        })

        it('renders header by default', () => {
            renderComponent('test-app-id')

            expect(screen.getByText('Chat preview')).toBeInTheDocument()
        })
    })

    describe('supportDefaultChatPreview prop', () => {
        it('renders ChatPreviewDefault when appId is null and supportDefaultChatPreview is true', () => {
            renderComponent(null, { supportDefaultChatPreview: true })

            expect(
                screen.getByTestId('chat-preview-default'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(
                    'Connect a Chat or Help Center to your store to use this feature.',
                ),
            ).not.toBeInTheDocument()
        })

        it('renders warning banner when appId is null and supportDefaultChatPreview is false', () => {
            renderComponent(null, { supportDefaultChatPreview: false })

            expect(
                screen.getByText(
                    'Connect a Chat or Help Center to your store to use this feature.',
                ),
            ).toBeInTheDocument()
            expect(
                screen.queryByTestId('chat-preview-default'),
            ).not.toBeInTheDocument()
        })

        it('renders ChatPreview when appId is provided regardless of supportDefaultChatPreview', () => {
            renderComponent('test-app-id', { supportDefaultChatPreview: true })

            expect(screen.getByTestId('chat-preview')).toBeInTheDocument()
            expect(
                screen.queryByTestId('chat-preview-default'),
            ).not.toBeInTheDocument()
        })
    })

    describe('business hours toggle', () => {
        it('does not render by default', () => {
            renderComponent('test-app-id')

            expect(
                screen.queryByRole('button', {
                    name: 'During Business Hours',
                }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: 'Outside Business Hours',
                }),
            ).not.toBeInTheDocument()
        })

        it('renders when enabled and an appId is provided', () => {
            renderComponent('test-app-id', { showBusinessHoursToggle: true })

            expect(
                screen.getByRole('button', { name: 'During Business Hours' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Outside Business Hours' }),
            ).toBeInTheDocument()
        })

        it('renders when enabled with the default chat preview', () => {
            renderComponent(null, {
                showBusinessHoursToggle: true,
                supportDefaultChatPreview: true,
            })

            expect(
                screen.getByRole('button', { name: 'During Business Hours' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Outside Business Hours' }),
            ).toBeInTheDocument()
        })

        it('does not render when enabled without an appId or default chat preview support', () => {
            renderComponent(null, { showBusinessHoursToggle: true })

            expect(
                screen.queryByRole('button', {
                    name: 'During Business Hours',
                }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', {
                    name: 'Outside Business Hours',
                }),
            ).not.toBeInTheDocument()
        })

        it('applies during-business-hours mode when the preview loads', () => {
            renderComponent('test-app-id', { showBusinessHoursToggle: true })

            act(() => {
                triggerOnLoaded()
            })

            expect(mockGorgiasChat.setCustomBusinessHours).toHaveBeenCalledWith(
                {
                    timezone: 'UTC',
                    businessHours: [
                        {
                            days: [1, 2, 3, 4, 5, 6, 7],
                            fromTime: '00:00',
                            toTime: '00:00',
                        },
                    ],
                },
            )
        })

        it('does not apply business hours when the toggle is hidden', () => {
            renderComponent('test-app-id')

            act(() => {
                triggerOnLoaded()
            })

            expect(
                mockGorgiasChat.setCustomBusinessHours,
            ).not.toHaveBeenCalled()
        })

        it('applies outside-business-hours mode when the toggle selection changes', async () => {
            const user = userEvent.setup()
            renderComponent('test-app-id', { showBusinessHoursToggle: true })

            await user.click(
                screen.getByRole('button', {
                    name: 'Outside Business Hours',
                }),
            )

            expect(mockGorgiasChat.setCustomBusinessHours).toHaveBeenCalledWith(
                {
                    timezone: 'UTC',
                    businessHours: [],
                },
            )
        })

        it('keeps the page navigation buttons wired when the business hours toggle is visible', async () => {
            const user = userEvent.setup()
            renderComponent('test-app-id', { showBusinessHoursToggle: true })

            await user.click(screen.getByTestId('button-group-item-homepage'))

            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith(
                'homepage',
                undefined,
            )
            expect(mockGorgiasChat.open).toHaveBeenCalled()
        })
    })

    describe('shouldShowChatVersionSwitcher prop', () => {
        it('does not render version switcher buttons by default', () => {
            renderComponent('test-app-id')

            expect(
                screen.queryByTestId('button-group-item-current'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByTestId('button-group-item-new'),
            ).not.toBeInTheDocument()
        })

        it('renders version switcher buttons when shouldShowChatVersionSwitcher is true', () => {
            renderComponent('test-app-id', {
                shouldShowChatVersionSwitcher: true,
            })

            expect(
                screen.getByTestId('button-group-item-current'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('button-group-item-new'),
            ).toBeInTheDocument()
        })

        it('remounts ChatPreview when Current version is selected', async () => {
            const user = userEvent.setup()
            renderComponent('test-app-id', {
                shouldShowChatVersionSwitcher: true,
            })

            expect(mockMountCount).toBe(1)

            await user.click(screen.getByTestId('button-group-item-current'))

            expect(mockMountCount).toBe(2)
        })

        it('remounts ChatPreview when New version is selected', async () => {
            const user = userEvent.setup()
            renderComponent('test-app-id', {
                shouldShowChatVersionSwitcher: true,
            })

            expect(mockMountCount).toBe(1)

            await user.click(screen.getByTestId('button-group-item-new'))

            expect(mockMountCount).toBe(2)
        })

        it('sets chat-client-ui-redesign-project to false when chatDisplayVersion is current', async () => {
            const user = userEvent.setup()
            renderComponent('test-app-id', {
                shouldShowChatVersionSwitcher: true,
            })

            act(() => {
                triggerOnLoaded()
            })

            await user.click(screen.getByTestId('button-group-item-current'))
            mockGorgiasChatConfiguration.featureFlags = {}

            act(() => {
                triggerOnLoaded()
            })

            expect(
                mockGorgiasChatConfiguration.featureFlags[
                    'chat-client-ui-redesign-project'
                ],
            ).toBe(false)
        })

        it('sets enforce flag to false when chatDisplayVersion is current and forceChatRedesign is false', async () => {
            const user = userEvent.setup()
            renderComponent('test-app-id', {
                shouldShowChatVersionSwitcher: true,
                forceChatRedesign: false,
            })

            act(() => {
                triggerOnLoaded()
            })

            await user.click(screen.getByTestId('button-group-item-current'))
            mockGorgiasChatConfiguration.featureFlags = {}

            act(() => {
                triggerOnLoaded()
            })

            expect(
                mockGorgiasChatConfiguration.featureFlags[
                    'linear.AIEXP-8485.enforce-chat-2-0-without-ai-agent'
                ],
            ).toBe(false)
        })

        it('does not let forceChatRedesign override enforce flag when shouldShowChatVersionSwitcher is true', async () => {
            const user = userEvent.setup()
            renderComponent('test-app-id', {
                shouldShowChatVersionSwitcher: true,
                forceChatRedesign: true,
            })

            act(() => {
                triggerOnLoaded()
            })

            await user.click(screen.getByTestId('button-group-item-current'))
            mockGorgiasChatConfiguration.featureFlags = {}

            act(() => {
                triggerOnLoaded()
            })

            expect(
                mockGorgiasChatConfiguration.featureFlags[
                    'linear.AIEXP-8485.enforce-chat-2-0-without-ai-agent'
                ],
            ).toBe(false)
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

    describe('onLoaded', () => {
        it('seeds SSP texts and sets the current page on load', () => {
            const onPreviewLoaded = jest.fn()
            renderComponent('test-app-id', { onPreviewLoaded })

            act(() => {
                triggerOnLoaded()
            })

            expect(mockGorgiasChat.updateSSPTexts).toHaveBeenCalledWith(
                expect.any(Object),
            )
            expect(mockGorgiasChat.setPage).toHaveBeenCalledWith('homepage')
            expect(onPreviewLoaded).toHaveBeenCalled()
        })

        it('sets chat redesign feature flag when forceChatRedesign is true', () => {
            renderComponent('test-app-id', { forceChatRedesign: true })

            act(() => {
                triggerOnLoaded()
            })

            expect(
                mockGorgiasChatConfiguration.featureFlags[
                    'linear.AIEXP-8485.enforce-chat-2-0-without-ai-agent'
                ],
            ).toBe(true)
        })

        it('does not set enforce flag when neither shouldShowChatVersionSwitcher nor forceChatRedesign is enabled', () => {
            renderComponent('test-app-id', { forceChatRedesign: false })

            act(() => {
                triggerOnLoaded()
            })

            expect(
                mockGorgiasChatConfiguration.featureFlags[
                    'linear.AIEXP-8485.enforce-chat-2-0-without-ai-agent'
                ],
            ).toBeUndefined()
        })

        it('does not set chat-client-ui-redesign-project flag when shouldShowChatVersionSwitcher is false', () => {
            renderComponent('test-app-id')

            act(() => {
                triggerOnLoaded()
            })

            expect(
                mockGorgiasChatConfiguration.featureFlags[
                    'chat-client-ui-redesign-project'
                ],
            ).toBeUndefined()
        })

        it('does not set feature flags when gorgiasChatConfiguration is not provided', () => {
            renderComponent('test-app-id', { forceChatRedesign: true })

            act(() => {
                triggerOnLoaded(
                    mockGorgiasChat as unknown as Window['GorgiasChat'],
                    // null skips the default and is treated as falsy by onLoaded
                    null as unknown as Window['gorgiasChatConfiguration'],
                )
            })

            expect(
                mockGorgiasChatConfiguration.featureFlags[
                    'linear.AIEXP-8485.enforce-chat-2-0-without-ai-agent'
                ],
            ).toBeUndefined()
        })

        it('skips updateSSPTexts when iframe window is unavailable', () => {
            mockHasGorgiasChat = false
            renderComponent('test-app-id')

            act(() => {
                triggerOnLoaded()
            })

            expect(mockGorgiasChat.updateSSPTexts).not.toHaveBeenCalled()
        })

        it('does not call setPage or updateSSPTexts when gorgiasChat is undefined', () => {
            renderComponent('test-app-id')

            act(() => {
                triggerOnLoaded(
                    null as unknown as Window['GorgiasChat'],
                    mockGorgiasChatConfiguration as unknown as Window['gorgiasChatConfiguration'],
                )
            })

            expect(mockGorgiasChat.setPage).not.toHaveBeenCalled()
            expect(mockGorgiasChat.updateSSPTexts).not.toHaveBeenCalled()
        })

        it('sets feature flags to true when the New chat version is selected', async () => {
            const user = userEvent.setup()
            renderComponent('test-app-id', {
                shouldShowChatVersionSwitcher: true,
            })

            act(() => {
                triggerOnLoaded()
            })

            await user.click(screen.getByTestId('button-group-item-new'))
            mockGorgiasChatConfiguration.featureFlags = {}

            act(() => {
                triggerOnLoaded()
            })

            expect(
                mockGorgiasChatConfiguration.featureFlags[
                    'chat-client-ui-redesign-project'
                ],
            ).toBe(true)
            expect(
                mockGorgiasChatConfiguration.featureFlags[
                    'linear.AIEXP-8485.enforce-chat-2-0-without-ai-agent'
                ],
            ).toBe(true)
        })
    })
})
