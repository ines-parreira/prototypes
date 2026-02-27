import { Box, Text } from '@gorgias/axiom'

import css from './OrderSidePanelPreview.less'

type Fulfillment = {
    tracking_url?: string | null
    tracking_number?: string | null
}

type Props = {
    fulfillments?: Fulfillment[] | null
}

const EMPTY_FULFILLMENT: Fulfillment = {}

export function OrderShipmentSection({ fulfillments }: Props) {
    const items =
        fulfillments && fulfillments.length > 0
            ? fulfillments
            : [EMPTY_FULFILLMENT]

    return (
        <Box className={css.section} p="sm" display="block" mt="sm">
            <Box mb="xs">
                <Text size="md" variant="bold">
                    Shipment
                </Text>
            </Box>
            <Box flexDirection="column" gap="xs">
                {items.map((fulfillment, index) => (
                    <Box key={index} flexDirection="column" gap="xs">
                        <Box
                            display="grid"
                            w="100%"
                            alignItems="flex-start"
                            gap="xs"
                            className={css.row}
                        >
                            <Text as="span" size="md" className={css.label}>
                                Tracking URL
                            </Text>
                            {fulfillment.tracking_url ? (
                                <a
                                    href={fulfillment.tracking_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={css.trackingUrl}
                                >
                                    {fulfillment.tracking_url}
                                </a>
                            ) : (
                                <Text size="md">-</Text>
                            )}
                        </Box>
                        <Box
                            display="grid"
                            w="100%"
                            alignItems="flex-start"
                            gap="xs"
                            className={css.row}
                        >
                            <Text as="span" size="md" className={css.label}>
                                Tracking number
                            </Text>

                            <Text size="md">
                                {fulfillment.tracking_number ?? '-'}
                            </Text>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}
