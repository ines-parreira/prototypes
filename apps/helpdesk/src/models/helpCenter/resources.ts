import axios from 'axios'

import type { HelpCenterClient } from 'rest_api/help_center_api/client'
import type { Paths } from 'rest_api/help_center_api/client.generated'

import type {
    KnowledgeHubArticlesQueryParams,
    KnowledgeHubArticlesResponse,
} from './types'

export const getHelpCenterArticles = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.ListArticles.PathParameters,
    queryParams: Paths.ListArticles.QueryParameters,
) => {
    if (!client) return null

    const response = await client.listArticles({
        ...pathParams,
        ...queryParams,
    })

    return response.data
}

export const getHelpCenterStatistics = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetStatistics.PathParameters,
    queryParams: Paths.GetStatistics.QueryParameters,
) => {
    if (!client) return null

    const response = await client.getStatistics({
        ...pathParams,
        ...queryParams,
    })

    return response.data
}

export const getCategoryTree = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetCategoryTree.PathParameters,
    queryParams: Paths.GetCategoryTree.QueryParameters,
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
    queryParams: Paths.GetArticle.QueryParameters,
    options?: { throwOn404?: boolean },
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
            if (options?.throwOn404) {
                throw error
            }
            return null
        }
        throw error
    }
}

export const getHelpCenter = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetHelpCenter.PathParameters,
    queryParams: Paths.GetHelpCenter.QueryParameters,
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
    data: Paths.CreateHelpCenter.RequestBody,
) => {
    if (!client) return null
    const response = await client.createHelpCenter(null, data)
    return response
}

export const updateHelpCenter = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.UpdateHelpCenter.PathParameters,
    data: Paths.UpdateHelpCenter.RequestBody,
) => {
    if (!client) return null
    const response = await client.updateHelpCenter(pathParams, data)
    return response
}

export const createHelpCenterTranslation = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.CreateHelpCenterTranslation.PathParameters,
    data: Paths.CreateHelpCenterTranslation.RequestBody,
) => {
    if (!client) return null
    const response = await client.createHelpCenterTranslation(pathParams, data)
    return response
}

export const deleteHelpCenterTranslation = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.DeleteHelpCenterTranslation.PathParameters,
) => {
    if (!client) return null
    const response = await client.deleteHelpCenterTranslation(pathParams)
    return response
}

export const checkHelpCenterWithSubdomainExists = async (
    client: HelpCenterClient | undefined,
    data: Paths.CheckHelpCenterWithSubdomainExists.PathParameters,
) => {
    if (!client) return null

    const response = await client.checkHelpCenterWithSubdomainExists(data)
    return response
}

export const createArticle = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.CreateArticle.PathParameters,
    data: Paths.CreateArticle.RequestBody,
) => {
    if (!client) return null
    const response = await client.createArticle(pathParams, data)
    return response
}

export const deleteArticle = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.DeleteArticle.PathParameters,
) => {
    if (!client) return null
    const response = await client.deleteArticle(pathParams)
    return response
}

export const bulkDeleteArticles = async (
    client: HelpCenterClient | undefined,
    pathParams: { help_center_id: number },
    body: { article_ids: number[] },
) => {
    if (!client) return null
    const response = await client.bulkDeleteArticles(pathParams, body)
    return response.data
}

export const bulkCopyArticles = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.BulkCopyArticles.PathParameters,
    body: Paths.BulkCopyArticles.RequestBody,
) => {
    if (!client) return null
    const response = await client.bulkCopyArticles(pathParams, body)
    return response.data
}

export const bulkUpdateArticleTranslationVisibility = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.BulkUpdateArticleTranslationsVisibility.PathParameters,
    body: Paths.BulkUpdateArticleTranslationsVisibility.RequestBody,
) => {
    if (!client) return null
    const response = await client.bulkUpdateArticleTranslationsVisibility(
        pathParams,
        body,
    )
    return response.data
}

export const updateArticleTranslation = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.UpdateArticleTranslation.PathParameters,
    data: Paths.UpdateArticleTranslation.RequestBody,
) => {
    if (!client) return null
    const response = await client.updateArticleTranslation(pathParams, data)
    return response
}

export const copyArticle = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.CopyArticle.PathParameters,
    shopName: string,
) => {
    if (!client) return null
    const response = await client.copyArticle(pathParams, {
        shop_name: shopName,
    })
    return response
}

export const createArticleTranslation = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.CreateArticleTranslation.PathParameters,
    data: Paths.CreateArticleTranslation.RequestBody,
) => {
    if (!client) return null
    const response = await client.createArticleTranslation(pathParams, data)
    return response
}

export const deleteArticleTranslation = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.DeleteArticleTranslation.PathParameters,
) => {
    if (!client) return null
    const response = await client.deleteArticleTranslation(pathParams)
    return response
}

