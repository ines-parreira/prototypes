import { ComponentProps } from 'react'

import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { Form } from 'core/forms'

import { CustomerLookupActionsFieldItem } from '../CustomerLookupActionsFieldItem'

const defaultProps = {
    stepName: 'stepName',
    onRemove: jest.fn(),
    isRemovable: true,
    branchNameFieldName: 'stepName.branch_options.0.branch_name',
    fieldValueName: 'stepName.branch_options.0.field_value',
}

const defaultValues = {
    stepName: {
        branch_options: [
            {
                field_value: 'found',
                branch_name: 'Customer found',
            },
        ],
    },
}

const renderComponent = (
    props: ComponentProps<typeof CustomerLookupActionsFieldItem> = defaultProps,
    formDefaultValues = defaultValues,
) => {
    return render(
        <Form defaultValues={formDefaultValues} onValidSubmit={jest.fn()}>
            <CustomerLookupActionsFieldItem {...props} />
        </Form>,
    )
}

describe('CustomerLookupActionsFieldItem', () => {
    it('should render with field value select, branch name input and remove button', () => {
        renderComponent(defaultProps)

        expect(screen.getByDisplayValue('Customer found')).toBeInTheDocument()
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

    it('should render field value select when fieldValueName is provided', () => {
        renderComponent(defaultProps)

        const selectField = screen.getByRole('button', {
            name: /arrow-chevron-down/,
        })
        expect(selectField).toBeInTheDocument()
    })

    it('should render disabled field value select when fieldValueName is not provided', () => {
        renderComponent({ ...defaultProps, fieldValueName: undefined })

        const selectField = screen.getByRole('button', {
            name: /arrow-chevron-down/,
        })
        expect(selectField).toBeInTheDocument()
        expect(selectField).toBeDisabled()
        expect(screen.getByText('Other')).toBeInTheDocument()
    })

    it('should render branch name input with correct placeholder', () => {
        renderComponent(defaultProps)

        const branchNameInput = screen.getByPlaceholderText('Branch name')
        expect(branchNameInput).toBeInTheDocument()
        expect(branchNameInput).toHaveValue('Customer found')
    })

    it('should render Other option in select field when fieldValueName is falsy', () => {
        renderComponent({ ...defaultProps, fieldValueName: undefined })

        expect(screen.getByText('Other')).toBeInTheDocument()
    })

    it('should render all options in select field', () => {
        renderComponent(
            { ...defaultProps, fieldValueOptions: ['option1', 'option2'] },
            {
                stepName: {
                    branch_options: [
                        { field_value: 'option1', branch_name: '' },
                    ],
                },
            },
        )

        expect(screen.getByText('option1')).toBeInTheDocument()
        expect(screen.getByText('option2')).toBeInTheDocument()
    })

    it('should render the correct labels for boolean field values', () => {
        renderComponent({ ...defaultProps, fieldValueOptions: [true, false] })

        expect(screen.getByText('Yes')).toBeInTheDocument()
        expect(screen.getByText('No')).toBeInTheDocument()
    })
})
