import { Box, Card, CardHeader, Heading, Link, Text } from '@gorgias/axiom'

import { useJourneyContext } from 'AIJourney/providers'
import { getAiAgentNavigationRoutes } from 'pages/aiAgent/hooks/useAiAgentNavigation'

const CARD_DESCRIPTION = (
    <Text color="content-neutral-secondary">
        AI Journey uses the product catalog synced from Shopify to AI Agent,
        including inventory, variants, descriptions, and product page links.
    </Text>
)

export const ShopifyCard = () => {
    const { shopName } = useJourneyContext()
    const aiAgentProductsUrl = getAiAgentNavigationRoutes(shopName).products

    return (
        <Card gap="lg" width={610}>
            <CardHeader
                title={<Heading size="md">Shopify</Heading>}
                description={CARD_DESCRIPTION}
            />
            <Box flexDirection="row">
                <Link
                    href={aiAgentProductsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    trailingSlot="external-link"
                >
                    View product catalog in AI Agent
                </Link>
            </Box>
        </Card>
    )
}
