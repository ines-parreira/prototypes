import { useCallback, useEffect, useMemo, useState } from 'react'

import isEqual from 'lodash/isEqual'

import { useNotify } from 'hooks/useNotify'
import useUpdateEffect from 'hooks/useUpdateEffect'
import { GorgiasChatIntegration } from 'models/integration/types'

import { HandoverCustomizationFallbackSettingsFormMultiLanguageValues } from '../types'
import {
    formFieldsConfiguration,
    getInitialFormValues,
    mapFromFormValuesToMultiLanguageText,
    mapFromMultiLanguageTextToFormValues,
} from '../utils/handoverCustomizationFallbackSettingsForm.utils'
import { useHandoverCustomizationChatLanguageTextsConfiguration } from './useHandoverCustomizationChatLanguageTextsConfiguration'

type Props = {
    integration: GorgiasChatIntegration
}

export const useHandoverCustomizationFallbackSettingsForm = ({
    integration,
}: Props) => {
    const notify = useNotify()

    const { multiLanguageTexts, updateMultiLanguageTexts, isLoading } =
        useHandoverCustomizationChatLanguageTextsConfiguration(integration)

    const [formValues, setFormValues] =
        useState<HandoverCustomizationFallbackSettingsFormMultiLanguageValues>(
            getInitialFormValues(integration),
        )

    const [hasError, setHasError] = useState(false)

    const [isSaving, setIsSaving] = useState(false)

    const initialFormValues = useMemo(() => {
        if (!multiLanguageTexts) {
            return getInitialFormValues(integration)
        }

        return mapFromMultiLanguageTextToFormValues(
            integration,
            multiLanguageTexts,
        )
    }, [integration, multiLanguageTexts])

    const setToInitialFormValues = useCallback(() => {
        setFormValues(initialFormValues)
    }, [initialFormValues])

    const hasChanges = useMemo(() => {
        return !isEqual(formValues, initialFormValues)
    }, [formValues, initialFormValues])

    const updateValue = useCallback(
        (key, language, value) => {
            const langForm = formValues[language]

            if (!langForm) {
                return
            }

            const newLanguageFormValues = {
                ...formValues,
                [language]: {
                    ...langForm,
                    [key]: value,
                },
            }

            setFormValues(newLanguageFormValues)

            setHasError(false)
        },
        [formValues],
    )

    const hasFormErrors = useCallback(() => {
        return Object.keys(formValues).some((language) => {
            return Object.keys(
                formValues[language] as Record<string, string>,
            ).some((key) => {
                const value = (formValues[language] as Record<string, string>)[
                    key
                ]

                const fieldReference =
                    formFieldsConfiguration[
                        key as keyof typeof formFieldsConfiguration
                    ]

                return (
                    !!value &&
                    fieldReference &&
                    fieldReference.maxLength &&
                    value.length > fieldReference.maxLength
                )
            })
        })
    }, [formValues])

    const handleOnSave = useCallback(async () => {
        setHasError(false)

        if (!multiLanguageTexts || !hasChanges) {
            return
        }

        if (hasFormErrors()) {
            setHasError(true)
            return
        }

        try {
            setIsSaving(true)

            const mergedTexts = mapFromFormValuesToMultiLanguageText(
                formValues,
                multiLanguageTexts,
            )

            await updateMultiLanguageTexts(mergedTexts)

            notify.success('Changes saved successfully!')
        } catch (error) {
            if (error instanceof Error) {
                notify.error(error.message)
            } else {
                notify.error('An unknown error occurred. Please try again')
            }
        } finally {
            setIsSaving(false)
        }
    }, [
        formValues,
        multiLanguageTexts,
        notify,
        updateMultiLanguageTexts,
        hasChanges,
        hasFormErrors,
    ])

    const handleOnCancel = useCallback(() => {
        setToInitialFormValues()
    }, [setToInitialFormValues])

    useUpdateEffect(() => {
        setFormValues(getInitialFormValues(integration))
    }, [integration])

    useEffect(() => {
        setToInitialFormValues()
    }, [multiLanguageTexts, setToInitialFormValues])

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
