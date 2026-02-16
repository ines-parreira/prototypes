import { render, screen } from '@testing-library/react'

import { AppLayout } from '../AppLayout'

jest.mock('routes/layout/NavigationSidebar', () => ({
    NavigationSidebar: () => <div>Sidebar</div>,
}))

describe('AppLayout', () => {
    it('should render sidebar and children when hasPanel is false', () => {
        render(
            <AppLayout hasPanel={false}>
                <div>main content</div>
            </AppLayout>,
        )
        expect(screen.getByText('main content')).toBeInTheDocument()
        expect(screen.getByText('Sidebar')).toBeInTheDocument()
    })

    it('should render sidebar and children when hasPanel is true', () => {
        render(
            <AppLayout hasPanel={true}>
                <div>main content</div>
            </AppLayout>,
        )
        expect(screen.getByText('main content')).toBeInTheDocument()
        expect(screen.getByText('Sidebar')).toBeInTheDocument()
    })
})
