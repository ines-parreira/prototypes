import { useCallback, useEffect, useMemo, useState } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import { GorgiasChatIntegration } from 'models/integration/types'
import {
    formFieldsConfiguration,
    getHandoverConfigurationFormDataFragment,
    getIntegrationPreferencesFormDataFragment,
    hasAnyChangeInFormValues,
    initialFormFieldValues,
    mapFromFormValuesToIntegrationPreferences,
} from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOnlineSettingsForm.utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { updateOrCreateIntegrationRequest } from 'state/integrations/actions'

import { CHANGES_SAVED_SUCCESS } from '../constants'
import { HandoverCustomizationOnlineSettingsFormValues } from '../types'
import { mapFormValuesToHandoverConfigurationData } from '../utils/handoverCustomization/handoverCustomizationConfigurationData.utils'
import { useAiAgentHandoverConfigurationMutation } from './useAiAgentHandoverConfigurationMutation'
import { useFetchAiAgentStoreHandoverConfiguration } from './useFetchAiAgentHandoverConfiguration'

type Props = {
    integration: GorgiasChatIntegration
}

export const useHandoverCustomizationOnlineSettingsForm = ({
    integration,
}: Props) => {
    const notify = useNotify()

    const dispatch = useAppDispatch()

    const currentAccount = useAppSelector(getCurrentAccountState)

    const accountDomain = currentAccount.get('domain')
    const accountId = currentAccount.get('id')

    const [formValues, setFormValues] =
        useState<HandoverCustomizationOnlineSettingsFormValues>(
            initialFormFieldValues,
        )

    const [hasError, setHasError] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const { integrationId, storeName, shopType, integrationType } =
        useMemo(() => {
            return {
                integrationId: integration.id,
                storeName: integration.meta.shop_name ?? '',
                shopType: integration.meta.shop_type ?? '',
                integrationType: integration.type,
            }
        }, [integration])

    const {
        data: currentHandoverConfiguration,
        isLoading: isLoadingHandoverConfiguration,
    } = useFetchAiAgentStoreHandoverConfiguration({
        accountDomain,
        storeName,
        integrationId,
        enabled: true,
    })

    const { upsertHandoverConfiguration } =
        useAiAgentHandoverConfigurationMutation({
            accountDomain,
            storeName,
            integrationId,
        })

    const initialIntegrationPreferencesFormValues = useMemo(
        () => getIntegrationPreferencesFormDataFragment(integration),
        [integration],
    )

    const initialHandoverConfigurationFormValues = useMemo(
        () =>
            getHandoverConfigurationFormDataFragment(
                currentHandoverConfiguration,
            ),
        [currentHandoverConfiguration],
    )

    const initialFormValues = useMemo(() => {
        return {
            ...initialIntegrationPreferencesFormValues,
            ...initialHandoverConfigurationFormValues,
        }
    }, [
        initialIntegrationPreferencesFormValues,
        initialHandoverConfigurationFormValues,
    ])

    const setToInitialFormValues = useCallback(() => {
        setFormValues(initialFormValues)
    }, [initialFormValues])

    const hasIntegrationPreferencesChanges = useMemo(
        () =>
            hasAnyChangeInFormValues<HandoverCustomizationOnlineSettingsFormValues>(
                formValues,
                initialIntegrationPreferencesFormValues,
            ),
        [formValues, initialIntegrationPreferencesFormValues],
    )

    const hasHandoverConfigurationChanges = useMemo(
        () =>
            hasAnyChangeInFormValues<HandoverCustomizationOnlineSettingsFormValues>(
                formValues,
                initialHandoverConfigurationFormValues,
            ),
        [formValues, initialHandoverConfigurationFormValues],
    )

    const hasChanges = useMemo(
        () =>
            hasIntegrationPreferencesChanges || hasHandoverConfigurationChanges,
        [hasIntegrationPreferencesChanges, hasHandoverConfigurationChanges],
    )

    const updateValue = useCallback(
        (
            key: keyof HandoverCustomizationOnlineSettingsFormValues,
            value: any,
        ) => {
            const newFormValues = {
                ...formValues,
                [key]: value,
            }

            setFormValues(newFormValues)

            setHasError(false)
        },
        [formValues],
    )

    const hasFormErrors = useCallback(
        () =>
            Object.entries(formValues).some(([key, value]) => {
                const fieldReference =
                    formFieldsConfiguration[
                        key as keyof typeof formFieldsConfiguration
                    ]

                if (value === undefined || !fieldReference) {
                    return false
                }

                return (
                    typeof value === 'string' &&
                    fieldReference.maxLength &&
                    value.length > fieldReference.maxLength
                )
            }),
        [formValues],
    )

    const handleOnSave = useCallback(async () => {
        /**
         * Wraps the updateOrCreateIntegrationRequest dispatch in a Promise to make it awaitable.
         * This implementation allows for conditional execution of async operations in the save flow,
         * ensuring that both integration preferences and handover configuration updates can be
         * handled sequentially when needed.
         * The parameters are the same as the updateOrCreateIntegrationRequest action, but the
         * resolve function is called manually to ensure the Promise is resolved.
         */
        const saveIntegrationPreferences = (payload: any): Promise<void> =>
            new Promise((resolve) => {
                void dispatch(
                    updateOrCreateIntegrationRequest(
                        payload,
                        undefined,
                        null,
                        true,
                        () => resolve(),
                        true,
                    ),
                )
            })

        setHasError(false)

        if (!hasChanges) {
            return
        }

        if (hasFormErrors()) {
            setHasError(true)

            notify.error('Please check the form for errors')

            return
        }

        try {
            setIsSaving(true)

            if (hasHandoverConfigurationChanges) {
                const handoverData = mapFormValuesToHandoverConfigurationData({
                    accountId,
                    storeName,
                    shopType,
                    integrationId,
                    integrationType,
                    formValues,
                    configuration: currentHandoverConfiguration,
                })

                await upsertHandoverConfiguration(handoverData)
            }

            if (hasIntegrationPreferencesChanges) {
                const integrationPreferences =
                    mapFromFormValuesToIntegrationPreferences(
                        formValues,
                        integration,
                    )

                await saveIntegrationPreferences(integrationPreferences)
            }

            notify.success(CHANGES_SAVED_SUCCESS)
        } catch (error) {
            if (error instanceof Error) {
                notify.error(error.message)
            } else {
                notify.error('An unknown error occurred. Please try again')
            }

            return
        } finally {
            setIsSaving(false)
        }
    }, [
        formValues,
        hasFormErrors,
        hasIntegrationPreferencesChanges,
        hasHandoverConfigurationChanges,
        hasChanges,
        integration,
        notify,
        integrationId,
        currentHandoverConfiguration,
        accountId,
        storeName,
        integrationType,
        shopType,
        upsertHandoverConfiguration,
        dispatch,
    ])

    const handleOnCancel = useCallback(() => {
        setToInitialFormValues()
    }, [setToInitialFormValues])

    useEffect(() => {
        if (isSaving) return

        setFormValues((state) => ({
            ...state,
            ...getIntegrationPreferencesFormDataFragment(integration),
        }))
    }, [integration, isSaving])

    useEffect(() => {
        if (isSaving) return

        setFormValues((state) => ({
            ...state,
            ...getHandoverConfigurationFormDataFragment(
                currentHandoverConfiguration,
            ),
        }))
    }, [currentHandoverConfiguration, isSaving])

    return {
        isLoading: isLoadingHandoverConfiguration,
        isSaving,
        formValues,
        hasChanges,
        hasError,
        updateValue,
        handleOnSave,
        handleOnCancel,
    }
}
