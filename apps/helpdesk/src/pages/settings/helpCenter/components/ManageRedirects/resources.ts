import { HelpCenterClient } from 'rest_api/help_center_api/client'
import { Paths } from 'rest_api/help_center_api/client.generated'

export const getHelpCenterRedirects = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.ListRedirects.PathParameters,
    queryParams: Paths.ListRedirects.QueryParameters = {},
) => {
    if (!client) return null
    const res = await client.listRedirects({
        ...pathParams,
        ...queryParams,
    })

    return res.data
}

export const createHelpCenterRedirect = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.CreateRedirect.PathParameters,
    data: Paths.CreateRedirect.RequestBody,
) => {
    if (!client) return null

    const res = await client.createRedirect(
        {
            ...pathParams,
        },
        {
            ...data,
        },
    )

    return res.data
}

export const deleteHelpCenterRedirect = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.DeleteRedirect.PathParameters,
    queryParams: Paths.DeleteRedirect.QueryParameters,
) => {
    if (!client) return null

    await client.deleteRedirect({
        ...pathParams,
        ...queryParams,
    })
}
