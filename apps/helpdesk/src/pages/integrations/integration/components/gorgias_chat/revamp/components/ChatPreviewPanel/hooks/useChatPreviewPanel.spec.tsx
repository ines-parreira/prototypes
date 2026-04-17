import type { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import {
    GorgiasChatAvatarType,
    GorgiasChatLauncherType,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types/gorgiasChat'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ChatPreviewPanel } from '../ChatPreviewPanel'
import type { ChatPreviewPanelContextValue } from './useChatPreviewPanel'
import {
    ChatPreviewPanelContext,
    useChatPreviewPanel,
    useChatPreviewPanelContext,
} from './useChatPreviewPanel'

jest.mock('pages/common/hooks/useCollapsibleColumn')
jest.mock('../ChatPreviewPanel', () => ({
    ChatPreviewPanel: jest.fn().mockReturnValue(null),
}))

const mockWarpToCollapsibleColumn = jest.fn()
const mockSetIsCollapsibleColumnOpen = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    ;(useCollapsibleColumn as jest.Mock).mockReturnValue({
        warpToCollapsibleColumn: mockWarpToCollapsibleColumn,
        setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
    })
})

describe('useChatPreviewPanel', () => {
    it('opens the collapsible column when showPreviewPanel is called', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        act(() => {
            result.current.showPreviewPanel('test-app-id')
        })

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
    })

    it('renders ChatPreviewPanel via warpToCollapsibleColumn by default', () => {
        renderHook(() => useChatPreviewPanel())

        expect(mockWarpToCollapsibleColumn).toHaveBeenCalledWith(
            expect.objectContaining({ type: ChatPreviewPanel }),
        )
    })

    it('closes the collapsible column on unmount', () => {
        const { unmount } = renderHook(() => useChatPreviewPanel())

        unmount()

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
    })

    it('passes the appId to ChatPreviewPanel when showPreviewPanel is called', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        act(() => {
            result.current.showPreviewPanel('test-app-id-1')
        })

        const lastElement = mockWarpToCollapsibleColumn.mock.calls.at(-1)[0]
        expect(lastElement.type).toBe(ChatPreviewPanel)
        expect(lastElement.props.appId).toBe('test-app-id-1')
    })

    it('passes null appId to ChatPreviewPanel when showPreviewPanel is called with null', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        act(() => {
            result.current.showPreviewPanel(null)
        })

        const lastElement = mockWarpToCollapsibleColumn.mock.calls.at(-1)[0]
        expect(lastElement.props.appId).toBeNull()
    })

    it('closes the collapsible column when hidePreviewPanel is called', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        act(() => {
            result.current.hidePreviewPanel()
        })

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
    })

    it('updateMainColor does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() => result.current.updateMainColor('#ff0000')).not.toThrow()
    })

    it('updateMainColor does not throw when called with an invalid hex color', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updateMainColor('not-a-valid-color'),
        ).not.toThrow()
    })

    it('updateMainColor does not throw when called with an empty string', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() => result.current.updateMainColor('')).not.toThrow()
    })

    it('updatePosition does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updatePosition({
                alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
                offsetX: 0,
                offsetY: 0,
            }),
        ).not.toThrow()
    })

    it('updateHeaderPictureUrl does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updateHeaderPictureUrl(
                'https://example.com/img.png',
            ),
        ).not.toThrow()
    })

    it('updateHeaderPictureUrl does not throw when called with undefined', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updateHeaderPictureUrl(undefined),
        ).not.toThrow()
    })

    it('updateTexts does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updateTexts({ title: 'Hello' }),
        ).not.toThrow()
    })

    it('updateLauncher does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updateLauncher({
                type: GorgiasChatLauncherType.ICON,
                label: 'Chat',
            }),
        ).not.toThrow()
    })

    it('updateLegalDisclaimer does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updateLegalDisclaimer('Privacy policy text'),
        ).not.toThrow()
    })

    it('updateLegalDisclaimerEnabled does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updateLegalDisclaimerEnabled(true),
        ).not.toThrow()
    })

    it('openChat does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() => result.current.openChat()).not.toThrow()
    })

    it('closeChat does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() => result.current.closeChat()).not.toThrow()
    })

    it('displayPage does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() => result.current.displayPage('homepage')).not.toThrow()
    })

    it('displayPage("orders") does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() => result.current.displayPage('orders')).not.toThrow()
    })

    it('reloadPreview does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() => result.current.reloadPreview()).not.toThrow()
    })

    it('reloadPreview calls reloadPreview on the ref when attached', () => {
        const mockReloadPreview = jest.fn()

        const { result } = renderHook(() => useChatPreviewPanel())

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        if (panelArg?.ref) {
            panelArg.ref.current = { reloadPreview: mockReloadPreview }
        }

        result.current.reloadPreview()

        expect(mockReloadPreview).toHaveBeenCalled()
    })

    it('updateAvatarSettings does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updateAvatarSettings({
                avatarType: GorgiasChatAvatarType.TEAM_MEMBERS,
            }),
        ).not.toThrow()
    })

    it('updateAvatarSettings calls openChat, displayPage with conversation, and updateSettings on the ref when attached', () => {
        const mockOpenChat = jest.fn()
        const mockDisplayPage = jest.fn()
        const mockUpdateSettings = jest.fn()

        const { result } = renderHook(() => useChatPreviewPanel())

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        if (panelArg?.ref) {
            panelArg.ref.current = {
                openChat: mockOpenChat,
                displayPage: mockDisplayPage,
                updateSettings: mockUpdateSettings,
            }
        }

        result.current.updateAvatarSettings({
            avatarType: GorgiasChatAvatarType.TEAM_MEMBERS,
        })

        expect(mockOpenChat).toHaveBeenCalled()
        expect(mockDisplayPage).toHaveBeenCalledWith('conversation', undefined)
        expect(mockUpdateSettings).toHaveBeenCalledWith({
            decoration: { avatarType: GorgiasChatAvatarType.TEAM_MEMBERS },
        })
    })

    it('updateAvatarSettings passes all avatar settings fields to updateSettings', () => {
        const mockOpenChat = jest.fn()
        const mockDisplayPage = jest.fn()
        const mockUpdateSettings = jest.fn()

        const { result } = renderHook(() => useChatPreviewPanel())

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        if (panelArg?.ref) {
            panelArg.ref.current = {
                openChat: mockOpenChat,
                displayPage: mockDisplayPage,
                updateSettings: mockUpdateSettings,
            }
        }

        const avatarSettings = {
            avatarTeamPictureUrl: 'https://example.com/team.png',
            avatarType: GorgiasChatAvatarType.TEAM_PICTURE,
            avatar: null,
        }
        result.current.updateAvatarSettings(avatarSettings)

        expect(mockUpdateSettings).toHaveBeenCalledWith({
            decoration: avatarSettings,
        })
    })

    it('updateQuickReplies does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updateQuickReplies({
                enabled: true,
                replies: ['reply 1', 'reply 2'],
            }),
        ).not.toThrow()
    })

    it('updateQuickReplies calls openChat and updateSettings on the ref when attached', () => {
        const mockOpenChat = jest.fn()
        const mockUpdateSettings = jest.fn()

        const { result } = renderHook(() => useChatPreviewPanel())

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        if (panelArg?.ref) {
            panelArg.ref.current = {
                openChat: mockOpenChat,
                updateSettings: mockUpdateSettings,
            }
        }

        const quickReplies = { enabled: true, replies: ['reply 1', 'reply 2'] }
        result.current.updateQuickReplies(quickReplies)

        expect(mockOpenChat).toHaveBeenCalled()
        expect(mockUpdateSettings).toHaveBeenCalledWith({ quickReplies })
    })

    it('updateWorkflowEntryPoints does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() => result.current.updateWorkflowEntryPoints([])).not.toThrow()
    })

    it('updatePreviewOrders does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.updatePreviewOrders({ orders: {} }),
        ).not.toThrow()
    })

    it('updatePreviewOrders calls updatePreviewOrders on the ref when attached', () => {
        const mockUpdatePreviewOrders = jest.fn()

        const { result } = renderHook(() => useChatPreviewPanel())

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        if (panelArg?.ref) {
            panelArg.ref.current = {
                updatePreviewOrders: mockUpdatePreviewOrders,
            }
        }

        const options = { orders: { '#1001': { name: '#1001' } as any } }
        result.current.updatePreviewOrders(options)

        expect(mockUpdatePreviewOrders).toHaveBeenCalledWith(options)
    })

    it('updateWorkflowEntryPoints calls displayPage with homepage and updateWorkflowEntryPoints on the ref when attached', () => {
        const mockDisplayPage = jest.fn()
        const mockUpdateWorkflowEntrypoints = jest.fn()

        const { result } = renderHook(() => useChatPreviewPanel())

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        if (panelArg?.ref) {
            panelArg.ref.current = {
                displayPage: mockDisplayPage,
                updateWorkflowEntryPoints: mockUpdateWorkflowEntrypoints,
            }
        }

        const entrypoints = [{ id: 'flow-1' }] as any
        result.current.updateWorkflowEntryPoints(entrypoints)

        expect(mockDisplayPage).toHaveBeenCalledWith('homepage', undefined)
        expect(mockUpdateWorkflowEntrypoints).toHaveBeenCalledWith(entrypoints)
    })

    it('setConversationMessages does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() =>
            result.current.setConversationMessages([
                { text: 'Hello', isHtml: false, fromAgent: false },
            ]),
        ).not.toThrow()
    })

    it('setConversationMessages calls setConversationMessages on the ref when attached', () => {
        const mockSetConversationMessages = jest.fn()

        const { result } = renderHook(() => useChatPreviewPanel())

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        if (panelArg?.ref) {
            panelArg.ref.current = {
                setConversationMessages: mockSetConversationMessages,
            }
        }

        const messages = [{ text: 'Hello', isHtml: false, fromAgent: false }]
        result.current.setConversationMessages(messages)

        expect(mockSetConversationMessages).toHaveBeenCalledWith(messages)
    })

    it('onChatPreviewLoaded registers a callback that fires when onPreviewLoaded is called', () => {
        const mockCallback = jest.fn()
        const { result } = renderHook(() => useChatPreviewPanel())

        result.current.onChatPreviewLoaded(mockCallback)

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        panelArg.props.onPreviewLoaded()

        expect(mockCallback).toHaveBeenCalled()
    })

    it('onChatPreviewLoaded returns a cleanup function that unsubscribes the callback', () => {
        const mockCallback = jest.fn()
        const { result } = renderHook(() => useChatPreviewPanel())

        const unsubscribe = result.current.onChatPreviewLoaded(mockCallback)
        unsubscribe()

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        panelArg.props.onPreviewLoaded()

        expect(mockCallback).not.toHaveBeenCalled()
    })
})

