import { useFlags } from 'launchdarkly-react-client-sdk'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import PageHeader from 'pages/common/components/PageHeader'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import EmailIntegrationOnboardingBreadcrumbs from 'pages/integrations/integration/components/email/EmailIntegrationOnboardingBreadcrumbs'
import SettingsContent from 'pages/settings/SettingsContent'
import SettingsPageContainer from 'pages/settings/SettingsPageContainer'

import DomainVerificationProvider from './EmailDomainVerification/DomainVerificationProvider'
import EmailDomainVerificationSupportContentSidebar from './EmailDomainVerification/EmailDomainVerificationSupportContentSidebar'
import EmailIntegrationConnectForm from './EmailIntegrationConnectForm'
import EmailIntegrationForwardingSetupForm from './EmailIntegrationForwardingSetupForm'
import EmailIntegrationOnboardingDomainVerification from './EmailIntegrationOnboardingDomainVerification'
import EmailIntegrationVerificationForm from './EmailIntegrationVerificationForm'
import { getDomainFromEmailAddress } from './helpers'
import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
} from './hooks/useEmailOnboarding'

import css from './EmailIntegrationOnboarding.less'

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationOnboarding({ integration }: Props) {
    const { currentStep } = useEmailOnboarding({ integration })
    const isNewDomainVerificationEnabled =
        useFlags()[FeatureFlagKey.NewDomainVerification] ?? false

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
                            steps={
                                isNewDomainVerificationEnabled
                                    ? Object.values(
                                          EmailIntegrationOnboardingStep,
                                      )
                                    : Object.values(
                                          EmailIntegrationOnboardingStep,
                                      ).filter(
                                          (step) =>
                                              step !==
                                              EmailIntegrationOnboardingStep.DomainVerification,
                                      )
                            }
                        >
                            <WizardProgressHeader
                                labels={{
                                    [EmailIntegrationOnboardingStep.ConnectIntegration]:
                                        'Connect email',
                                    [EmailIntegrationOnboardingStep.ForwardingSetup]:
                                        'Receive emails',
                                    [EmailIntegrationOnboardingStep.Verification]:
                                        'Verify integration',
                                    ...(isNewDomainVerificationEnabled
                                        ? {
                                              [EmailIntegrationOnboardingStep.DomainVerification]:
                                                  'Send emails',
                                          }
                                        : {}),
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
                            {isNewDomainVerificationEnabled && (
                                <WizardStep
                                    name={
                                        EmailIntegrationOnboardingStep.DomainVerification
                                    }
                                />
                            )}

                            {currentStep ===
                                EmailIntegrationOnboardingStep.ConnectIntegration && (
                                <EmailIntegrationConnectForm
                                    integration={integration}
                                />
                            )}
                            {currentStep ===
                                EmailIntegrationOnboardingStep.ForwardingSetup && (
                                <EmailIntegrationForwardingSetupForm
                                    integration={integration}
                                />
                            )}
                            {currentStep ===
                                EmailIntegrationOnboardingStep.Verification && (
                                <EmailIntegrationVerificationForm
                                    integration={integration}
                                />
                            )}
                            {currentStep ===
                                EmailIntegrationOnboardingStep.DomainVerification &&
                                integration && (
                                    <DomainVerificationProvider
                                        domainName={getDomainFromEmailAddress(
                                            integration.meta?.address ?? '',
                                        )}
                                    >
                                        <EmailIntegrationOnboardingDomainVerification
                                            integration={integration}
                                        />
                                    </DomainVerificationProvider>
                                )}
                        </Wizard>
                    </SettingsContent>
                    {currentStep ===
                        EmailIntegrationOnboardingStep.DomainVerification && (
                        <EmailDomainVerificationSupportContentSidebar />
                    )}
                </SettingsPageContainer>
            </div>
        </>
    )
}
