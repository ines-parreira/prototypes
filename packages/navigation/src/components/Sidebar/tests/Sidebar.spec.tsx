import { render, screen } from '@testing-library/react'

import { MockSidebarProvider } from '../../../fixtures/MockSidebarProvider'
import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
    it('should render children', () => {
        render(
            <MockSidebarProvider>
                <Sidebar>sidebar content</Sidebar>
            </MockSidebarProvider>,
        )
        const el = screen.getByText('sidebar content')
        expect(el).toBeInTheDocument()
    })

    it('should render children when sidebar is collapsed', () => {
        render(
            <MockSidebarProvider isCollapsed={true}>
                <Sidebar>sidebar content</Sidebar>
            </MockSidebarProvider>,
        )
        const el = screen.getByText('sidebar content')
        expect(el).toBeInTheDocument()
    })
})
