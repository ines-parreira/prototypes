import { useCallback, useEffect, useMemo, useState } from 'react'

import isEqual from 'lodash/isEqual'

import useAppSelector from 'hooks/useAppSelector'
import { useNotify } from 'hooks/useNotify'
import { GorgiasChatIntegration } from 'models/integration/types'
import {
    formFieldsConfiguration,
    initialFormFieldValues,
} from 'pages/aiAgent/utils/handoverCustomization/handoverCustomizationChatOfflineSettingsForm.utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { CHANGES_SAVED_SUCCESS } from '../constants'
import { HandoverCustomizationOfflineSettingsFormValues } from '../types'
import { mapFormValuesToHandoverConfigurationData } from '../utils/handoverCustomization/handoverCustomizationConfigurationData.utils'
import { useAiAgentHandoverConfigurationMutation } from './useAiAgentHandoverConfigurationMutation'
import { useFetchAiAgentStoreHandoverConfiguration } from './useFetchAiAgentHandoverConfiguration'

type Props = {
    integration: GorgiasChatIntegration
}

export const useHandoverCustomizationOfflineSettingsForm = ({
    integration,
}: Props) => {
    const notify = useNotify()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const accountId = currentAccount.get('id')

    const integrationId = useMemo(() => integration?.id, [integration])

    const { storeName, shopType, integrationType } = useMemo(
        () => ({
            integrationType: integration?.type,
            storeName: integration?.meta.shop_name ?? '',
            shopType: integration?.meta.shop_type ?? '',
        }),
        [integration],
    )

    const { data: currentHandoverConfiguration, isLoading } =
        useFetchAiAgentStoreHandoverConfiguration({
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

    const [formValues, setFormValues] =
        useState<HandoverCustomizationOfflineSettingsFormValues>(
            initialFormFieldValues,
        )

    const [hasError, setHasError] = useState(false)

    const [isSaving, setIsSaving] = useState(false)

    const initialFormValues = useMemo(() => {
        if (!currentHandoverConfiguration) {
            return initialFormFieldValues
        }

        return {
            offlineInstructions:
                currentHandoverConfiguration.offlineInstructions ?? '',
            shareBusinessHours:
                currentHandoverConfiguration.shareBusinessHours ?? false,
        }
    }, [currentHandoverConfiguration])

    const setToInitialFormValues = useCallback(() => {
        setFormValues(initialFormValues)
    }, [initialFormValues, setFormValues])

    const hasChanges = useMemo(() => {
        return !isEqual(formValues, initialFormValues)
    }, [formValues, initialFormValues])

    const updateValue = useCallback(
        (
            key: keyof HandoverCustomizationOfflineSettingsFormValues,
            value: string | boolean,
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
        setHasError(false)

        if (!hasChanges) {
            return
        }

        if (hasFormErrors()) {
            setHasError(true)

            notify.error('Please check the form for errors')

            return
        }

        const mergedData = mapFormValuesToHandoverConfigurationData({
            accountId,
            storeName,
            shopType,
            integrationId,
            integrationType,
            formValues,
            configuration: currentHandoverConfiguration,
        })

        try {
            setIsSaving(true)
            await upsertHandoverConfiguration(mergedData)
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
        accountId,
        formValues,
        currentHandoverConfiguration,
        integrationType,
        storeName,
        shopType,
        integrationId,
        notify,
        hasChanges,
        hasFormErrors,
        upsertHandoverConfiguration,
    ])

    const handleOnCancel = useCallback(() => {
        setToInitialFormValues()
    }, [setToInitialFormValues])

    useEffect(() => {
        setToInitialFormValues()
    }, [currentHandoverConfiguration, setToInitialFormValues])

    return {
        isLoading,
        isSaving,
        formValues,
        hasChanges,
        hasError,
        updateValue,
        handleOnSave,
        handleOnCancel,
    }
}
