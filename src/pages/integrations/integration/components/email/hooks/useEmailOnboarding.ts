import {useRouteMatch} from 'react-router-dom'
import {kebabCase} from 'lodash'

import {EmailIntegration} from 'models/integration/types'

export enum EmailIntegrationOnboardingStep {
    ConnectIntegration = 'ConnectIntegration',
    ForwardingSetup = 'ForwardingSetup',
    Verification = 'Verification',
}

type ConnectIntegrationPayload = {
    name: string
    address: string
}

export type UseEmailOnboardingHookOptions = {
    integration?: EmailIntegration | undefined
}

export type UseEmailOnboardingHookResult = {
    integration: EmailIntegration | undefined
    currentStep: EmailIntegrationOnboardingStep
    connectIntegration: (payload: ConnectIntegrationPayload) => void
    sendVerification: () => void
    deleteIntegration: () => void
    isConnected: boolean
    isVerifying: boolean
    isVerified: boolean
}

export function useEmailOnboarding(
    options?: UseEmailOnboardingHookOptions
): UseEmailOnboardingHookResult {
    const integration = options?.integration
    const currentStep = useGetCurrentStep(integration)

    return {
        integration,
        currentStep,
        connectIntegration: () => {},
        sendVerification: () => {},
        deleteIntegration: () => {},
        isConnected: false,
        isVerifying: false,
        isVerified: false,
    }
}

function useGetCurrentStep(
    integration?: EmailIntegration | undefined
): EmailIntegrationOnboardingStep {
    const match = useRouteMatch<{
        id?: string
        tab?: string
        step?: string
    }>({
        path: ['/app/settings/channels/email/:id?/:tab?/:step?'],
        exact: false,
    })

    if (!integration) {
        return EmailIntegrationOnboardingStep.ConnectIntegration
    }

    const step = match?.params?.step
    const isVerified = integration?.meta?.verified
    const isForwardingActivated = integration?.meta?.email_forwarding_activated

    switch (step) {
        case kebabCase(EmailIntegrationOnboardingStep.ConnectIntegration):
            return EmailIntegrationOnboardingStep.ConnectIntegration

        case kebabCase(EmailIntegrationOnboardingStep.ForwardingSetup):
            return EmailIntegrationOnboardingStep.ForwardingSetup

        case kebabCase(EmailIntegrationOnboardingStep.Verification):
            return isForwardingActivated
                ? EmailIntegrationOnboardingStep.Verification
                : EmailIntegrationOnboardingStep.ForwardingSetup

        default:
            return isVerified || isForwardingActivated
                ? EmailIntegrationOnboardingStep.Verification
                : EmailIntegrationOnboardingStep.ForwardingSetup
    }
}
