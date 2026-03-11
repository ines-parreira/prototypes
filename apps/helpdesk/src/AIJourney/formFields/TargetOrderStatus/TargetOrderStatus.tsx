import { Controller, useFormContext } from 'react-hook-form'

import { Box, ButtonGroup, ButtonGroupItem, Text } from '@gorgias/axiom'
import { OrderStatusEnum } from '@gorgias/convert-client'

const ORDER_STATUS_OPTIONS = [
    { value: OrderStatusEnum.OrderPlaced, label: 'Order placed' },
    { value: OrderStatusEnum.OrderFulfilled, label: 'Order fulfilled' },
]

const TargetOrderStatusOptionsGroupItem = () =>
    ORDER_STATUS_OPTIONS.map((option) => (
        <ButtonGroupItem key={option.value} id={option.value}>
            {option.label}
        </ButtonGroupItem>
    ))

const renderButtonGroup = (field: {
    value: OrderStatusEnum
    onChange: (value: OrderStatusEnum) => void
}) => (
    <ButtonGroup
        selectedKey={field.value}
        onSelectionChange={(key) => field.onChange(key as OrderStatusEnum)}
    >
        <TargetOrderStatusOptionsGroupItem />
    </ButtonGroup>
)

export const TargetOrderStatus = () => {
    const { control } = useFormContext()

    return (
        <Box flexDirection="column" gap="xxs">
            <Text as="span" size="md" variant="medium">
                Start this flow when
            </Text>
            <Controller
                name="target_order_status"
                control={control}
                render={({ field }) => renderButtonGroup(field)}
            />
        </Box>
    )
}
