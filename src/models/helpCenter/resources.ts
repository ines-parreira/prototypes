import axios from 'axios'
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

export const getCategoryTree = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetCategoryTree.PathParameters,
    queryParams: Paths.GetCategoryTree.QueryParameters
) => {
    if (!client) return null

    const response = await client.getCategoryTree({
        ...pathParams,
        ...queryParams,
    })

    return response.data
}

export const getHelpCenterArticle = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetArticle.PathParameters,
    queryParams: Paths.GetArticle.QueryParameters
) => {
    if (!client) return null

    try {
        const response = await client.getArticle({
            ...pathParams,
            ...queryParams,
        })
        return response.data
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return null
        }
        throw error
    }
}

export const getHelpCenter = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetHelpCenter.PathParameters,
    queryParams: Paths.GetHelpCenter.QueryParameters
) => {
    if (!client) return null

    const response = await client.getHelpCenter({
        ...pathParams,
        ...queryParams,
    })
    return response.data
}

export const createHelpCenter = async (
    client: HelpCenterClient | undefined,
    data: Paths.CreateHelpCenter.RequestBody
) => {
    if (!client) return null
    const response = await client.createHelpCenter(null, data)
    return response
}

export const updateHelpCenter = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.UpdateHelpCenter.PathParameters,
    data: Paths.UpdateHelpCenter.RequestBody
) => {
    if (!client) return null
    const response = await client.updateHelpCenter(pathParams, data)
    return response
}

export const createHelpCenterTranslation = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.CreateHelpCenterTranslation.PathParameters,
    data: Paths.CreateHelpCenterTranslation.RequestBody
) => {
    if (!client) return null
    const response = await client.createHelpCenterTranslation(pathParams, data)
    return response
}

export const deleteHelpCenterTranslation = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.DeleteHelpCenterTranslation.PathParameters
) => {
    if (!client) return null
    const response = await client.deleteHelpCenterTranslation(pathParams)
    return response
}

export const checkHelpCenterWithSubdomainExists = async (
    client: HelpCenterClient | undefined,
    data: Paths.CheckHelpCenterWithSubdomainExists.PathParameters
) => {
    if (!client) return null

    const response = await client.checkHelpCenterWithSubdomainExists(data)
    return response
}
