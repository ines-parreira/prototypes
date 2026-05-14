import { useState } from 'react'

import { render, userEvent } from '@repo/testing'

import { Button } from '@gorgias/axiom'

import type { ConditionField, ConditionFieldCategory } from '../types'
import { ConditionVariablePicker } from './ConditionVariablePicker'

const fields: ConditionField[] = [
    {
        id: 'order_status',
        label: 'Order status',
        type: 'string',
        category: 'order',
    },
    {
        id: 'order_amount',
        label: 'Order amount',
        type: 'number',
        category: 'order',
    },
    {
        id: 'customer_name',
        label: 'Customer name',
        type: 'string',
        category: 'customer',
    },
]

const categories: ConditionFieldCategory[] = [
    { id: 'customer', label: 'Existing customer', iconName: 'customer-info' },
    { id: 'order', label: 'Order', iconName: 'download-package' },
]

const Harness = ({
    onSelect,
    withCategories,
}: {
    onSelect: (field: ConditionField) => void
    withCategories?: boolean
}) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <ConditionVariablePicker
            fields={fields}
            categories={withCategories ? categories : undefined}
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            onSelect={onSelect}
            trigger={
                <Button as="button" onClick={() => setIsOpen(true)}>
                    Open
                </Button>
            }
        />
    )
}

describe('ConditionVariablePicker', () => {
    it('shows the category list with the INSERT VARIABLE header when categories are provided', async () => {
        const user = userEvent.setup()
        const { getByRole, findByText } = render(
            <Harness onSelect={() => {}} withCategories />,
        )
        await user.click(getByRole('button', { name: 'Open' }))
        expect(await findByText('INSERT VARIABLE')).toBeInTheDocument()
        expect(await findByText('Existing customer')).toBeInTheDocument()
        expect(await findByText('Order')).toBeInTheDocument()
    })

    it('drills into a category and lists its fields', async () => {
        const user = userEvent.setup()
        const onSelect = jest.fn()
        const { getByRole, findByRole } = render(
            <Harness onSelect={onSelect} withCategories />,
        )
        await user.click(getByRole('button', { name: 'Open' }))
        await user.click(
            await findByRole('button', { name: /Existing customer/ }),
        )
        const customerNameOption = await findByRole('button', {
            name: 'Customer name',
        })
        await user.click(customerNameOption)
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'customer_name' }),
        )
    })

    it('searches across all fields and surfaces matches', async () => {
        const user = userEvent.setup()
        const onSelect = jest.fn()
        const { getByRole, findByRole, getByPlaceholderText } = render(
            <Harness onSelect={onSelect} withCategories />,
        )
        await user.click(getByRole('button', { name: 'Open' }))
        await user.type(getByPlaceholderText('Search for a variable'), 'amount')
        await user.click(await findByRole('button', { name: 'Order amount' }))
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'order_amount' }),
        )
    })

    it('falls back to a flat list when no categories are provided', async () => {
        const user = userEvent.setup()
        const onSelect = jest.fn()
        const { getByRole, findByRole } = render(
            <Harness onSelect={onSelect} />,
        )
        await user.click(getByRole('button', { name: 'Open' }))
        const orderStatus = await findByRole('button', {
            name: 'Order status',
        })
        await user.click(orderStatus)
        expect(onSelect).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'order_status' }),
        )
    })
})
