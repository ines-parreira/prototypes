import { render, screen } from '@testing-library/react'

import { SidebarFooter } from '../SidebarFooter'

describe('SidebarFooter', () => {
    it('should render children', () => {
        render(<SidebarFooter>footer content</SidebarFooter>)
        const el = screen.getByText('footer content')
        expect(el).toBeInTheDocument()
    })
})
