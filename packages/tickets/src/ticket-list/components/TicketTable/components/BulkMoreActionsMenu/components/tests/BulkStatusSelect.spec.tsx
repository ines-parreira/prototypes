import { screen } from '@testing-library/react'

import { render } from '../../../../../../../tests/render.utils'
import { TicketStatus } from '../../../../../../../types/ticket'
import { BulkStatusSelect } from '../BulkStatusSelect'

describe('BulkStatusSelect', () => {
    it.each([
        { label: 'Open', expected: TicketStatus.Open },
        { label: 'Close', expected: TicketStatus.Closed },
    ])(
        'calls onChange with $expected when $label is selected',
        async ({ label, expected }) => {
            const onChange = vi.fn()
            const { user } = render(<BulkStatusSelect onChange={onChange} />)

            await user.click(screen.getByLabelText('Status selection'))
            await user.click(screen.getByRole('option', { name: label }))

            expect(onChange).toHaveBeenCalledWith(expected)
        },
    )
})
