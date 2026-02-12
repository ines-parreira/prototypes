import { render, screen } from '@testing-library/react'

import { SidebarContent } from '../SidebarContent'

describe('SidebarContent', () => {
    it('should render children', () => {
        render(<SidebarContent>content</SidebarContent>)
        const el = screen.getByText('content')
        expect(el).toBeInTheDocument()
    })
})
