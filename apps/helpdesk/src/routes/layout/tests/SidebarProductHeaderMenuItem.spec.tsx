import { history } from '@repo/routing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Button, Menu } from '@gorgias/axiom'

import { Product, productConfig } from 'routes/layout/productConfig'

import { SidebarProductHeaderMenuItem } from '../SidebarProductHeaderMenuItem'

jest.mock('@repo/routing', () => ({
    history: {
        push: jest.fn(),
    },
}))

const renderMenuItem = (item: any) => {
    return render(
        <Menu trigger={<Button>Open Menu</Button>}>
            <SidebarProductHeaderMenuItem item={item} />
        </Menu>,
    )
}

describe('SidebarProductHeaderMenuItem', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should navigate to product path when clicked', async () => {
        const user = userEvent.setup()
        const item = productConfig[Product.Inbox]

        renderMenuItem(item)

        const menuTrigger = screen.getByRole('button', { name: /Open Menu/i })
        await user.click(menuTrigger)

        const menuItem = screen.getByText('Inbox')
        await user.click(menuItem)

        expect(history.push).toHaveBeenCalledWith(
            productConfig[Product.Inbox].defaultPath,
        )
    })
})
