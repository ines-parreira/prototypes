import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { Form } from 'core/forms'

import { BUSINESS_HOURS_BASE_URL } from '../constants'
import EditCustomBusinessHoursActions from '../EditCustomBusinessHoursActions'

describe('EditCustomBusinessHoursActions', () => {
    it('should render all actions', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <EditCustomBusinessHoursActions />
            </Form>,
        )

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })

        expect(
            screen.getByRole('button', { name: 'Save changes' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Delete business hours' }),
        ).toBeInTheDocument()

        expect(cancelButton.closest('a')).toHaveAttribute(
            'to',
            BUSINESS_HOURS_BASE_URL,
        )
    })

    it('should render the delete confirmation modal with correct content', async () => {
        const user = userEvent.setup()

        render(
            <Form onValidSubmit={jest.fn()}>
                <EditCustomBusinessHoursActions />
            </Form>,
        )

        await act(() =>
            user.click(
                screen.getByRole('button', { name: 'Delete business hours' }),
            ),
        )

        expect(screen.getByText('Delete business hours?')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Are you sure you want to delete these custom business hours?',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'The custom schedule will be deleted and all integrations assigned to it will revert to default business hours.',
            ),
        ).toBeInTheDocument()
    })
})
