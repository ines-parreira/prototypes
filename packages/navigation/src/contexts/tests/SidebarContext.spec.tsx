import { act, renderHook } from '@testing-library/react'

import { SidebarProvider, useSidebar } from '../SidebarContext'

describe('SidebarContext', () => {
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
