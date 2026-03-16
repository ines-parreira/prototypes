import type { RefObject } from 'react'
import { useCallback, useMemo } from 'react'

import {
    Box,
    Label,
    ListItem,
    Select,
    SelectTrigger,
    Text,
    TextField,
} from '@gorgias/axiom'

import { DURATION_UNIT_OPTIONS } from '../../constants'
import type { DurationUnitOption } from '../../types'
import type { StatusDurationUnitSelectProps } from './types'

/**
 * Dropdown for selecting duration unit (minutes, hours, days).
 * Compatible with react-hook-form via FormField.
 */
export function StatusDurationUnitSelect({
    value,
    onChange,
    error,
}: StatusDurationUnitSelectProps) {
    const selectedItem = useMemo(
        () =>
            DURATION_UNIT_OPTIONS.find((option) => option.id === value) ||
            DURATION_UNIT_OPTIONS[0],
        [value],
    )

    const handleSelect = useCallback(
        (item: DurationUnitOption) => {
            onChange(item.id)
        },
        [onChange],
    )

    return (
        <Box flexDirection="column" gap="xs" alignSelf="end" flex={1}>
            {/* TODO: provide a way to have hidden label so that the layout does not break */}
            <Label
                id="custom-duration-unit-label"
                htmlFor="custom-duration-unit"
                style={{ opacity: 0 }}
            >
                Unit
            </Label>
            <Select
                items={DURATION_UNIT_OPTIONS}
                selectedItem={selectedItem}
                onSelect={handleSelect}
                aria-labelledby="custom-duration-unit-label"
                trigger={({ ref, selectedText, isOpen }) => {
                    return (
                        <SelectTrigger>
                            <TextField
                                id="custom-duration-unit"
                                inputRef={ref as RefObject<HTMLInputElement>}
                                isFocused={isOpen}
                                trailingSlot={
                                    isOpen
                                        ? 'arrow-chevron-up'
                                        : 'arrow-chevron-down'
                                }
                                variant="primary"
                                value={selectedText}
                                aria-labelledby="custom-duration-unit-label"
                            />
                        </SelectTrigger>
                    )
                }}
            >
                {(item) => <ListItem id={item.id} label={item.name} />}
            </Select>
            {error && (
                <Text size="sm" color="content-error-default">
                    {error}
                </Text>
            )}
        </Box>
    )
}
