import { Controller, useFormContext } from 'react-hook-form'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    ListItem,
    SelectField,
    Text,
} from '@gorgias/axiom'
import { OrderStatusEnum } from '@gorgias/convert-client'

type OrderStatusOption = { id: OrderStatusEnum; label: string }

const ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
    { id: OrderStatusEnum.OrderPlaced, label: 'Order placed' },
    { id: OrderStatusEnum.OrderFulfilled, label: 'Order fulfilled' },
]

const TargetOrderStatusOptionsGroupItem = () =>
    ORDER_STATUS_OPTIONS.map((option) => (
        <ButtonGroupItem key={option.id} id={option.id}>
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

const renderSelectField = (field: {
    value: OrderStatusEnum
    onChange: (value: OrderStatusEnum) => void
}) => {
    const selectedOption = ORDER_STATUS_OPTIONS.find(
        (option) => option.id === field.value,
    )

    return (
        <Box width="100%" flexDirection="column">
            <SelectField
                label="Start when"
                items={ORDER_STATUS_OPTIONS}
                value={selectedOption}
                onChange={(option) => field.onChange(option.id)}
            >
                {(option) => <ListItem label={option.label} />}
            </SelectField>
        </Box>
    )
}

type TargetOrderStatusProps = {
    isV3Architecture?: boolean
}

export const TargetOrderStatus = ({
    isV3Architecture,
}: TargetOrderStatusProps) => {
    const { control } = useFormContext()

    if (isV3Architecture) {
        return (
            <Controller
                name="target_order_status"
                control={control}
                render={({ field }) => renderSelectField(field)}
            />
        )
    }

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
