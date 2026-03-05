import React from 'react'

import { render, screen } from '@testing-library/react'

import { SidebarContext } from '../../../contexts/SidebarContext'
import { SidebarContent } from '../SidebarContent'

const wrapper = ({
    children,
    isCollapsed = false,
}: {
    children: React.ReactNode
    isCollapsed?: boolean
}) => (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse: vi.fn() }}>
        {children}
    </SidebarContext.Provider>
)

describe('SidebarContent', () => {
    it('should render children', () => {
        render(<SidebarContent>content</SidebarContent>, {
            wrapper,
        })
        const el = screen.getByText('content')
        expect(el).toBeInTheDocument()
    })

    it('should render children when sidebar is collapsed', () => {
        render(
            <SidebarContent>
                <div data-testid="content">content</div>
            </SidebarContent>,
            {
                wrapper: ({ children }) =>
                    wrapper({ children, isCollapsed: true }),
            },
        )
        const el = screen.getByText('content')
        expect(el).toBeInTheDocument()
    })
})
