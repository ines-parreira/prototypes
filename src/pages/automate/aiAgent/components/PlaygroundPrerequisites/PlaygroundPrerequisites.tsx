import React, {ReactNode} from 'react'

import {StoreConfiguration} from 'models/aiAgent/types'
import Loader from 'pages/common/components/Loader/Loader'
import {usePublicResources} from '../../hooks/usePublicResources'
import {
    MissingEmailAlert,
    MissingEmailAndKnowledgeSourceAlert,
    MissingKnowledgeSourceAlert,
} from './PlaygroundPrerequisitesAlerts'

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
    const hasEmail = storeConfiguration
        ? storeConfiguration.monitoredEmailIntegrations.length > 0
        : false

    if (!storeConfiguration || storeConfiguration.helpCenterId === null) {
        if (!snippetHelpCenterId) {
            return hasEmail ? (
                <MissingKnowledgeSourceAlert shopName={shopName} />
            ) : (
                <MissingEmailAndKnowledgeSourceAlert shopName={shopName} />
            )
        }

        return (
            <CheckKnowledgeHasAtLeastPublicSources
                hasEmail={hasEmail}
                snippetHelpCenterId={snippetHelpCenterId}
                shopName={shopName}
            >
                {children}
            </CheckKnowledgeHasAtLeastPublicSources>
        )
    }

    if (!hasEmail) {
        return <MissingEmailAlert shopName={shopName} />
    }

    return <>{children}</>
}

const CheckKnowledgeHasAtLeastPublicSources = ({
    snippetHelpCenterId,
    children,
    shopName,
    hasEmail,
}: {
    children: ReactNode
    snippetHelpCenterId: number
    shopName: string
    hasEmail: boolean
}) => {
    const {sourceItems, isSourceItemsListLoading} = usePublicResources({
        helpCenterId: snippetHelpCenterId,
    })

    if (isSourceItemsListLoading) {
        return <Loader data-testid="loader" />
    }

    if (!sourceItems || !sourceItems.some(({status}) => status === 'done')) {
        return hasEmail ? (
            <MissingKnowledgeSourceAlert shopName={shopName} />
        ) : (
            <MissingEmailAndKnowledgeSourceAlert shopName={shopName} />
        )
    }

    return hasEmail ? (
        <>{children}</>
    ) : (
        <MissingEmailAlert shopName={shopName} />
    )
}
