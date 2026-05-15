import { Controller, useFormContext } from 'react-hook-form'

import { Box, ButtonGroup, ButtonGroupItem, Text } from '@gorgias/axiom'

const fieldProps = {
    ['cooldown']: {
        fieldName: 'cooldown_days',
        label: 'Shopper can re-enter after',
        options: [30, 60, 90],
    },
    ['inactive-days']: {
        fieldName: 'inactive_days',
        label: 'Shopper inactive for at least',
        options: [30, 60, 90, 120],
    },
}

const WaitingDaysGroupItem = ({ options }: { options: number[] }) =>
    options.map((option) => (
        <ButtonGroupItem key={option} id={String(option)}>
            {`${option} days`}
        </ButtonGroupItem>
    ))

const renderButtonGroup = (
    field: {
        value: number
        onChange: (value: number) => void
    },
    options: number[],
) => (
    <ButtonGroup
        selectedKey={field.value?.toString()}
        onSelectionChange={(key) => field.onChange(Number(key))}
    >
        <WaitingDaysGroupItem options={options} />
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
                render={({ field }) =>
                    renderButtonGroup(field, fieldProps[type].options)
                }
            />
        </Box>
    )
}
