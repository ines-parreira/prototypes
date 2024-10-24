import {Map} from 'immutable'
import React from 'react'
import {Link} from 'react-router-dom'

import {IntegrationType} from 'models/integration/types'

import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import {Tab} from 'pages/integrations/integration/types'
import {NotificationStatus} from 'state/notifications/types'

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
        <BannerNotification
            status={NotificationStatus.Warning}
            showIcon
            message={message}
            actionHTML={
                !isInstallationTab && (
                    <Link
                        to={`/app/settings/channels/${
                            IntegrationType.GorgiasChat
                        }/${integration.get('id') as string}/${
                            Tab.Installation
                        }`}
                    >
                        Go To Installation Tab
                    </Link>
                )
            }
            borderless
            dismissible={false}
        />
    )
}

export default GorgiasChatIntegrationOutdatedSnippetBanner
