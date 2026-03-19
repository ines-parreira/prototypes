import { act, screen, waitFor } from '@testing-library/react'

import { render } from '../../../tests/render.utils'
import { TicketSectionActionsMenu } from '../TicketSectionActionsMenu'

const actions = [
    { label: 'Rename', onClick: vi.fn() },
    { label: 'Delete', onClick: vi.fn() },
]

describe('TicketSectionActionsMenu', () => {
    it('renders each action as a menu item after opening', async () => {
        const { user } = render(
            <TicketSectionActionsMenu
                triggerIcon="dots-meatballs-horizontal"
                actions={actions}
            />,
        )

        await act(() => user.click(screen.getByRole('button')))

        await waitFor(() => {
            expect(screen.getByText('Rename')).toBeInTheDocument()
            expect(screen.getByText('Delete')).toBeInTheDocument()
        })
    })

    it('calls action onClick when a menu item is selected', async () => {
        const onClick = vi.fn()
        const { user } = render(
            <TicketSectionActionsMenu
                triggerIcon="dots-meatballs-horizontal"
                actions={[{ label: 'Rename', onClick }]}
            />,
        )

        await act(() => user.click(screen.getByRole('button')))

        await waitFor(() => {
            expect(screen.getByText('Rename')).toBeInTheDocument()
        })

        await act(() => user.click(screen.getByText('Rename')))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('renders tooltip text when tooltip prop is provided', async () => {
        const { user } = render(
            <TicketSectionActionsMenu
                triggerIcon="add-plus-circle"
                actions={actions}
                tooltip="Add a view"
            />,
        )

        await act(() => user.hover(screen.getByRole('button')))

        await waitFor(() => {
            expect(screen.getByText('Add a view')).toBeInTheDocument()
        })
    })

    it('does not render tooltip content when tooltip is not provided', async () => {
        const { user } = render(
            <TicketSectionActionsMenu
                triggerIcon="add-plus-circle"
                actions={actions}
            />,
        )

        await act(() => user.hover(screen.getByRole('button')))

        expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
    })

    it('disables the button when isDisabled is true', () => {
        render(
            <TicketSectionActionsMenu
                triggerIcon="add-plus-circle"
                actions={actions}
                isDisabled
            />,
        )

        expect(screen.getByRole('button')).toBeDisabled()
    })
})
