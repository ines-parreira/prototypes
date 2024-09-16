import React from 'react'
import {EmailIntegration} from 'models/integration/types'
import EmailIntegrationOnboardingBreadcrumbs from 'pages/integrations/integration/components/email/EmailIntegrationOnboardingBreadcrumbs'
import PageHeader from 'pages/common/components/PageHeader'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import SettingsContent from 'pages/settings/SettingsContent'
import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
} from './hooks/useEmailOnboarding'
import EmailIntegrationConnectForm from './EmailIntegrationConnectForm'
import css from './EmailIntegrationOnboarding.less'

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

                <SettingsPageContainer>
                    <SettingsContent>
                        <Wizard
                            startAt={currentStep}
                            steps={Object.values(
                                EmailIntegrationOnboardingStep
                            )}
                        >
                            <WizardProgressHeader
                                labels={{
                                    [EmailIntegrationOnboardingStep.ConnectIntegration]:
                                        'Connect email',
                                    [EmailIntegrationOnboardingStep.ForwardingSetup]:
                                        'Forward emails to Gorgias',
                                    [EmailIntegrationOnboardingStep.Verification]:
                                        'Verify email integration',
                                }}
                                className={css.wizardProgressHeader}
                            />

                            <WizardStep
                                name={
                                    EmailIntegrationOnboardingStep.ConnectIntegration
                                }
                            />

                            <WizardStep
                                name={
                                    EmailIntegrationOnboardingStep.ForwardingSetup
                                }
                            />

                            <WizardStep
                                name={
                                    EmailIntegrationOnboardingStep.Verification
                                }
                            />
                        </Wizard>
                        {currentStep ===
                            EmailIntegrationOnboardingStep.ConnectIntegration && (
                            <EmailIntegrationConnectForm
                                integration={integration}
                            />
                        )}
                    </SettingsContent>
                </SettingsPageContainer>
            </div>
        </>
    )
}
