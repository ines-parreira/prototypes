import { useCallback, useMemo, useState } from 'react'

import { Dropdown, FieldPresentation } from 'AIJourney/components'
import type {
    OrderStatus,
    OrderStatusOption,
    TargetOrderStatusFieldProps,
} from 'AIJourney/types/AIJourneyTypes'

const ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
    { value: 'order_placed', label: 'Order Placed' },
    { value: 'order_fulfilled', label: 'Order Fulfilled' },
]

export const TargetOrderStatusField = ({
    value = 'order_placed',
    onChange,
}: TargetOrderStatusFieldProps) => {
    const [selectedValue, setSelectedValue] = useState<OrderStatus>(
        value ?? 'order_placed',
    )

    const selectedOption = useMemo(
        () =>
            ORDER_STATUS_OPTIONS.find(
                (opt) => opt.value === (value ?? selectedValue),
            ),
        [value, selectedValue],
    )

    const handleChange = useCallback(
        (option: OrderStatusOption) => {
            setSelectedValue(option.value)
            onChange?.(option.value)
        },
        [onChange],
    )

    return (
        <div style={{ width: '100%' }}>
            <FieldPresentation
                name="Trigger event"
                tooltip="Choose when to trigger the post-purchase journey based on the order status"
            />
            <Dropdown
                options={ORDER_STATUS_OPTIONS}
                value={selectedOption}
                onChange={handleChange}
                getLabel={(option) => option.label}
                getValue={(option) => option.value}
            />
        </div>
    )
}
