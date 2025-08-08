import { useQuery } from '@tanstack/react-query'

import { getSmsIntegrations } from '@gorgias/convert-client'

import { useAccessToken } from 'AIJourney/providers'
import { getGorgiasRevenueAddonApiBaseUrl } from 'rest_api/revenue_addon_api/client'

const getSmsIntegrationsInUse = async (accessToken: string) => {
    if (!accessToken) {
        throw new Error(`Missing access token: ${accessToken}`)
    }

    const response = await getSmsIntegrations({
        baseURL: getGorgiasRevenueAddonApiBaseUrl(),
        headers: { Authorization: accessToken },
    })

    return response.data
}

export const useSmsIntegrations = (options: { enabled?: boolean } = {}) => {
    const accessToken = useAccessToken()
    return useQuery({
        queryKey: ['getSmsIntegrations'],
        queryFn: () => getSmsIntegrationsInUse(accessToken!),
        enabled: true,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        ...options,
    })
}
