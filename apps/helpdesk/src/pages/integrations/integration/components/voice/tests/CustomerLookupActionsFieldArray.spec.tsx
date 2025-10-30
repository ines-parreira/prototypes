import { ComponentProps } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import {
    mockBooleanDataTypeDefinition,
    mockBooleanDropdownInputSettings,
    mockCustomerCustomField,
    mockCustomerFieldBranchOption,
    mockDropdownInputSettingsSettings,
    mockTextDataTypeDefinition,
} from '@gorgias/helpdesk-mocks'
import { CustomField } from '@gorgias/helpdesk-types'

import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'

import { CustomerLookupActionsFieldArray } from '../CustomerLookupActionsFieldArray'

const useDeleteNodeMock = {
    removeUnlinkedSteps: jest.fn(),
}
jest.mock(
    'pages/integrations/integration/components/voice/flows/utils/useDeleteNode',
    () => ({
        useDeleteNode: () => useDeleteNodeMock,
    }),
)

const defaultProps = {
    stepName: 'steps.customerLookup',
    onAddOption: jest.fn(),
    onRemoveOption: jest.fn(),
    branchNextId: 'end_call_node',
    selectedCustomField: mockCustomerCustomField({
        id: 1,
        definition: mockTextDataTypeDefinition({
            input_settings: mockDropdownInputSettingsSettings({
                choices: ['vip', 'problematic', 'something else', 'option4'],
            }),
        }),
    }) as unknown as CustomField,
}

const branchOptions = [
    mockCustomerFieldBranchOption({
        field_value: 'vip',
    }),
    mockCustomerFieldBranchOption({
        field_value: 'problematic',
    }),
    mockCustomerFieldBranchOption({
        field_value: 'something else',
    }),
]

const defaultValues = {
    steps: {
        customerLookup: {
            custom_field_id: 1,
            branch_options: branchOptions,
        },
    },
}

const renderComponent = (
    props: ComponentProps<
        typeof CustomerLookupActionsFieldArray
    > = defaultProps,
    formDefaultValues = defaultValues,
) => {
    return render(
        <FlowProvider>
            <Form defaultValues={formDefaultValues} onValidSubmit={jest.fn()}>
                <CustomerLookupActionsFieldArray {...props} />
            </Form>
        </FlowProvider>,
    )
}

describe('CustomerLookupActionsFieldArray', () => {
    it('should render with add option button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /Add option/ }),
        ).toBeInTheDocument()
    })

    it('should render branch options', () => {
        renderComponent()

        const selectFields = screen.getAllByRole('button', {
            name: /arrow-chevron-down/,
        })
        expect(selectFields.length).toBe(branchOptions.length + 1)

        expect(screen.getAllByPlaceholderText('Branch name').length).toBe(
            branchOptions.length + 1,
        )
    })

    it('should call onAddOption when add button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const addButton = screen.getByRole('button', { name: /Add option/ })

        expect(addButton).toBeInTheDocument()

        await act(async () => {
            await user.click(addButton)
        })

        await waitFor(() => {
            expect(defaultProps.onAddOption).toHaveBeenCalled()
        })
    })

    it('should call onRemoveOption when remove button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const removeButtons = screen.getAllByText('close')

        expect(removeButtons.length).toBeGreaterThanOrEqual(
            branchOptions.length,
        )

        await act(async () => {
            await user.click(removeButtons[0])
        })

        await waitFor(() => {
            expect(useDeleteNodeMock.removeUnlinkedSteps).toHaveBeenCalled()
        })
    })

    it('should render remove buttons for all branch options except default', () => {
        renderComponent()

        const removeButtons = screen.getAllByText('close')
        expect(removeButtons).toHaveLength(branchOptions.length)
    })

    it('should handle empty branch options array', () => {
        renderComponent(defaultProps, {
            steps: {
                customerLookup: {
                    branch_options: [],
                    custom_field_id: 1,
                },
            },
        })

        expect(
            screen.getAllByDisplayValue('Other').length,
        ).toBeGreaterThanOrEqual(1)
        expect(screen.queryByText('close')).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Add option/ }),
        ).toBeInTheDocument()
    })

    it('should render the component when the input settings is dropdown', () => {
        const selectedCustomField = mockCustomerCustomField({
            id: 1,
            definition: mockTextDataTypeDefinition({
                input_settings: mockDropdownInputSettingsSettings({
                    choices: ['option1', 'option2'],
                }),
            }),
        }) as unknown as CustomField

        renderComponent(
            { ...defaultProps, selectedCustomField },
            {
                steps: {
                    customerLookup: {
                        custom_field_id: 1,
                        branch_options: [],
                    },
                },
            },
        )
        expect(screen.getByText('Other')).toBeInTheDocument()
        expect(screen.getByText('Add option')).toBeInTheDocument()
    })

    it('should render the component when the input settings is boolean dropdown', () => {
        const selectedCustomField = mockCustomerCustomField({
            id: 1,
            definition: mockBooleanDataTypeDefinition({
                input_settings: mockBooleanDropdownInputSettings({
                    choices: [true, false],
                }),
            }),
        }) as unknown as CustomField

        renderComponent(
            { ...defaultProps, selectedCustomField },
            {
                steps: {
                    customerLookup: {
                        custom_field_id: 1,
                        branch_options: [],
                    },
                },
            },
        )
        expect(screen.getByText('Other')).toBeInTheDocument()
        expect(screen.getByText('Add option')).toBeInTheDocument()
    })

    it('should not render the component when the customer field is not defined', () => {
        renderComponent(
            { ...defaultProps, selectedCustomField: undefined },
            {
                steps: {
                    customerLookup: {
                        custom_field_id: 1,
                        branch_options: [],
                    },
                },
            },
        )
        expect(screen.queryByText('Other')).not.toBeInTheDocument()
        expect(screen.queryByText('Add option')).not.toBeInTheDocument()
    })

    it('shoud not render the "add option" button when the form already has the max number of options', () => {
        renderComponent(defaultProps, {
            steps: {
                customerLookup: {
                    custom_field_id: 1,
                    branch_options: [
                        ...branchOptions,
                        mockCustomerFieldBranchOption({
                            field_value: 'option4',
                        }),
                    ],
                },
            },
        })
        expect(screen.queryByText('Add option')).not.toBeInTheDocument()
    })
})
