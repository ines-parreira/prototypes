import { ComponentProps } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mockBranchOptions } from '@gorgias/helpdesk-mocks'

import { Form } from 'core/forms'
import { FlowProvider } from 'core/ui/flows'

import { IvrMenuActionsFieldArray } from './IvrMenuActionsFieldArray'

const defaultProps = {
    name: 'someFieldArray',
    onAddOption: jest.fn(),
    onRemoveOption: jest.fn(),
    branchNextId: 'end_call_node',
}

const branchOptions = [
    mockBranchOptions({ input_digit: '1', branch_name: 'branch_name_1' }),
    mockBranchOptions({ input_digit: '2', branch_name: 'branch_name_2' }),
    mockBranchOptions({ input_digit: '3', branch_name: 'branch_name_3' }),
]
const defaultValues = {
    someFieldArray: branchOptions,
}

const renderComponent = (
    props: ComponentProps<typeof IvrMenuActionsFieldArray> = defaultProps,
    formDefaultValues = defaultValues,
) => {
    return render(
        <FlowProvider>
            <Form defaultValues={formDefaultValues} onValidSubmit={jest.fn()}>
                <IvrMenuActionsFieldArray {...props} />
            </Form>
        </FlowProvider>,
    )
}

describe('IvrMenuActionsFieldArray', () => {
    it('should render with add option button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Add option' }),
        ).toBeInTheDocument()
    })

    it('should call onAddOption when add button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent()

        const addButton = screen.getByRole('button', { name: 'Add option' })

        expect(addButton).toBeInTheDocument()

        await act(async () => {
            await user.click(addButton)
        })

        await waitFor(() => {
            expect(defaultProps.onAddOption).toHaveBeenCalledWith(
                expect.objectContaining({
                    input_digit: '4',
                    branch_name: '',
                    next_step_id: defaultProps.branchNextId,
                }),
                3,
            )
        })
    })

    it('should create new option with the next available digit', async () => {
        const user = userEvent.setup()
        const branchOptions = [
            mockBranchOptions({
                input_digit: '1',
                branch_name: 'branch_name_1',
            }),
            mockBranchOptions({
                input_digit: '4',
                branch_name: 'branch_name_4',
            }),
            mockBranchOptions({
                input_digit: '5',
                branch_name: 'branch_name_5',
            }),
        ]

        renderComponent(defaultProps, {
            someFieldArray: branchOptions,
        })

        const addButton = screen.getByRole('button', { name: 'Add option' })

        await act(async () => {
            await user.click(addButton)
        })

        await waitFor(() => {
            expect(defaultProps.onAddOption).toHaveBeenCalledWith(
                expect.objectContaining({
                    input_digit: '2',
                }),
                1,
            )
        })

        await act(async () => {
            await user.click(addButton)
        })

        await waitFor(() => {
            expect(defaultProps.onAddOption).toHaveBeenCalledWith(
                expect.objectContaining({
                    input_digit: '3',
                }),
                2,
            )
        })

        await act(async () => {
            await user.click(addButton)
        })

        await waitFor(() => {
            expect(defaultProps.onAddOption).toHaveBeenCalledWith(
                expect.objectContaining({
                    input_digit: '6',
                }),
                5,
            )
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
            expect(defaultProps.onRemoveOption).toHaveBeenCalled()
        })
    })

    it('should not render any remove button if there are <= 2 options', () => {
        renderComponent(defaultProps, {
            someFieldArray: branchOptions.slice(0, 2),
        })

        expect(screen.queryByText('close')).not.toBeInTheDocument()
    })
})
