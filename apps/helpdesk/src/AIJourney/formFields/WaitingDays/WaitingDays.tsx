import { Controller, useFormContext } from 'react-hook-form'

import { Box, ButtonGroup, ButtonGroupItem, Text } from '@gorgias/axiom'

const fieldProps = {
    ['cooldown']: {
        fieldName: 'cooldown_days',
        label: 'Shopper inactive for at least',
    },
    ['inactive-days']: {
        fieldName: 'inactive_days',
        label: 'Shopper can re-enter after',
    },
}

const WAITING_DAYS_OPTIONS = [30, 60, 90]

const WaitingDaysGroupItem = () =>
    WAITING_DAYS_OPTIONS.map((option) => (
        <ButtonGroupItem key={option} id={String(option)}>
            {`${option} days`}
        </ButtonGroupItem>
    ))

const renderButtonGroup = (field: {
    value: number
    onChange: (value: number) => void
}) => (
    <ButtonGroup
        selectedKey={field.value.toString()}
        onSelectionChange={(key) => field.onChange(Number(key))}
    >
        <WaitingDaysGroupItem />
    </ButtonGroup>
)

export const WaitingDays = ({
    type,
}: {
    type: 'cooldown' | 'inactive-days'
}) => {
    const { control } = useFormContext()

    return (
        <Box flexDirection="column" gap="xxs">
            <Text as="span" size="md" variant="medium">
                {fieldProps[type].label}
            </Text>
            <Controller
                name={fieldProps[type].fieldName}
                control={control}
                render={({ field }) => renderButtonGroup(field)}
            />
        </Box>
    )
}
