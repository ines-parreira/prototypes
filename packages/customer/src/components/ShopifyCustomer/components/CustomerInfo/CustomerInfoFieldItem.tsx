import { FieldRow } from '@repo/tickets'

import { OverflowListItem, Text } from '@gorgias/axiom'

import type { FieldConfig, FieldRenderContext } from './types'

type Props = {
    field: FieldConfig
    context: FieldRenderContext
}

export function CustomerInfoFieldItem({ field, context }: Props) {
    if (field.type === 'component') {
        return <>{field.render(context)}</>
    }

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
