import React from 'react'

import {
    createEvent,
    fireEvent,
    render,
    screen,
    waitFor,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockFlags } from 'jest-launchdarkly-mock'
import { omit } from 'lodash'

import { FeatureFlagKey } from 'config/featureFlags'
import { OBJECT_TYPE_SETTINGS, OBJECT_TYPES } from 'custom-fields/constants'
import { useUpdateCustomFieldArchiveStatus } from 'custom-fields/hooks/queries/useUpdateCustomFieldArchiveStatus'
import {
    aiManagedTicketInputFieldDefinition,
    archivedTicketInputFieldDefinition,
    customFieldInputDefinition,
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import ArchiveConfirmationModal from 'pages/settings/customFields/components/ArchiveConfirmationModal'
import DropdownInput from 'pages/settings/customFields/components/DropdownInput'
import FieldForm from 'pages/settings/customFields/components/FieldForm'
import { assumeMock, getLastMockCall, renderWithRouter } from 'utils/testing'

jest.mock('pages/settings/customFields/components/DropdownInput', () =>
    jest.fn(() => <div>Dropdown</div>),
)
jest.mock('custom-fields/hooks/queries/useUpdateCustomFieldArchiveStatus')
jest.mock(
    'pages/settings/customFields/components/ArchiveConfirmationModal',
    () => jest.fn(() => null),
)
jest.mock('pages/common/components/UnsavedChangesPrompt', () =>
    jest.fn(() => null),
)

const DropdownInputMock = assumeMock(DropdownInput)
const useUpdateCustomFieldArchiveStatusMock = assumeMock(
    useUpdateCustomFieldArchiveStatus,
)
const ArchiveConfirmationModalMock = assumeMock(ArchiveConfirmationModal)
const mockedUnsavedChangesPrompt = assumeMock(UnsavedChangesPrompt)

const updateMutateMock = jest.fn()

const defaultProps = {
    field: ticketInputFieldDefinition,
    onSubmit: jest.fn(),
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
        mockFlags({
            [FeatureFlagKey.TicketConditionalFields]: false,
        })
    })

    it('should show archiving status and disable type change on edit', () => {
        render(<FieldForm {...defaultProps} />)
        expect(screen.getByText('ACTIVE'))
        expect(screen.getByText(/Field type can’t be changed/))
    })

    it('should show a tooltip on hover save after doing a change on placeholder', async () => {
        render(<FieldForm {...defaultProps} />)

        await userEvent.type(screen.getByLabelText(/Placeholder/), 'a')
        userEvent.hover(screen.getByText(/Save changes/))
        await waitFor(() => {
            expect(screen.getByText(/The values you have changed/))
        })
    })

    it('should show a tooltip on hover save after doing a change on description', async () => {
        render(<FieldForm {...defaultProps} />)

        await userEvent.type(screen.getByLabelText(/Description/), 'a')
        userEvent.hover(screen.getByText(/Save changes/))
        await waitFor(() => {
            expect(screen.getByText(/The values you have changed/))
        })
    })

    it('should show a tooltip on hover save after doing a change on placeholder with saved filters text added', async () => {
        render(<FieldForm {...defaultProps} />)

        await userEvent.type(screen.getByLabelText(/Placeholder/), 'a')
        userEvent.hover(screen.getByText(/Save changes/))
        await waitFor(() => {
            expect(screen.getByText(/The values you have changed/))
            expect(screen.getByText(/Saved Filters/i)).toBeInTheDocument()
        })
    })

    it('should disable the save button if the form is not valid', () => {
        const props = {
            ...defaultProps,
            field: { ...customFieldInputDefinition, label: '' },
        }

        render(<FieldForm {...props} />)

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

        render(<FieldForm {...props} />)

        const inputEl: HTMLInputElement = screen.getByDisplayValue(text)
        inputEl.setCustomValidity('error')

        // necessary to trigger the effect on form data change
        await userEvent.type(screen.getByLabelText(/Description/), 'a')

        fireEvent.click(screen.getByText(/Save changes/))

        expect(props.onSubmit).not.toHaveBeenCalled()
    })

    it('should call onSubmit if the form is valid and the save button is clicked', () => {
        render(
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

        render(<FieldForm {...props} />)

        const cancelButton = screen.getByText(/Cancel/)
        cancelButton.click()

        expect(props.onClose).toHaveBeenCalledTimes(1)
    })

    it('should change checkbox required value of is clicked', async () => {
        const props = {
            ...defaultProps,
            field: customFieldInputDefinition,
        }

        render(<FieldForm {...props} />)

        await userEvent.type(
            screen.getByLabelText(/Required to close ticket/),
            'checkbox',
        )
        userEvent.click(screen.getByLabelText(/Required to close ticket/))
        await waitFor(() => {
            expect(screen.getByLabelText(/Required to close ticket/))
                .toBeChecked
        })
    })

    it('should show three options instead of a checkbox when fields conditions are enabled', () => {
        mockFlags({
            [FeatureFlagKey.TicketConditionalFields]: true,
        })

        render(<FieldForm {...defaultProps} />)

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

    it('should prompt for confirmation when closing the page with unsaved changes', () => {
        const props = {
            ...defaultProps,
            field: customFieldInputDefinition,
        }

        renderWithRouter(<FieldForm {...props} />)

        const nameInput = screen.getByLabelText(/Name/)
        fireEvent.change(nameInput, { target: { value: 'New name' } })
        expect(mockedUnsavedChangesPrompt).toHaveBeenCalledTimes(1)
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
        render(<FieldForm {...defaultProps} />)

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

    it('should not show the archive button opening a modal that closes itself when calling onClose', () => {
        render(<FieldForm {...defaultProps} />)

        fireEvent.click(screen.getByText(/Archive/))
        expect(ArchiveConfirmationModalMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                customFieldLabel: defaultProps.field.label,
                isOpen: true,
            }),
            {},
        )

        getLastMockCall(ArchiveConfirmationModalMock)[0].onClose()
        expect(ArchiveConfirmationModalMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                customFieldLabel: defaultProps.field.label,
                isOpen: false,
            }),
            {},
        )
    })

    it.each(Object.values(OBJECT_TYPES))(
        'should show the correct placeholders when object_type=%s',
        (objectType) => {
            render(
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

            render(<FieldForm {...props} />)

            fireEvent.click(screen.getByText(/Unarchive/))
            expect(updateMutateMock).toHaveBeenCalledWith(false)
        })
    })

    describe('AI managed field', () => {
        it('should show a back button when the field is ai managed', () => {
            const props = {
                ...defaultProps,
                field: aiManagedTicketInputFieldDefinition,
            }

            render(<FieldForm {...props} />)

            fireEvent.click(screen.getByText(/Return to/))
            expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
        })

        it('should disabled fields', () => {
            const props = {
                ...defaultProps,
                field: aiManagedTicketInputFieldDefinition,
            }

            render(<FieldForm {...props} />)

            expect(screen.getByLabelText(/Name/)).toBeDisabled()
            expect(screen.getByLabelText(/Description/)).toBeDisabled()
        })

        it('should pass isDisabled to DropdownInput', () => {
            const props = {
                ...defaultProps,
                field: {
                    ...ticketDropdownFieldDefinition,
                    managed_type: 'ai_intent',
                },
            }

            render(<FieldForm {...props} />)
            expect(DropdownInputMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    isDisabled: true,
                }),
                {},
            )
        })
    })
})
