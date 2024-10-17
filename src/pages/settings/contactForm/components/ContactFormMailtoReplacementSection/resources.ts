import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {Paths} from 'rest_api/help_center_api/client.generated'

export const upsertMailtoReplacementConfig = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.UpsertContactFormShopifyMailtoReplacement.PathParameters,
    body: Paths.UpsertContactFormShopifyMailtoReplacement.RequestBody
) => {
    if (!client) return null
    const res = await client.upsertContactFormShopifyMailtoReplacement(
        pathParameters,
        body
    )

    return {data: res.data, statusCode: res.status}
}

export const getMailtoReplacementConfig = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.GetContactFormMailtoReplacementConfig.PathParameters
) => {
    if (!client) return null
    const res =
        await client.getContactFormMailtoReplacementConfig(pathParameters)

    return res.data
}
