import useAppSelector from 'hooks/useAppSelector'
import useContactFormsAutomationSettings from 'pages/automate/common/hooks/useContactFormAutomationSettings'
import FlowsBanner from 'pages/settings/contactForm/components/FlowsBanner'
import { getCurrentAutomatePlan } from 'state/billing/selectors'

type Props = {
    contactFormId: number
    shopName: string
}

const ContactFormFlowsBanner = ({ contactFormId, shopName }: Props) => {
    const currentAutomatePlan = useAppSelector(getCurrentAutomatePlan)
    const { automationSettings, isFetchPending } =
        useContactFormsAutomationSettings(contactFormId)
    const hasFlowsEnabled = automationSettings.workflows.some(
        (workflow) => workflow.enabled,
    )

    if (hasFlowsEnabled || isFetchPending) {
        return null
    }

    return (
        <FlowsBanner
            isSubscribedToAutomation={!!currentAutomatePlan}
            contactFormId={contactFormId}
            shopName={shopName}
        />
    )
}

export default ContactFormFlowsBanner
