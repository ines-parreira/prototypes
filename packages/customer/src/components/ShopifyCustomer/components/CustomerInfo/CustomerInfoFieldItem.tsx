import { CopyableField } from '@repo/ecommerce/shopify/components'
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

    const rawCopy =
        field.copyValue?.(value, context) ??
        (value == null ? undefined : String(value))
    const canCopy = Boolean(
        field.copyable && value != null && rawCopy && rawCopy.length > 0,
    )

    const valueText = (
        <Text overflow="ellipsis" className={css.fieldValue}>
            {displayValue}
        </Text>
    )

    return (
        <OverflowListItem className={className}>
            <FieldRow label={field.label} className={css.fieldRow}>
                {canCopy ? (
                    <CopyableField
                        value={rawCopy!}
                        ariaLabel={`Copy ${field.label}`}
                        inline
                    >
                        {valueText}
                    </CopyableField>
                ) : (
                    valueText
                )}
            </FieldRow>
        </OverflowListItem>
    )
}
