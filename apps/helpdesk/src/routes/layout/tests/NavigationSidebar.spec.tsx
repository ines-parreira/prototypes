import { render, screen } from '@testing-library/react'

import { NavigationSidebar } from '../NavigationSidebar'

describe('NavigationSidebar', () => {
    it('should render sidebar content', () => {
        render(<NavigationSidebar />)
        expect(screen.getByText('Sidebar')).toBeInTheDocument()
    })
})
