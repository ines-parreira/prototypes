import { render, userEvent } from '@repo/testing'

import type { ConditionField, ConditionOperator } from '../types'
import { ConditionBuilder } from './ConditionBuilder'

const fields: ConditionField[] = [
    { id: 'order_status', label: 'Order status', type: 'enum' },
    { id: 'amount', label: 'Amount', type: 'number' },
]

const operators: ConditionOperator[] = [
    { id: 'eq', label: 'is' },
    { id: 'ne', label: 'is not' },
]

describe('ConditionBuilder', () => {
    it('hides condition rows when the mode is "none"', () => {
        const { queryByLabelText } = render(
            <ConditionBuilder
                conditions={[]}
                logicOperator="none"
                fields={fields}
                getOperators={() => operators}
                onConditionsChange={() => {}}
                onLogicChange={() => {}}
            />,
        )
        expect(queryByLabelText('Field')).not.toBeInTheDocument()
    })

    it('appends a condition for the selected field after picking it from the variable picker', async () => {
        const user = userEvent.setup()
        const onConditionsChange = jest.fn()
        const { getByRole, findByRole } = render(
            <ConditionBuilder
                conditions={[]}
                logicOperator="all"
                fields={fields}
                getOperators={() => operators}
                onConditionsChange={onConditionsChange}
                onLogicChange={() => {}}
            />,
        )
        await user.click(getByRole('button', { name: 'Add condition' }))
        const orderStatusOption = await findByRole('button', {
            name: 'Order status',
        })
        await user.click(orderStatusOption)
        expect(onConditionsChange).toHaveBeenCalledTimes(1)
        const next = onConditionsChange.mock.calls[0][0]
        expect(next).toHaveLength(1)
        expect(next[0].field).toBe('order_status')
        expect(next[0].operator).toBe('eq')
    })

    it('renders an AND connector between rows when the mode is "all"', () => {
        const { getByText } = render(
            <ConditionBuilder
                conditions={[
                    {
                        id: 'cond-1',
                        field: 'order_status',
                        operator: 'eq',
                        value: 'paid',
                    },
                    {
                        id: 'cond-2',
                        field: 'amount',
                        operator: 'eq',
                        value: '10',
                    },
                ]}
                logicOperator="all"
                fields={fields}
                getOperators={() => operators}
                onConditionsChange={() => {}}
                onLogicChange={() => {}}
            />,
        )
        expect(getByText('AND')).toBeInTheDocument()
    })

    it('renders an OR connector between rows when the mode is "any"', () => {
        const { getByText } = render(
            <ConditionBuilder
                conditions={[
                    {
                        id: 'cond-1',
                        field: 'order_status',
                        operator: 'eq',
                        value: 'paid',
                    },
                    {
                        id: 'cond-2',
                        field: 'amount',
                        operator: 'eq',
                        value: '10',
                    },
                ]}
                logicOperator="any"
                fields={fields}
                getOperators={() => operators}
                onConditionsChange={() => {}}
                onLogicChange={() => {}}
            />,
        )
        expect(getByText('OR')).toBeInTheDocument()
    })

    it('propagates a logic mode change through onLogicChange', async () => {
        const user = userEvent.setup()
        const onLogicChange = jest.fn()
        const { getByLabelText, findByRole } = render(
            <ConditionBuilder
                conditions={[]}
                logicOperator="none"
                fields={fields}
                getOperators={() => operators}
                onConditionsChange={() => {}}
                onLogicChange={onLogicChange}
            />,
        )
        await user.click(getByLabelText('Conditions mode'))
        await user.click(
            await findByRole('option', { name: 'All conditions are met' }),
        )
        expect(onLogicChange).toHaveBeenCalledWith('all')
    })

    it('updates a condition through the value Select when valueOptions are provided', async () => {
        const user = userEvent.setup()
        const onConditionsChange = jest.fn()
        const { getByLabelText, findByRole } = render(
            <ConditionBuilder
                conditions={[
                    {
                        id: 'cond-1',
                        field: 'order_status',
                        operator: 'eq',
                        value: 'paid',
                    },
                ]}
                logicOperator="all"
                fields={fields}
                getOperators={() => operators}
                getValueOptions={(fieldId) =>
                    fieldId === 'order_status'
                        ? [
                              { value: 'paid', label: 'Paid' },
                              { value: 'pending', label: 'Pending' },
                          ]
                        : undefined
                }
                onConditionsChange={onConditionsChange}
                onLogicChange={() => {}}
            />,
        )
        await user.click(getByLabelText('Value'))
        await user.click(await findByRole('option', { name: 'Pending' }))
        expect(onConditionsChange).toHaveBeenCalledWith([
            expect.objectContaining({ value: 'pending' }),
        ])
    })

    it('ignores the picked field when no operators are configured for it', async () => {
        const user = userEvent.setup()
        const onConditionsChange = jest.fn()
        const { getByRole, findByRole } = render(
            <ConditionBuilder
                conditions={[]}
                logicOperator="all"
                fields={fields}
                getOperators={(fieldId) =>
                    fieldId === 'order_status' ? operators : []
                }
                onConditionsChange={onConditionsChange}
                onLogicChange={() => {}}
            />,
        )
        await user.click(getByRole('button', { name: 'Add condition' }))
        await user.click(await findByRole('button', { name: 'Amount' }))
        expect(onConditionsChange).not.toHaveBeenCalled()
    })

    it('removes a condition when its delete button is clicked', async () => {
        const user = userEvent.setup()
        const onConditionsChange = jest.fn()
        const { getByRole } = render(
            <ConditionBuilder
                conditions={[
                    {
                        id: 'cond-1',
                        field: 'order_status',
                        operator: 'eq',
                        value: 'paid',
                    },
                ]}
                logicOperator="all"
                fields={fields}
                getOperators={() => operators}
                onConditionsChange={onConditionsChange}
                onLogicChange={() => {}}
            />,
        )
        await user.click(getByRole('button', { name: 'Remove condition' }))
        expect(onConditionsChange).toHaveBeenCalledWith([])
    })
})
