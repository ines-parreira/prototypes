import { render, screen } from '@testing-library/react'

import { MockSidebarProvider } from '../../../fixtures/MockSidebarProvider'
import { SidebarContent } from '../SidebarContent'

describe('SidebarContent', () => {
    it('should render children', () => {
        render(
            <MockSidebarProvider>
                <SidebarContent>content</SidebarContent>
            </MockSidebarProvider>,
        )
        const el = screen.getByText('content')
        expect(el).toBeInTheDocument()
    })

    it('should render children when sidebar is collapsed', () => {
        render(
            <MockSidebarProvider isCollapsed={true}>
                <SidebarContent>
                    <div data-testid="content">content</div>
                </SidebarContent>
            </MockSidebarProvider>,
        )
        const el = screen.getByText('content')
        expect(el).toBeInTheDocument()
    })
})
