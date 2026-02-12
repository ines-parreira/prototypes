import { render, screen } from '@testing-library/react'

import { Sidebar } from '../Sidebar'

describe('Sidebar', () => {
    it('should render children', () => {
        render(<Sidebar>sidebar content</Sidebar>)
        const el = screen.getByText('sidebar content')
        expect(el).toBeInTheDocument()
    })
})
