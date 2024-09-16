import {useCallback, useState} from 'react'
import {useHistory, useRouteMatch} from 'react-router-dom'
import {isObject, kebabCase} from 'lodash'
import {
    HttpResponse,
    UpdateIntegrationBody,
    useCreateIntegration,
    useUpdateIntegration,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import {EmailIntegration, Integration} from 'models/integration/types'
import {onCreateSuccess} from 'state/integrations/actions'
import {isGorgiasApiError} from 'models/api/types'
import {FormErrors} from 'pages/settings/SLAs/features/SLAForm/views/validation'

export enum EmailIntegrationOnboardingStep {
    ConnectIntegration = 'ConnectIntegration',
    ForwardingSetup = 'ForwardingSetup',
    Verification = 'Verification',
}

export type ConnectIntegrationPayload = {
    name: string
    meta: {
        address: string
    }
}

export type UseEmailOnboardingHookOptions = {
    integration?: EmailIntegration | undefined
}

export type Errors = FormErrors<ConnectIntegrationPayload>

export type UseEmailOnboardingHookResult = {
    integration: EmailIntegration | undefined
    currentStep: EmailIntegrationOnboardingStep
    errors: Errors | undefined
    connectIntegration: (payload: ConnectIntegrationPayload) => void
    sendVerification: () => void
    deleteIntegration: () => void
    back: () => void
    cancel: () => void
    isConnected: boolean
    isConnecting: boolean
    isVerified: boolean
    isVerifying: boolean
}

export function useEmailOnboarding(
    options?: UseEmailOnboardingHookOptions
): UseEmailOnboardingHookResult {
    const integration = options?.integration
    const currentStep = useGetCurrentStep(integration)
    const dispatch = useAppDispatch()
    const history = useHistory()
    const [errors, setErrors] = useState<Errors>()

    const mutationOptions = {
        onSuccess: (response: HttpResponse<unknown>) => {
            const integration = response.data as Integration
            onCreateSuccess(dispatch, integration, true, true)
            history.push(
                `/app/settings/channels/email/${integration.id}/onboarding`
            )
        },
        onError: (error: HttpResponse<unknown>) => {
            if (
                isGorgiasApiError(error) &&
                isObject(error.response?.data?.error?.data)
            ) {
                setErrors(error.response?.data?.error?.data)
            }
        },
    }

    const {mutate: create, isLoading: isCreating} = useCreateIntegration({
        mutation: mutationOptions,
    })

    const {mutate: update, isLoading: isUpdating} = useUpdateIntegration({
        mutation: mutationOptions,
    })

    const connectIntegration = useCallback(
        (payload: ConnectIntegrationPayload) => {
            if (integration) {
                update({
                    id: integration.id,
                    data: {
                        ...integration,
                        ...payload,
                    } as UpdateIntegrationBody,
                })
            } else {
                create({data: {...payload, type: 'email' as 'http'}})
            }
        },
        [integration, create, update]
    )

    const cancel = useCallback(() => {
        history.push('/app/settings/channels/email')
    }, [history])

    const back = useCallback(() => {}, [])
    const sendVerification = useCallback(() => {}, [])
    const deleteIntegration = useCallback(() => {}, [])

    return {
        integration,
        currentStep,
        connectIntegration,
        sendVerification,
        deleteIntegration,
        back,
        cancel,
        errors,
        isConnecting: isCreating || isUpdating,
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
