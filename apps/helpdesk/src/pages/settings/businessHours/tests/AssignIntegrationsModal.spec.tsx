import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Form, FormField } from 'core/forms'

import AssignIntegrationsModal from '../AssignIntegrationsModal'
import { CustomBusinessHoursContext } from '../CustomBusinessHoursContext'
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

const resetIntegrationsToOverride = jest.fn()
const onClose = jest.fn()

const renderWithForm = (
    isOpen: boolean = true,
    values: Partial<EditCustomBusinessHoursFormValues> = baseValues,
    integrationsToOverride: number[] = [],
) => {
    return render(
        <CustomBusinessHoursContext.Provider
            value={{
                businessHoursId: 1,
                integrationsToOverride,
                toggleIntegrationsToOverride: jest.fn(),
                resetIntegrationsToOverride,
            }}
        >
            <Form defaultValues={values} onValidSubmit={jest.fn()}>
                <FormField
                    name="assigned_integrations.assign_integrations"
                    label="Assigned integrations"
                />
                <FormField
                    type="checkbox"
                    name="overrideConfirmation"
                    label="Override confirmation"
                />
                <AssignIntegrationsModal isOpen={isOpen} onClose={onClose} />
            </Form>
        </CustomBusinessHoursContext.Provider>,
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

        await waitFor(() => {
            expect(
                screen.getByRole('textbox', {
                    name: 'Assigned integrations',
                }),
            ).toHaveValue('1,2,3')
        })

        expect(onClose).toHaveBeenCalled()
    })

    it('resets the override confirmation and integrations to override when the modal is closed', async () => {
        const user = userEvent.setup()
        renderWithForm(true, {
            ...baseValues,
            temporary_assigned_integrations: [1, 2, 3],
            overrideConfirmation: true,
        })

        await act(() =>
            user.click(screen.getByRole('button', { name: 'Cancel' })),
        )

        await waitFor(() => {
            expect(resetIntegrationsToOverride).toHaveBeenCalled()
            expect(
                screen.getByRole('checkbox', {
                    name: 'Override confirmation',
                }),
            ).not.toBeChecked()
        })
        expect(onClose).toHaveBeenCalled()
    })

    it('should not allow to update the selection if the override confirmation is not set', () => {
        renderWithForm(
            true,
            {
                ...baseValues,
                overrideConfirmation: false,
            },
            [1, 2, 3],
        )

        expect(
            screen.getByRole('button', { name: 'Update selection' }),
        ).toBeAriaDisabled()
    })

    it('should allow to update the selection if the override confirmation is set and there are integrations to override', () => {
        renderWithForm(
            true,
            {
                ...baseValues,
                overrideConfirmation: true,
            },
            [1, 2, 3],
        )

        expect(
            screen.getByRole('button', { name: 'Update selection' }),
        ).not.toBeAriaDisabled()
    })
})
