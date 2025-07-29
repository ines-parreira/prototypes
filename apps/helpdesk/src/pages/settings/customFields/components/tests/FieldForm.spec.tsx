import { createEvent, fireEvent, screen, waitFor } from '@testing-library/react'
import { omit } from 'lodash'

import { CustomFieldManagedTypeProperty } from '@gorgias/helpdesk-types'

import {
    OBJECT_TYPE_SETTINGS,
    OBJECT_TYPES,
    SYSTEM_READ_ONLY_MANAGED_TYPES,
} from 'custom-fields/constants'
import { useUpdateCustomFieldArchiveStatus } from 'custom-fields/hooks/queries/useUpdateCustomFieldArchiveStatus'
import {
    aiManagedTicketInputFieldDefinition,
    archivedTicketInputFieldDefinition,
    customFieldInputDefinition,
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import useAppDispatch from 'hooks/useAppDispatch'
import ArchiveConfirmationModal from 'pages/settings/customFields/components/ArchiveConfirmationModal'
import DropdownInput from 'pages/settings/customFields/components/DropdownInput'
import FieldForm from 'pages/settings/customFields/components/FieldForm'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assumeMock, getLastMockCall, renderWithRouter } from 'utils/testing'
import { userEvent } from 'utils/testing/userEvent'

jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)
jest.mock('state/notifications/actions')
const notifyMock = assumeMock(notify)

jest.mock('pages/settings/customFields/components/DropdownInput', () =>
    jest.fn(() => <div>Dropdown</div>),
)
jest.mock('custom-fields/hooks/queries/useUpdateCustomFieldArchiveStatus')
jest.mock(
    'pages/settings/customFields/components/ArchiveConfirmationModal',
    () => jest.fn(() => null),
)

const DropdownInputMock = assumeMock(DropdownInput)
const useUpdateCustomFieldArchiveStatusMock = assumeMock(
    useUpdateCustomFieldArchiveStatus,
)
const ArchiveConfirmationModalMock = assumeMock(ArchiveConfirmationModal)

const updateMutateMock = jest.fn()

const defaultProps = {
    field: ticketInputFieldDefinition,
    onSubmit: jest.fn().mockResolvedValue({}),
    onClose: jest.fn(),
    objectType: OBJECT_TYPES.TICKET,
}

