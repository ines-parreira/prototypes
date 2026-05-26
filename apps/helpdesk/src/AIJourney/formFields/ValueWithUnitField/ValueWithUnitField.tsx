import { useEffect, useRef, useState } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import {
    Box,
    Label,
    ListItem,
    NumberField,
    SelectField,
    Text,
} from '@gorgias/axiom'

export type UnitOption = {
    id: string
    label: string
    factorToBase: number
}

export type ValueWithUnitFieldProps = {
    fieldName: string
    label: string
    units: UnitOption[]
    defaultUnitId?: string
    isUnitDisabled?: boolean
    isDisabled?: boolean
    minBaseValue?: number
    maxBaseValue?: number
    caption?: string
    unitAriaLabel?: string
}

const UNIT_SELECT_WIDTH = '96px'

const pickInitialUnit = (
    baseValue: number | null | undefined,
    units: UnitOption[],
    defaultUnitId?: string,
): UnitOption => {
    if (defaultUnitId) {
        const defaultUnit = units.find((u) => u.id === defaultUnitId)
        if (defaultUnit) return defaultUnit
    }
    if (baseValue == null || baseValue === 0) {
        return units[0]
    }
    const sorted = [...units].sort((a, b) => b.factorToBase - a.factorToBase)
    for (const unit of sorted) {
        if (baseValue % unit.factorToBase === 0) return unit
    }
    return units[0]
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value))

const toDisplayBounds = (
    minBaseValue: number,
    maxBaseValue: number | undefined,
    factor: number,
) => ({
    min: Math.ceil(minBaseValue / factor),
    max: maxBaseValue != null ? Math.floor(maxBaseValue / factor) : undefined,
})

export const ValueWithUnitField = ({
    fieldName,
    label,
    units,
    defaultUnitId,
    isUnitDisabled,
    isDisabled,
    minBaseValue = 0,
    maxBaseValue,
    caption,
    unitAriaLabel,
}: ValueWithUnitFieldProps) => {
    const { control } = useFormContext()
    const { field } = useController({ name: fieldName, control })
    const baseValue = field.value as number | null | undefined

    const [unitId, setUnitId] = useState<string>(
        () => pickInitialUnit(baseValue, units, defaultUnitId).id,
    )

    const prevBaseValueRef = useRef(baseValue)
    useEffect(() => {
        const prev = prevBaseValueRef.current
        prevBaseValueRef.current = baseValue
        if (prev == null && baseValue != null) {
            setUnitId(
                pickInitialUnit(Number(baseValue), units, defaultUnitId).id,
            )
        }
    }, [baseValue, units, defaultUnitId])

    const currentUnit = units.find((u) => u.id === unitId) ?? units[0]
    const { min: minDisplay, max: maxDisplay } = toDisplayBounds(
        minBaseValue,
        maxBaseValue,
        currentUnit.factorToBase,
    )
    const displayValue =
        baseValue != null
            ? Number(baseValue) / currentUnit.factorToBase
            : undefined

    const handleNumberChange = (value: number | null | undefined) => {
        if (value == null || Number.isNaN(value)) {
            const minDoesNotFitCurrentUnit =
                minBaseValue > 0 &&
                minBaseValue % currentUnit.factorToBase !== 0
            if (minDoesNotFitCurrentUnit) {
                setUnitId(pickInitialUnit(minBaseValue, units).id)
            }
            field.onChange(minBaseValue)
            return
        }
        field.onChange(value * currentUnit.factorToBase)
    }

    const handleUnitChange = (unit: UnitOption) => {
        setUnitId(unit.id)
        if (displayValue == null) return
        const { min, max } = toDisplayBounds(
            minBaseValue,
            maxBaseValue,
            unit.factorToBase,
        )
        const newDisplay = clamp(
            Math.round(displayValue),
            min,
            max ?? Number.POSITIVE_INFINITY,
        )
        field.onChange(newDisplay * unit.factorToBase)
    }

    return (
        <Box flexDirection="column" gap="xxs" width="100%">
            <Label isDisabled={isDisabled}>{label}</Label>
            <Box
                flexDirection="row"
                gap="xxs"
                alignItems="stretch"
                width="100%"
            >
                <Box flex={1} minWidth={0}>
                    <NumberField
                        aria-label={label}
                        value={displayValue}
                        onChange={handleNumberChange}
                        minValue={minDisplay}
                        maxValue={maxDisplay}
                        step={1}
                        isDisabled={isDisabled}
                        formatOptions={{
                            style: 'decimal',
                            useGrouping: false,
                        }}
                        trailingSlot={<></>}
                        style={{ width: '100%' }}
                    />
                </Box>
                <Box width={UNIT_SELECT_WIDTH} flexShrink={0}>
                    <SelectField
                        aria-label={unitAriaLabel ?? `${label} unit`}
                        items={units}
                        value={currentUnit}
                        onChange={handleUnitChange}
                        isDisabled={isUnitDisabled || isDisabled}
                    >
                        {(unit) => <ListItem label={unit.label} />}
                    </SelectField>
                </Box>
            </Box>
            {caption && (
                <Text
                    size="sm"
                    variant="regular"
                    color="var(--content-neutral-secondary)"
                >
                    {caption}
                </Text>
            )}
        </Box>
    )
}
