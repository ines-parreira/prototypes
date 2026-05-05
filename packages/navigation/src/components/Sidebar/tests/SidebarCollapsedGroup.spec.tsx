import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MockSidebarProvider } from '../../../fixtures/MockSidebarProvider'
import { SidebarCollapsedGroup } from '../SidebarCollapsedGroup'
import { SidebarCollapsedItem } from '../SidebarCollapsedItem'

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <MockSidebarProvider isCollapsed>{children}</MockSidebarProvider>
)

describe('SidebarCollapsedGroup', () => {
    it('renders children', () => {
        render(
            <SidebarCollapsedGroup>
                <SidebarCollapsedItem id="inbox" icon="inbox" label="Inbox" />
            </SidebarCollapsedGroup>,
            { wrapper },
        )

        expect(
            screen.getByRole('radio', { name: /inbox/i }),
        ).toBeInTheDocument()
    })

    it('renders multiple children', () => {
        render(
            <SidebarCollapsedGroup>
                <SidebarCollapsedItem id="inbox" icon="inbox" label="Inbox" />
                <SidebarCollapsedItem
                    id="customers"
                    icon="notebook"
                    label="All customers"
                />
            </SidebarCollapsedGroup>,
            { wrapper },
        )

        expect(screen.getAllByRole('radio')).toHaveLength(2)
    })

    it('calls onSelectionChange with the selected item id when clicked', async () => {
        const user = userEvent.setup()
        const onSelectionChange = vi.fn()

        render(
            <SidebarCollapsedGroup onSelectionChange={onSelectionChange}>
                <SidebarCollapsedItem id="inbox" icon="inbox" label="Inbox" />
                <SidebarCollapsedItem
                    id="customers"
                    icon="notebook"
                    label="All customers"
                />
            </SidebarCollapsedGroup>,
            { wrapper },
        )

        await user.click(screen.getByRole('radio', { name: /inbox/i }))

        expect(onSelectionChange).toHaveBeenCalledWith('inbox')
    })

    it('marks the item matching selectedKey as selected', () => {
        render(
            <SidebarCollapsedGroup selectedKey="inbox">
                <SidebarCollapsedItem id="inbox" icon="inbox" label="Inbox" />
                <SidebarCollapsedItem
                    id="customers"
                    icon="notebook"
                    label="All customers"
                />
            </SidebarCollapsedGroup>,
            { wrapper },
        )

        const [inboxButton, customersButton] = screen.getAllByRole('radio')

        expect(inboxButton).toHaveAttribute('aria-checked', 'true')
        expect(customersButton).toHaveAttribute('aria-checked', 'false')
    })
})
