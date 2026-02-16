import { render, screen } from '@testing-library/react'

import { CustomersSidebar } from '../sidebars/CustomersSidebar'

jest.mock('pages/customers/common/CustomerNavbarContainer', () => ({
    __esModule: true,
    default: () => <div>CustomerNavbarContainer</div>,
}))

describe('CustomersSidebar', () => {
    it('should render CustomerNavbarContainer component', () => {
        render(<CustomersSidebar />)
        const navbar = screen.getByText('CustomerNavbarContainer')
        expect(navbar).toBeInTheDocument()
    })
})
