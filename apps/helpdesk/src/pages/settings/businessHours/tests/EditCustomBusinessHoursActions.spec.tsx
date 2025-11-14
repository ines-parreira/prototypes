import { act, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { mockBusinessHoursDetails } from '@gorgias/helpdesk-mocks'

import { Form } from 'core/forms'
import useDeleteCustomBusinessHours from 'hooks/businessHours/useDeleteCustomBusinessHours'
import { renderWithRouter } from 'utils/testing'

import { BUSINESS_HOURS_BASE_URL } from '../constants'
import EditCustomBusinessHoursActions from '../EditCustomBusinessHoursActions'

jest.mock('hooks/businessHours/useDeleteCustomBusinessHours')
const useDeleteCustomBusinessHoursMock = jest.mocked(
    useDeleteCustomBusinessHours,
)
const mockDelete = jest.fn()
useDeleteCustomBusinessHoursMock.mockReturnValue({
    mutate: mockDelete,
    isLoading: false,
} as any)

const businessHours = mockBusinessHoursDetails()

describe('EditCustomBusinessHoursActions', () => {
    it('should render all actions', () => {
        renderWithRouter(
            <Form onValidSubmit={jest.fn()}>
                <EditCustomBusinessHoursActions businessHours={businessHours} />
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
            'href',
            BUSINESS_HOURS_BASE_URL,
        )
    })

    it('should render the delete confirmation modal with correct content and call deleteBusinessHours when the button is clicked', async () => {
        const user = userEvent.setup()

        renderWithRouter(
            <Form onValidSubmit={jest.fn()}>
                <EditCustomBusinessHoursActions businessHours={businessHours} />
            </Form>,
        )

        await act(() =>
            user.click(
                screen.getByRole('button', { name: 'Delete business hours' }),
            ),
        )

        expect(screen.getByText('Delete business hours?')).toBeInTheDocument()
        expect(
            screen.getByText(/Are you sure you want to delete/),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'The custom schedule will be deleted and all integrations assigned to it will revert to default business hours.',
            ),
        ).toBeInTheDocument()

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Delete' })),
        )

        expect(mockDelete).toHaveBeenCalledWith({
            id: businessHours.id,
        })
    })
})
