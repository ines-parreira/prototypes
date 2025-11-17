import type { ReactNode } from 'react'
import React from 'react'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import type { StoreConfiguration } from 'models/aiAgent/types'

import { useFileIngestion } from '../../../hooks/useFileIngestion'
import { usePublicResources } from '../../../hooks/usePublicResources'
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

    if (isSourceItemsListLoading || isExternalFilesLoading) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner role="alert" size="big" />
            </div>
        )
    }

    const hasPublicUrlSources =
        sourceItems && sourceItems.some(({ status }) => status === 'done')

    const hasExternalFiles =
        ingestedFiles &&
        ingestedFiles.some(
            (ingestedFile) => ingestedFile.status === 'SUCCESSFUL',
        )

    if (!hasPublicUrlSources && !hasExternalFiles) {
        return <MissingKnowledgeSourceAlert shopName={shopName} />
    }

    return <>{children}</>
}
