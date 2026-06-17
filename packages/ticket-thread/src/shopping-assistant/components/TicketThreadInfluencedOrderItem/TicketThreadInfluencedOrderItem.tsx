import { Box, Icon, Text } from '@gorgias/axiom'

import { TicketThreadEventContainer } from '#events/components/TicketThreadEventItem/components/TicketThreadEventContainer'
import { TicketThreadEventDateTime } from '#events/components/TicketThreadEventItem/components/TicketThreadEventDateTime'
import { InfluencedOrderSource } from '#shopping-assistant/constants'
import type { TicketThreadInfluencedOrderItem as TicketThreadInfluencedOrderItemType } from '#shopping-assistant/types'

type TicketThreadInfluencedOrderItemProps = {
    item: TicketThreadInfluencedOrderItemType
}

function getInfluencedByLabel(influencedBy: InfluencedOrderSource): string {
    switch (influencedBy) {
        case InfluencedOrderSource.AI_JOURNEY:
            return 'AI Journey'
        case InfluencedOrderSource.SHOPPING_ASSISTANT:
        case InfluencedOrderSource.AI_AGENT:
            return 'Shopping Assistant'
    }
}

function getShopifyOrderUrl({
    orderId,
    shopName,
}: TicketThreadInfluencedOrderItemType['data']): string {
    return `https://admin.shopify.com/store/${shopName}/orders/${orderId}`
}

export function TicketThreadInfluencedOrderItem({
    item,
}: TicketThreadInfluencedOrderItemProps) {
    const { data } = item

    return (
        <TicketThreadEventContainer>
            <Icon name="shopping-bag" />
            <a
                href={getShopifyOrderUrl(data)}
                target="_blank"
                rel="noopener noreferrer"
            >
                <Text size="sm" variant="medium">
                    {`Order #${data.orderNumber}`}
                </Text>
            </a>
            <Text size="sm">influenced</Text>
            <Box alignItems="center" gap="xxxs">
                <Text size="sm">{'via '}</Text>
                <Icon name="ai-alt-1" size="sm" />
                <Text size="sm" variant="medium">
                    {getInfluencedByLabel(data.influencedBy)}
                </Text>
            </Box>
            <TicketThreadEventDateTime datetime={data.created_datetime} />
        </TicketThreadEventContainer>
    )
}
