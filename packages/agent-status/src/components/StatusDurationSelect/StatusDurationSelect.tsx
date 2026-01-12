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
    'aria-label': ariaLabel = 'Status duration',
}: StatusDurationSelectProps) {
    return (
        <Box flexDirection="column" gap="xs" maxWidth={260} flex={1}>
            <Label>Status duration</Label>
            <Select
                maxWidth={200}
                items={DURATION_OPTIONS}
                selectedItem={value}
                onSelect={onChange}
                aria-label={ariaLabel}
                // TODO: There are only 3 avaialble placements, but the design mandates top placement
                // this works, I'm leaving an ignore until resolved in PR
                // @ts-ignore
                placement={'top'}
                trigger={({ ref, isOpen, selectedText }) => {
                    return (
                        <SelectTrigger>
                            <TextField
                                inputRef={ref as RefObject<HTMLInputElement>}
                                isFocused={isOpen}
                                trailingSlot={
                                    isOpen
                                        ? 'arrow-chevron-up'
                                        : 'arrow-chevron-down'
                                }
                                variant="primary"
                                value={selectedText}
                                aria-label={ariaLabel}
                            />
                        </SelectTrigger>
                    )
                }}
            >
                {(item) => <ListItem id={item.id} label={item.name} />}
            </Select>
            {error && (
                <Text size="sm" color="error">
                    {error}
                </Text>
            )}
        </Box>
    )
}
