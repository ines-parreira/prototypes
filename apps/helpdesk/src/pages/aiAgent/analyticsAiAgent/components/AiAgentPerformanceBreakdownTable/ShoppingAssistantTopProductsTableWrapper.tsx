import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { Box, Skeleton } from '@gorgias/axiom'

import { ShoppingAssistantTopProductsTable } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantTopProductsTable'

import { ShoppingAssistantTopProductsTable as LegacyShoppingAssistantTopProductsTable } from './ShoppingAssistantTopProductsTable'

export const ShoppingAssistantTopProductsTableWrapper = () => {
    const { value: isNewTableEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )

    if (isLoading) {
        return (
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                width="100%"
                padding="xl"
            >
                <Skeleton width={200} height={200} />
            </Box>
        )
    }

    if (isNewTableEnabled) {
        return <ShoppingAssistantTopProductsTable />
    }

    return <LegacyShoppingAssistantTopProductsTable />
}
