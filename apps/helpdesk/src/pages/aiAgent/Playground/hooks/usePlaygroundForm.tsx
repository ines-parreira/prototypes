import { useCallback, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'

import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'

import { DEFAULT_PLAYGROUND_CUSTOMER } from '../../constants'
import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import { usePublicResources } from '../../hooks/usePublicResources'
import { usePublicResourcesPooling } from '../../hooks/usePublicResourcesPooling'
import type { PlaygroundFormValues } from '../components/PlaygroundChat/PlaygroundChat.types'

const INITIAL_FORM_VALUES: PlaygroundFormValues = {
    message: '',
    subject: '',
    customer: DEFAULT_PLAYGROUND_CUSTOMER,
}

export const usePlaygroundForm = ({
    shopName,
    snippetHelpCenterId,
    helpCenterId,
    guidanceHelpCenterId,
}: {
    shopName: string
    snippetHelpCenterId: number
    helpCenterId: number | null
    guidanceHelpCenterId: number | null
}) => {
    const [formValues, setFormValues] =
        useState<PlaygroundFormValues>(INITIAL_FORM_VALUES)

    const { sourceItems } = usePublicResources({
        helpCenterId: snippetHelpCenterId,
    })
    usePublicResourcesPooling({
        helpCenterId: snippetHelpCenterId,
        shopName,
    })
    const { routes } = useAiAgentNavigation({ shopName })

    const { guidanceArticles } = useGuidanceArticles(
        guidanceHelpCenterId ?? 0,
        {
            enabled: !!guidanceHelpCenterId,
        },
    )

    const guidanceUsed = useMemo(() => {
        return guidanceArticles?.filter(
            (article) => article.visibility === 'PUBLIC',
        )
    }, [guidanceArticles])

    const isPendingResources = sourceItems
        ? sourceItems.some((item) => item.status === 'loading')
        : false
    const isKnowledgeBaseEmpty =
        sourceItems !== undefined &&
        sourceItems.length === 0 &&
        helpCenterId === null &&
        guidanceUsed.length === 0

    const validateFormValues = (formValues: PlaygroundFormValues) => {
        const formValuesValidity: Record<string, boolean> = {
            message: formValues.message.length > 0,
        }

        return Object.values(formValuesValidity).every(Boolean)
    }

    const isFormValid = useMemo(
        () => validateFormValues(formValues),
        [formValues],
    )

    const clearForm = useCallback(() => {
        setFormValues(INITIAL_FORM_VALUES)
    }, [])
    const isDisabled = useMemo(
        () => isPendingResources || isKnowledgeBaseEmpty || !isFormValid,
        [isFormValid, isKnowledgeBaseEmpty, isPendingResources],
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
                    <Link to={routes.configuration()}>Settings page</Link>.
                </div>
            )
        }

        return undefined
    }, [isKnowledgeBaseEmpty, isPendingResources, routes])

    const onFormValuesChange = useCallback(
        <Key extends keyof PlaygroundFormValues>(
            key: Key,
            value: PlaygroundFormValues[Key],
        ) => {
            setFormValues((preFormValues) => ({
                ...preFormValues,
                [key]: value,
            }))
        },
        [],
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
