import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Form, FormField } from 'core/forms'

import AssignIntegrationsModal from '../AssignIntegrationsModal'
import { EditCustomBusinessHoursFormValues } from '../types'

jest.mock(
    '../CustomBusinessHoursIntegrationsTable',
    () => (props: { name: string }) => (
        <div>CustomBusinessHoursIntegrationsTable {props.name}</div>
    ),
)

const baseValues: Partial<EditCustomBusinessHoursFormValues> = {
    previous_assigned_integrations: [],
    assigned_integrations: {
        assign_integrations: [],
        unassign_integrations: [],
    },
    temporary_assigned_integrations: [],
}

const renderWithForm = (
    isOpen: boolean = true,
    values: Partial<EditCustomBusinessHoursFormValues> = baseValues,
) => {
    return render(
        <Form defaultValues={values} onValidSubmit={jest.fn()}>
            <FormField
                name="assigned_integrations.assign_integrations"
                label="Assigned integrations"
            />
            <AssignIntegrationsModal isOpen={isOpen} onClose={jest.fn()} />
        </Form>,
    )
}

describe('AssignIntegrationsModal', () => {
    it('should render content when isOpen is true', () => {
        renderWithForm()

        expect(
            screen.getByText(
                'Select which integrations should use this business hours schedule. Updates will take effect when you save your business hours changes.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText(
                'CustomBusinessHoursIntegrationsTable temporary_assigned_integrations',
            ),
        ).toBeInTheDocument()
    })

    it('should not render content when isOpen is false', () => {
        renderWithForm(false)

        expect(
            screen.queryByText('Assign Integrations'),
        ).not.toBeInTheDocument()
    })

    it('updates the assigned integrations when the update selection button is clicked', async () => {
        const user = userEvent.setup()
        renderWithForm(true, {
            ...baseValues,
            temporary_assigned_integrations: [1, 2, 3],
        })

        expect(
            screen.getByRole('textbox', {
                name: 'Assigned integrations',
            }),
        ).toHaveValue('')

        await act(() =>
            user.click(
                screen.getByRole('button', { name: 'Update selection' }),
            ),
        )

        expect(
            screen.getByRole('textbox', {
                name: 'Assigned integrations',
            }),
        ).toHaveValue('1,2,3')
    })
})
