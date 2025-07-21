import { CONTACT_FORM_ID_PARAM } from '../constants'

const ID_PARAM_REG_EXP = new RegExp(`\:${CONTACT_FORM_ID_PARAM}`, 'g')

export function insertContactFormIdParam(
    path: string,
    contactFormId: number | string,
): string {
    if (!ID_PARAM_REG_EXP.test(path)) {
        throw new Error(
            `Path "${path}" doesn't contain id param template (${CONTACT_FORM_ID_PARAM})`,
        )
    }

    return path.replace(ID_PARAM_REG_EXP, contactFormId.toString())
}

export function linkToContactFormPreferences(contactFormId: number): string {
    return `/app/settings/contact-form/${contactFormId}/preferences`
}

export function linkToShopifyIntegration(integrationId: number): string {
    return `/app/settings/integrations/shopify/${integrationId}`
}
