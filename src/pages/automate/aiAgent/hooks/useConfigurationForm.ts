import {isAxiosError} from 'axios'
import _get from 'lodash/get'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {useCallback, useEffect, useMemo, useState} from 'react'
import _isEqual from 'lodash/isEqual'
import {useAiAgentStoreConfigurationContext} from 'pages/automate/aiAgent/providers/AiAgentStoreConfigurationContext'
import {FormValues, ValidFormValues} from '../types'
import {
    AiAgentChannel,
    CUSTOM_TONE_OF_VOICE_MAX_LENGTH,
    DEFAULT_FORM_VALUES,
    EXCLUDED_TOPIC_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
    SIGNATURE_MAX_LENGTH,
    ToneOfVoice,
} from '../constants'
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

    const simplifyWizardErrors = (message: string) => {
        if (formValues.wizard) {
            return 'One or more required fields not filled.'
        }

        return message
    }

    const validateConfigurationFormValues = (
        formValues: FormValues,
        publicUrls: string[] | null | undefined,
        isChatSupportEnabled?: boolean
    ): ValidFormValues => {
        if (formValues.signature !== null) {
            if (formValues.signature.length > SIGNATURE_MAX_LENGTH) {
                throw new Error(
                    `Signature must be less than ${SIGNATURE_MAX_LENGTH} characters`
                )
            }
        }

        if (
            formValues.signature === null ||
            formValues.signature.trim().length === 0
        ) {
            throw new Error(simplifyWizardErrors('Signature can not be empty'))
        }

        if (
            formValues.excludedTopics !== null &&
            formValues.excludedTopics.length > 0
        ) {
            const hasEmptyFields = formValues.excludedTopics.some(
                (topic) => topic === ''
            )
            if (hasEmptyFields) {
                throw new Error('Excluded topic cannot be empty')
            }
            if (formValues.excludedTopics.length > MAX_EXCLUDED_TOPICS) {
                throw new Error(
                    `Excluded topics must be less than ${MAX_EXCLUDED_TOPICS}`
                )
            }
            for (const topic of formValues.excludedTopics) {
                if (topic.length > EXCLUDED_TOPIC_MAX_LENGTH) {
                    throw new Error(
                        `Excluded topics must be less than ${EXCLUDED_TOPIC_MAX_LENGTH} characters`
                    )
                }
            }
        }

        if (formValues.tags !== null && formValues.tags.length > 0) {
            const hasEmptyFields = formValues.tags.some(
                (tag) => tag.name === '' || tag.description === ''
            )
            if (hasEmptyFields) {
                throw new Error('Tags must have a name and description')
            }
        }

        if (
            (!formValues.toneOfVoice ||
                formValues.toneOfVoice === ToneOfVoice.Custom) &&
            formValues.customToneOfVoiceGuidance?.length === 0
        ) {
            throw new Error(
                simplifyWizardErrors('Custom tone of voice cannot be empty')
            )
        }

        const noSelectedChannelsMessage = !!formValues?.wizard
            ?.completedDatetime
            ? 'Please select at least 1 email address for AI Agent to use or disable AI Agent to proceed.'
            : 'At least one channel must be toggled ON.'
        if (isChatSupportEnabled) {
            // we must have at least one integration selected (email or chat)
            if (
                formValues.monitoredEmailIntegrations?.length === 0 &&
                formValues.monitoredChatIntegrations?.length === 0 &&
                formValues.deactivatedDatetime === null
            ) {
                throw new Error(noSelectedChannelsMessage)
            }
        } else {
            // we must have at least one integration selected (email)
            if (
                formValues.monitoredEmailIntegrations?.length === 0 &&
                formValues.deactivatedDatetime === null
            ) {
                throw new Error(noSelectedChannelsMessage)
            }
        }

        // we must have at least one channel selected in the wizard
        if (
            formValues.wizard &&
            formValues.wizard.enabledChannels &&
            formValues.wizard.enabledChannels.length === 0 &&
            (formValues.wizard.stepName ===
                AiAgentOnboardingWizardStep.Knowledge ||
                formValues.wizard.stepName ===
                    AiAgentOnboardingWizardStep.Personalize)
        ) {
            throw new Error('At least one channel must be toggled ON.')
        }

        // we must have integration for selected channel
        if (
            formValues.wizard &&
            formValues.wizard.enabledChannels &&
            formValues.wizard.enabledChannels.includes(AiAgentChannel.Email) &&
            formValues.monitoredEmailIntegrations?.length === 0
        ) {
            throw new Error('One or more required fields not filled.')
        }

        if (
            formValues.wizard &&
            formValues.wizard.enabledChannels &&
            formValues.wizard.enabledChannels.includes(AiAgentChannel.Chat) &&
            formValues.monitoredChatIntegrations?.length === 0
        ) {
            throw new Error('One or more required fields not filled.')
        }

        if (
            (!formValues.toneOfVoice ||
                formValues.toneOfVoice === ToneOfVoice.Custom) &&
            formValues.customToneOfVoiceGuidance &&
            formValues.customToneOfVoiceGuidance.length >
                CUSTOM_TONE_OF_VOICE_MAX_LENGTH
        ) {
            throw new Error(
                `Custom tone of voice should be less than ${CUSTOM_TONE_OF_VOICE_MAX_LENGTH} characters`
            )
        }

        if (
            formValues.helpCenterId === null &&
            (!publicUrls || publicUrls.length === 0) &&
            (!formValues.wizard || formValues.wizard.completedDatetime !== null)
        ) {
            const errorMessage = isOnboardingWizardPage
                ? 'You must add at least one knowledge source to continue.'
                : 'Select a Help Center or add at least one public URL'

            throw new Error(errorMessage)
        }

        return {
            ...formValues,
            // Need to explicitly set these fields to non-null
            signature: formValues.signature,
            monitoredEmailIntegrations:
                formValues.monitoredEmailIntegrations || [],
            monitoredChatIntegrations:
                formValues.monitoredChatIntegrations || [],
        }
    }

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
            },
        }
        let validFormValues: ValidFormValues
        try {
            validFormValues = validateConfigurationFormValues(
                enrichedFormValues,
                publicUrls,
                isAiAgentChatEnabled
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
