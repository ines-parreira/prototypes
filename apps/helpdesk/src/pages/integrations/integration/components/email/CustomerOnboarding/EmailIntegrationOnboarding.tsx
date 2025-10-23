import React, { useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useLocalStorage } from '@repo/hooks'
import { history } from '@repo/routing'

import { LegacyButton as Button } from '@gorgias/axiom'
import { EmailIntegration } from '@gorgias/helpdesk-queries'

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

import EmailGenericModal from '../components/EmailGenericModal'
import {
    EmailIntegrationOnboardingStep,
    forwardingVerificationStorageKey,
    useEmailOnboarding,
} from '../hooks/useEmailOnboarding'
import EmailIntegrationForwardingSetupForm from './EmailForwarding/EmailIntegrationForwardingSetupForm'
import EmailIntegrationOnboardingBreadcrumbs from './EmailIntegrationOnboardingBreadcrumbs'
import EmailIntegrationOnboardingDomainVerification from './EmailIntegrationOnboardingDomainVerification'

import css from './EmailIntegrationOnboarding.less'

type Props = {
    integration?: EmailIntegration | undefined
}

export default function EmailIntegrationOnboarding({ integration }: Props) {
    const { currentStep, deleteIntegration } = useEmailOnboarding({
        integration,
    })
    const forceEmailForwardingFlag: boolean = useFlag(
        FeatureFlagKey.ForceEmailOnboarding,
        false,
    )

    const [emailAddress, setEmailAddress] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [showWarningModal, setShowWarningModal] = useState(false)

    const currentHelpdeskPlan = useAppSelector(getCurrentHelpdeskPlan)
    const isEnterpriseCustomer = isEnterprise(currentHelpdeskPlan)
    const isForcedEmailOnboarding =
        forceEmailForwardingFlag && isEnterpriseCustomer

    const [, , removeVerification] = useLocalStorage<Date | null>(
        forwardingVerificationStorageKey(integration?.id ?? 0),
        null,
    )

    const handleEmailOnboardingCancel = () => {
        setShowWarningModal(false)
        removeVerification()
        deleteIntegration()
        history.push('/app/settings/channels/email')
    }
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

            <EmailGenericModal
                showModal={showWarningModal}
                title="Leave email setup?"
                description="If you leave now, you’ll lose your progress and the email integration won’t be created."
            >
                <Button
                    intent="secondary"
                    onClick={() => {
                        setShowWarningModal(false)
                    }}
                >
                    Back to Editing
                </Button>
                <Button
                    intent="destructive"
                    onClick={handleEmailOnboardingCancel}
                >
                    Discard Email integration
                </Button>
            </EmailGenericModal>

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
                                handleCancel={() => setShowWarningModal(true)}
                            />
                        )}

                        {currentStep ===
                            EmailIntegrationOnboardingStep.SetupForwarding && (
                            <EmailIntegrationForwardingSetupForm
                                integration={integration}
                                handleCancel={() => setShowWarningModal(true)}
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
                                        handleCancel={() =>
                                            setShowWarningModal(true)
                                        }
                                    />
                                </DomainVerificationProvider>
                            )}
                    </Wizard>
                </SettingsContent>
                {currentStep ===
                    EmailIntegrationOnboardingStep.DomainVerification && (
                    <EmailDomainVerificationSupportContentSidebar />
                )}
            </div>
        </div>
    )
}
