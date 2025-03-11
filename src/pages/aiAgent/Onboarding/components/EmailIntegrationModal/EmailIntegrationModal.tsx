import React, { FC, useCallback } from 'react'

import gmailLogo from 'assets/img/integrations/gmail.svg'
import microsoftLogo from 'assets/img/integrations/office.svg'
import { IntegrationType } from 'models/integration/types'
import IntegrationCard from 'pages/aiAgent/Onboarding/components/IntegrationCard'
import StatusBadge, {
    StatusEnum,
} from 'pages/aiAgent/Onboarding/components/StatusBadge'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'

import css from './EmailIntegrationModal.less'

export const EmailIntegrationModal: FC<{
    isOpen: boolean
    onClose: () => void
    redirectToIntegration: (redirectUri: string) => void
}> = ({ isOpen, onClose, redirectToIntegration }) => {
    const { gmailIntegration, microsoftIntegration } = useEmailIntegrations()
    const newEmailIntegrationUrl = '/app/settings/channels/email/new/onboarding'
    const integrationRedirectBaseUrl = '/integrations/{}/auth/pre-callback/'

    const gmailStatus =
        gmailIntegration === undefined
            ? StatusEnum.Disconnected
            : StatusEnum.Connected
    const microsoftStatus =
        microsoftIntegration === undefined
            ? StatusEnum.Disconnected
            : StatusEnum.Connected

    const gmailIcon = <img src={gmailLogo} alt="Gmail" />
    const msIcon = <img src={microsoftLogo} alt="Microsoft" />

    const gmailRedirectUri = integrationRedirectBaseUrl.replace(
        '{}',
        IntegrationType.Gmail,
    )
    const outlookRedirectUri = integrationRedirectBaseUrl.replace(
        '{}',
        IntegrationType.Outlook,
    )

    const handleSubmit = useCallback(
        (e: React.SyntheticEvent, redirectUri: string) => {
            e.preventDefault()
            redirectToIntegration(redirectUri)
        },
        [redirectToIntegration],
    )

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader title="Let's connect your email" />
            <ModalBody>
                <div className={css.container}>
                    <IntegrationCard
                        icon={gmailIcon}
                        status={<StatusBadge status={gmailStatus} />}
                        buttonLabel="Connect Gmail"
                        description="Log into your Gmail or Google Workspace account to allow Gorgias access to emails."
                        title="Connect Gmail"
                        onClick={(e) => handleSubmit(e, gmailRedirectUri)}
                    />

                    <IntegrationCard
                        icon={msIcon}
                        status={<StatusBadge status={microsoftStatus} />}
                        buttonLabel="Connect Microsoft"
                        description="Log into your Microsoft365 account to allow Gorgias access to emails."
                        title="Connect Microsoft"
                        onClick={(e) => handleSubmit(e, outlookRedirectUri)}
                    />

                    <a
                        className={css.link}
                        href={newEmailIntegrationUrl}
                        onClick={(e) => {
                            handleSubmit(e, newEmailIntegrationUrl)
                        }}
                    >
                        Need to connect another provider?
                    </a>
                </div>
            </ModalBody>
        </Modal>
    )
}

export default EmailIntegrationModal
