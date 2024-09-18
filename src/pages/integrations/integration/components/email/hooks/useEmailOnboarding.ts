import {useCallback, useState} from 'react'
import {useHistory, useRouteMatch} from 'react-router-dom'
import {isObject, kebabCase} from 'lodash'
import {
    CreateIntegrationBody,
    HttpResponse,
    UpdateIntegrationBody,
    useCreateIntegration,
    useSendVerificationEmail,
    useUpdateIntegration,
} from '@gorgias/api-queries'

import useAppDispatch from 'hooks/useAppDispatch'
import {EmailIntegration, Integration} from 'models/integration/types'
import {onCreateSuccess} from 'state/integrations/actions'
import {isGorgiasApiError} from 'models/api/types'
import {FormErrors} from 'pages/settings/SLAs/features/SLAForm/views/validation'
import useLocalStorage from 'hooks/useLocalStorage'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'

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
    goBack: () => void
    isConnected: boolean
    isConnecting: boolean
    isVerified: boolean
    isRequested: boolean
    isSending: boolean
    isDeleting: boolean
}

export function useEmailOnboarding(
    options?: UseEmailOnboardingHookOptions
): UseEmailOnboardingHookResult {
    const integration = options?.integration
    const currentStep = useGetCurrentStep(integration)
    const history = useHistory()

    const {
        connectIntegration,
        sendVerification,
        deleteIntegration,
        errors,
        isConnecting,
        isSending,
        isRequested,
        isDeleting,
    } = useMutations(integration)

    const isConnected = !!integration

    const goBack = useCallback(() => {
        if (!integration) {
            history.push('/app/settings/channels/email')
            return
        }

        switch (currentStep) {
            case EmailIntegrationOnboardingStep.ConnectIntegration: {
                history.push('/app/settings/channels/email')
                return
            }

            case EmailIntegrationOnboardingStep.ForwardingSetup: {
                history.push(
                    `/app/settings/channels/email/${
                        integration.id
                    }/onboarding/${kebabCase(
                        EmailIntegrationOnboardingStep.ConnectIntegration
                    )}`
                )
                return
            }

            case EmailIntegrationOnboardingStep.Verification: {
                history.push(
                    `/app/settings/channels/email/${
                        integration.id
                    }/onboarding/${kebabCase(
                        EmailIntegrationOnboardingStep.ForwardingSetup
                    )}`
                )
                return
            }
        }
    }, [history, currentStep, integration])

    return {
        integration,
        currentStep,
        connectIntegration,
        sendVerification,
        deleteIntegration,
        goBack,
        errors,
        isConnecting,
        isSending,
        isDeleting,
        isRequested,
        isConnected,
        isVerified: false,
    }
}

type UseMutationsHookResult = {
    errors: Errors | undefined
    connectIntegration: (payload: ConnectIntegrationPayload) => void
    sendVerification: () => void
    deleteIntegration: () => void
    isConnecting: boolean
    isSending: boolean
    isDeleting: boolean
    isRequested: boolean
}

function useMutations(
    integration?: EmailIntegration | undefined
): UseMutationsHookResult {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const [errors, setErrors] = useState<Errors>()
    const {isRequested, setRequestedAt} =
        useVerificationRequestStatus(integration)

    const connectMutationOptions = {
        onSuccess: (response: HttpResponse<unknown>) => {
            const integration = response.data as Integration
            onCreateSuccess(dispatch, integration, true, true)
            history.push(
                `/app/settings/channels/email/${integration.id}/onboarding/forwarding-setup`
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

    const sendMutationOptions = {
        onSuccess: () => {
            if (integration) {
                setRequestedAt(new Date())
                history.push(
                    `/app/settings/channels/email/${integration.id}/onboarding/verification`
                )
            }
        },
        onError: (error: HttpResponse<unknown>) => {
            const message = isGorgiasApiError(error)
                ? error.response.data.error.msg
                : 'Failed to send verification message'

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message,
                })
            )
        },
    }

    const {mutate: create, isLoading: isCreating} = useCreateIntegration({
        mutation: connectMutationOptions,
    })

    const {mutate: update, isLoading: isUpdating} = useUpdateIntegration({
        mutation: connectMutationOptions,
    })

    const {mutate: send, isLoading: isSending} = useSendVerificationEmail({
        mutation: sendMutationOptions,
    })

    const isConnecting = isCreating || isUpdating

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
                create({
                    data: {
                        ...payload,
                        type: 'email' as 'http',
                    } as CreateIntegrationBody,
                })
            }
        },
        [integration, create, update]
    )

    const sendVerification = useCallback(() => {
        if (!integration) {
            return
        }

        send({integrationId: integration.id})
    }, [integration, send])

    const deleteIntegration = useCallback(() => {}, [])

    return {
        connectIntegration,
        sendVerification,
        deleteIntegration,
        errors,
        isConnecting,
        isSending,
        isRequested,
        isDeleting: false,
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

    const {isRequested} = useVerificationRequestStatus(integration)

    if (!integration) {
        return EmailIntegrationOnboardingStep.ConnectIntegration
    }

    const step = match?.params?.step
    const isVerified = integration?.meta?.verified

    switch (step) {
        case kebabCase(EmailIntegrationOnboardingStep.ConnectIntegration):
            return EmailIntegrationOnboardingStep.ConnectIntegration

        case kebabCase(EmailIntegrationOnboardingStep.ForwardingSetup):
            return EmailIntegrationOnboardingStep.ForwardingSetup

        case kebabCase(EmailIntegrationOnboardingStep.Verification):
            return isRequested
                ? EmailIntegrationOnboardingStep.Verification
                : EmailIntegrationOnboardingStep.ForwardingSetup

        default:
            return isVerified || isRequested
                ? EmailIntegrationOnboardingStep.Verification
                : EmailIntegrationOnboardingStep.ForwardingSetup
    }
}

export const forwardingVerificationStorageKey = (id: number) =>
    `email-forwarding-verification-requested-at-${id}`

type UseVerificationStateHookResult = {
    isRequested: boolean
    setRequestedAt: (value: Date) => void
}

function useVerificationRequestStatus(
    integration: EmailIntegration | undefined
): UseVerificationStateHookResult {
    const [requestedAt, setRequestedAt] = useLocalStorage<Date | undefined>(
        forwardingVerificationStorageKey(integration?.id ?? 0)
    )

    const isRequested = !!requestedAt

    return {isRequested, setRequestedAt}
}
