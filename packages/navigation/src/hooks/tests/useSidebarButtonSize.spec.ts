import { renderHook } from '@testing-library/react'

import {
    SIDEBAR_BUTTON_SIZE_COLLAPSED,
    SIDEBAR_BUTTON_SIZE_EXPANDED,
} from '../../constants'
import { MockSidebarProvider } from '../../fixtures/MockSidebarProvider'
import { useSidebarButtonSize } from '../useSidebarButtonSize'

describe('useSidebarButtonSize', () => {
    it('throws when used outside SidebarProvider', () => {
        expect(() => {
            renderHook(() => useSidebarButtonSize())
        }).toThrow('useSidebar must be used within SidebarProvider')
    })

    it('returns expanded size when sidebar is not collapsed', () => {
        const { result } = renderHook(() => useSidebarButtonSize(), {
            wrapper: MockSidebarProvider,
        })

        expect(result.current).toBe(SIDEBAR_BUTTON_SIZE_EXPANDED)
    })

    it('returns collapsed size when sidebar is collapsed', () => {
        const { result } = renderHook(() => useSidebarButtonSize(), {
            wrapper: ({ children }) =>
                MockSidebarProvider({ children, isCollapsed: true }),
        })

        expect(result.current).toBe(SIDEBAR_BUTTON_SIZE_COLLAPSED)
    })
})
