import type { ComponentProps } from 'react'

import { fireEvent, screen } from '@testing-library/react'

import { DataTable } from '@gorgias/axiom'

import { render } from '../../../../tests/render.utils'
import { TicketTableCellLink } from './TicketTableCellLink'

import css from './TicketTableCellLink.module.less'

function renderTicketTableCellLink(
    props?: Partial<ComponentProps<typeof TicketTableCellLink>>,
) {
    return render(
        <div onClick={(event) => event.preventDefault()}>
            <DataTable
                data={[]}
                columns={[]}
                renderEmptyState={() => (
                    <table>
                        <tbody>
                            <tr>
                                <TicketTableCellLink
                                    to="/app/ticket/42"
                                    {...props}
                                >
                                    {props?.children ?? 'Ticket 42'}
                                </TicketTableCellLink>
                            </tr>
                        </tbody>
                    </table>
                )}
            />
        </div>,
    )
}

describe('TicketTableCellLink', () => {
    it('renders a real link inside the cell and merges the optional class name', () => {
        const { container } = renderTicketTableCellLink({
            className: 'custom-cell',
        })

        const link = screen.getByRole('link', { name: 'Ticket 42' })
        const cell = link.closest('td')
        expect(cell).not.toBeNull()
        const baseCellContent = container.querySelector(
            '[data-name="data-table-cell"]',
        )

        expect(link).toHaveAttribute('href', '/app/ticket/42')
        expect(link).toHaveClass(css.link)
        expect(baseCellContent).toHaveClass(css.cell, 'custom-cell')
    })

    it('uses the default cell class when no custom class name is provided', () => {
        const { container } = renderTicketTableCellLink()

        expect(
            container.querySelector('[data-name="data-table-cell"]'),
        ).toHaveClass(css.cell)
    })

    it('calls the navigation side effect on a plain left click', async () => {
        const onNavigateToTicket = vi.fn()
        const { user } = renderTicketTableCellLink({ onNavigateToTicket })

        await user.click(screen.getByRole('link', { name: 'Ticket 42' }))

        expect(onNavigateToTicket).toHaveBeenCalledTimes(1)
    })

    it('renders a clickable link without requiring a navigation callback', async () => {
        const { user } = renderTicketTableCellLink()

        await user.click(screen.getByRole('link', { name: 'Ticket 42' }))
    })

    it.each([
        ['middle click', { button: 1 }],
        ['meta click', { metaKey: true }],
        ['ctrl click', { ctrlKey: true }],
        ['shift click', { shiftKey: true }],
        ['alt click', { altKey: true }],
    ])('does not trigger the navigation side effect on %s', (_, eventInit) => {
        const onNavigateToTicket = vi.fn()

        renderTicketTableCellLink({ onNavigateToTicket })

        fireEvent.click(
            screen.getByRole('link', { name: 'Ticket 42' }),
            eventInit,
        )

        expect(onNavigateToTicket).not.toHaveBeenCalled()
    })

    it('does not trigger the navigation side effect when the click is already prevented', () => {
        const onNavigateToTicket = vi.fn()

        renderTicketTableCellLink({
            onNavigateToTicket,
            children: (
                <button
                    type="button"
                    onClick={(event) => {
                        event.preventDefault()
                    }}
                >
                    Show more tags
                </button>
            ),
        })

        fireEvent.click(screen.getByRole('button', { name: 'Show more tags' }))

        expect(onNavigateToTicket).not.toHaveBeenCalled()
    })
})
