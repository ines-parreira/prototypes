import { useCallback, useMemo, useState } from 'react'

import { Link } from 'react-router-dom'

import { useFileIngestion } from 'pages/aiAgent/hooks/useFileIngestion'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'

import { DEFAULT_PLAYGROUND_CUSTOMER } from '../../constants'
import { useAiAgentNavigation } from '../../hooks/useAiAgentNavigation'
import { usePublicResources } from '../../hooks/usePublicResources'
import { usePublicResourcesPooling } from '../../hooks/usePublicResourcesPooling'
import type { PlaygroundFormValues } from '../components/PlaygroundChat/PlaygroundChat.types'
import {
    analyzeKnowledgeSources,
    formatSyncingSourcesMessage,
} from '../utils/knowledgeSourcesAnalysis'
import type {
    FormattedSyncingMessage,
    KnowledgeSourcesAnalysis,
} from '../utils/knowledgeSourcesAnalysis'

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

    const { ingestedFiles } = useFileIngestion({
        helpCenterId: snippetHelpCenterId,
    })

    const guidanceUsed = useMemo(() => {
        return guidanceArticles?.filter(
            (article) => article.visibility === 'PUBLIC',
        )
    }, [guidanceArticles])

    const knowledgeSourcesAnalysis: KnowledgeSourcesAnalysis = useMemo(
        () =>
            analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles,
                helpCenterId,
                guidanceUsedCount: guidanceUsed?.length ?? 0,
            }),
        [sourceItems, ingestedFiles, helpCenterId, guidanceUsed],
    )

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
                    Testing unavailable. Please add at least one knowledge
                    source on the{' '}
                    <Link to={routes.knowledge}>Knowledge page</Link>.
                </div>
            )
        }

        return undefined
    }, [
        knowledgeSourcesAnalysis.hasAvailableSources,
        knowledgeSourcesAnalysis.hasSyncingSources,
        routes,
    ])

    const syncingMessage: FormattedSyncingMessage | null = useMemo(() => {
        if (knowledgeSourcesAnalysis.hasSyncingSources) {
            return formatSyncingSourcesMessage(
                knowledgeSourcesAnalysis.syncingSources,
            )
        }
        return null
    }, [knowledgeSourcesAnalysis])

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
        isFormValid,
        formValues,
        isDisabled,
        disabledMessage,
        syncingMessage,
        onFormValuesChange,
        clearForm,
        knowledgeSourcesAnalysis,
    }
}
