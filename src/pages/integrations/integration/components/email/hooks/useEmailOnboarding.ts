import {
    CreateIntegrationBody,
    EmailIntegration,
    GmailIntegration,
    HttpResponse,
    UpdateIntegrationBody,
    useCreateIntegration,
    useDeleteIntegration,
    useSendVerificationEmail,
    useUpdateIntegration,
} from '@gorgias/api-queries'
import {useFlags} from 'launchdarkly-react-client-sdk'
import isObject from 'lodash/isObject'
import kebabCase from 'lodash/kebabCase'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {useHistory, useRouteMatch} from 'react-router-dom'

import {FormErrors} from 'components/Form/validation'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useInterval from 'hooks/useInterval'
import useLocalStorage from 'hooks/useLocalStorage'
import {isGorgiasApiError} from 'models/api/types'
import {
    Integration,
    IntegrationType,
    OutlookIntegration,
} from 'models/integration/types'
import socketManager from 'services/socketManager'
import {JoinEventType} from 'services/socketManager/types'
import {fetchIntegration, onCreateSuccess} from 'state/integrations/actions'
import {DELETE_INTEGRATION_SUCCESS} from 'state/integrations/constants'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'

export enum EmailIntegrationOnboardingStep {
    ConnectIntegration = 'ConnectIntegration',
    ForwardingSetup = 'ForwardingSetup',
    Verification = 'Verification',
    DomainVerification = 'DomainVerification',
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
    goToNext: () => void
    isConnected: boolean
    isConnecting: boolean
    isVerified: boolean
    isRequested: boolean
    isSending: boolean
    isPending: boolean
    isDeleting: boolean
}

const FORWARDING_VERIFICATION_TIMEOUT_IN_SECONDS = 2 * 60
const ONBOARDING_COMPLETE_STORAGE_KEY = 'email-onboarding-completed'

export function useEmailOnboarding(
    options?: UseEmailOnboardingHookOptions
): UseEmailOnboardingHookResult {
    const integration = options?.integration
    const currentStep = useGetCurrentStep(integration)
    const {goBack, goToNext} = useStepNavigation(integration)

    const {
        connectIntegration,
        sendVerification,
        deleteIntegration,
        errors,
        isConnecting,
        isSending,
        isRequested,
        isDeleting,
        isPending,
    } = useMutations(integration)

    const isConnected = !!integration
    const isVerified = integration?.meta?.verified ?? false

    return {
        integration,
        currentStep,
        connectIntegration,
        sendVerification,
        deleteIntegration,
        goBack,
        goToNext,
        errors,
        isConnecting,
        isSending,
        isDeleting,
        isRequested,
        isConnected,
        isPending,
        isVerified,
    }
}

type UseMutationsHookResult = {
    errors: Errors | undefined
    connectIntegration: (payload: ConnectIntegrationPayload) => void
    sendVerification: () => void
    deleteIntegration: () => void
    isConnecting: boolean
    isSending: boolean
    isPending: boolean
    isDeleting: boolean
    isRequested: boolean
}

function useMutations(
    integration?: EmailIntegration | undefined
): UseMutationsHookResult {
    const dispatch = useAppDispatch()
    const history = useHistory()
    const [errors, setErrors] = useState<Errors>()
    const {isPending, isRequested, setRequestedAt} =
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

            if (
                integration &&
                message === 'This integration is already verified.'
            ) {
                void dispatch(
                    fetchIntegration(
                        String(integration.id),
                        IntegrationType.Email
                    )
                )
            }

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message,
                })
            )
        },
    }

    const deleteMutationOptions = {
        onSuccess: () => {
            if (integration) {
                dispatch({
                    type: DELETE_INTEGRATION_SUCCESS,
                    id: integration.id,
                })
                history.push(listUrl())
            }
        },
        onError: (error: HttpResponse<unknown>) => {
            const message = isGorgiasApiError(error)
                ? error.response.data.error.msg
                : 'Failed to delete integration'

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message,
                })
            )
        },
    }

    const {mutate: performCreate, isLoading: isCreating} = useCreateIntegration(
        {
            mutation: connectMutationOptions,
        }
    )

    const {mutate: performUpdate, isLoading: isUpdating} = useUpdateIntegration(
        {
            mutation: connectMutationOptions,
        }
    )

    const {mutate: performDelete, isLoading: isDeleting} = useDeleteIntegration(
        {
            mutation: deleteMutationOptions,
        }
    )

    const {mutate: performSend, isLoading: isSending} =
        useSendVerificationEmail({
            mutation: sendMutationOptions,
        })

    const isConnecting = isCreating || isUpdating

    const connectIntegration = useCallback(
        (payload: ConnectIntegrationPayload) => {
            if (integration) {
                performUpdate({
                    id: integration.id,
                    data: {
                        ...integration,
                        ...payload,
                    } as UpdateIntegrationBody,
                })
            } else {
                performCreate({
                    data: {
                        ...payload,
                        type: 'email' as 'http',
                    } as CreateIntegrationBody,
                })
            }
        },
        [integration, performUpdate, performCreate]
    )

    const sendVerification = useCallback(() => {
        if (!integration) {
            return
        }

        performSend({integrationId: integration.id})
    }, [integration, performSend])

    const deleteIntegration = useCallback(() => {
        if (!integration) {
            return
        }

        performDelete({
            id: integration.id,
        })
    }, [integration, performDelete])

    useEffect(() => {
        if (!integration) {
            return
        }

        isPending
            ? socketManager.join(JoinEventType.Integration, integration.id)
            : socketManager.leave(JoinEventType.Integration, integration.id)
    }, [integration, isPending])

    return {
        connectIntegration,
        sendVerification,
        deleteIntegration,
        errors,
        isConnecting,
        isSending,
        isRequested,
        isPending,
        isDeleting,
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
            return isRequested || isVerified
                ? EmailIntegrationOnboardingStep.Verification
                : EmailIntegrationOnboardingStep.ForwardingSetup

        case kebabCase(EmailIntegrationOnboardingStep.DomainVerification):
            if (isVerified) {
                return EmailIntegrationOnboardingStep.DomainVerification
            }
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
    isPending: boolean
    isRequested: boolean
    setRequestedAt: (value: Date) => void
}

