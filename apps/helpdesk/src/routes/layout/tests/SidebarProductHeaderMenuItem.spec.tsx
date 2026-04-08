import { MockSidebarProvider } from '@repo/navigation/fixtures'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Button, Menu } from '@gorgias/axiom'

import { Product, productConfig } from 'routes/layout/productConfig'

import { SidebarProductHeaderMenuItem } from '../SidebarProductHeaderMenuItem'

const renderComponent = (
    item = productConfig[Product.Inbox],
    requiresUpgrade = false,
) =>
    render(
        <MemoryRouter>
            <MockSidebarProvider>
                <Menu trigger={<Button>Open Menu</Button>}>
                    <SidebarProductHeaderMenuItem
                        item={item}
                        requiresUpgrade={requiresUpgrade}
                    />
                </Menu>
            </MockSidebarProvider>
        </MemoryRouter>,
    )

describe('SidebarProductHeaderMenuItem', () => {
    it('renders the menu item as a link to the product path', async () => {
        const user = userEvent.setup()
        const item = productConfig[Product.Inbox]

        renderComponent(item)

        const menuTrigger = screen.getByRole('button', { name: /Open Menu/i })
        await act(() => user.click(menuTrigger))

        const menuItem = screen.getByText('Inbox').closest('a')

        expect(menuItem).toHaveAttribute('href', item.defaultPath)
    })

    it('should render item name with Upgrade badge when requiresUpgrade is true', async () => {
        const user = userEvent.setup()
        const item = productConfig[Product.AiAgent]

        renderComponent(item, true)

        const menuTrigger = screen.getByRole('button', {
            name: /Open Menu/i,
        })

        await act(() => user.click(menuTrigger))

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Upgrade')).toBeInTheDocument()
    })

    it('should render item description as caption', async () => {
        const user = userEvent.setup()

        renderComponent()

        await act(() =>
            user.click(screen.getByRole('button', { name: /Open Menu/i })),
        )

        expect(screen.getByText('Talk with customers')).toBeInTheDocument()
    })

    it('should render item name without Upgrade badge when requiresUpgrade is false', async () => {
        const user = userEvent.setup()
        const item = productConfig[Product.AiAgent]

        renderComponent(item)

        const menuTrigger = screen.getByRole('button', {
            name: /Open Menu/i,
        })

        await act(() => user.click(menuTrigger))

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.queryByText('Upgrade')).not.toBeInTheDocument()
    })
})
