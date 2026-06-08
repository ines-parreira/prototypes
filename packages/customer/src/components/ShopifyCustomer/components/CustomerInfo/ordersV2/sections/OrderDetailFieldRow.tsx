import { CopyableField } from '@repo/ecommerce/shopify/components'

import { Box, Text } from '@gorgias/axiom'

import type { OrderFieldConfig, OrderFieldRenderContext } from '../../types'

import { UrlField } from './UrlField'
import sharedCss from '../../orders/sidePanel/OrderSidePanelPreview.less'

type Props = {
    field: OrderFieldConfig
    context: OrderFieldRenderContext
    isUrlField?: boolean
}

export function OrderDetailFieldRow({
    field,
    context,
    isUrlField = false,
}: Props) {
    if (field.type === 'component') {
        const urlValue = isUrlField
            ? (field.getValue(context) as string | undefined)
            : undefined
        const rendered = urlValue ? (
            <UrlField url={urlValue} />
        ) : (
            field.render(context)
        )

        if (!rendered) return null

        const rawCopy = field.copyValue?.(undefined, context) ?? undefined
        const canCopy = Boolean(field.copyable && rawCopy && rawCopy.length > 0)

        return (
            <Box
                display="grid"
                w="100%"
                alignItems="center"
                gap="xs"
                className={sharedCss.row}
            >
                <Text as="span" size="md" className={sharedCss.label}>
                    {field.label}
                </Text>
                {canCopy && rawCopy ? (
                    <CopyableField
                        value={rawCopy}
                        ariaLabel={`Copy ${field.label}`}
                        inline
                    >
                        {rendered}
                    </CopyableField>
                ) : (
                    rendered
                )}
            </Box>
        )
    }

    const value = field.getValue(context)
    if (value == null) return null

    const displayValue = field.formatValue?.(value, context) ?? String(value)
    const rawCopy = field.copyValue?.(value, context) ?? String(value)
    const canCopy = Boolean(field.copyable && rawCopy && rawCopy.length > 0)
    const valueNode = <Text size="md">{displayValue}</Text>

    return (
        <Box
            display="grid"
            w="100%"
            alignItems="center"
            gap="xs"
            className={sharedCss.row}
        >
            <Text as="span" size="md" className={sharedCss.label}>
                {field.label}
            </Text>
            {canCopy ? (
                <CopyableField
                    value={rawCopy}
                    ariaLabel={`Copy ${field.label}`}
                    inline
                >
                    {valueNode}
                </CopyableField>
            ) : (
                valueNode
            )}
        </Box>
    )
}
