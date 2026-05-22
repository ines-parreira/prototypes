import { useEffect } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

import {
    Box,
    ButtonGroup,
    ButtonGroupItem,
    ListItem,
    SelectField,
    Text,
} from '@gorgias/axiom'

type DayOption = { id: string; label: string }

const toDayOptions = (days: number[]): DayOption[] =>
    days.map((d) => ({ id: String(d), label: `${d} days` }))

const fieldProps = {
    ['cooldown']: {
        fieldName: 'cooldown_days',
        label: 'Shopper can re-enter after',
        labelV3: 'Re-entry after',
        options: [30, 60, 90],
        optionsV3: toDayOptions([30, 60, 90]),
        defaultV3: 90,
    },
    ['inactive-days']: {
        fieldName: 'inactive_days',
        label: 'Shopper inactive for at least',
        labelV3: 'Shopper inactive',
        options: [30, 60, 90, 120],
        optionsV3: toDayOptions([30, 60, 90, 180]),
        defaultV3: 60,
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
    isV3Architecture,
}: {
    type: 'cooldown' | 'inactive-days'
    isV3Architecture?: boolean
}) => {
    const { control, setValue, getValues } = useFormContext()
    const props = fieldProps[type]

    useEffect(() => {
        if (!isV3Architecture) return
        if (getValues(props.fieldName) == null) {
            setValue(props.fieldName, props.defaultV3)
        }
    }, [
        isV3Architecture,
        props.fieldName,
        props.defaultV3,
        getValues,
        setValue,
    ])

    if (isV3Architecture) {
        return (
            <Controller
                name={props.fieldName}
                control={control}
                render={({ field }) => {
                    const currentValueId =
                        field.value != null ? String(field.value) : undefined
                    const items =
                        currentValueId != null &&
                        !props.optionsV3.some((o) => o.id === currentValueId)
                            ? [
                                  ...props.optionsV3,
                                  ...toDayOptions([Number(currentValueId)]),
                              ]
                            : props.optionsV3
                    const selectedOption = items.find(
                        (option) => option.id === currentValueId,
                    )

                    return (
                        <Box width="100%" flexDirection="column">
                            <SelectField
                                label={props.labelV3}
                                items={items}
                                value={selectedOption}
                                onChange={(option) =>
                                    field.onChange(Number(option.id))
                                }
                            >
                                {(option) => <ListItem label={option.label} />}
                            </SelectField>
                        </Box>
                    )
                }}
            />
        )
    }

    return (
        <Box flexDirection="column" gap="xxs">
            <Text as="span" size="md" variant="medium">
                {props.label}
            </Text>
            <Controller
                name={props.fieldName}
                control={control}
                render={({ field }) => renderButtonGroup(field, props.options)}
            />
        </Box>
    )
}
