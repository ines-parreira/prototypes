import type { ReactNode } from 'react'
import { useMemo } from 'react'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import type { StoreConfiguration } from 'models/aiAgent/types'

import { useFileIngestion } from '../../../hooks/useFileIngestion'
import { usePublicResources } from '../../../hooks/usePublicResources'
import { analyzeKnowledgeSources } from '../../utils/knowledgeSourcesAnalysis'
import { MissingKnowledgeSourceAlert } from './PlaygroundPrerequisitesAlerts'

import css from './PlaygroundPrerequisites.less'

export const CheckPlaygroundPrerequisites = ({
    children,
    storeConfiguration,
    snippetHelpCenterId,
    guidanceArticlesLength = 0,
    shopName,
}: {
    children: ReactNode
    storeConfiguration?: StoreConfiguration
    snippetHelpCenterId?: number
    guidanceArticlesLength?: number
    shopName: string
}) => {
    if (
        !storeConfiguration ||
        (storeConfiguration.helpCenterId === null &&
            guidanceArticlesLength === 0)
    ) {
        if (!snippetHelpCenterId) {
            return <MissingKnowledgeSourceAlert shopName={shopName} />
        }

        return (
            <CheckExternalKnowledgeSources
                snippetHelpCenterId={snippetHelpCenterId}
                shopName={shopName}
            >
                {children}
            </CheckExternalKnowledgeSources>
        )
    }

    return <>{children}</>
}

const CheckExternalKnowledgeSources = ({
    snippetHelpCenterId,
    children,
    shopName,
}: {
    children: ReactNode
    snippetHelpCenterId: number
    shopName: string
}) => {
    const { sourceItems, isSourceItemsListLoading } = usePublicResources({
        helpCenterId: snippetHelpCenterId,
    })

    const { ingestedFiles, isLoading: isExternalFilesLoading } =
        useFileIngestion({
            helpCenterId: snippetHelpCenterId,
        })

    const knowledgeSourcesAnalysis = useMemo(
        () =>
            analyzeKnowledgeSources({
                sourceItems,
                ingestedFiles,
                helpCenterId: null, // we are checking for help center above in CheckPlaygroundPrerequisites
                guidanceUsedCount: 0, // same for guidances, they are checked above in CheckPlaygroundPrerequisites
            }),
        [sourceItems, ingestedFiles],
    )

    if (isSourceItemsListLoading || isExternalFilesLoading) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner role="alert" size="big" />
            </div>
        )
    }

    if (!knowledgeSourcesAnalysis.hasAvailableSources) {
        return <MissingKnowledgeSourceAlert shopName={shopName} />
    }

    return <>{children}</>
}
