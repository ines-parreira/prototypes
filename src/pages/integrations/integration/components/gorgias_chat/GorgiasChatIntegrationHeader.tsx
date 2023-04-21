import React from 'react'
import {Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import useAppSelector from 'hooks/useAppSelector'

import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'

import {latestSnippetVersion} from 'models/integration/types'

import {Tab} from '../../Integration'

import GorgiasChatIntegrationNavigation from './GorgiasChatIntegrationNavigation'
import GorgiasChatIntegrationNotInstalledBanner from './GorgiasChatIntegrationNotInstalledBanner'
import GorgiasChatIntegrationOutdatedSnippetBanner from './GorgiasChatIntegrationOutdatedSnippetBanner'

type Props = {
    integration: Map<any, any>
    tab?: Tab
}

const GorgiasChatIntegrationHeader: React.FC<Props> = ({integration, tab}) => {
    const isChatSnippetV3BannerEnabled =
        useFlags()[FeatureFlagKey.ChatSnippetV3Banner]

    const {installed, minimumSnippetVersion} = useAppSelector(
        getChatInstallationStatus
    )

    const hasLatestSnippetVersion =
        minimumSnippetVersion === latestSnippetVersion

    return (
        <>
            <GorgiasChatIntegrationNavigation integration={integration} />
            {installed ? (
                isChatSnippetV3BannerEnabled &&
                !hasLatestSnippetVersion && (
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
