import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import useAppSelector from 'hooks/useAppSelector'
import type { ContactForm } from 'models/contactForm/types'
import type { Integration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import SelfServicePreviewContext from 'pages/automate/common/components/preview/SelfServicePreviewContext'
import SelfServiceStandaloneContactFormHomePage from 'pages/automate/common/components/preview/SelfServiceStandaloneContactFormHomePage'
import useContactFormAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import useSelfServiceConfiguration from 'pages/automate/common/hooks/useSelfServiceConfiguration'
import { getIntegrationsByType } from 'state/integrations/selectors'

import StandaloneContactFormPreview from '../StandaloneContactFormPreview/StandaloneContactFormPreview'

export type ContactFormEntrypointPreviewProps = {
    contactForm: ContactForm
    isFormHidden: boolean
}

const ContactFormEntrypointPreview = ({
    contactForm,
    isFormHidden,
}: ContactFormEntrypointPreviewProps) => {
    const integrations = useAppSelector(
        getIntegrationsByType(IntegrationType.Shopify),
    )
    const contactFormShopIntegration = integrations?.find(
        (integration) =>
            integration.id === contactForm.shop_integration?.integration_id,
    )
    const { hasAccess } = useAiAgentAccess(contactForm?.shop_name || undefined)
    if (contactFormShopIntegration && hasAccess) {
        return (
            <ContactFormWithShopIntegration
                contactForm={contactForm}
                isFormHidden={isFormHidden}
                shopIntegration={contactFormShopIntegration}
            />
        )
    }

    return (
        <SelfServicePreviewContext.Provider
            value={{
                selfServiceConfiguration: undefined,
                workflowsEntrypoints: undefined,
            }}
        >
            <StandaloneContactFormPreview name={contactForm.name}>
                <SelfServiceStandaloneContactFormHomePage
                    locale={contactForm.default_locale}
                    formIsHidden={isFormHidden}
                    scrollToView
                />
            </StandaloneContactFormPreview>
        </SelfServicePreviewContext.Provider>
    )
}

export const ContactFormWithShopIntegration = ({
    contactForm,
    isFormHidden,
    shopIntegration,
}: ContactFormEntrypointPreviewProps & { shopIntegration: Integration }) => {
    const shopType = shopIntegration?.type || ''
    const shopName = shopIntegration?.name || ''
    const { selfServiceConfiguration } = useSelfServiceConfiguration(
        shopType,
        shopName,
    )

    let isOrderManagementEnabled = false
    let workflowsEntrypoints:
        | { workflow_id: string; enabled: boolean }[]
        | undefined

    const { automationSettings } = useContactFormAutomationSettings(
        contactForm.id,
    )
    if (automationSettings !== undefined) {
        isOrderManagementEnabled = automationSettings.order_management.enabled
        workflowsEntrypoints = automationSettings.workflows.map(
            ({ id, enabled }) => ({ workflow_id: id, enabled }),
        )
    }

    return (
        <SelfServicePreviewContext.Provider
            value={{
                selfServiceConfiguration: isOrderManagementEnabled
                    ? selfServiceConfiguration
                    : undefined,
                workflowsEntrypoints,
            }}
        >
            <StandaloneContactFormPreview name={contactForm.name}>
                <SelfServiceStandaloneContactFormHomePage
                    locale={contactForm.default_locale}
                    formIsHidden={isFormHidden}
                    scrollToView
                />
            </StandaloneContactFormPreview>
        </SelfServicePreviewContext.Provider>
    )
}

export default ContactFormEntrypointPreview
