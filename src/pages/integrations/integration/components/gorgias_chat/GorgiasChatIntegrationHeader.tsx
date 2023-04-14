import React from 'react'
import {Map} from 'immutable'

import GorgiasChatIntegrationNavigation from './GorgiasChatIntegrationNavigation'
import GorgiasChatIntegrationNotInstalledBanner from './GorgiasChatIntegrationNotInstalledBanner'

type Props = {
    integration: Map<any, any>
    showInstallLink?: boolean
}

const GorgiasChatIntegrationHeader: React.FC<Props> = ({
    integration,
    showInstallLink,
}) => (
    <>
        <GorgiasChatIntegrationNavigation integration={integration} />
        <GorgiasChatIntegrationNotInstalledBanner
            integration={integration}
            showInstallLink={showInstallLink}
        />
    </>
)

export default GorgiasChatIntegrationHeader
