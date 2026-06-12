import { useFlag } from '@repo/feature-flags'
import { reportError } from '@repo/logging'
import { assumeMock, getLastMockCall, render, userEvent } from '@repo/testing'
import { createEvent, fireEvent, screen, waitFor } from '@testing-library/react'
import { Link } from 'react-router-dom'
import { omit } from '@gorgias/toolkit'

import { toast } from '@gorgias/axiom'
import type { ManagedTicketFieldType } from '@gorgias/helpdesk-types'

import {
    OBJECT_TYPE_SETTINGS,
    OBJECT_TYPES,
    SYSTEM_READ_ONLY_MANAGED_TYPES,
} from 'custom-fields/constants'
import { useUpdateAiAutofill } from 'custom-fields/hooks/queries/useUpdateAiAutofill'
import { useUpdateCustomFieldArchiveStatus } from 'custom-fields/hooks/queries/useUpdateCustomFieldArchiveStatus'
import {
    aiManagedTicketInputFieldDefinition,
    archivedTicketInputFieldDefinition,
    customFieldInputDefinition,
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
} from 'fixtures/customField'
import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import { useGetAccountConfiguration } from 'models/aiAgent/queries'
import { AIAutofill } from 'pages/settings/customFields/components/AIAutofill'
import { ArchiveConfirmationModal } from 'pages/settings/customFields/components/ArchiveConfirmationModal'
import { DefaultExportDropdownInput as DropdownInput } from 'pages/settings/customFields/components/DropdownInput'
import { FieldForm } from 'pages/settings/customFields/components/FieldForm'

jest.mock('hooks/useAppDispatch', () => ({ useAppDispatch: jest.fn() }))
const useAppDispatchMock = assumeMock(useAppDispatch)
jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)
jest.mock('@repo/logging')
const reportErrorMock = assumeMock(reportError)
jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)
jest.mock('models/aiAgent/queries')
const useGetAccountConfigurationMock = assumeMock(useGetAccountConfiguration)
jest.mock('custom-fields/hooks/queries/useUpdateAiAutofill')
const useUpdateAiAutofillMock = assumeMock(useUpdateAiAutofill)
jest.mock('pages/settings/customFields/components/AIAutofill', () => ({
    AIAutofill: jest.fn(() => <div>AIAutofill</div>),
}))
jest.mock('pages/settings/customFields/components/DropdownInput', () => ({
    DefaultExportDropdownInput: jest.fn(() => <div>Dropdown</div>),
}))
jest.mock('custom-fields/hooks/queries/useUpdateCustomFieldArchiveStatus')
jest.mock(
    'pages/settings/customFields/components/ArchiveConfirmationModal',
    () => ({ ArchiveConfirmationModal: jest.fn(() => null) }),
)
const DropdownInputMock = assumeMock(DropdownInput)
const useUpdateCustomFieldArchiveStatusMock = assumeMock(
    useUpdateCustomFieldArchiveStatus,
)
const ArchiveConfirmationModalMock = assumeMock(ArchiveConfirmationModal)
const AIAutofillMock = assumeMock(AIAutofill)
const updateMutateMock = jest.fn()
const updateAiAutofillMock = jest.fn()
const renderWithNavigation = (ui: React.ReactElement) =>
    render(
        <>
            <Link to="/test">Navigate away</Link>
            {ui}
        </>,
    )
