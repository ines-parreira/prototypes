import { useMemo } from 'react'

import { StoreConfiguration } from 'models/aiAgent/types'

import { useFileIngestion } from '../../hooks/useFileIngestion'
import { usePublicResources } from '../../hooks/usePublicResources'

interface UsePlaygroundPrerequisitesProps {
    storeConfiguration?: StoreConfiguration
    snippetHelpCenterId?: number
}

interface UsePlaygroundPrerequisitesReturn {
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

    const isLoading = isSourceItemsListLoading || isExternalFilesLoading

    const hasPrerequisites = useMemo(() => {
        if (isLoading) return false

        if (
            storeConfiguration?.helpCenterId !== null &&
            storeConfiguration?.helpCenterId
        ) {
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

        return hasPublicUrlSources || hasExternalFiles
    }, [
        storeConfiguration,
        snippetHelpCenterId,
        sourceItems,
        ingestedFiles,
        isLoading,
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
