import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { createBaseUrl } from 'models/aiAgent/resources/message-processing'
import { IntegrationType } from 'models/integration/constants'
import { HttpIntegration } from 'models/integration/types'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { isProduction } from 'utils/environment'

export const useAiAgentHttpIntegration = () => {
    const httpIntegrations = useAppSelector(
        getIntegrationsByType<HttpIntegration>(IntegrationType.Http),
    )

    const aiAgentIntegration = useMemo(() => {
        return httpIntegrations.find(
            (integration) => integration.name.toLowerCase() === 'ai agent',
        )
    }, [httpIntegrations])

    const baseUrl = useMemo(() => {
        // For production return default base url
        if (isProduction()) {
            return createBaseUrl()
        }

        if (aiAgentIntegration?.http?.url) {
            const url = aiAgentIntegration.http.url
            // Extract base URL by finding /api/ and taking everything before it
            const apiIndex = url.indexOf('/api/')
            if (apiIndex !== -1) {
                return url.substring(0, apiIndex)
            }
            // If /api/ is not found, try to extract origin from URL
            try {
                const urlObj = new URL(url)
                return urlObj.origin
            } catch {
                // If URL parsing fails, return as is
                return url
            }
        }
        // Fallback to default URL
        return createBaseUrl()
    }, [aiAgentIntegration])

    return {
        httpIntegrationId: aiAgentIntegration?.id || null,
        baseUrl,
        aiAgentIntegration,
    }
}
