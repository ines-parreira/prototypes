import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { SidebarContext } from '../../../contexts/SidebarContext'
import { SidebarFooter } from '../SidebarFooter'

const mockToggleCollapse = vi.fn()

const wrapper = ({ children }: any) => (
    <SidebarContext.Provider
        value={{ isCollapsed: false, toggleCollapse: mockToggleCollapse }}
    >
        {children}
    </SidebarContext.Provider>
)

describe('SidebarFooter', () => {
    it('should render children', () => {
        render(<SidebarFooter>footer content</SidebarFooter>, { wrapper })
        const el = screen.getByText('footer content')
        expect(el).toBeInTheDocument()
    })

    it('should render with expanded layout when isCollapsed is false', () => {
        render(<SidebarFooter>footer content</SidebarFooter>, { wrapper })
        const el = screen.getByText('footer content')
        expect(el).toBeInTheDocument()
    })

    it('should render with collapsed layout when isCollapsed is true', () => {
        render(<SidebarFooter>footer content</SidebarFooter>, {
            wrapper: ({ children }) => (
                <SidebarContext.Provider
                    value={{
                        isCollapsed: true,
                        toggleCollapse: mockToggleCollapse,
                    }}
                >
                    {children}
                </SidebarContext.Provider>
            ),
        })
        const el = screen.getByText('footer content')
        expect(el).toBeInTheDocument()
    })

    it('should render multiple children', () => {
        render(
            <SidebarFooter>
                <div>child 1</div>
                <div>child 2</div>
            </SidebarFooter>,
            { wrapper },
        )
        expect(screen.getByText('child 1')).toBeInTheDocument()
        expect(screen.getByText('child 2')).toBeInTheDocument()
    })
})
