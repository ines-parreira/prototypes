import _isEqual from 'lodash/isEqual'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {
    DEFAULT_FORM_VALUES,
    EXCLUDED_TOPIC_MAX_LENGTH,
    MAX_EXCLUDED_TOPICS,
    SIGNATURE_MAX_LENGTH,
    ToneOfVoice,
} from '../constants'
import {FormValues, ValidFormValues} from '../types'

export const useConfigurationForm = (initValues?: Partial<FormValues>) => {
    const defaultValues = useMemo(
        () => ({
            ...DEFAULT_FORM_VALUES,
            ...initValues,
        }),
        [initValues]
    )
    // could have used a useReducer instead, but keeping it simple for now
    const [formValues, setFormValues] = useState<FormValues>(defaultValues)

    useEffect(() => {
        if (defaultValues !== null) {
            setFormValues(defaultValues)
        }
    }, [defaultValues])

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

    return {
        formValues,
        resetForm,
        isFormDirty,
        updateValue,
        isFieldDirty,
    }
}

export const validateConfigurationFormValues = (
    formValues: FormValues,
    isKnowledgeBaseEnabled: boolean
): ValidFormValues => {
    if (formValues.signature !== null) {
        if (formValues.signature.length > SIGNATURE_MAX_LENGTH) {
            throw new Error(
                `Signature must be less than ${SIGNATURE_MAX_LENGTH} characters`
            )
        }

        if (formValues.signature.length === 0) {
            throw new Error('Signature can not be empty')
        }
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
        throw new Error('Custom tone of voice cannot be empty')
    }

    if (formValues.monitoredEmailIntegrations === null) {
        throw new Error('Select at least one monitored email integration')
    }

    if (
        (!formValues.toneOfVoice ||
            formValues.toneOfVoice === ToneOfVoice.Custom) &&
        formValues.customToneOfVoiceGuidance &&
        formValues.customToneOfVoiceGuidance.length > 500
    ) {
        throw new Error(
            'Custom tone of voice should be less than 500 characters'
        )
    }

    if (
        formValues.helpCenterId === null &&
        (formValues.publicURLs === null || formValues.publicURLs.length === 0)
    ) {
        throw isKnowledgeBaseEnabled
            ? new Error('Select a Help Center or add at least one public URL')
            : new Error('Select a Help Center')
    }

    return {
        ...formValues,
        monitoredEmailIntegrations: formValues.monitoredEmailIntegrations,
    }
}
