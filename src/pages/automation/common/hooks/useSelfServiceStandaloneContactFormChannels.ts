import {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/constants'
import {TicketChannel} from 'business/types/ticket'
import {getContactFormsList} from 'state/entities/contactForm/contactForms'
import {ContactForm} from 'models/contactForm/types'

export type SelfServiceStandaloneContactFormChannel = {
    type: TicketChannel.ContactForm
    value: ContactForm
}

const useSelfServiceStandaloneContactFormChannels = (
    shopType: string,
    shopName: string
) => {
    const contactForms = useAppSelector(getContactFormsList)

    return useMemo<SelfServiceStandaloneContactFormChannel[]>(() => {
        if (shopType !== IntegrationType.Shopify) {
            return []
        }

        return contactForms
            .filter(
                (contactForm) =>
                    contactForm.help_center_id === null &&
                    contactForm.shop_name === shopName
            )
            .map((contactForm) => ({
                type: TicketChannel.ContactForm,
                value: contactForm,
            }))
    }, [contactForms, shopType, shopName])
}

export default useSelfServiceStandaloneContactFormChannels
