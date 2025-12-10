import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { isAxiosError } from 'axios'
import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'

import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import useSelfServiceChatChannels from 'pages/automate/common/hooks/useSelfServiceChatChannels'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { getStoreConfigurationFromFormValues } from '../components/StoreConfigForm/StoreConfigForm.utils'
import { CHANGES_SAVED_SUCCESS, DEFAULT_FORM_VALUES } from '../constants'
import type { FormValues, UpdateValue, ValidFormValues } from '../types'
import {
    ConfigurationPage,
    getConfigurationPage,
    getValidStoreConfigurationFormValues,
} from '../utils/store-configuration-validation.utils'
import { useAiAgentNavigation } from './useAiAgentNavigation'
import { useHasUninstalledChatIntegration } from './useHasUninstalledChatIntegration'
import { useStoreConfigurationMutation } from './useStoreConfigurationMutation'
import { useStoresDomainIngestionLogs } from './useStoresDomainIngestionLogs'
import { getFormValuesFromStoreConfiguration } from './utils/configurationForm.utils'

export const useConfigurationForm = ({
    initValues,
    shopName,
    shopType,
}: {
    shopName: string
    shopType: string
    initValues?: Partial<FormValues>
}) => {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { isLoading, createStoreConfiguration, upsertStoreConfiguration } =
        useStoreConfigurationMutation({ shopName, accountDomain })
    const { routes } = useAiAgentNavigation({ shopName })
    const configurationPage = getConfigurationPage({
        pathname: window.location.pathname,
        routes,
    })
    const { data: storesDomainIngestionLogs } = useStoresDomainIngestionLogs({
        storeNames: [shopName],
    })

    const chatChannels = useSelfServiceChatChannels(shopType, shopName)

    const chatChannelIds = useMemo(
        () => new Set<number>(chatChannels.map((chat) => chat.value.id)),
        [chatChannels],
    )

    const isAiAgentChatEnabled = useFlag(FeatureFlagKey.AiAgentChat)
    const hasAiAgentNewActivationXp = useFlag(
        FeatureFlagKey.AiAgentNewActivationXp,
    )
    const isExtendedToneOfVoiceLimitEnabled = useFlag(
        FeatureFlagKey.AiAgentExtendedToneOfVoiceLimit,
    )

    const defaultValues = useMemo(() => {
        const monitoredChatIntegrations =
            initValues?.monitoredChatIntegrations?.filter((chat) =>
                chatChannelIds.has(chat),
            ) || null

        return {
            ...DEFAULT_FORM_VALUES,
            ...initValues,
            monitoredChatIntegrations,
        }
    }, [chatChannelIds, initValues])

    // could have used a useReducer instead, but keeping it simple for now
    const [formValues, setFormValues] = useState<FormValues>(defaultValues)

    const { storeConfiguration, isLoading: isStoreConfigurationLoading } =
        useAiAgentStoreConfigurationContext()

    const hasUninstalledChatIntegration = useHasUninstalledChatIntegration(
        formValues.monitoredChatIntegrations || [],
    )

    // Only update form values if the form hasn't been initialized yet
    // This is used to prevent the form from being updated when the store configuration is updated
    const isInitializedRef = useRef(false)

    // This is used to reset the form values when the props change
    useEffect(() => {
        isInitializedRef.current = false
    }, [shopName, initValues])

    useEffect(() => {
        if (!isInitializedRef.current && !isStoreConfigurationLoading) {
            if (storeConfiguration) {
                const monitoredChatIntegrations =
                    storeConfiguration.monitoredChatIntegrations.filter(
                        (chat) => chatChannelIds.has(chat),
                    )

                setFormValues(
                    getFormValuesFromStoreConfiguration({
                        ...storeConfiguration,
                        monitoredChatIntegrations,
                    }),
                )
            } else {
                setFormValues(defaultValues)
            }

            isInitializedRef.current = true
        }
    }, [
        defaultValues,
        storeConfiguration,
        isStoreConfigurationLoading,
        chatChannelIds,
    ])

    const resetForm = useCallback(() => {
        isInitializedRef.current = false
        setFormValues(defaultValues)
    }, [defaultValues])

    const isFormDirty = useMemo(
        () => !_isEqual(formValues, defaultValues),
        [formValues, defaultValues],
    )

    const isFieldDirty = useCallback(
        (key: keyof FormValues) => {
            return !_isEqual(formValues[key], DEFAULT_FORM_VALUES[key])
        },
        [formValues],
    )

    const updateValue: UpdateValue<FormValues> = useCallback((key, value) => {
        setFormValues((prev) => ({
            ...prev,
            [key]: value,
        }))
    }, [])

    const handleOnSave = async ({
        publicUrls,
        hasExternalFiles,
        shopName,
        aiAgentMode,
        payload,
        stepName,
        silentNotification,
        onSuccess,
    }: {
        shopName: string
        publicUrls?: string[]
        hasExternalFiles?: boolean
        aiAgentMode?: string
        payload?: Partial<FormValues>
        stepName?: AiAgentOnboardingWizardStep
        silentNotification?: boolean
        onSuccess?: () => void
    }) => {
        const isUpdate = !!storeConfiguration

        const enrichedFormValues = {
            ...formValues,
            ...payload,
            wizard: formValues.wizard && {
                ...formValues.wizard,
                ...payload?.wizard,
                stepName: stepName ?? formValues.wizard.stepName,
            },
        }
        let validFormValues: ValidFormValues
        try {
            validFormValues = getValidStoreConfigurationFormValues(
                enrichedFormValues,
                publicUrls,
                hasExternalFiles ?? false,
                hasUninstalledChatIntegration,
                storesDomainIngestionLogs?.[shopName],
                {
                    isAiAgentChatEnabled,
                    configurationPage,
                    hasAiAgentNewActivationXp,
                    isExtendedToneOfVoiceLimitEnabled,
                },
            )
        } catch (error) {
            if (error instanceof Error) {
                void dispatch(
                    notify({
                        message: error.message,
                        status: NotificationStatus.Error,
                    }),
                )
            } else {
                throw error
            }

            return
        }

        const configurationToSubmit = getStoreConfigurationFromFormValues(
            shopName,
            validFormValues,
            storeConfiguration,
        )

        let res
        try {
            let wizardForUpdate
            if (storeConfiguration && storeConfiguration.wizard) {
                wizardForUpdate = {
                    ...storeConfiguration.wizard,
                }
            }

            if (configurationToSubmit.wizard) {
                wizardForUpdate = {
                    ...wizardForUpdate,
                    ...configurationToSubmit.wizard,
                }
            }

            if (stepName && wizardForUpdate) {
                wizardForUpdate.stepName = stepName
            }
            if (isUpdate) {
                res = await upsertStoreConfiguration({
                    ...storeConfiguration,
                    ...configurationToSubmit,
                    wizard: wizardForUpdate,
                })
            } else {
                res = await createStoreConfiguration({
                    ...configurationToSubmit,
                    wizard: wizardForUpdate,
                })
            }

            if (
                aiAgentMode === 'enabled' &&
                initValues &&
                initValues.emailChannelDeactivatedDatetime !== null
            ) {
                logEvent(SegmentEvent.AiAgentEnabled, {
                    store: shopName,
                })
            }

            onSuccess?.()

            if (
                configurationPage === ConfigurationPage.OnboardingWizard ||
                silentNotification
            ) {
                return res
            }

            void dispatch(
                notify({
                    message: CHANGES_SAVED_SUCCESS,
                    status: NotificationStatus.Success,
                }),
            )

            return res
        } catch (error) {
            if (isAxiosError(error) && _get(error, 'response.status') === 409) {
                void dispatch(
                    notify({
                        message:
                            'Email address or chat channel already used by AI Agent on a different store.',
                        status: NotificationStatus.Error,
                    }),
                )
            } else {
                void dispatch(
                    notify({
                        message: 'Failed to save AI Agent configuration',
                        status: NotificationStatus.Error,
                    }),
                )
            }
        }
    }

    return {
        formValues,
        resetForm,
        isFormDirty,
        updateValue,
        setFormValues,
        isFieldDirty,
        handleOnSave,
        isPendingCreateOrUpdate: isLoading,
    }
}
