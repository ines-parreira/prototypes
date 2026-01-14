import { useCallback } from 'react'

import { Box, Label, TextField } from '@gorgias/axiom'

import type { StatusDurationValueFieldProps } from './types'

/**
 * Text input field for custom duration value.
 * Compatible with react-hook-form via FormField.
 */
export function StatusDurationValueField({
    value,
    onChange,
    error,
}: StatusDurationValueFieldProps) {
    const handleChange = useCallback(
        (newValue: string) => {
            // Parse to number, default to minValue if invalid
            const numValue = parseInt(newValue, 10)
            if (!isNaN(numValue)) {
                onChange(numValue)
            } else if (newValue === '') {
                // Allow empty string during editing
                onChange(0)
            }
        },
        [onChange],
    )

    return (
        <Box flexDirection="column" gap="xs">
            {/* TODO: provide a way to have hidden label so that the layout does not break */}
            <Label
                id="custom-duration-value-label"
                htmlFor="custom-duration-value"
                style={{ opacity: 0 }}
            >
                Amount
            </Label>
            <TextField
                id="custom-duration-value"
                style={{ width: 60 }}
                value={value.toString()}
                onChange={handleChange}
                inputMode="numeric"
                variant="primary"
                error={error}
                aria-labelledby="custom-duration-value-label"
            />
        </Box>
    )
}
