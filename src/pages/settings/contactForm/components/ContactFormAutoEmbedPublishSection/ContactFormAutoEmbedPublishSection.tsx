import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {ContactForm, PageEmbedment} from 'models/contactForm/types'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getShopifyIntegrationByShopName} from 'state/integrations/selectors'
import ContactFormAutoEmbedWarningBanner, {
    ContactFormAutoEmbedWarningBannerProps,
} from '../ContactFormAutoEmbedWarningBanner'
import ContactFormAutoEmbedCard from '../ContactFormAutoEmbedCard'
import {ContactFormAutoEmbedReadinessStatus} from './types'

/**
 * Search for a Shopify integration by shop name
 * and return the integration id if found and if it needs to be updated
 */
const useShopifyIntegrationAndScope = (
    shopName: string
): {
    integrationId: number | null
    needScopeUpdate: boolean
} => {
    const shopifyIntegration = useAppSelector(
        getShopifyIntegrationByShopName(shopName)
    )

    const needScopeUpdate = !shopifyIntegration.isEmpty()
        ? Boolean(
              shopifyIntegration.getIn(['meta', 'need_scope_update'], false)
          )
        : false

    return {
        integrationId: shopifyIntegration.getIn(['id'], null),
        needScopeUpdate,
    }
}

export type ContactFormAutoEmbedPublishSectionProps = {
    contactFormShopName: ContactForm['shop_name']
    contactFormId: ContactForm['id']
    pageEmbedments: PageEmbedment[]
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
        <section>
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
        </section>
    )
}

export default ContactFormAutoEmbedPublishSection
