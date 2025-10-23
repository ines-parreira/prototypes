import { ComponentProps } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { mockCustomerFieldBranchOption } from '@gorgias/helpdesk-mocks'

import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'

import { CustomerLookupActionsFieldArray } from '../CustomerLookupActionsFieldArray'

const defaultProps = {
    stepName: 'steps.customerLookup',
    onAddOption: jest.fn(),
    onRemoveOption: jest.fn(),
    branchNextId: 'end_call_node',
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
            expect(defaultProps.onRemoveOption).toHaveBeenCalledWith(0)
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
})
