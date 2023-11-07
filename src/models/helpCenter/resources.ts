import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {Paths} from 'rest_api/help_center_api/client.generated'

export const getHelpCenterArticles = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.ListArticles.PathParameters,
    queryParams: Paths.ListArticles.QueryParameters
) => {
    if (!client) return null

    const response = await client.listArticles({
        ...pathParams,
        ...queryParams,
    })

    return response.data
}
