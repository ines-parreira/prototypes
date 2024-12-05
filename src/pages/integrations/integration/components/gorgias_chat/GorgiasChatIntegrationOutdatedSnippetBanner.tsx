import {Map} from 'immutable'
import React from 'react'

import {AlertBanner, AlertBannerTypes} from 'AlertBanners'
import {IntegrationType} from 'models/integration/types'
import {Tab} from 'pages/integrations/integration/types'

type Props = {
    integration: Map<any, any>
    tab?: Tab
}

const GorgiasChatIntegrationOutdatedSnippetBanner: React.FC<Props> = ({
    integration,
    tab,
}) => {
    const isInstallationTab = tab === Tab.Installation

    const message = `Your chat is installed with an outdated code snippet. ${
        isInstallationTab
            ? 'Please manually update it using the code below to ensure your chat’s security.'
            : 'Please manually update it from the installation tab to ensure your chat’s security.'
    }`

    return (
        <AlertBanner
            type={AlertBannerTypes.Warning}
            message={message}
            CTA={{
                type: 'internal',
                text: 'Go To Installation Tab',
                to: `/app/settings/channels/${IntegrationType.GorgiasChat}/${integration.get('id') as string}/${Tab.Installation}`,
            }}
            borderless
        />
    )
}

export default GorgiasChatIntegrationOutdatedSnippetBanner