describe('useChatPreviewPanelContext', () => {
    it('throws when used outside of ChatPreviewPanelContext', () => {
        const consoleError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        expect(() => renderHook(() => useChatPreviewPanelContext())).toThrow(
            'useChatPreviewPanelContext must be used within ChatPreviewPanelContext',
        )

        consoleError.mockRestore()
    })

    it('returns context value when used within ChatPreviewPanelContext', () => {
        const mockContextValue: ChatPreviewPanelContextValue = {
            updateMainColor: jest.fn(),
            updatePosition: jest.fn(),
            updateHeaderPictureUrl: jest.fn(),
            openChat: jest.fn(),
            closeChat: jest.fn(),
            displayPage: jest.fn(),
            updateLauncher: jest.fn(),
            updateTexts: jest.fn(),
            updateLegalDisclaimer: jest.fn(),
            updateLegalDisclaimerEnabled: jest.fn(),
            updateWorkflowEntryPoints: jest.fn(),
            reloadPreview: jest.fn(),
            updateAvatarSettings: jest.fn(),
            updateQuickReplies: jest.fn(),
            updatePreviewOrders: jest.fn(),
            setConversationMessages: jest.fn(),
            onChatPreviewLoaded: jest.fn(),
        }

        const wrapper = ({ children }: { children: ReactNode }) => (
            <ChatPreviewPanelContext.Provider value={mockContextValue}>
                {children}
            </ChatPreviewPanelContext.Provider>
        )

        const { result } = renderHook(() => useChatPreviewPanelContext(), {
            wrapper,
        })

        expect(result.current).toBe(mockContextValue)
    })
})
