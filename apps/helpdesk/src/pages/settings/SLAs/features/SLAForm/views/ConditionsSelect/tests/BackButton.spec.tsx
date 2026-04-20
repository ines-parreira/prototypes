import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { BackButton } from '../BackButton'
import type { DrilldownLevel } from '../types'

describe('BackButton', () => {
    it.each<[string, DrilldownLevel, string, DrilldownLevel]>([
        ['tags level', { type: 'tags' }, 'Tags', { type: 'root' }],
        [
            'ticket_fields level',
            { type: 'ticket_fields' },
            'Ticket fields',
            { type: 'root' },
        ],
        [
            'ticket_field_values with empty path',
            {
                type: 'ticket_field_values',
                fieldId: 10,
                fieldLabel: 'Priority',
                path: [],
            },
            'Priority',
            { type: 'ticket_fields' },
        ],
        [
            'ticket_field_values with path',
            {
                type: 'ticket_field_values',
                fieldId: 10,
                fieldLabel: 'Priority',
                path: ['Level1'],
            },
            'Level1',
            expect.objectContaining({
                type: 'ticket_field_values',
                path: [],
            }),
        ],
    ])(
        'at %s: shows label and navigates to parent',
        async (_, level, expectedLabel, expectedParent) => {
            const user = userEvent.setup()
            const onNavigate = jest.fn()

            render(<BackButton level={level} onNavigate={onNavigate} />)

            expect(screen.getByText(expectedLabel)).toBeInTheDocument()

            await user.click(screen.getByRole('button'))
            expect(onNavigate).toHaveBeenCalledWith(expectedParent)
        },
    )
})
