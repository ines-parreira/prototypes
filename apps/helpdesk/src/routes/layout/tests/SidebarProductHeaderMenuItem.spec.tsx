import { history } from '@repo/routing'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button, Menu } from '@gorgias/axiom'

import { Product, productConfig } from 'routes/layout/productConfig'

import { SidebarProductHeaderMenuItem } from '../SidebarProductHeaderMenuItem'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

describe('SidebarProductHeaderMenuItem', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should navigate to product path when clicked', async () => {
        const user = userEvent.setup()
        const item = productConfig[Product.Inbox]

        render(
            <Menu trigger={<Button>Open Menu</Button>}>
                <SidebarProductHeaderMenuItem item={item} />
            </Menu>,
        )

        const menuTrigger = screen.getByRole('button', { name: /Open Menu/i })
        await act(() => user.click(menuTrigger))

        const menuItem = screen.getByText('Inbox')
        await act(() => user.click(menuItem))

        expect(history.push).toHaveBeenCalledWith(
            productConfig[Product.Inbox].defaultPath,
        )
    })

    it('should render item name with Upgrade badge when requiresUpgrade is true', async () => {
        const user = userEvent.setup()
        const item = productConfig[Product.AiAgent]

        render(
            <Menu trigger={<Button>Open Menu</Button>}>
                <SidebarProductHeaderMenuItem item={item} requiresUpgrade />
            </Menu>,
        )

        const menuTrigger = screen.getByRole('button', {
            name: /Open Menu/i,
        })

        await act(() => user.click(menuTrigger))

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.getByText('Upgrade')).toBeInTheDocument()
    })

    it('should render item description as caption', async () => {
        const user = userEvent.setup()
        const item = productConfig[Product.Inbox]

        render(
            <Menu trigger={<Button>Open Menu</Button>}>
                <SidebarProductHeaderMenuItem item={item} />
            </Menu>,
        )

        await act(() =>
            user.click(screen.getByRole('button', { name: /Open Menu/i })),
        )

        expect(screen.getByText('Talk with customers')).toBeInTheDocument()
    })

    it('should render item name without Upgrade badge when requiresUpgrade is false', async () => {
        const user = userEvent.setup()
        const item = productConfig[Product.AiAgent]

        render(
            <Menu trigger={<Button>Open Menu</Button>}>
                <SidebarProductHeaderMenuItem item={item} />
            </Menu>,
        )

        const menuTrigger = screen.getByRole('button', {
            name: /Open Menu/i,
        })

        await act(() => user.click(menuTrigger))

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
        expect(screen.queryByText('Upgrade')).not.toBeInTheDocument()
    })
})
