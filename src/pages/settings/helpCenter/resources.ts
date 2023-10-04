import {
    CreateShopifyPageEmbedmentDto,
    UpdateShopifyPageEmbedmentDto,
} from 'models/contactForm/types'
import {HelpCenterClient} from '../../../rest_api/help_center_api'
import {Paths} from '../../../rest_api/help_center_api/client.generated'

export const getShopifyPages = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.ListContactFormShopifyPages.PathParameters
) => {
    if (!client) return null

    const res = await client.listContactFormShopifyPages(pathParameters)

    return res.data
}

export const getPageEmbedments = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.ListContactFormShopifyPageEmbedments.PathParameters
) => {
    if (!client) return null

    const res = await client.listContactFormShopifyPageEmbedments(
        pathParameters
    )

    return res.data
}

export const createPageEmbedment = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.CreateContactFormShopifyPageEmbedment.PathParameters,
    body: CreateShopifyPageEmbedmentDto
) => {
    if (!client) return null

    const res = await client.createContactFormShopifyPageEmbedment(
        pathParameters,
        body
    )

    return res.data
}

export const updatePageEmbedment = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.UpdateContactFormShopifyPageEmbedment.PathParameters,
    body: UpdateShopifyPageEmbedmentDto
) => {
    if (!client) return null

    const res = await client.updateContactFormShopifyPageEmbedment(
        pathParameters,
        body
    )

    return res.data
}

export const deletePageEmbedment = async (
    client: HelpCenterClient | undefined,
    pathParameters: Paths.DeleteContactFormShopifyPageEmbedment.PathParameters
) => {
    if (!client) return null

    await client.deleteContactFormShopifyPageEmbedment(pathParameters)

    return null
}