export const getHelpCenterList = async (
    client: HelpCenterClient | undefined,
    queryParams: Paths.ListHelpCenters.QueryParameters,
) => {
    if (!client) return null
    const response = await client.listHelpCenters(queryParams)
    return response
}

export const getArticleIngestionLogs = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetArticleIngestionLogs.PathParameters &
        Paths.GetArticleIngestionLogs.QueryParameters,
) => {
    if (!client) return null
    const response = await client.getArticleIngestionLogs(pathParams)
    return response.data
}

export const getArticleIngestionArticleTitlesAndStatus = async (
    client: HelpCenterClient | undefined,
    pathParams: {
        help_center_id: number
        article_ingestion_id: number
    },
) => {
    if (!client) return null
    const response =
        await client.getArticleIngestionArticleTitlesAndStatus(pathParams)
    return response.data
}

export const deleteArticleIngestionLog = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.DeleteArticleIngestionLog.PathParameters,
) => {
    if (!client) return null
    const response = await client.deleteArticleIngestionLog(pathParams)

    return response
}

export const getIngestionLogs = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetIngestionLogs.PathParameters &
        Paths.GetIngestionLogs.QueryParameters,
) => {
    if (!client) return null
    const response = await client.getIngestionLogs(pathParams)
    return response.data
}

export const startIngestion = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.StartIngestion.PathParameters,
    data: Paths.StartIngestion.RequestBody,
) => {
    if (!client) return null
    const response = await client.startIngestion(pathParams, data)

    return response
}

export const listIngestedResources = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.ListIngestedResources.PathParameters,
    queryParams: Paths.ListIngestedResources.QueryParameters,
) => {
    if (!client) return null
    const response = await client.listIngestedResources({
        ...pathParams,
        ...queryParams,
    })
    return response.data
}

export const getIngestedResource = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetIngestedResource.PathParameters,
) => {
    if (!client) return null
    const response = await client.getIngestedResource(pathParams)
    return response.data
}

export const updateIngestedResource = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.UpdateIngestedResource.PathParameters,
    data: Paths.UpdateIngestedResource.RequestBody,
) => {
    if (!client) return null
    const response = await client.updateIngestedResource(pathParams, data)
    return response
}

export const updateAllIngestedResourcesStatus = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.UpdateAllIngestedResourcesStatus.PathParameters,
    data: Paths.UpdateAllIngestedResourcesStatus.RequestBody,
) => {
    if (!client) return null
    const response = await client.updateAllIngestedResourcesStatus(
        pathParams,
        data,
    )
    return response
}

export const createFileIngestion = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.CreateFileIngestion.PathParameters,
    data: Paths.CreateFileIngestion.RequestBody,
) => {
    if (!client) return null
    const response = await client.createFileIngestion(pathParams, data)
    return response
}

export const getFileIngestion = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetFileIngestion.PathParameters,
) => {
    if (!client) return null
    const response = await client.getFileIngestion(pathParams)
    return response
}

export const deleteFileIngestion = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.DeleteFileIngestion.PathParameters,
) => {
    if (!client) return null
    const response = await client.deleteFileIngestion(pathParams)
    return response
}

export const getFileIngestionArticleTitlesAndStatus = async (
    client: HelpCenterClient | undefined,
    pathParams: {
        help_center_id: number
        file_ingestion_id: number
    },
) => {
    if (!client) return null
    const response =
        await client.getFileIngestionArticleTitlesAndStatus(pathParams)
    return response.data
}

export const getKnowledgeStatus = async (
    client: HelpCenterClient | undefined,
) => {
    if (!client) return null
    const response = await client.getKnowledgeStatus()
    return response.data
}

export const getKnowledgeHubArticles = async (
    client: HelpCenterClient | undefined,
    queryParams: KnowledgeHubArticlesQueryParams,
) => {
    if (!client) return null

    const response = await client.get<KnowledgeHubArticlesResponse>(
        '/api/help-center/help-centers/knowledge-hub-articles',
        {
            params: queryParams,
        },
    )

    return response.data
}

export const deleteArticleTranslationDraft = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.DeleteArticleTranslationDraft.PathParameters,
) => {
    if (!client) return null
    const response = await client.deleteArticleTranslationDraft(pathParams)
    return response
}

export const listArticleTranslationVersions = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.ListArticleTranslationVersions.PathParameters,
    queryParams?: Paths.ListArticleTranslationVersions.QueryParameters,
) => {
    if (!client) return null
    const response = await client.listArticleTranslationVersions({
        ...pathParams,
        ...queryParams,
    })
    return response.data
}

export const getArticleTranslationVersion = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetArticleTranslationVersion.PathParameters,
) => {
    if (!client) return null
    const response = await client.getArticleTranslationVersion(pathParams)
    return response.data
}

export const getArticleTranslationIntents = async (
    client: HelpCenterClient | undefined,
    pathParams: Paths.GetArticleTranslationIntents.PathParameters,
) => {
    if (!client) return null
    const response = await client.getArticleTranslationIntents(pathParams)
    return response.data
}
