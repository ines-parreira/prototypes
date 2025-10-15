import { useMemo } from 'react'

import { StoreConfiguration } from 'models/aiAgent/types'
import { useGuidanceArticles } from 'pages/aiAgent/hooks/useGuidanceArticles'

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
}

export const usePlaygroundPrerequisites = ({
    storeConfiguration,
    snippetHelpCenterId,
}: UsePlaygroundPrerequisitesProps): UsePlaygroundPrerequisitesReturn => {
    const { sourceItems, isSourceItemsListLoading } = usePublicResources({
        helpCenterId: snippetHelpCenterId || 0,
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
            (article) => article.visibility === 'PUBLIC',
        )
    }, [guidanceArticles])

    const isLoading =
        isSourceItemsListLoading ||
        isExternalFilesLoading ||
        isGuidanceArticleListLoading

    const hasPrerequisites = useMemo(() => {
        if (isLoading) return false

        // If we have a help center, prerequisites are met
        if (!!storeConfiguration?.helpCenterId) {
            return true
        }

        if (!snippetHelpCenterId) {
            return false
        }

        const hasPublicUrlSources =
            sourceItems && sourceItems.some(({ status }) => status === 'done')

        const hasExternalFiles =
            ingestedFiles &&
            ingestedFiles.some(
                (ingestedFile) => ingestedFile.status === 'SUCCESSFUL',
            )

        const hasGuidance = guidanceUsed.length > 0

        return hasPublicUrlSources || hasExternalFiles || hasGuidance
    }, [
        storeConfiguration,
        snippetHelpCenterId,
        sourceItems,
        ingestedFiles,
        isLoading,
        guidanceUsed,
    ])

    const missingKnowledgeSource = useMemo(() => {
        if (isLoading) return false

        if (!!storeConfiguration?.helpCenterId) {
            return false
        }

        if (!snippetHelpCenterId) {
            return true
        }

        return !hasPrerequisites
    }, [storeConfiguration, snippetHelpCenterId, hasPrerequisites, isLoading])

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
    }
}
