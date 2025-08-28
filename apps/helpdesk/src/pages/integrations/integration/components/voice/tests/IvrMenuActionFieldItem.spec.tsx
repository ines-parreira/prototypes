import { ComponentProps } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Form } from 'core/forms'

import { IvrMenuActionFieldItem } from '../IvrMenuActionsFieldItem'

const defaultProps = {
    name: 'branch_options',
    onRemove: jest.fn(),
    index: 0,
    isRemovable: true,
}

const defaultBranchOptions = [
    {
        input_digit: 'input_digit_3',
        branch_name: 'branch_name',
    },
]

const renderComponent = (
    props: ComponentProps<typeof IvrMenuActionFieldItem> = defaultProps,
    defaultValues = {
        branch_options: defaultBranchOptions,
    },
) => {
    return render(
        <Form defaultValues={defaultValues} onValidSubmit={jest.fn()}>
            <IvrMenuActionFieldItem {...props} />
        </Form>,
    )
}

describe('IvrMenuActionFieldItem', () => {
    it('should render with digit, branch name and remove button', () => {
        renderComponent(defaultProps)

        expect(
            screen.getByRole('button', { name: 'input_digit_3' }),
        ).toBeInTheDocument()
        expect(screen.getByDisplayValue('branch_name')).toBeInTheDocument()
        expect(screen.getByText('close')).toBeInTheDocument()
    })

    it('should call onRemove when remove button is clicked', async () => {
        const user = userEvent.setup()
        renderComponent(defaultProps)

        await act(async () => {
            await user.click(screen.getByText('close'))
        })

        await waitFor(() => {
            expect(defaultProps.onRemove).toHaveBeenCalled()
        })
    })

    it('should not render remove button if isRemovable is false', () => {
        renderComponent({ ...defaultProps, isRemovable: false })

        expect(screen.queryByText('close')).not.toBeInTheDocument()
    })
})
