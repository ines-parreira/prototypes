import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ButtonGroup } from '@gorgias/axiom'

import { SidebarCollapsedItem } from '../SidebarCollapsedItem'

describe('SidebarCollapsedItem', () => {
    it('renders the icon', () => {
        render(
            <ButtonGroup>
                <SidebarCollapsedItem id="inbox" icon="inbox" label="Inbox" />
            </ButtonGroup>,
        )

        expect(screen.getByRole('img', { name: 'inbox' })).toBeInTheDocument()
    })

    it('shows the label as tooltip on focus', async () => {
        const user = userEvent.setup()

        render(
            <ButtonGroup>
                <SidebarCollapsedItem id="inbox" icon="inbox" label="Inbox" />
            </ButtonGroup>,
        )

        await user.tab()

        expect(screen.getByText('Inbox')).toBeInTheDocument()
    })
})
