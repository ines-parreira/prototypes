import React, {useCallback, useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {PlaygroundFormValues} from '../components/PlaygroundChat/PlaygroundChat.types'
import {usePublicResources} from './usePublicResources'
import {usePublicResourcesPooling} from './usePublicResourcesPooling'
import {useAiAgentNavigation} from './useAiAgentNavigation'

const INITIAL_FORM_VALUES: PlaygroundFormValues = {
    message: '',
}

export const usePlaygroundForm = ({
    shopName,
    snippetHelpCenterId,
    helpCenterId,
}: {
    shopName: string
    snippetHelpCenterId: number
    helpCenterId: number | null
}) => {
    const [formValues, setFormValues] =
        useState<PlaygroundFormValues>(INITIAL_FORM_VALUES)

    const {sourceItems} = usePublicResources({
        helpCenterId: snippetHelpCenterId,
    })
    usePublicResourcesPooling({
        helpCenterId: snippetHelpCenterId,
        shopName,
    })
    const {routes} = useAiAgentNavigation({shopName})

    const isPendingResources = sourceItems
        ? sourceItems.some((item) => item.status === 'loading')
        : false
    const isKnowledgeBaseEmpty =
        sourceItems !== undefined &&
        sourceItems.length === 0 &&
        helpCenterId === null

    const validateFormValues = (formValues: PlaygroundFormValues) => {
        const formValuesValidity: Record<string, boolean> = {
            message: formValues.message.length > 0,
            customerEmail:
                !formValues.customerEmail ||
                formValues.customerEmail.length > 0,
        }

        return Object.values(formValuesValidity).every(Boolean)
    }

    const isFormValid = useMemo(
        () => validateFormValues(formValues),
        [formValues]
    )

    const clearForm = useCallback(() => {
        setFormValues(INITIAL_FORM_VALUES)
    }, [])
    const isDisabled = useMemo(
        () => isPendingResources || isKnowledgeBaseEmpty || !isFormValid,
        [isFormValid, isKnowledgeBaseEmpty, isPendingResources]
    )

    const disabledMessage = useMemo(() => {
        if (isPendingResources) {
            return 'Testing currently disabled. Please wait knowledges sources to sync.'
        }

        if (isKnowledgeBaseEmpty) {
            return (
                <div>
                    Testing currently disabled. Please add Help Center or Public
                    URL on{' '}
                    <Link to={routes.configuration}>Configuration page</Link>.
                </div>
            )
        }

        return undefined
    }, [isKnowledgeBaseEmpty, isPendingResources, routes.configuration])

    const onFormValuesChange = useCallback(
        <Key extends keyof PlaygroundFormValues>(
            key: Key,
            value: PlaygroundFormValues[Key]
        ) => {
            setFormValues((preFormValues) => ({
                ...preFormValues,
                [key]: value,
            }))
        },
        []
    )

    return {
        isPendingResources,
        isKnowledgeBaseEmpty,
        isFormValid,
        formValues,
        isDisabled,
        disabledMessage,
        onFormValuesChange,
        clearForm,
    }
}
