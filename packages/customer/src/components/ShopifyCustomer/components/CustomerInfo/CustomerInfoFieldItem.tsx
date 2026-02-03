import { FieldRow } from '@repo/tickets'

import { OverflowListItem, Text } from '@gorgias/axiom'

import type { FieldRenderContext, ReadOnlyFieldConfig } from './types'

type Props = {
    field: ReadOnlyFieldConfig
    context: FieldRenderContext
}

export function CustomerInfoFieldItem({ field, context }: Props) {
    const value = field.getValue(context)
    const displayValue =
        field.formatValue?.(value, context) ?? String(value ?? '-')

    return (
        <OverflowListItem>
            <FieldRow label={field.label}>
                <Text size="sm">{displayValue}</Text>
            </FieldRow>
        </OverflowListItem>
    )
}