describe('<FieldForm/>', () => {
    beforeEach(() => {
        useUpdateCustomFieldArchiveStatusMock.mockImplementation(() => {
            return {
                mutateAsync: updateMutateMock,
            } as unknown as ReturnType<typeof useUpdateCustomFieldArchiveStatus>
        })
        useAppDispatchMock.mockClear()
        useAppDispatchMock.mockReturnValue(jest.fn())
        notifyMock.mockClear()
    })

    it('should show archiving status and disable type change on edit', () => {
        renderWithRouter(<FieldForm {...defaultProps} />)
        expect(screen.getByText('ACTIVE'))
        expect(screen.getByText(/Field type can’t be changed/))
    })

    it('should show a tooltip on hover save after doing a change on placeholder', async () => {
        renderWithRouter(<FieldForm {...defaultProps} />)

        await userEvent.type(screen.getByLabelText(/Placeholder/), 'a')
        userEvent.hover(screen.getByText(/Save changes/))
        await waitFor(() => {
            expect(screen.getByText(/The values you have changed/))
        })
    })

    it('should show a tooltip on hover save after doing a change on description', async () => {
        renderWithRouter(<FieldForm {...defaultProps} />)

        await userEvent.type(screen.getByLabelText(/Description/), 'a')
        userEvent.hover(screen.getByText(/Save changes/))
        await waitFor(() => {
            expect(screen.getByText(/The values you have changed/))
        })
    })

    it('should show a tooltip on hover save after doing a change on placeholder with saved filters text added', async () => {
        renderWithRouter(<FieldForm {...defaultProps} />)

        await userEvent.type(screen.getByLabelText(/Placeholder/), 'a')
        userEvent.hover(screen.getByText(/Save changes/))
        await waitFor(() => {
            expect(screen.getByText(/The values you have changed/))
            expect(screen.getByText(/Saved Filters/i)).toBeInTheDocument()
        })
    })

    it('should disable the save button if the label is empty', () => {
        const props = {
            ...defaultProps,
            field: { ...customFieldInputDefinition, label: '' },
        }

        renderWithRouter(<FieldForm {...props} />)

        fireEvent.click(screen.getByText(/Save changes/))

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should disable the save button if the form has dropdown field and no choices are selected', () => {
        const props = {
            ...defaultProps,
            field: {
                ...ticketDropdownFieldDefinition,
                label: 'test',
                definition: {
                    ...ticketDropdownFieldDefinition.definition,
                    input_settings: {
                        ...ticketDropdownFieldDefinition.definition
                            .input_settings,
                        choices: [],
                    },
                },
            },
        }

        renderWithRouter(<FieldForm {...props} />)

        fireEvent.click(screen.getByText(/Save changes/))

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should disable the save button if some field has called the `setCustomValidity` method', async () => {
        const text = '20-1 rpz'
        DropdownInputMock.mockImplementation(() => (
            <input
                name="meh"
                id="meh"
                value={text}
                type="text"
                onChange={() => null}
            />
        ))

        const props = {
            ...defaultProps,
            field: ticketDropdownFieldDefinition,
        }

        renderWithRouter(<FieldForm {...props} />)

        const inputEl: HTMLInputElement = screen.getByDisplayValue(text)
        inputEl.setCustomValidity('error')

        // necessary to trigger the effect on form data change
        await userEvent.type(screen.getByLabelText(/Description/), 'a')

        fireEvent.click(screen.getByText(/Save changes/))

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should call onSubmit if the form is valid and the save button is clicked', () => {
        renderWithRouter(
            <FieldForm
                {...{ ...defaultProps, field: customFieldInputDefinition }}
            />,
        )

        fireEvent.click(screen.getByText(/Save changes/))

        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
            omit(customFieldInputDefinition, ['priority']),
        )
    })

    it('should call onClose if the cancel button is clicked', () => {
        const props = {
            ...defaultProps,
            field: customFieldInputDefinition,
        }

        renderWithRouter(<FieldForm {...props} />)

        const cancelButton = screen.getByText(/Cancel/)
        cancelButton.click()

        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    it('should show three options', () => {
        renderWithRouter(<FieldForm {...defaultProps} />)

        // All three options should be visible
        for (const label of [
            'Always optional',
            'Always required',
            'Conditionally visible',
        ]) {
            const input = screen.getByLabelText(label, { selector: 'input' })
            expect(input).toBeInTheDocument()

            fireEvent.click(input)
            expect(input).toBeChecked()
        }

        // Change the value to "conditional"
        userEvent.click(
            screen.getByLabelText('Conditionally visible', {
                selector: 'input',
            }),
        )

        // Submit the form
        fireEvent.click(screen.getByText('Save changes'))

        // The submit event must contain "requirement_type=conditional"
        expect(defaultProps.onSubmit).toHaveBeenCalledTimes(1)
        expect(defaultProps.onSubmit).toHaveBeenCalledWith(
            expect.objectContaining({ requirement_type: 'conditional' }),
        )
    })

    it.each([true, false])(
        'should prompt for confirmation when closing the page with unsaved changes (%s)',
        async (error) => {
            const onSubmit = error
                ? jest.fn().mockRejectedValue('Error')
                : jest.fn().mockResolvedValue({})
            const props = {
                ...defaultProps,
                onSubmit,
                field: customFieldInputDefinition,
            }

            const { history } = renderWithRouter(<FieldForm {...props} />)

            const nameInput = screen.getByLabelText(/Name/)
            fireEvent.change(nameInput, { target: { value: 'New name' } })

            history.push('/test')
            expect(history.location.pathname).toBe('/')

            expect(props.onSubmit).not.toHaveBeenCalled()
            expect(props.onClose).not.toHaveBeenCalled()

            await screen.findByText('Save changes?')
            userEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )

            expect(props.onSubmit).toHaveBeenCalledTimes(1)
            expect(history.location.pathname).toBe('/')
        },
    )

    it('should show an error notification if the form is invalid from saving in unsaved modal', async () => {
        const { history } = renderWithRouter(<FieldForm {...defaultProps} />)

        const nameInput = screen.getByLabelText(/Name/)
        userEvent.clear(nameInput)

        history.push('/test')

        await screen.findByRole('button', { name: 'Save Changes' })
        userEvent.click(screen.getByRole('button', { name: 'Save Changes' }))

        expect(notifyMock).toHaveBeenCalledWith({
            title: 'Unable to save, please complete all required fields',
            status: NotificationStatus.Error,
        })
        expect(defaultProps.onSubmit).not.toHaveBeenCalled()
    })

    it('should not trigger a submit when pressing enter in a field', () => {
        const props = {
            ...defaultProps,
            field: customFieldInputDefinition,
        }

        renderWithRouter(<FieldForm {...props} />)

        const nameInput = screen.getByLabelText(/Name/)
        nameInput.focus()
        fireEvent.keyDown(nameInput, { key: 'Enter' })

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should prevent default on form submit', () => {
        const props = {
            ...defaultProps,
            field: customFieldInputDefinition,
        }

        renderWithRouter(<FieldForm {...props} />)

        const nameInput = screen.getByLabelText(/Name/)
        const form = nameInput.closest('form')!
        const submitEvent = createEvent.submit(form)
        fireEvent(form, submitEvent)

        expect(submitEvent.defaultPrevented).toBe(true)
    })

    it('should have an archive button calling ArchiveConfirmationModal with the right props', () => {
        renderWithRouter(<FieldForm {...defaultProps} />)

        fireEvent.click(screen.getByText(/Archive/))
        expect(ArchiveConfirmationModalMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                customFieldLabel: defaultProps.field.label,
                isOpen: true,
            }),
            {},
        )

        getLastMockCall(ArchiveConfirmationModalMock)[0].onConfirm()
        expect(updateMutateMock).toHaveBeenCalledWith(true)
    })

    it('should not show the archive button opening a modal that closes itself when calling onClose', async () => {
        renderWithRouter(<FieldForm {...defaultProps} />)

        fireEvent.click(screen.getByText(/Archive/))
        expect(ArchiveConfirmationModalMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                customFieldLabel: defaultProps.field.label,
                isOpen: true,
            }),
            {},
        )

        getLastMockCall(ArchiveConfirmationModalMock)[0].onClose()

        await waitFor(() => {
            expect(ArchiveConfirmationModalMock).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    customFieldLabel: defaultProps.field.label,
                    isOpen: false,
                }),
                {},
            )
        })
    })

    it.each(Object.values(OBJECT_TYPES))(
        'should show the correct placeholders when object_type=%s',
        (objectType) => {
            renderWithRouter(
                <FieldForm
                    {...{
                        ...defaultProps,
                        field: {
                            ...defaultProps.field,
                            object_type: objectType,
                        },
                        objectType,
                    }}
                />,
            )

            const namePlaceholder = screen
                .getByLabelText(/Name/)
                .getAttribute('placeholder')
            expect(namePlaceholder).toEqual(
                OBJECT_TYPE_SETTINGS[objectType].PLACEHOLDERS.LABEL,
            )

            const descriptionPlaceholder = screen
                .getByLabelText(/Description/)
                .getAttribute('placeholder')
            expect(descriptionPlaceholder).toEqual(
                OBJECT_TYPE_SETTINGS[objectType].PLACEHOLDERS.DESCRIPTION,
            )
        },
    )

    describe('Archived field', () => {
        it('should have an unarchive button calling update mutation', () => {
            const props = {
                ...defaultProps,
                field: archivedTicketInputFieldDefinition,
            }

            renderWithRouter(<FieldForm {...props} />)

            fireEvent.click(screen.getByText(/Unarchive/))
            expect(updateMutateMock).toHaveBeenCalledWith(false)
        })
    })

    describe('System read only fields', () => {
        it('should show a back button when the field is system read only', () => {
            const props = {
                ...defaultProps,
                field: {
                    ...aiManagedTicketInputFieldDefinition,
                    managed_type: SYSTEM_READ_ONLY_MANAGED_TYPES.CALL_STATUS,
                },
            }

            renderWithRouter(<FieldForm {...props} />)

            fireEvent.click(screen.getByText(/Return to/))
            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        })

        it('should disabled fields', () => {
            const props = {
                ...defaultProps,
                field: aiManagedTicketInputFieldDefinition,
            }

            renderWithRouter(<FieldForm {...props} />)

            expect(screen.getByLabelText(/Name/)).toBeDisabled()
            expect(screen.getByLabelText(/Description/)).toBeDisabled()
        })

        it('should pass isDisabled to DropdownInput', () => {
            const props = {
                ...defaultProps,
                field: {
                    ...ticketDropdownFieldDefinition,
                    managed_type: 'ai_intent' as CustomFieldManagedTypeProperty,
                },
            }

            renderWithRouter(<FieldForm {...props} />)
            expect(DropdownInputMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDisabled: true,
                }),
                {},
            )
        })
    })
})
