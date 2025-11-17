import type { HelpCenterClient } from 'rest_api/help_center_api/client'
import type { Paths } from 'rest_api/help_center_api/client.generated'

export const getAIGeneratedGuidances = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.ListAIGuidancesByHelpCenterAndStore.PathParameters,
) => {
    if (!client) return null

    const res = await client.listAIGuidancesByHelpCenterAndStore(pathParameters)

    return res.data
}
