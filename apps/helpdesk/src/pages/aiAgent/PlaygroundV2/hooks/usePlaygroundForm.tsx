import { useCallback, useMemo } from 'react'

import { Link } from 'react-router-dom'

import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import { analyzeKnowledgeSources } from 'pages/aiAgent/PlaygroundV2/utils/knowledgeSourcesAnalysis'

import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import { useFileIngestion } from '../../hooks/useFileIngestion'
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
        overrides: {
            sources: ['domain', 'url'],
        },
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

    const { ingestedFiles } = useFileIngestion({
        helpCenterId: snippetHelpCenterId,
    })

    const guidanceUsed = useMemo(() => {
        return guidanceArticles?.filter(
            (article) => article.visibility === VisibilityStatusEnum.PUBLIC,
        )
    }, [guidanceArticles])

    const knowledgeSourcesAnalysis = useMemo(
        () =>
            analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles,
                helpCenterId,
                guidanceUsedCount: guidanceUsed?.length ?? 0,
            }),
        [sourceItems, ingestedFiles, helpCenterId, guidanceUsed],
    )

    const isFormValid = useMemo(() => draftMessage.length > 0, [draftMessage])

    const clearForm = useCallback(() => {
        setDraftMessage('')
        setDraftSubject('')
    }, [setDraftMessage, setDraftSubject])
    const isDisabled = useMemo(
        () => !knowledgeSourcesAnalysis.hasAvailableSources || !isFormValid,
        [knowledgeSourcesAnalysis.hasAvailableSources, isFormValid],
    )

    const disabledMessage = useMemo(() => {
        if (!knowledgeSourcesAnalysis.hasAvailableSources) {
            if (knowledgeSourcesAnalysis.hasSyncingSources) {
                return (
                    <div>
                        Testing currently unavailable. Knowledge sources are
                        syncing. Please wait for syncing to complete or add
                        additional sources on the{' '}
                        <Link to={routes.knowledge}>Knowledge page</Link>.
                    </div>
                )
            }
            return (
                <div>
                    Testing currently disabled. Please add Help Center or Public
                    URL on the <Link to={routes.knowledge}>Knowledge page</Link>
                    .
                </div>
            )
        }

        return undefined
    }, [
        knowledgeSourcesAnalysis.hasAvailableSources,
        knowledgeSourcesAnalysis.hasSyncingSources,
        routes,
    ])

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
        isFormValid,
        formValues,
        isDisabled,
        disabledMessage,
        onFormValuesChange,
        clearForm,
    }
}
