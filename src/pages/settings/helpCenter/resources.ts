import {
    CreateShopifyPageEmbedmentDto,
    UpdateShopifyPageEmbedmentDto,
} from 'models/contactForm/types'
import {HelpCenterClient} from 'rest_api/help_center_api/client'
import {Paths} from 'rest_api/help_center_api/client.generated'

export const getShopifyPages = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.ListHelpCenterShopifyPages.PathParameters
) => {
    if (!client) return null

    const res = await client.listHelpCenterShopifyPages(pathParameters)

    return res.data
}

export const getPageEmbedments = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.ListHelpCenterShopifyPageEmbedments.PathParameters
) => {
    if (!client) return null

    const res = await client.listHelpCenterShopifyPageEmbedments(pathParameters)

    return res.data
}

export const createPageEmbedment = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.CreateHelpCenterShopifyPageEmbedment.PathParameters,
    body: CreateShopifyPageEmbedmentDto
) => {
    if (!client) return null

    const res = await client.createHelpCenterShopifyPageEmbedment(
        pathParameters,
        body
    )

    return res.data
}

export const updatePageEmbedment = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.UpdateHelpCenterShopifyPageEmbedment.PathParameters,
    body: UpdateShopifyPageEmbedmentDto
) => {
    if (!client) return null

    const res = await client.updateHelpCenterShopifyPageEmbedment(
        pathParameters,
        body
    )

    return res.data
}

export const deletePageEmbedment = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.DeleteHelpCenterShopifyPageEmbedment.PathParameters
) => {
    if (!client) return null

    await client.deleteHelpCenterShopifyPageEmbedment(pathParameters)

    return null
}

export const getArticleTemplates = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.ListArticleTemplates.QueryParameters
) => {
    if (!client) return null

    const res = await client.listArticleTemplates(pathParameters)

    return res.data
}

type ExtendedPathParameters = {
    template_key: Paths.GetArticleTemplate.Parameters.TemplateKey | null
}

export const getArticleTemplate = async (
    client: HelpCenterClient | undefined,
    pathParameters: ExtendedPathParameters,
    queryParameters: Paths.GetArticleTemplate.QueryParameters
) => {
    const isPathParameter = (
        pathParameters: ExtendedPathParameters
    ): pathParameters is Paths.GetArticleTemplate.PathParameters => {
        return pathParameters.template_key !== null
    }

    if (!client || !isPathParameter(pathParameters)) return null

    const parameters = {
        ...pathParameters,
        ...queryParameters,
    }

    const res = await client.getArticleTemplate(parameters)

    return res.data
}

export const getAIGeneratedArticles = async (
    client: HelpCenterClient | undefined
) => {
    if (!client) return null

    const res = await client.listAIArticleTemplates()

    return res.data
}

export const getAIGeneratedArticlesByHelpCenter = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.ListAIArticleTemplatesByHelpCenter.PathParameters
) => {
    if (!client) return null

    const res = await client.listAIArticleTemplatesByHelpCenter(pathParameters)

    return res.data
}

export const getAIGeneratedArticlesByHelpCenterAndStore = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.ListAIArticleTemplatesByHelpCenterAndStore.PathParameters
) => {
    if (!client) return null

    const res = await client.listAIArticleTemplatesByHelpCenterAndStore(
        pathParameters
    )

    return res.data
}

export const upsertArticleTemplateReview = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.UpsertArticleTemplateReview.PathParameters,
    body: Paths.UpsertArticleTemplateReview.RequestBody
) => {
    if (!client) return null

    await client.upsertArticleTemplateReview(pathParameters, body)

    return null
}
