import {isAxiosError} from 'axios'
import _get from 'lodash/get'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useCallback, useEffect, useMemo, useState} from 'react'
import _isEqual from 'lodash/isEqual'
import {useAiAgentStoreConfigurationContext} from 'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext'
import {FormValues, ValidFormValues} from '../types'
import {DEFAULT_FORM_VALUES} from '../constants'
import {notify} from '../../../../state/notifications/actions'
import {NotificationStatus} from '../../../../state/notifications/types'
import {
    getFormValuesFromStoreConfiguration,
    getStoreConfigurationFromFormValues,
} from '../components/StoreConfigForm/StoreConfigForm.utils'
import {logEvent, SegmentEvent} from '../../../../common/segment'
import useAppDispatch from '../../../../hooks/useAppDispatch'
import {FeatureFlagKey} from '../../../../config/featureFlags'
import {AiAgentOnboardingWizardStep} from '../../../../models/aiAgent/types'
import useAppSelector from '../../../../hooks/useAppSelector'
import {getCurrentAccountState} from '../../../../state/currentAccount/selectors'
import {getValidStoreConfigurationFormValues} from '../utils/store-configuration-validation.utils'
import {useStoreConfigurationMutation} from './useStoreConfigurationMutation'
import {useAiAgentNavigation} from './useAiAgentNavigation'

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
    const {isLoading, createStoreConfiguration, upsertStoreConfiguration} =
        useStoreConfigurationMutation({shopName, accountDomain})
    const {routes} = useAiAgentNavigation({shopName})
    const isOnboardingWizardPage = window.location.pathname.includes(
        routes.onboardingWizard
    )
    const isAiAgentChatEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentChat]
    const isMultiChannelEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AiAgentMultiChannelEnablement]

    const defaultValues = useMemo(
        () => ({
            ...DEFAULT_FORM_VALUES,
            ...initValues,
        }),
        [initValues]
    )

    // could have used a useReducer instead, but keeping it simple for now
    const [formValues, setFormValues] = useState<FormValues>(defaultValues)

    const {storeConfiguration} = useAiAgentStoreConfigurationContext()

    useEffect(() => {
        if (storeConfiguration) {
            setFormValues(
                getFormValuesFromStoreConfiguration(storeConfiguration)
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
        [formValues]
    )

    const updateValue = useCallback(
        <Key extends keyof FormValues>(key: Key, value: FormValues[Key]) => {
            setFormValues((prev) => ({
                ...prev,
                [key]: value,
            }))
        },
        []
    )

    const handleOnSave = async ({
        publicUrls,
        shopName,
        aiAgentMode,
        payload,
        stepName,
        silentNotification,
    }: {
        shopName: string
        publicUrls?: string[]
        aiAgentMode?: string
        payload?: Partial<FormValues>
        stepName?: AiAgentOnboardingWizardStep
        silentNotification?: boolean
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
                {
                    isAiAgentChatEnabled,
                    isMultiChannelEnabled,
                    isOnboardingWizardPage,
                }
            )
        } catch (error) {
            if (error instanceof Error) {
                void dispatch(
                    notify({
                        message: error.message,
                        status: NotificationStatus.Error,
                    })
                )
            } else {
                throw error
            }

            return
        }

        const configurationToSubmit = getStoreConfigurationFromFormValues(
            shopName,
            validFormValues
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
                (initValues.deactivatedDatetime !== null ||
                    initValues.trialModeActivatedDatetime !== null)
            ) {
                logEvent(SegmentEvent.AiAgentEnabled, {
                    store: shopName,
                })
            }

            if (isOnboardingWizardPage || silentNotification) {
                return res
            }

            void dispatch(
                notify({
                    message: 'AI Agent configuration saved!',
                    status: NotificationStatus.Success,
                })
            )

            return res
        } catch (error) {
            if (
                isAxiosError(error) &&
                _get(error, 'response.data.message') ===
                    'Email address already used by AI Agent on a different store.'
            ) {
                void dispatch(
                    notify({
                        message:
                            'Email address already used by AI Agent on a different store.',
                        status: NotificationStatus.Error,
                    })
                )
            } else {
                void dispatch(
                    notify({
                        message: 'Failed to save AI Agent configuration',
                        status: NotificationStatus.Error,
                    })
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
