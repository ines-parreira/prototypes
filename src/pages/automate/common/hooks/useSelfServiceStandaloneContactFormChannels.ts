import { useMemo } from 'react'

import { TicketChannel } from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import { ContactForm } from 'models/contactForm/types'
import { IntegrationType } from 'models/integration/constants'
import { getContactFormsList } from 'state/entities/contactForm/contactForms'

export type SelfServiceStandaloneContactFormChannel = {
    type: TicketChannel.ContactForm
    value: ContactForm
}

const useSelfServiceStandaloneContactFormChannels = (
    shopType: string,
    shopName: string,
) => {
    const contactForms = useAppSelector(getContactFormsList)
    return useMemo<SelfServiceStandaloneContactFormChannel[]>(() => {
        if (
            ![
                IntegrationType.Shopify,
                IntegrationType.BigCommerce,
                IntegrationType.Magento2,
            ].includes(shopType as IntegrationType)
        ) {
            return []
        }
        return contactForms
            .filter(
                (contactForm) =>
                    contactForm.help_center_id === null &&
                    (contactForm.shop_integration?.shop_name === shopName ||
                        contactForm.shop_name === shopName),
            )
            .map((contactForm) => ({
                type: TicketChannel.ContactForm,
                value: contactForm,
            }))
    }, [contactForms, shopType, shopName])
}

export default useSelfServiceStandaloneContactFormChannels
