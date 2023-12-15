import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {ContactForm, ContactFormPageEmbedment} from 'models/contactForm/types'
import {FeatureFlagKey} from 'config/featureFlags'
import {useShopifyIntegrationAndScope} from 'pages/common/hooks/useShopifyIntegrationAndScope'
import ContactFormAutoEmbedWarningBanner, {
    ContactFormAutoEmbedWarningBannerProps,
} from '../ContactFormAutoEmbedWarningBanner'
import ContactFormAutoEmbedCard from '../ContactFormAutoEmbedCard'
import {ContactFormAutoEmbedReadinessStatus} from './types'

export type ContactFormAutoEmbedPublishSectionProps = {
    contactFormShopName: ContactForm['shop_name']
    contactFormId: ContactForm['id']
    pageEmbedments: ContactFormPageEmbedment[]
    isDisabled?: boolean
}

const ContactFormAutoEmbedPublishSection = (
    props: ContactFormAutoEmbedPublishSectionProps
) => {
    const {contactFormShopName, contactFormId, pageEmbedments} = props

    const isAutoEmbedFlagActive =
        useFlags()[FeatureFlagKey.ContactFormAutoEmbed] ?? false

    const {integrationId, needScopeUpdate} = useShopifyIntegrationAndScope(
        contactFormShopName ?? ''
    )

    // hide this entire section if the flag is not active
    if (!isAutoEmbedFlagActive) return null

    // CF connected to a Shopify store and not needing a scope update
    const canAutoEmbed = Boolean(integrationId && !needScopeUpdate)

    // Compute the banner details
    let bannerDetails: ContactFormAutoEmbedWarningBannerProps['details'] =
        undefined
    if (!canAutoEmbed) {
        if (!contactFormShopName) {
            bannerDetails = {
                type: ContactFormAutoEmbedReadinessStatus.NOT_CONNECTED,
                entityId: contactFormId,
            }
        } else if (needScopeUpdate && integrationId) {
            bannerDetails = {
                type: ContactFormAutoEmbedReadinessStatus.NEED_PERMISSION_UPDATE,
                entityId: integrationId,
            }
        }
    }

    return (
        <>
            <ContactFormAutoEmbedWarningBanner details={bannerDetails} />
            <ContactFormAutoEmbedCard
                isDisabled={props.isDisabled}
                isNotConnected={contactFormShopName === null}
                shopifyIntegrationId={integrationId}
                needScopeUpdate={needScopeUpdate}
                pageEmbedments={pageEmbedments}
                hasEmbeddedPages={pageEmbedments.length > 0}
                contactFormId={contactFormId}
            />
        </>
    )
}

export default ContactFormAutoEmbedPublishSection
