import { FieldRow } from '@repo/tickets'

import { OverflowListItem, Text } from '@gorgias/axiom'

import type { FieldConfig, FieldRenderContext } from './types'

import css from './CustomerInfoFieldItem.less'

type Props = {
    field: FieldConfig
    context: FieldRenderContext
    className?: string
}

export function CustomerInfoFieldItem({ field, context, className }: Props) {
    if (field.type === 'component') {
        return (
            <OverflowListItem className={className}>
                {field.render(context)}
            </OverflowListItem>
        )
    }

    const value = field.getValue(context)
    const displayValue =
        field.formatValue?.(value, context) ?? String(value ?? '-')

    return (
        <OverflowListItem className={className}>
            <FieldRow label={field.label} className={css.fieldRow}>
                <Text size="sm" overflow="ellipsis" className={css.fieldValue}>
                    {displayValue}
                </Text>
            </FieldRow>
        </OverflowListItem>
    )
}
