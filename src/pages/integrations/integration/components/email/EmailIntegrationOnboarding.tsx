import React from 'react'
import {EmailIntegration} from 'models/integration/types'
import EmailIntegrationOnboardingBreadcrumbs from 'pages/integrations/integration/components/email/EmailIntegrationOnboardingBreadcrumbs'
import PageHeader from 'pages/common/components/PageHeader'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import {useEmailOnboarding} from './hooks/useEmailOnboarding'

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationOnboarding({integration}: Props) {
    const {currentStep} = useEmailOnboarding({integration})
    return (
        <>
            <div className="full-width">
                <PageHeader
                    title={
                        <EmailIntegrationOnboardingBreadcrumbs
                            integration={integration}
                        />
                    }
                />

                <SettingsPageContainer>{currentStep}</SettingsPageContainer>
            </div>
        </>
    )
}
