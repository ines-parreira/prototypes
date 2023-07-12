import {HelpCenterClient} from '../../../rest_api/help_center_api'
import {Paths} from '../../../rest_api/help_center_api/client.generated'

export const getContactForms = async (
    client: HelpCenterClient | undefined,
    queryParams: Paths.ListContactForms.QueryParameters = {}
) => {
    if (!client) return null
    const res = await client.listContactForms(queryParams)

    return res.data
}

export const createContactForm = async (
    client: HelpCenterClient | undefined,
    body: Paths.CreateContactForm.RequestBody
) => {
    if (!client) return null

    const res = await client.createContactForm(null, body)

    return res.data
}
