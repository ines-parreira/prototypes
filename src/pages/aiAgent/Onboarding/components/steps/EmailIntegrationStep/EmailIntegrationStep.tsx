import React, { FC, useCallback } from 'react'

import { useParams } from 'react-router-dom'

import gorgiasLogo from 'assets/img/gorgias-logo-dark.svg'
import gmailLogo from 'assets/img/integrations/gmail.svg'
import microsoftLogo from 'assets/img/integrations/office.svg'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import IntegrationCard from 'pages/aiAgent/Onboarding/components/IntegrationCard'
import MainTitle from 'pages/aiAgent/Onboarding/components/MainTitle/MainTitle'
import StatusBadge, {
    StatusEnum,
} from 'pages/aiAgent/Onboarding/components/StatusBadge'
import { StepProps } from 'pages/aiAgent/Onboarding/components/steps/types'
import useCheckOnboardingCompleted from 'pages/aiAgent/Onboarding/hooks/useCheckOnboardingCompleted'
import useCheckStoreIntegration from 'pages/aiAgent/Onboarding/hooks/useCheckStoreIntegration'
import { useOnboardingIntegrationRedirection } from 'pages/aiAgent/Onboarding/hooks/useOnboardingIntegrationRedirection'
import { useSteps } from 'pages/aiAgent/Onboarding/hooks/useSteps'
import {
    OnboardingBody,
    OnboardingContentContainer,
    OnboardingPreviewContainer,
} from 'pages/aiAgent/Onboarding/layout/ConvAiOnboardingLayout'
import AIBanner from 'pages/common/components/AIBanner/AIBanner'
import { useEmailIntegrations } from 'pages/settings/contactForm/hooks/useEmailIntegrations'
import { getRedirectUri } from 'state/integrations/selectors'

import css from './EmailIntegrationStep.less'

export const EmailIntegrationStep: FC<StepProps> = ({
    currentStep,
    totalSteps,
    goToStep,
}) => {
    const { shopName } = useParams<{ shopName: string }>()

    const { validSteps } = useSteps({ shopName })

    useCheckStoreIntegration()
    useCheckOnboardingCompleted()

    const onNextClick = () => {
        const nextStep = validSteps[currentStep]?.step

        goToStep(nextStep)
    }

    const onBackClick = () => {
        const previousStep = validSteps[currentStep - 2]?.step

        goToStep(previousStep)
    }

    const { gmailIntegration, microsoftIntegration } = useEmailIntegrations()

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
    const gorgiasIcon = <img src={gorgiasLogo} alt="Gorgias" />

    const { redirectToIntegration } = useOnboardingIntegrationRedirection()

    const gmailRedirectUri = useAppSelector(
        getRedirectUri(IntegrationType.Gmail),
    )
    const outlookRedirectUri = useAppSelector(
        getRedirectUri(IntegrationType.Outlook),
    )

    const handleSubmit = useCallback(
        (redirectUri: string) => {
            redirectToIntegration(redirectUri, IntegrationType.Email)
        },
        [redirectToIntegration],
    )

    return (
        <OnboardingBody>
            <OnboardingContentContainer
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNextClick={onNextClick}
                onBackClick={onBackClick}
            >
                <MainTitle
                    titleBlack="Now, let’s connect "
                    titleMagenta="your email"
                />
                <div className={css.container}>
                    <>
                        <AIBanner fillStyle="success">
                            Success - We connected to your shopify store{' '}
                            {shopName}
                        </AIBanner>
                    </>
                    <IntegrationCard
                        icon={gmailIcon}
                        status={<StatusBadge status={gmailStatus} />}
                        buttonLabel="Connect Gmail"
                        description="Log into your Gmail or Google Workspace account to allow Gorgias access to emails."
                        title="Connect Gmail"
                        onClick={() => handleSubmit(gmailRedirectUri)}
                    />

                    <IntegrationCard
                        icon={msIcon}
                        status={<StatusBadge status={microsoftStatus} />}
                        buttonLabel="Connect Microsoft"
                        description="Log into your Microsoft365 account to allow Gorgias access to emails."
                        title="Connect Microsoft"
                        onClick={() => handleSubmit(outlookRedirectUri)}
                    />

                    <a
                        className={css.link}
                        href="/app/settings/channels/email/new/onboarding"
                    >
                        Need to connect another provider?
                    </a>
                </div>
            </OnboardingContentContainer>

            <OnboardingPreviewContainer isLoading icon={gorgiasIcon} />
        </OnboardingBody>
    )
}

export default EmailIntegrationStep
