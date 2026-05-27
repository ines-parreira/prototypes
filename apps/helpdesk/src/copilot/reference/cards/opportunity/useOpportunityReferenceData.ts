import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { useFindOneOpportunity } from 'pages/aiAgent/opportunities/hooks/useFindOneOpportunity'

type Params = {
    shopName: string
    opportunityId: number
    enabled: boolean
}

/**
 * Two-step lookup matching the opportunities page: first resolve the shop
 * integration id from the shop name (Redux state, no network), then fetch
 * the opportunity itself. Both stay disabled until the popover opens.
 */
export function useOpportunityReferenceData({
    shopName,
    opportunityId,
    enabled,
}: Params) {
    const shopIntegrationId = useShopIntegrationId(shopName)

    const { data, isLoading, isError } = useFindOneOpportunity(
        shopIntegrationId ?? 0,
        opportunityId,
        {
            query: {
                enabled: enabled && !!shopIntegrationId,
                refetchOnWindowFocus: false,
            },
        },
    )

    return {
        opportunity: data,
        isLoading: enabled && (!shopIntegrationId || isLoading),
        isError,
    }
}
