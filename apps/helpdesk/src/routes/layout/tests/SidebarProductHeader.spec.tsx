import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SidebarProductHeader } from '../SidebarProductHeader'

describe('SidebarProductHeader', () => {
    it('should render trigger button with selected item name', () => {
        const selectedItem = {
            name: 'Inbox',
            icon: '',
        }

        render(<SidebarProductHeader selectedItem={selectedItem} />)

        const triggerButton = screen.getByRole('button', { name: /Inbox/i })
        expect(triggerButton).toBeInTheDocument()
    })

    it('should render all menu items', async () => {
        const user = userEvent.setup()
        const selectedItem = {
            name: 'Inbox',
            icon: 'comm-chat-conversation-circle',
        }

        render(<SidebarProductHeader selectedItem={selectedItem} />)

        const triggerButton = screen.getByRole('button', { name: /Inbox/i })

        await act(() => user.click(triggerButton))

        expect(
            screen.getByRole('menuitem', { name: /Inbox/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /AI Agent/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /Marketing/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /Analytics/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /Workflows/ }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('menuitem', { name: /Customers/ }),
        ).toBeInTheDocument()
    })
})
