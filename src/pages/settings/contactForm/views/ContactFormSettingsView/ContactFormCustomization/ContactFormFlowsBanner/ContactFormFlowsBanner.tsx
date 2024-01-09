import React from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getCurrentAutomationProduct} from 'state/billing/selectors'
import useContactFormsAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import FlowsBanner from 'pages/settings/contactForm/components/FlowsBanner'

type Props = {
    contactFormId: number
    shopName: string
}

const ContactFormFlowsBanner = ({contactFormId, shopName}: Props) => {
    const automationProduct = useAppSelector(getCurrentAutomationProduct)
    const {automationSettings, isFetchPending} =
        useContactFormsAutomationSettings(contactFormId)
    const hasFlowsEnabled = automationSettings.workflows.some(
        (workflow) => workflow.enabled
    )

    if (hasFlowsEnabled || isFetchPending) {
        return null
    }

    return (
        <FlowsBanner
            isSubscribedToAutomation={!!automationProduct}
            contactFormId={contactFormId}
            shopName={shopName}
        />
    )
}

export default ContactFormFlowsBanner
