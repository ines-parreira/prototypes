import type { ComponentProps } from 'react'

import { Box, Button, Heading, Icon, Tag } from '@gorgias/axiom'

type TagColor = ComponentProps<typeof Tag>['color']

type Props = {
    orderName: string
    isCancelled: boolean
    financialLabel: string
    financialColor: TagColor
    fulfillmentLabel: string
    fulfillmentColor: TagColor
    onClose: () => void
}

export function OrderSidePanelHeader({
    orderName,
    isCancelled,
    financialLabel,
    financialColor,
    fulfillmentLabel,
    fulfillmentColor,
    onClose,
}: Props) {
    return (
        <Box
            flexDirection="row"
            alignItems="center"
            gap="xxxs"
            marginBottom={'xxs'}
        >
            <Box flexShrink={0}>
                <Icon name="app-shopify" size="lg" intent="regular" />
            </Box>

            <Box flex={1} minWidth={0} alignItems="center" gap="xs">
                <Heading size="lg" overflow="ellipsis">
                    Order {orderName}
                </Heading>
                <Box gap="xxxs">
                    {isCancelled && <Tag color="red">Cancelled</Tag>}
                    <Tag color={financialColor}>{financialLabel}</Tag>
                    <Tag color={fulfillmentColor}>{fulfillmentLabel}</Tag>
                </Box>
            </Box>

            <Box
                flexDirection="row"
                alignItems="center"
                gap="xxxs"
                flexShrink={0}
            >
                <Button
                    as="button"
                    icon="close"
                    intent="regular"
                    size="sm"
                    variant="tertiary"
                    onClick={onClose}
                    aria-label="Close preview"
                />
            </Box>
        </Box>
    )
}
