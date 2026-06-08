import { CopyableField } from '@repo/ecommerce/shopify/components'

import { Box, Button, Icon, Text } from '@gorgias/axiom'

import css from './OrderRowHeader.less'

type Props = {
    orderName: string
    dateLabel: string
    itemCount: number
    total: string
    isExpanded: boolean
    onToggle: () => void
}

export function OrderRowHeader({
    orderName,
    dateLabel,
    itemCount,
    total,
    isExpanded,
    onToggle,
}: Props) {
    return (
        <div className={css.header} onClick={isExpanded ? onToggle : undefined}>
            <Box
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                gap="xs"
            >
                <Box
                    flexDirection="row"
                    alignItems="center"
                    gap="xxxs"
                    minWidth={0}
                >
                    <Icon name="app-shopify" size="md" />
                    <CopyableField
                        value={orderName}
                        ariaLabel="Copy order number"
                        inline
                    >
                        <Text
                            size="md"
                            variant="bold"
                            className={css.orderNumber}
                        >
                            {orderName}
                        </Text>
                    </CopyableField>
                </Box>
                <Button
                    as="button"
                    icon={
                        isExpanded ? 'arrow-chevron-up' : 'arrow-chevron-down'
                    }
                    variant="tertiary"
                    size="md"
                    aria-expanded={isExpanded}
                    aria-label={isExpanded ? 'Collapse order' : 'Expand order'}
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggle()
                    }}
                />
            </Box>
            <Text size="md" className={css.metadata}>
                {`${dateLabel} · ${itemCount} ${itemCount === 1 ? 'item' : 'items'} · ${total}`}
            </Text>
        </div>
    )
}
