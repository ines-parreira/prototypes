import type React from 'react'

import { assumeMock, getLastMockCall } from '@repo/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Link } from 'react-router-dom'

import { RequirementType } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { useUpdateCustomFieldDefinition } from 'custom-fields/hooks/queries/useUpdateCustomFieldDefinition'
import type { CustomField } from 'custom-fields/types'
import { CUSTOM_FIELD_ROUTES } from 'routes/constants'

import ConfirmCustomFieldRequirementTypeChangeModal from '../ConfirmCustomFieldRequirementTypeChangeModal'

jest.mock('custom-fields/hooks/queries/useUpdateCustomFieldDefinition')

const mockUpdateCustomFieldDefinition = assumeMock(
    useUpdateCustomFieldDefinition,
)

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            Link: jest.fn(
                ({ children }: { children: React.ReactNode }) => children,
            ),
        }) as Record<string, unknown>,
)
const mockedLink = assumeMock(Link)

describe('ConfirmCustomFieldRequirementTypeChangeModal', () => {
    const defaultProps = {
        isOpen: true,
        onCancel: jest.fn(),
        onConfirmationSuccess: jest.fn(),
    }

    const mockCustomField: CustomField = {
        id: 123,
        object_type: OBJECT_TYPES.TICKET,
        definition: {},
        label: 'Test Field',
        managed_type: null,
        requirement_type: RequirementType.Required,
        required: true,
    } as any

    beforeEach(() => {
        mockUpdateCustomFieldDefinition.mockReturnValue({
            mutateAsync: jest.fn().mockResolvedValue({}),
            isLoading: false,
        } as any)
    })

    it('displays correct text for required ticket field', () => {
        render(
            <ConfirmCustomFieldRequirementTypeChangeModal
                {...defaultProps}
                customField={mockCustomField}
            />,
        )

        expect(
            screen.getByText(
                (__content, element) =>
                    element?.textContent ===
                    'This field is currently set to required. Changing to conditional visibility will override any current behaviors. To modify conditional visibility options, visit Ticket Field Settings.',
            ),
        ).toBeInTheDocument()
    })

    it.each([OBJECT_TYPES.TICKET, OBJECT_TYPES.CUSTOMER])(
        'displays correct link based on the object type',
        (objectType) => {
            render(
                <ConfirmCustomFieldRequirementTypeChangeModal
                    {...defaultProps}
                    customField={{
                        ...mockCustomField,
                        object_type: objectType,
                    }}
                />,
            )

            const button = screen.getByRole('button', {
                name: `See ${objectType} Field`,
            })
            expect(button).toBeInTheDocument()

            expect(getLastMockCall(mockedLink)[0]?.to).toEqual(
                `/app/settings/${CUSTOM_FIELD_ROUTES[objectType]}/${mockCustomField.id}/edit`,
            )
        },
    )

    it('displays correct text for always visible customer field', () => {
        const visibleField = {
            ...mockCustomField,
            requirement_type: RequirementType.Visible,
            required: false,
            object_type: OBJECT_TYPES.CUSTOMER,
        }

        render(
            <ConfirmCustomFieldRequirementTypeChangeModal
                {...defaultProps}
                customField={visibleField}
            />,
        )

        expect(
            screen.getByText(
                (__content, element) =>
                    element?.textContent ===
                    'This field is currently set to always visible. Changing to conditional visibility will override any current behaviors. To modify conditional visibility options, visit Customer Field Settings.',
            ),
        ).toBeInTheDocument()
    })

    it('handles confirmation flow correctly', async () => {
        const mutateAsync = jest.fn().mockResolvedValue({})
        mockUpdateCustomFieldDefinition.mockReturnValue({
            mutateAsync,
            isLoading: false,
        } as any)

        render(
            <ConfirmCustomFieldRequirementTypeChangeModal
                {...defaultProps}
                customField={mockCustomField}
            />,
        )

        const confirmButton = screen.getByRole('button', { name: 'Confirm' })
        fireEvent.click(confirmButton)

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                id: mockCustomField.id,
                data: {
                    object_type: mockCustomField.object_type,
                    definition: mockCustomField.definition,
                    label: mockCustomField.label,
                    managed_type: mockCustomField.managed_type,
                    required: false,
                    requirement_type: RequirementType.Conditional,
                },
            })
            expect(defaultProps.onConfirmationSuccess).toHaveBeenCalled()
        })
    })

    it('disables all buttons and removes the link on confirmation in progress', async () => {
        const mutateAsync = jest.fn().mockResolvedValue({})
        mockUpdateCustomFieldDefinition.mockReturnValue({
            mutateAsync,
            isLoading: true,
        } as any)

        render(
            <ConfirmCustomFieldRequirementTypeChangeModal
                {...defaultProps}
                customField={mockCustomField}
            />,
        )
        const confirmButton = screen.getByRole('button', { name: /Confirm/ })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /See Ticket Field/ }),
            ).toBeAriaDisabled()
            expect(confirmButton).toBeAriaDisabled()
            expect(
                screen.getByRole('button', { name: 'Cancel' }),
            ).toBeAriaDisabled()
        })
    })
})
