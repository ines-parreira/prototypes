import React, { useState } from 'react'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { isEnterprise } from 'models/billing/utils'
import PageHeader from 'pages/common/components/PageHeader'
import Wizard from 'pages/common/components/wizard/Wizard'
import WizardProgressHeader from 'pages/common/components/wizard/WizardProgressHeader'
import WizardStep from 'pages/common/components/wizard/WizardStep'
import EmailIntegrationConnectForm from 'pages/integrations/integration/components/email/CustomerOnboarding/EmailForwarding/EmailIntegrationConnectForm'
import DomainVerificationProvider from 'pages/integrations/integration/components/email/EmailDomainVerification/DomainVerificationProvider'
import EmailDomainVerificationSupportContentSidebar from 'pages/integrations/integration/components/email/EmailDomainVerification/EmailDomainVerificationSupportContentSidebar'
import { getDomainFromEmailAddress } from 'pages/integrations/integration/components/email/helpers'
import SettingsContent from 'pages/settings/SettingsContent'
import { getCurrentHelpdeskPlan } from 'state/billing/selectors'

import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
} from '../hooks/useEmailOnboarding'
import EmailIntegrationForwardingSetupForm from './EmailForwarding/EmailIntegrationForwardingSetupForm'
import EmailPreview from './EmailForwarding/EmailPreview'
import EmailIntegrationOnboardingBreadcrumbs from './EmailIntegrationOnboardingBreadcrumbs'
import EmailIntegrationOnboardingDomainVerification from './EmailIntegrationOnboardingDomainVerification'

import css from './EmailIntegrationOnboarding.less'

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationOnboarding({ integration }: Props) {
    const { currentStep } = useEmailOnboarding({ integration })
    const forceEmailForwardingFlag: boolean = useFlag(
        FeatureFlagKey.ForceEmailOnboarding,
        false,
    )

    const [emailAddress, setEmailAddress] = useState('')
    const [displayName, setDisplayName] = useState('')

    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const isEnterpriseCustomer = isEnterprise(currentHelpdeskPlan)
    const isForcedEmailOnboarding =
        forceEmailForwardingFlag && isEnterpriseCustomer

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <EmailIntegrationOnboardingBreadcrumbs
                        integration={integration}
                        isForcedEmailOnboarding={isForcedEmailOnboarding}
                    />
                }
            />

            <div className="full-width flex">
                <SettingsContent>
                    <Wizard
                        startAt={currentStep}
                        steps={Object.values(EmailIntegrationOnboardingStep)}
                    >
                        <WizardProgressHeader
                            labels={{
                                [EmailIntegrationOnboardingStep.ConnectIntegration]:
                                    'Connect email',
                                [EmailIntegrationOnboardingStep.SetupForwarding]:
                                    'Set up forwarding',
                                [EmailIntegrationOnboardingStep.DomainVerification]:
                                    'Verify domain',
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
                                EmailIntegrationOnboardingStep.SetupForwarding
                            }
                        />
                        <WizardStep
                            name={
                                EmailIntegrationOnboardingStep.DomainVerification
                            }
                        />
                        {currentStep ===
                            EmailIntegrationOnboardingStep.ConnectIntegration && (
                            <EmailIntegrationConnectForm
                                integration={integration}
                                emailAddress={emailAddress}
                                displayName={displayName}
                                handleEmailChange={setEmailAddress}
                                handleDisplayChange={setDisplayName}
                            />
                        )}

                        {currentStep ===
                            EmailIntegrationOnboardingStep.SetupForwarding && (
                            <EmailIntegrationForwardingSetupForm
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
                    EmailIntegrationOnboardingStep.ConnectIntegration && (
                    <EmailPreview
                        emailAddress={emailAddress}
                        displayName={displayName}
                    />
                )}
                {currentStep ===
                    EmailIntegrationOnboardingStep.DomainVerification && (
                    <EmailDomainVerificationSupportContentSidebar />
                )}
            </div>
        </div>
    )
}
