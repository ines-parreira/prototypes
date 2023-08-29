import React from 'react'
import {Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'

import {Tab} from '../../Integration'

import GorgiasChatIntegrationNavigation from './GorgiasChatIntegrationNavigation'
import GorgiasChatIntegrationNotInstalledBanner from './GorgiasChatIntegrationNotInstalledBanner'
import GorgiasChatIntegrationOutdatedSnippetBanner from './GorgiasChatIntegrationOutdatedSnippetBanner'
import useChatMigrationBanner from './hooks/useChatMigrationBanner'

type Props = {
    integration: Map<any, any>
    tab?: Tab
}

const GorgiasChatIntegrationHeader: React.FC<Props> = ({integration, tab}) => {
    const {installed} = useAppSelector(getChatInstallationStatus)

    const {showSnippetV3MigrationBanner} = useChatMigrationBanner(integration)

    return (
        <>
            <GorgiasChatIntegrationNavigation integration={integration} />
            {installed ? (
                showSnippetV3MigrationBanner && (
                    <GorgiasChatIntegrationOutdatedSnippetBanner
                        integration={integration}
                        tab={tab}
                    />
                )
            ) : (
                <GorgiasChatIntegrationNotInstalledBanner
                    integration={integration}
                    tab={tab}
                />
            )}
        </>
    )
}

export default GorgiasChatIntegrationHeader
