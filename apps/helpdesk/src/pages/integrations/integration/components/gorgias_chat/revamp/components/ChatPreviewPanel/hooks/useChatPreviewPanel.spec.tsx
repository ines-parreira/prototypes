import type { ReactNode } from 'react'

import { act, renderHook } from '@testing-library/react'

import { GorgiasChatPositionAlignmentEnum } from 'models/integration/types/gorgiasChat'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import { ChatPreviewPanel } from '../ChatPreviewPanel'
import {
    ChatPreviewPanelContext,
    useChatPreviewPanel,
    useGorgiasChatCreationWizardContext,
} from './useChatPreviewPanel'

jest.mock('pages/common/hooks/useCollapsibleColumn')
jest.mock('../ChatPreviewPanel', () => ({
    ChatPreviewPanel: jest.fn().mockReturnValue(null),
}))

const mockSetCollapsibleColumnChildren = jest.fn()
const mockSetIsCollapsibleColumnOpen = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    ;(useCollapsibleColumn as jest.Mock).mockReturnValue({
        setCollapsibleColumnChildren: mockSetCollapsibleColumnChildren,
        setIsCollapsibleColumnOpen: mockSetIsCollapsibleColumnOpen,
    })
})

describe('useChatPreviewPanel', () => {
    it('opens the collapsible column and sets children when showPreviewPanel is called', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        act(() => {
            result.current.showPreviewPanel('test-app-id')
        })

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(true)
        expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(
            expect.objectContaining({ type: ChatPreviewPanel }),
        )
    })

    it('closes the collapsible column and clears children on unmount', () => {
        const { unmount } = renderHook(() => useChatPreviewPanel())

        unmount()

        expect(mockSetIsCollapsibleColumnOpen).toHaveBeenCalledWith(false)
        expect(mockSetCollapsibleColumnChildren).toHaveBeenCalledWith(null)
    })

    it('passes the appId to ChatPreviewPanel when showPreviewPanel is called', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        act(() => {
            result.current.showPreviewPanel('test-app-id-1')
        })

        const lastElement =
            mockSetCollapsibleColumnChildren.mock.calls.at(-1)[0]
        expect(lastElement.type).toBe(ChatPreviewPanel)
        expect(lastElement.props.appId).toBe('test-app-id-1')
    })

    it('passes null appId to ChatPreviewPanel when showPreviewPanel is called with null', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        act(() => {
            result.current.showPreviewPanel(null)
        })

        const element = mockSetCollapsibleColumnChildren.mock.calls[0][0]
        expect(element.props.appId).toBeNull()
    })

    it('updateMainColor does not throw when ref is unattached', () => {
        const { result } = renderHook(() => useChatPreviewPanel())

        expect(() => result.current.updateMainColor('#ff0000')).not.toThrow()
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
        const mockContextValue = {
            updateMainColor: jest.fn(),
            updatePosition: jest.fn(),
            updateHeaderPictureUrl: jest.fn(),
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
