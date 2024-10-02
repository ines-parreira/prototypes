import React, {ReactNode} from 'react'

import {StoreConfiguration} from 'models/aiAgent/types'
import Loader from 'pages/common/components/Loader/Loader'
import {usePublicResources} from '../../hooks/usePublicResources'
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
            <CheckKnowledgeHasAtLeastPublicSources
                snippetHelpCenterId={snippetHelpCenterId}
                shopName={shopName}
            >
                {children}
            </CheckKnowledgeHasAtLeastPublicSources>
        )
    }

    return <>{children}</>
}

const CheckKnowledgeHasAtLeastPublicSources = ({
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

    if (isSourceItemsListLoading) {
        return <Loader role="alert" aria-label="Loading" />
    }

    if (!sourceItems || !sourceItems.some(({status}) => status === 'done')) {
        return <MissingKnowledgeSourceAlert shopName={shopName} />
    }

    return <>{children}</>
}
