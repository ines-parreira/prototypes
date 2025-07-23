import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Form, FormField } from 'core/forms'
import Modal from 'pages/common/components/modal/Modal'

import EditCustomBusinessHoursIntegrationsSection from '../EditCustomBusinessHoursIntegrationsSection'
import { EditCustomBusinessHoursFormValues } from '../types'

jest.mock('../AssignIntegrationsModal', () => (props: any) => (
    <Modal {...props}>
        <div>AssignIntegrationsModal</div>
        <FormField
            name="temporary_assigned_integrations"
            label="Temporary assigned integrations"
        />
        <button onClick={props.onClose}>Close</button>
    </Modal>
))

const baseValues: Partial<EditCustomBusinessHoursFormValues> = {
    previous_assigned_integrations: [],
    assigned_integrations: {
        assign_integrations: [],
        unassign_integrations: [],
    },
}

const renderWithForm = (
    values: Partial<EditCustomBusinessHoursFormValues> = baseValues,
) => {
    return render(
        <Form<EditCustomBusinessHoursFormValues>
            onValidSubmit={jest.fn()}
            defaultValues={values}
        >
            <EditCustomBusinessHoursIntegrationsSection />
        </Form>,
    )
}

describe('EditCustomBusinessHoursIntegrationsSection', () => {
    it.each([
        [[], 'No integrations assigned'],
        [[1], '1 integration assigned'],
        [[1, 2], '2 integrations assigned'],
    ])(
        'renders the integrations section with %s',
        async (assignedIntegrations, expectedText) => {
            renderWithForm({
                previous_assigned_integrations: [],
                assigned_integrations: {
                    assign_integrations: assignedIntegrations,
                    unassign_integrations: [],
                },
            })

            expect(screen.getByText(expectedText)).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Select integrations' }),
            ).toBeInTheDocument()
        },
    )

    it.each([
        [[1], [2], '1 integration added, 1 integration removed'],
        [[1], [], '1 integration removed'],
        [[], [1], '1 integration added'],
        [[1], [2, 3], '2 integrations added'],
        [[1, 2], [], '2 integrations removed'],
        [[1, 2, 3], [4, 5, 6], '3 integrations added, 3 integrations removed'],
    ])(
        'renders the integrations section with a summary text when the assigned integrations are different from the previous assigned integrations',
        async (
            previousAssignedIntegrations,
            assignedIntegrations,
            expectedText,
        ) => {
            renderWithForm({
                previous_assigned_integrations: previousAssignedIntegrations,
                assigned_integrations: {
                    assign_integrations: assignedIntegrations,
                    unassign_integrations: [],
                },
            })

            expect(
                screen.getByText(expectedText, { exact: false }),
            ).toBeInTheDocument()
        },
    )

    it('does not render a summary text when the assigned integrations are the same as the previous assigned integrations', async () => {
        renderWithForm({
            previous_assigned_integrations: [1],
            assigned_integrations: {
                assign_integrations: [1],
                unassign_integrations: [],
            },
        })

        expect(
            screen.queryByText('Save Changes', { exact: false }),
        ).not.toBeInTheDocument()
    })

    it('opens the modal and sets the temporary assigned integrations to the current assigned integrations', async () => {
        const user = userEvent.setup()
        renderWithForm({
            ...baseValues,
            assigned_integrations: {
                assign_integrations: [1, 2, 3],
                unassign_integrations: [],
            },
        })

        await act(() =>
            user.click(
                screen.getByRole('button', { name: 'Select integrations' }),
            ),
        )

        expect(screen.getByText('AssignIntegrationsModal')).toBeInTheDocument()

        expect(
            screen.getByRole('textbox', {
                name: 'Temporary assigned integrations',
            }),
        ).toHaveValue('1,2,3')
    })

    it('closes the modal when the close button is clicked', async () => {
        const user = userEvent.setup()
        renderWithForm()

        await act(() =>
            user.click(
                screen.getByRole('button', { name: 'Select integrations' }),
            ),
        )

        expect(screen.getByText('AssignIntegrationsModal')).toBeInTheDocument()

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Close' })),
        )

        await waitFor(() =>
            expect(
                screen.queryByText('AssignIntegrationsModal'),
            ).not.toBeInTheDocument(),
        )
    })
})