const defaultProps = {
    field: ticketInputFieldDefinition,
    onSubmit: jest.fn().mockResolvedValue({ data: ticketInputFieldDefinition }),
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
        useUpdateAiAutofillMock.mockReturnValue({
            mutateAsync: updateAiAutofillMock,
        } as unknown as ReturnType<typeof useUpdateAiAutofill>)
        useFlagMock.mockReturnValue(false)
        useGetAccountConfigurationMock.mockReturnValue({
            data: {
                data: {
                    accountConfiguration: {
                        customFieldIds: [],
                    },
                },
            },
        } as any)
        useAppSelectorMock.mockReturnValue({
            get: jest.fn((key: string) => {
                if (key === 'domain') return 'test-account'
                if (key === 'id') return 1
                return null
            }),
        } as any)
        useAppDispatchMock.mockClear()
        useAppDispatchMock.mockReturnValue(jest.fn())
        updateAiAutofillMock.mockClear()
        updateAiAutofillMock.mockResolvedValue({})
        reportErrorMock.mockClear()
    })
    afterEach(() => {
        toast.dismiss()
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
    it('should disable the save button if the label is empty', () => {
        const props = {
            ...defaultProps,
            field: { ...customFieldInputDefinition, label: '' },
        }
        render(<FieldForm {...props} />)
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
    it('should show three options', () => {
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
            renderWithNavigation(<FieldForm {...props} />)
            const nameInput = screen.getByLabelText(/Name/)
            fireEvent.change(nameInput, { target: { value: 'New name' } })
            await userEvent.click(
                screen.getByRole('link', { name: 'Navigate away' }),
            )
            expect(props.onSubmit).not.toHaveBeenCalled()
            expect(props.onClose).not.toHaveBeenCalled()
            await screen.findByText('Save changes?')
            await userEvent.click(
                screen.getByRole('button', { name: 'Save Changes' }),
            )
            expect(props.onSubmit).toHaveBeenCalledTimes(1)
        },
    )
    it('should show an error notification if the form is invalid from saving in unsaved modal', async () => {
        renderWithNavigation(<FieldForm {...defaultProps} />)
        const nameInput = screen.getByLabelText(/Name/)
        await userEvent.clear(nameInput)
        await userEvent.click(
            screen.getByRole('link', { name: 'Navigate away' }),
        )
        await screen.findByRole('button', { name: 'Save Changes' })
        await userEvent.click(
            screen.getByRole('button', { name: 'Save Changes' }),
        )
        await waitFor(() => {
            expect(
                screen.getByRole('status', {
                    name: 'Unable to save, please complete all required fields',
                }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
        expect(defaultProps.onSubmit).not.toHaveBeenCalled()
    })
    it('should not trigger a submit when pressing enter in a field', () => {
        const props = {
            ...defaultProps,
            field: customFieldInputDefinition,
        }
        render(<FieldForm {...props} />)
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
        render(<FieldForm {...props} />)
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
    it('should not show the archive button opening a modal that closes itself when calling onClose', async () => {
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
    describe('System read only fields', () => {
        it('should show a back button when the field is system read only', () => {
            const props = {
                ...defaultProps,
                field: {
                    ...aiManagedTicketInputFieldDefinition,
                    managed_type: SYSTEM_READ_ONLY_MANAGED_TYPES.CALL_STATUS,
                },
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
                    managed_type: 'ai_intent' as ManagedTicketFieldType,
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
    describe('AI Autofill', () => {
        it('should show AIAutofill when FF enabled and hide when disabled, conditional, or managed', () => {
            // Test 1: Should NOT show when feature flag is disabled
            useFlagMock.mockReturnValue(false)
            render(<FieldForm {...defaultProps} />)
            expect(AIAutofillMock).not.toHaveBeenCalled()
            // Test 2: Should show when feature flag is enabled
            AIAutofillMock.mockClear()
            useFlagMock.mockReturnValue(true)
            render(<FieldForm {...defaultProps} />)
            expect(AIAutofillMock).toHaveBeenCalled()
            // Test 3: Should NOT show when requirement_type is conditional
            AIAutofillMock.mockClear()
            const conditionalField = {
                ...defaultProps,
                field: {
                    ...ticketInputFieldDefinition,
                    requirement_type: 'conditional' as const,
                },
            }
            render(<FieldForm {...conditionalField} />)
            expect(AIAutofillMock).not.toHaveBeenCalled()
            // Test 4: Should NOT show when field has managed_type
            AIAutofillMock.mockClear()
            const managedField = {
                ...defaultProps,
                field: aiManagedTicketInputFieldDefinition,
            }
            render(<FieldForm {...managedField} />)
            expect(AIAutofillMock).not.toHaveBeenCalled()
        })
        it('should initialize checkbox state based on account configuration customFieldIds', () => {
            useFlagMock.mockReturnValue(true)
            // Field ID is in customFieldIds - should be enabled
            useGetAccountConfigurationMock.mockReturnValue({
                data: {
                    data: {
                        accountConfiguration: {
                            customFieldIds: [ticketInputFieldDefinition.id],
                        },
                    },
                },
            } as any)
            render(<FieldForm {...defaultProps} />)
            // AIAutofill should be called with value=false initially, then updated via useEffect
            expect(AIAutofillMock).toHaveBeenCalled()
            // The component will update the state via useEffect based on customFieldIds
        })
        it('should pass correct props to AIAutofill component and mark form as dirty when changed', () => {
            useFlagMock.mockReturnValue(true)
            // Capture the onChange callback
            let capturedOnChange: ((value: boolean) => void) | null = null
            AIAutofillMock.mockImplementation(({ value, onChange }) => {
                capturedOnChange = onChange
                return (
                    <div data-testid="ai-autofill-mock">
                        Value: {value.toString()}
                    </div>
                )
            })
            render(<FieldForm {...defaultProps} />)
            // Verify AIAutofill was rendered with initial value false
            expect(screen.getByTestId('ai-autofill-mock')).toHaveTextContent(
                'Value: false',
            )
            expect(AIAutofillMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: false,
                    onChange: expect.any(Function),
                }),
                {},
            )
            // Simulate changing the value
            expect(capturedOnChange).toBeDefined()
            capturedOnChange!(true)
            // Save button should still be enabled (form is valid and dirty)
            const saveButton = screen.getByText(/Save changes/)
            expect(saveButton).toBeEnabled()
        })
        it('should call updateAiAutofill when saving field with AI autofill enabled', async () => {
            useFlagMock.mockReturnValue(true)
            const dispatchMock = jest.fn()
            useAppDispatchMock.mockReturnValue(dispatchMock)
            render(<FieldForm {...defaultProps} />)
            // Make a change to make form dirty
            await userEvent.type(screen.getByLabelText(/Placeholder/), 'test')
            // Click save
            await userEvent.click(screen.getByText(/Save changes/))
            await waitFor(() => {
                expect(defaultProps.onSubmit).toHaveBeenCalled()
                expect(updateAiAutofillMock).toHaveBeenCalledWith({
                    customFieldId: ticketInputFieldDefinition.id,
                    enabled: false,
                })
            })
        })
        it('should handle updateAiAutofill errors and show notification', async () => {
            useFlagMock.mockReturnValue(true)
            const dispatchMock = jest.fn()
            useAppDispatchMock.mockReturnValue(dispatchMock)
            // Mock updateAiAutofill to fail
            const aiError = new Error('AI Autofill update failed')
            updateAiAutofillMock.mockRejectedValueOnce(aiError)
            render(<FieldForm {...defaultProps} />)
            // Make a change to make form dirty
            await userEvent.type(screen.getByLabelText(/Placeholder/), 'test')
            // Click save
            await userEvent.click(screen.getByText(/Save changes/))
            await waitFor(() => {
                expect(reportErrorMock).toHaveBeenCalledWith(
                    aiError,
                    expect.objectContaining({
                        tags: { team: 'automate-ai-agent' },
                        extra: expect.objectContaining({
                            context:
                                'Error updating AI Autofill settings for custom field',
                            accountId: 1,
                            customFieldId: ticketInputFieldDefinition.id,
                            enabled: false,
                        }),
                    }),
                )
            })
            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Failed to update AI Autofill settings',
                    }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })
    describe('Error handling', () => {
        it('should handle onSubmit errors and keep form dirty', async () => {
            const consoleErrorSpy = jest
                .spyOn(console, 'error')
                .mockImplementation()
            const errorProps = {
                ...defaultProps,
                onSubmit: jest
                    .fn()
                    .mockRejectedValue(new Error('Submit failed')),
            }
            render(<FieldForm {...errorProps} />)
            // Make a change to make form dirty
            await userEvent.type(screen.getByLabelText(/Placeholder/), 'test')
            // Click save
            await userEvent.click(screen.getByText(/Save changes/))
            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Custom field error',
                    expect.any(Error),
                )
                // Form should remain open since save returned false
                expect(defaultProps.onClose).not.toHaveBeenCalled()
            })
            consoleErrorSpy.mockRestore()
        })
    })
})
