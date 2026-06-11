import React from 'react'

import { Form } from '@repo/forms'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ExpressionOperator } from '@gorgias/helpdesk-types'

import {
    ticketDropdownFieldDefinition,
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
} from 'fixtures/customField'

import { ExpressionRow } from '../ExpressionRow'

const customFieldDefinitions = [
    ticketInputFieldDefinition,
    ticketNumberFieldDefinition,
    ticketDropdownFieldDefinition,
]

type RenderOptions = {
    index?: number
    field?: number
    operator?: ExpressionOperator
    onRemove?: (index?: number) => void
}

const renderExpressionRow = ({
    index = 1,
    field = ticketInputFieldDefinition.id,
    operator = ExpressionOperator.Is,
    onRemove = jest.fn(),
}: RenderOptions = {}) => {
    const result = render(
        <Form
            onValidSubmit={jest.fn()}
            defaultValues={{
                expression: {
                    [index]: { field, operator, values: null },
                },
            }}
        >
            <ExpressionRow
                index={index}
                customFieldDefinitions={customFieldDefinitions}
                onRemove={onRemove}
            />
        </Form>,
    )

    return { ...result, onRemove }
}

describe('ExpressionRow', () => {
    it("should render Pills, and 'And' when index is greater than 0", () => {
        const { rerender } = renderExpressionRow({ index: 1 })

        expect(screen.getByText('Ticket Field')).toBeInTheDocument()
        expect(screen.getByText('And')).toBeInTheDocument()

        rerender(
            <Form
                onValidSubmit={jest.fn()}
                defaultValues={{
                    expression: {
                        0: {
                            field: ticketInputFieldDefinition.id,
                            operator: ExpressionOperator.Is,
                            values: null,
                        },
                    },
                }}
            >
                <ExpressionRow
                    index={0}
                    customFieldDefinitions={customFieldDefinitions}
                    onRemove={jest.fn()}
                />
            </Form>,
        )

        expect(screen.getByText('Ticket Field')).toBeInTheDocument()
        expect(screen.queryByText('And')).toBeNull()
    })

    it('should render an enabled value field for the picked text field definition', () => {
        renderExpressionRow({ field: ticketInputFieldDefinition.id })

        const valueInput = screen.getByPlaceholderText('Enter field value')
        expect(valueInput).toBeInTheDocument()
        expect(valueInput).not.toBeDisabled()
    })

    it('should render a disabled value select when no field is picked', () => {
        renderExpressionRow({ field: 0 })

        expect(screen.queryByPlaceholderText('Enter field value')).toBeNull()
        expect(screen.getByText('Select field value(s)')).toBeInTheDocument()
    })

    it('should disable the value field when the operator is "is not empty"', () => {
        renderExpressionRow({
            field: ticketInputFieldDefinition.id,
            operator: ExpressionOperator.IsNotEmpty,
        })

        expect(screen.getByPlaceholderText('Enter field value')).toBeDisabled()
    })

    it('should call `onRemove` with the row index when clicking "close"', async () => {
        const user = userEvent.setup()
        const { onRemove } = renderExpressionRow({ index: 1 })

        await user.click(screen.getByRole('button', { name: 'close' }))

        expect(onRemove).toHaveBeenCalledWith(1)
    })
})
