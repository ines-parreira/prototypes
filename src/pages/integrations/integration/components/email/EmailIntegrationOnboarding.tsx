import React from 'react'
import {EmailIntegration} from 'models/integration/types'
import EmailIntegrationOnboardingBreadcrumbs from 'pages/integrations/integration/components/email/EmailIntegrationOnboardingBreadcrumbs'
import PageHeader from 'pages/common/components/PageHeader'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import SettingsContent from 'pages/settings/SettingsContent'
import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
} from './hooks/useEmailOnboarding'
import EmailIntegrationConnectForm from './EmailIntegrationConnectForm'

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationOnboarding({integration}: Props) {
    const {currentStep} = useEmailOnboarding({integration})
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <EmailIntegrationOnboardingBreadcrumbs
                        integration={integration}
                    />
                }
            />
            <SettingsPageContainer>
                <SettingsContent>
                    {currentStep ===
                        EmailIntegrationOnboardingStep.ConnectIntegration && (
                        <EmailIntegrationConnectForm
                            integration={integration}
                        />
                    )}
                </SettingsContent>
            </SettingsPageContainer>
        </div>
    )
}
