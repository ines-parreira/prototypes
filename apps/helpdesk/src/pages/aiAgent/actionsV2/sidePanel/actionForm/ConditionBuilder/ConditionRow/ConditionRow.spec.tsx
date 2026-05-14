import { render, userEvent } from '@repo/testing'

import type {
    Condition,
    ConditionField,
    ConditionOperator,
    ConditionValueOption,
} from '../types'
import { ConditionRow } from './ConditionRow'

const enumField: ConditionField = {
    id: 'order_status',
    label: 'Order status',
    type: 'enum',
}

const numberField: ConditionField = {
    id: 'amount',
    label: 'Amount',
    type: 'number',
}

const dateField: ConditionField = {
    id: 'created_at',
    label: 'Created at',
    type: 'date',
}

const operators: ConditionOperator[] = [
    { id: 'eq', label: 'is' },
    { id: 'ne', label: 'is not' },
]

const valueOptions: ConditionValueOption[] = [
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
]

const baseCondition = (overrides: Partial<Condition> = {}): Condition => ({
    id: 'cond-1',
    field: 'order_status',
    operator: 'eq',
    value: '',
    ...overrides,
})

describe('ConditionRow', () => {
    it('renders the field label and the selected operator', () => {
        const { getByLabelText } = render(
            <ConditionRow
                condition={baseCondition()}
                fields={[enumField]}
                operators={operators}
                onChange={() => {}}
                onRemove={() => {}}
            />,
        )
        expect(getByLabelText('Field')).toHaveTextContent('Order status')
        expect(getByLabelText('Operator')).toHaveTextContent('is')
    })

    it('emits onChange with the next operator when one is picked', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { getByLabelText, findByRole } = render(
            <ConditionRow
                condition={baseCondition()}
                fields={[enumField]}
                operators={operators}
                onChange={onChange}
                onRemove={() => {}}
            />,
        )
        await user.click(getByLabelText('Operator'))
        await user.click(await findByRole('option', { name: 'is not' }))
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ operator: 'ne' }),
        )
    })

    it('renders a value Select when valueOptions are provided', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { getByLabelText, findByRole } = render(
            <ConditionRow
                condition={baseCondition({ value: 'paid' })}
                fields={[enumField]}
                operators={operators}
                valueOptions={valueOptions}
                onChange={onChange}
                onRemove={() => {}}
            />,
        )
        expect(getByLabelText('Value')).toHaveTextContent('Paid')
        await user.click(getByLabelText('Value'))
        await user.click(await findByRole('option', { name: 'Pending' }))
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ value: 'pending' }),
        )
    })

    it('renders a TextField for free-text values and forwards typed input', async () => {
        const user = userEvent.setup()
        const onChange = jest.fn()
        const { getByLabelText } = render(
            <ConditionRow
                condition={baseCondition({
                    field: 'amount',
                    value: '',
                })}
                fields={[numberField]}
                operators={operators}
                onChange={onChange}
                onRemove={() => {}}
            />,
        )
        await user.type(getByLabelText('Value'), '4')
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({ value: '4' }),
        )
    })

    it('renders a DatePicker for value when the field type is "date"', () => {
        const { getByLabelText, queryByRole } = render(
            <ConditionRow
                condition={baseCondition({
                    field: 'created_at',
                    value: '',
                })}
                fields={[dateField]}
                operators={operators}
                onChange={() => {}}
                onRemove={() => {}}
            />,
        )
        expect(getByLabelText('Field')).toHaveTextContent('Created at')
        expect(queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('parses an ISO value into the DatePicker when one is set', () => {
        const { getByLabelText } = render(
            <ConditionRow
                condition={baseCondition({
                    field: 'created_at',
                    value: '2026-05-14T10:00:00.000Z',
                })}
                fields={[dateField]}
                operators={operators}
                onChange={() => {}}
                onRemove={() => {}}
            />,
        )
        expect(getByLabelText('Field')).toHaveTextContent('Created at')
    })

    it('calls onRemove when the destructive button is clicked', async () => {
        const user = userEvent.setup()
        const onRemove = jest.fn()
        const { getByRole } = render(
            <ConditionRow
                condition={baseCondition()}
                fields={[enumField]}
                operators={operators}
                onChange={() => {}}
                onRemove={onRemove}
            />,
        )
        await user.click(getByRole('button', { name: 'Remove condition' }))
        expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('disables the remove button when canRemove is false', () => {
        const { getByRole } = render(
            <ConditionRow
                condition={baseCondition()}
                fields={[enumField]}
                operators={operators}
                onChange={() => {}}
                onRemove={() => {}}
                canRemove={false}
            />,
        )
        expect(getByRole('button', { name: 'Remove condition' })).toBeDisabled()
    })

    it('uses a custom deleteAriaLabel when provided', () => {
        const { getByRole } = render(
            <ConditionRow
                condition={baseCondition()}
                fields={[enumField]}
                operators={operators}
                onChange={() => {}}
                onRemove={() => {}}
                deleteAriaLabel="Delete rule"
            />,
        )
        expect(getByRole('button', { name: 'Delete rule' })).toBeInTheDocument()
    })
})
