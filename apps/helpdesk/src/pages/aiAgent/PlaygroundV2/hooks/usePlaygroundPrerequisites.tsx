import { useMemo } from 'react'

import type { StoreConfiguration } from 'models/aiAgent/types'
import { VisibilityStatusEnum } from 'models/helpCenter/types'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'
import {
    analyzeKnowledgeSources,
    formatSyncingSourcesMessage,
} from 'pages/aiAgent/PlaygroundV2/utils/knowledgeSourcesAnalysis'
import type { FormattedSyncingMessage } from 'pages/aiAgent/PlaygroundV2/utils/knowledgeSourcesAnalysis'

import { useFileIngestion } from '../../hooks/useFileIngestion'
import { usePublicResources } from '../../hooks/usePublicResources'

type UsePlaygroundPrerequisitesProps = {
    storeConfiguration?: StoreConfiguration
    snippetHelpCenterId?: number
}

type UsePlaygroundPrerequisitesReturn = {
    hasPrerequisites: boolean
    isCheckingPrerequisites: boolean
    missingKnowledgeSource: boolean
    syncingMessage?: FormattedSyncingMessage | null
}

export const usePlaygroundPrerequisites = ({
    storeConfiguration,
    snippetHelpCenterId,
}: UsePlaygroundPrerequisitesProps): UsePlaygroundPrerequisitesReturn => {
    const { sourceItems, isSourceItemsListLoading } = usePublicResources({
        helpCenterId: snippetHelpCenterId || 0,
        overrides: {
            sources: ['domain', 'url'],
        },
        queryOptionsOverrides: {
            enabled: !!snippetHelpCenterId,
        },
    })

    const { ingestedFiles, isLoading: isExternalFilesLoading } =
        useFileIngestion({
            helpCenterId: snippetHelpCenterId || 0,
            queryOptionsOverrides: {
                enabled: !!snippetHelpCenterId,
            },
        })

    const { guidanceArticles, isGuidanceArticleListLoading } =
        useGuidanceArticles(
            storeConfiguration?.guidanceHelpCenterId ?? 0,

            {
                enabled: !!storeConfiguration?.guidanceHelpCenterId,
            },
        )

    const guidanceUsed = useMemo(() => {
        return guidanceArticles?.filter(
            (article) => article.visibility === VisibilityStatusEnum.PUBLIC,
        )
    }, [guidanceArticles])

    const isLoading =
        isSourceItemsListLoading ||
        isExternalFilesLoading ||
        isGuidanceArticleListLoading

    const knowledgeSourcesAnalysis = useMemo(() => {
        return analyzeKnowledgeSources({
            sourceItems,
            ingestedFiles,
            helpCenterId: storeConfiguration?.helpCenterId ?? null,
            guidanceUsedCount: guidanceUsed?.length ?? 0,
        })
    }, [sourceItems, ingestedFiles, storeConfiguration, guidanceUsed])

    const hasPrerequisites = useMemo(() => {
        if (isLoading) return false

        return knowledgeSourcesAnalysis.hasAvailableSources
    }, [knowledgeSourcesAnalysis, isLoading])

    const missingKnowledgeSource = useMemo(() => {
        if (isLoading) return false

        return !knowledgeSourcesAnalysis.hasAvailableSources
    }, [knowledgeSourcesAnalysis, isLoading])

    const syncingMessage = useMemo(() => {
        if (knowledgeSourcesAnalysis.hasSyncingSources) {
            return formatSyncingSourcesMessage(
                knowledgeSourcesAnalysis.syncingSources,
            )
        }
        return null
    }, [knowledgeSourcesAnalysis])

    const isCheckingPrerequisites = useMemo(() => {
        if (!!storeConfiguration?.helpCenterId) {
            return false
        }

        if (!snippetHelpCenterId) {
            return false
        }

        return isLoading
    }, [storeConfiguration, snippetHelpCenterId, isLoading])

    return {
        hasPrerequisites: Boolean(hasPrerequisites),
        isCheckingPrerequisites,
        missingKnowledgeSource,
        syncingMessage,
    }
}
