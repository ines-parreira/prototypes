import { useCallback, useMemo } from 'react'

import { Link } from 'react-router-dom'

import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import { usePublicResources } from '../../hooks/usePublicResources'
import { usePublicResourcesPooling } from '../../hooks/usePublicResourcesPooling'
import { useMessagesContext } from '../contexts/MessagesContext'
import { useSettingsContext } from '../contexts/SettingsContext'
import type { PlaygroundCustomer, PlaygroundFormValues } from '../types'

export type { PlaygroundFormValues }

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
    const { draftMessage, draftSubject, setDraftMessage, setDraftSubject } =
        useMessagesContext()
    const { selectedCustomer, setSettings } = useSettingsContext()

    const formValues = useMemo<PlaygroundFormValues>(
        () => ({
            message: draftMessage,
            subject: draftSubject,
            customer: selectedCustomer,
        }),
        [draftMessage, draftSubject, selectedCustomer],
    )

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

    const isFormValid = useMemo(() => draftMessage.length > 0, [draftMessage])

    const clearForm = useCallback(() => {
        setDraftMessage('')
        setDraftSubject('')
    }, [setDraftMessage, setDraftSubject])
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
            if (key === 'message') {
                setDraftMessage(value as string)
            } else if (key === 'subject') {
                setDraftSubject(value as string)
            } else if (key === 'customer') {
                setSettings({ selectedCustomer: value as PlaygroundCustomer })
            }
        },
        [setDraftMessage, setDraftSubject, setSettings],
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
