import type { RefObject } from 'react'

import {
    Box,
    Label,
    ListItem,
    Select,
    SelectTrigger,
    Text,
    TextField,
} from '@gorgias/axiom'

import { DURATION_OPTIONS } from '../../constants'
import type { StatusDurationSelectProps } from './types'

/**
 * Dropdown for selecting status duration.
 * Compatible with react-hook-form via FormField.
 */
export function StatusDurationSelect({
    value,
    onChange,
    error,
}: StatusDurationSelectProps) {
    return (
        <Box flexDirection="column" gap="xs" maxWidth={260} flex={1}>
            <Label id="status-duration-label" htmlFor="status-duration">
                Status duration
            </Label>
            <Select
                maxWidth={200}
                items={DURATION_OPTIONS}
                selectedItem={value}
                onSelect={onChange}
                aria-labelledby="status-duration-label"
                trigger={({ ref, isOpen, selectedText }) => {
                    return (
                        <SelectTrigger>
                            <TextField
                                id="status-duration"
                                inputRef={ref as RefObject<HTMLInputElement>}
                                isFocused={isOpen}
                                trailingSlot={
                                    isOpen
                                        ? 'arrow-chevron-up'
                                        : 'arrow-chevron-down'
                                }
                                variant="primary"
                                value={selectedText}
                                aria-labelledby="status-duration-label"
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
