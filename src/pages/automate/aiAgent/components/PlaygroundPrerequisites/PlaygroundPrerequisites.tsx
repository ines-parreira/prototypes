import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React, {ReactNode} from 'react'

import {StoreConfiguration} from 'models/aiAgent/types'

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
        return (
            <div className={css.spinner}>
                <LoadingSpinner role="alert" size="big" />
            </div>
        )
    }

    if (!sourceItems || !sourceItems.some(({status}) => status === 'done')) {
        return <MissingKnowledgeSourceAlert shopName={shopName} />
    }

    return <>{children}</>
}
