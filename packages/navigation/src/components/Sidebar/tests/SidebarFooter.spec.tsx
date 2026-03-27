import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { MockSidebarProvider } from '../../../fixtures/MockSidebarProvider'
import { SidebarFooter } from '../SidebarFooter'

const mockToggleCollapse = vi.fn()

describe('SidebarFooter', () => {
    it('should render children', () => {
        render(
            <MockSidebarProvider>
                <SidebarFooter>footer content</SidebarFooter>
            </MockSidebarProvider>,
        )
        const el = screen.getByText('footer content')
        expect(el).toBeInTheDocument()
    })

    it('should render with expanded layout when isCollapsed is false', () => {
        render(
            <MockSidebarProvider>
                <SidebarFooter>footer content</SidebarFooter>
            </MockSidebarProvider>,
        )
        const el = screen.getByText('footer content')
        expect(el).toBeInTheDocument()
    })

    it('should render with collapsed layout when isCollapsed is true', () => {
        render(
            <MockSidebarProvider isCollapsed={true}>
                <SidebarFooter>footer content</SidebarFooter>
            </MockSidebarProvider>,
        )
        const el = screen.getByText('footer content')
        expect(el).toBeInTheDocument()
    })

    it('should render multiple children', () => {
        render(
            <MockSidebarProvider toggleCollapse={mockToggleCollapse}>
                <SidebarFooter>
                    <div>child 1</div>
                    <div>child 2</div>
                </SidebarFooter>
            </MockSidebarProvider>,
        )
        expect(screen.getByText('child 1')).toBeInTheDocument()
        expect(screen.getByText('child 2')).toBeInTheDocument()
    })
})
