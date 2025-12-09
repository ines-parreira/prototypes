import { useQuery } from '@tanstack/react-query'

import { getSmsIntegrations } from '@gorgias/convert-client'

import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const getSmsIntegrationsInUse = async () => {
    const response = await getSmsIntegrations({
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
    })

    return response.data
}

export const useSmsIntegrations = (options: { enabled?: boolean } = {}) => {
    return useQuery({
        queryKey: ['getSmsIntegrations'],
        queryFn: () => getSmsIntegrationsInUse(),
        enabled: true,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        ...options,
    })
}
