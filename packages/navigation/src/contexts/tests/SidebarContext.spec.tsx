import { logEvent, SegmentEvent } from '@repo/logging'
import { act, renderHook } from '@testing-library/react'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

import { SidebarProvider, useSidebar } from '../SidebarContext'

vi.mock('@gorgias/toolkit-react', async () => ({
    ...(await vi.importActual('@gorgias/toolkit-react')),
    useIsMobileResolution: vi.fn(),
}))

vi.mock('@repo/logging', () => ({
    logEvent: vi.fn(),
    SegmentEvent: {
        NavigationPanelVisibilityStateToggled:
            'NavigationPanelVisibilityStateToggled',
    },
}))

describe('SidebarContext', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
    })

    describe('useSidebar', () => {
        it('should throw error when used outside provider', () => {
            expect(() => {
                renderHook(() => useSidebar())
            }).toThrow('useSidebar must be used within SidebarProvider')
        })

        it('should provide isCollapsed state and toggleCollapse function', () => {
            const { result } = renderHook(() => useSidebar(), {
                wrapper: SidebarProvider,
            })

            expect(result.current.isCollapsed).toBe(false)
            expect(typeof result.current.toggleCollapse).toBe('function')
        })

        it('should toggle isCollapsed state when toggleCollapse is called', () => {
            const { result } = renderHook(() => useSidebar(), {
                wrapper: SidebarProvider,
            })

            expect(result.current.isCollapsed).toBe(false)

            act(() => {
                result.current.toggleCollapse()
            })

            expect(result.current.isCollapsed).toBe(true)

            act(() => {
                result.current.toggleCollapse()
            })

            expect(result.current.isCollapsed).toBe(false)
        })

        it('should initialize isCollapsed as false', () => {
            const { result } = renderHook(() => useSidebar(), {
                wrapper: SidebarProvider,
            })

            expect(result.current.isCollapsed).toBe(false)
        })

        it('should toggle isCollapsed when onSidebarShortcutToggle is called', () => {
            const { result } = renderHook(() => useSidebar(), {
                wrapper: SidebarProvider,
            })

            act(() => {
                result.current.onSidebarShortcutToggle()
            })

            expect(result.current.isCollapsed).toBe(true)
        })

        it('should always return false for isCollapsed on mobile resolution regardless of stored value', () => {
            vi.mocked(useIsMobileResolution).mockReturnValue(true)
            localStorage.setItem('navigation-sidebar-collapsed', 'true')

            const { result } = renderHook(() => useSidebar(), {
                wrapper: SidebarProvider,
            })

            expect(result.current.isCollapsed).toBe(false)
        })

        it('should log event with current visibility state when onSidebarShortcutToggle is called', () => {
            const { result } = renderHook(() => useSidebar(), {
                wrapper: SidebarProvider,
            })

            act(() => {
                result.current.onSidebarShortcutToggle()
            })

            expect(logEvent).toHaveBeenCalledWith(
                SegmentEvent.NavigationPanelVisibilityStateToggled,
                { visible: true },
            )
        })
    })

    describe('SidebarProvider', () => {
        it('should support render props pattern', () => {
            const { result } = renderHook(() => useSidebar(), {
                wrapper: ({ children }) => (
                    <SidebarProvider>
                        {(props) => (
                            <>
                                <div data-testid="collapsed">
                                    {String(props.isCollapsed)}
                                </div>
                                {children}
                            </>
                        )}
                    </SidebarProvider>
                ),
            })

            expect(result.current.isCollapsed).toBe(false)
        })
    })
})
