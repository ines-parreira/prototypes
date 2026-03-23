import type { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import { Language } from 'constants/languages'
import {
    GorgiasChatLauncherType,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types/gorgiasChat'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ChatPreviewPanel } from '../ChatPreviewPanel'
import type { ChatPreviewPanelContextValue } from './useChatPreviewPanel'
import {
    ChatPreviewPanelContext,
    useChatPreviewPanel,
    useGorgiasChatCreationWizardContext,
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

    it('renders ChatPreviewPanel via warpToCollapsibleColumn', () => {
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

    it('updateLanguage does not throw when ref is unattached', async () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        await expect(
            result.current.updateLanguage(Language.EnglishUs),
        ).resolves.not.toThrow()
    })

    it('updateLanguage calls updateLanguage on the ref when attached', async () => {
        const mockUpdateLanguage = jest.fn().mockResolvedValue(undefined)
        ;(ChatPreviewPanel as jest.Mock).mockImplementation(
            jest.fn().mockReturnValue(null),
        )

        const { result } = renderHook(() => useChatPreviewPanel())

        Object.defineProperty(
            (ChatPreviewPanel as jest.Mock).mock.instances[0] ?? {},
            'updateLanguage',
            { value: mockUpdateLanguage },
        )

        const panelArg = mockWarpToCollapsibleColumn.mock.calls.at(-1)?.[0]
        if (panelArg?.ref) {
            panelArg.ref.current = { updateLanguage: mockUpdateLanguage }
        }

        await act(async () => {
            await result.current.updateLanguage(Language.French)
        })

        expect(mockUpdateLanguage).toHaveBeenCalledWith(Language.French)
    })
})

describe('useGorgiasChatCreationWizardContext', () => {
    it('throws when used outside of ChatPreviewPanelContext', () => {
        const consoleError = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        expect(() =>
            renderHook(() => useGorgiasChatCreationWizardContext()),
        ).toThrow(
            'useGorgiasChatCreationWizardContext must be used within GorgiasChatCreationWizard',
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
            updateLanguage: jest.fn(),
        }

        const wrapper = ({ children }: { children: ReactNode }) => (
            <ChatPreviewPanelContext.Provider value={mockContextValue}>
                {children}
            </ChatPreviewPanelContext.Provider>
        )

        const { result } = renderHook(
            () => useGorgiasChatCreationWizardContext(),
            { wrapper },
        )

        expect(result.current).toBe(mockContextValue)
    })
})
