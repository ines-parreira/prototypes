import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConditionsDisclaimer } from '../ConditionsDisclaimer'
import { makeConditionItem } from '../ConditionsSelect/types'

describe('ConditionsDisclaimer', () => {
    it('renders nothing when conditions array is empty', () => {
        const { container } = render(<ConditionsDisclaimer conditions={[]} />)
        expect(container).toBeEmptyDOMElement()
    })

    it.each<[string, ReturnType<typeof makeConditionItem>[], string]>([
        [
            'tags only',
            [makeConditionItem('tags', 1, 'urgent', 'urgent')],
            'Tags: urgent',
        ],
        [
            'ticket fields only',
            [makeConditionItem('ticket_fields', 10, 'optA', 'Priority / optA')],
            'Ticket fields: Priority / optA',
        ],
        [
            'both tags and fields',
            [
                makeConditionItem('tags', 1, 'urgent', 'urgent'),
                makeConditionItem(
                    'ticket_fields',
                    10,
                    'optA',
                    'Priority / optA',
                ),
            ],
            'Tags: urgent and Ticket fields: Priority / optA',
        ],
    ])('shows summary for %s', (_, conditions, expectedText) => {
        render(<ConditionsDisclaimer conditions={conditions} />)
        expect(
            screen.getByText(expectedText, { exact: false }),
        ).toBeInTheDocument()
    })

    it('hides after dismiss and reappears when conditions change', async () => {
        const user = userEvent.setup()
        const initialConditions = [
            makeConditionItem('tags', 1, 'urgent', 'urgent'),
        ]

        const { rerender } = render(
            <ConditionsDisclaimer conditions={initialConditions} />,
        )
        expect(
            screen.getByText('Tags: urgent', { exact: false }),
        ).toBeInTheDocument()

        const closeButton = screen.getByRole('button')
        await user.click(closeButton)

        expect(
            screen.queryByText('Tags: urgent', { exact: false }),
        ).not.toBeInTheDocument()

        const updatedConditions = [
            ...initialConditions,
            makeConditionItem('tags', 2, 'vip', 'vip'),
        ]
        rerender(<ConditionsDisclaimer conditions={updatedConditions} />)

        expect(
            screen.getByText('Tags: urgent, vip', { exact: false }),
        ).toBeInTheDocument()
    })
})
