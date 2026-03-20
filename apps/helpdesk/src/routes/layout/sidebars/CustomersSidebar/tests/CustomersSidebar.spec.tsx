import { SidebarContext } from '@repo/navigation'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { CustomersSidebar } from 'routes/layout/sidebars/CustomersSidebar/CustomersSidebar'

const renderCustomersSidebar = (isCollapsed = false) => {
    return render(
        <MemoryRouter>
            <SidebarContext.Provider
                value={{ isCollapsed, toggleCollapse: jest.fn() }}
            >
                <CustomersSidebar />
            </SidebarContext.Provider>
        </MemoryRouter>,
    )
}

describe('CustomersSidebar', () => {
    describe('expanded state', () => {
        it('should render a link to All customers', () => {
            renderCustomersSidebar()

            expect(
                screen.getByRole('link', { name: /All customers/i }),
            ).toBeInTheDocument()
        })
    })

    describe('collapsed state', () => {
        it('should render the notebook icon instead of the link', () => {
            renderCustomersSidebar(true)

            expect(
                screen.queryByRole('link', { name: /All customers/i }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('img', { name: 'notebook' }),
            ).toBeInTheDocument()
        })
    })
})
