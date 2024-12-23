import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React, {ReactNode} from 'react'

import {StoreConfiguration} from 'models/aiAgent/types'

import {useFileIngestion} from '../../hooks/useFileIngestion'
import {usePublicResources} from '../../hooks/usePublicResources'
import css from './PlaygroundPrerequisites.less'
import {MissingKnowledgeSourceAlert} from './PlaygroundPrerequisitesAlerts'

export const CheckPlaygroundPrerequisites = ({
    children,
    storeConfiguration,
    snippetHelpCenterId,
    shopName,
}: {
    children: ReactNode
    storeConfiguration?: StoreConfiguration
    snippetHelpCenterId?: number
    shopName: string
}) => {
    if (!storeConfiguration || storeConfiguration.helpCenterId === null) {
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
    const {sourceItems, isSourceItemsListLoading} = usePublicResources({
        helpCenterId: snippetHelpCenterId,
    })

    const {ingestedFiles, isLoading: isExternalFilesLoading} = useFileIngestion(
        {
            helpCenterId: snippetHelpCenterId,
        }
    )

    if (isSourceItemsListLoading || isExternalFilesLoading) {
        return (
            <div className={css.spinner}>
                <LoadingSpinner role="alert" size="big" />
            </div>
        )
    }

    const hasPublicUrlSources =
        sourceItems && sourceItems.some(({status}) => status === 'done')

    const hasExternalFiles =
        ingestedFiles &&
        ingestedFiles.some(
            (ingestedFile) => ingestedFile.status === 'SUCCESSFUL'
        )

    if (!hasPublicUrlSources && !hasExternalFiles) {
        return <MissingKnowledgeSourceAlert shopName={shopName} />
    }

    return <>{children}</>
}
