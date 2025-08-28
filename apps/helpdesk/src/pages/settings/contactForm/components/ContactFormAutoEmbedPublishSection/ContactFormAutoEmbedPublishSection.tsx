import { FeatureFlagKey } from '@repo/feature-flags'

import { useFlag } from 'core/flags'
import { ContactForm, ContactFormPageEmbedment } from 'models/contactForm/types'
import { useShopifyIntegrationAndScope } from 'pages/common/hooks/useShopifyIntegrationAndScope'

import ContactFormAutoEmbedCard from '../ContactFormAutoEmbedCard'

export type ContactFormAutoEmbedPublishSectionProps = {
    contactFormShopName: string | null
    contactFormId: ContactForm['id']
    pageEmbedments: ContactFormPageEmbedment[]
    isDisabled?: boolean
}

const ContactFormAutoEmbedPublishSection = (
    props: ContactFormAutoEmbedPublishSectionProps,
) => {
    const { contactFormShopName, contactFormId, pageEmbedments } = props

    const isAutoEmbedFlagActive = useFlag(
        FeatureFlagKey.ContactFormAutoEmbed,
        false,
    )

    const { integrationId, needScopeUpdate } = useShopifyIntegrationAndScope(
        contactFormShopName ?? '',
    )

    // hide this entire section if the flag is not active
    if (!isAutoEmbedFlagActive) return null

    return (
        <ContactFormAutoEmbedCard
            isDisabled={props.isDisabled}
            isNotConnected={contactFormShopName === null}
            shopifyIntegrationId={integrationId}
            needScopeUpdate={needScopeUpdate}
            pageEmbedments={pageEmbedments}
            hasEmbeddedPages={pageEmbedments.length > 0}
            contactFormId={contactFormId}
        />
    )
}

export default ContactFormAutoEmbedPublishSection
