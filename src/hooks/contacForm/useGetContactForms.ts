import { useMemo } from 'react'

import _flatten from 'lodash/flatten'

import { useGetContactFormList } from 'pages/settings/contactForm/queries'
import { notEmpty } from 'utils'

const MAX_NUMBER_OF_CONTACT_FORMS = 500

type ContactFormIntegration = {
    id: number
    channel: string
}
type ContactFormIntegrationWithoutName = ContactFormIntegration & {
    email_id: number
}

const CONTACT_FORM_CHANNEL = 'contact_form'
export const useGetContactFromIntegrationIdsForStore = ({
    shopName,
}: {
    shopName: string
}): {
    contactFormIntegrationsWithName: ContactFormIntegration[]
    contactFormIntegrationsWithoutName: ContactFormIntegrationWithoutName[]
} => {
    const getContactFormList = useGetContactFormList(
        {},
        MAX_NUMBER_OF_CONTACT_FORMS,
    )

    const result = useMemo(() => {
        const contactFormIntegrationsWithName: ContactFormIntegration[] = []
        const contactFormIntegrationsWithoutName: ContactFormIntegrationWithoutName[] =
            []

        if (
            getContactFormList.status === 'success' &&
            getContactFormList.data
        ) {
            const allContactFormListPageDto = getContactFormList.data.pages
                .filter(notEmpty)
                .map((page) => page.data)

            const allContactForms = _flatten(allContactFormListPageDto).filter(
                notEmpty,
            )

            allContactForms.forEach((cf) => {
                if (
                    cf.shop_integration?.shop_name === shopName &&
                    cf.integration_id
                ) {
                    contactFormIntegrationsWithName.push({
                        id: cf.integration_id,
                        channel: CONTACT_FORM_CHANNEL,
                    })
                } else {
                    if (cf?.email_integration?.id && cf.integration_id) {
                        contactFormIntegrationsWithoutName.push({
                            id: cf.integration_id,
                            email_id: cf.email_integration.id,
                            channel: CONTACT_FORM_CHANNEL,
                        })
                    }
                }
            })
        }

        return {
            contactFormIntegrationsWithName,
            contactFormIntegrationsWithoutName,
        }
    }, [shopName, getContactFormList.status, getContactFormList.data])

    return result
}