function useVerificationRequestStatus(
    integration: EmailIntegration | undefined
): UseVerificationStateHookResult {
    const [requestedAt, setRequestedAt] = useLocalStorage<Date | undefined>(
        forwardingVerificationStorageKey(integration?.id ?? 0)
    )

    const [currentTime, setCurrentTime] = useState(new Date())

    const isRequested = !!requestedAt
    const isPending = useMemo(
        () => computeIsPending(requestedAt, currentTime),
        [requestedAt, currentTime]
    )

    useInterval(() => {
        setCurrentTime(new Date())
    }, FORWARDING_VERIFICATION_TIMEOUT_IN_SECONDS * 1000)

    return {isPending, isRequested, setRequestedAt}
}

function computeIsPending(
    requestedAt: Date | undefined,
    currentTime: Date
): boolean {
    if (!requestedAt) {
        return false
    }

    return (
        (new Date(currentTime).getTime() - new Date(requestedAt).getTime()) /
            1000 <
        FORWARDING_VERIFICATION_TIMEOUT_IN_SECONDS
    )
}

function useStepNavigation(integration: EmailIntegration | undefined) {
    const history = useHistory()
    const currentStep = useGetCurrentStep(integration)

    const isNewDomainVerificationEnabled =
        useFlags()[FeatureFlagKey.NewDomainVerification] ?? false

    const goBack = useCallback(() => {
        if (!integration) {
            history.push(listUrl())
            return
        }

        switch (currentStep) {
            case EmailIntegrationOnboardingStep.ConnectIntegration: {
                history.push(listUrl())
                return
            }

            case EmailIntegrationOnboardingStep.ForwardingSetup: {
                history.push(
                    stepUrl(
                        EmailIntegrationOnboardingStep.ConnectIntegration,
                        integration
                    )
                )
                return
            }

            case EmailIntegrationOnboardingStep.Verification: {
                history.push(
                    stepUrl(
                        EmailIntegrationOnboardingStep.ForwardingSetup,
                        integration
                    )
                )
                return
            }

            case EmailIntegrationOnboardingStep.DomainVerification: {
                history.push(
                    stepUrl(
                        EmailIntegrationOnboardingStep.Verification,
                        integration
                    )
                )
            }
        }
    }, [history, currentStep, integration])

    const goToNext = useCallback(() => {
        if (!integration) {
            history.push(listUrl())
            return
        }

        switch (currentStep) {
            case EmailIntegrationOnboardingStep.ConnectIntegration: {
                history.push(
                    stepUrl(
                        EmailIntegrationOnboardingStep.ForwardingSetup,
                        integration
                    )
                )
                return
            }

            case EmailIntegrationOnboardingStep.ForwardingSetup: {
                history.push(
                    stepUrl(
                        EmailIntegrationOnboardingStep.Verification,
                        integration
                    )
                )
                return
            }

            case EmailIntegrationOnboardingStep.Verification: {
                if (isNewDomainVerificationEnabled) {
                    history.push(
                        stepUrl(
                            EmailIntegrationOnboardingStep.DomainVerification,
                            integration
                        )
                    )
                    return
                }

                history.push(listUrl())
                return
            }

            case EmailIntegrationOnboardingStep.DomainVerification: {
                history.push(listUrl())
                return
            }
        }
    }, [history, currentStep, integration, isNewDomainVerificationEnabled])

    return {
        goBack,
        goToNext,
    }
}

export const useEmailOnboardingCompleteCheck = (
    integration?:
        | EmailIntegration
        | GmailIntegration
        | OutlookIntegration
        | undefined
) => {
    const onboardingCompleteStorageKey = `${ONBOARDING_COMPLETE_STORAGE_KEY}-${integration?.id}`

    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useLocalStorage(
        onboardingCompleteStorageKey,
        false
    )

    const completeOnboarding = useCallback(() => {
        setHasCompletedOnboarding(true)
    }, [setHasCompletedOnboarding])

    return {
        isOnboardingComplete: hasCompletedOnboarding,
        completeOnboarding,
    }
}

export function listUrl(): string {
    return '/app/settings/channels/email'
}

export function stepUrl(
    step?: EmailIntegrationOnboardingStep,
    integration?: EmailIntegration | undefined
): string {
    if (!step || !integration) {
        return '/app/settings/channels/email/new/onboarding/connect-integration'
    }

    return `/app/settings/channels/email/${
        integration.id
    }/onboarding/${kebabCase(step)}`
}
