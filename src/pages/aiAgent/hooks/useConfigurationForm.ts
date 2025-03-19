import { useCallback, useEffect, useMemo, useState } from 'react'

import { isAxiosError } from 'axios'
import { useFlags } from 'launchdarkly-react-client-sdk'
import _get from 'lodash/get'
import _isEqual from 'lodash/isEqual'

import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { AiAgentOnboardingWizardStep } from 'models/aiAgent/types'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import { getStoreConfigurationFromFormValues } from '../components/StoreConfigForm/StoreConfigForm.utils'
import { DEFAULT_FORM_VALUES } from '../constants'
import { FormValues, UpdateValue, ValidFormValues } from '../types'
import { getValidStoreConfigurationFormValues } from '../utils/store-configuration-validation.utils'
import { useAiAgentNavigation } from './useAiAgentNavigation'
import { useStoreConfigurationMutation } from './useStoreConfigurationMutation'
import { getFormValuesFromStoreConfiguration } from './utils/configurationForm.utils'

export const useConfigurationForm = ({
    initValues,
    shopName,
}: {
    shopName: string
    initValues?: Partial<FormValues>
}) => {
    const dispatch = useAppDispatch()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const { isLoading, createStoreConfiguration, upsertStoreConfiguration } =
        useStoreConfigurationMutation({ shopName, accountDomain })
    const { routes } = useAiAgentNavigation({ shopName })
    const isOnboardingWizardPage = window.location.pathname.includes(
        routes.onboardingWizard,
    )
    const isAiAgentChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChat]

    const defaultValues = useMemo(
        () => ({
            ...DEFAULT_FORM_VALUES,
            ...initValues,
        }),
        [initValues],
    )

    // could have used a useReducer instead, but keeping it simple for now
    const [formValues, setFormValues] = useState<FormValues>(defaultValues)

    const { storeConfiguration } = useAiAgentStoreConfigurationContext()

    useEffect(() => {
        if (storeConfiguration) {
            setFormValues(
                getFormValuesFromStoreConfiguration(storeConfiguration),
            )
        } else {
            setFormValues(defaultValues)
        }
    }, [defaultValues, storeConfiguration])

    const resetForm = useCallback(() => {
        setFormValues(defaultValues)
    }, [defaultValues])

    const isFormDirty = !_isEqual(formValues, defaultValues)
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
                {
                    isAiAgentChatEnabled,
                    isOnboardingWizardPage,
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
                (initValues.emailChannelDeactivatedDatetime !== null ||
                    initValues.trialModeActivatedDatetime !== null)
            ) {
                logEvent(SegmentEvent.AiAgentEnabled, {
                    store: shopName,
                })
            }

            onSuccess?.()

            if (isOnboardingWizardPage || silentNotification) {
                return res
            }

            void dispatch(
                notify({
                    message: 'AI Agent configuration saved!',
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
