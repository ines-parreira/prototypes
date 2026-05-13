import { screen } from '@testing-library/react'

import { render } from '../../../../../../../tests/render.utils'
import { TicketStatus } from '../../../../../../../types/ticket'
import { BulkStatusSelect } from '../BulkStatusSelect'

describe('BulkStatusSelect', () => {
    it('calls onChange with closed when Close is clicked', async () => {
        const onChange = vi.fn()
        const { user } = render(<BulkStatusSelect onChange={onChange} />)

        await user.click(screen.getByRole('button', { name: 'Close' }))

        expect(onChange).toHaveBeenCalledWith(TicketStatus.Closed)
    })

    it('calls onChange with open when Open is selected from the dropdown', async () => {
        const onChange = vi.fn()
        const { user } = render(<BulkStatusSelect onChange={onChange} />)

        await user.click(
            screen.getByRole('button', { name: 'More status actions' }),
        )
        await user.click(await screen.findByRole('menuitem', { name: 'Open' }))

        expect(onChange).toHaveBeenCalledWith(TicketStatus.Open)
    })

    it('disables status actions', async () => {
        const onChange = vi.fn()
        render(<BulkStatusSelect onChange={onChange} isDisabled />)

        expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled()
        expect(
            screen.getByRole('button', { name: 'More status actions' }),
        ).toBeDisabled()
        expect(
            screen.queryByRole('menuitem', { name: 'Open' }),
        ).not.toBeInTheDocument()

        expect(onChange).not.toHaveBeenCalled()
    })

    it('does not open status actions when disabled', async () => {
        const onChange = vi.fn()
        const { user } = render(
            <BulkStatusSelect onChange={onChange} isDisabled />,
        )

        await user.click(
            screen.getByRole('button', { name: 'More status actions' }),
        )

        expect(
            screen.queryByRole('menuitem', { name: 'Open' }),
        ).not.toBeInTheDocument()
        expect(onChange).not.toHaveBeenCalled()
    })
})
