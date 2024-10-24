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

const GorgiasChatIntegrationNotInstalledBanner: React.FC<Props> = ({
    integration,
    tab,
}) => (
    <BannerNotification
        status={NotificationStatus.Error}
        showIcon
        message="Your chat widget was not seen installed on your website
                        in the past 72 hours. Check its installation and your
                        website to resolve."
        actionHTML={
            tab === Tab.Installation ? (
                <a
                    href="https://docs.gorgias.com/en-US/chat-getting-started-81789#installation-monitoring"
                    target="_blank"
                    rel="noreferrer"
                >
                    More Information
                </a>
            ) : (
                <Link
                    to={`/app/settings/channels/${
                        IntegrationType.GorgiasChat
                    }/${integration.get('id') as string}/${Tab.Installation}`}
                >
                    Install
                </Link>
            )
        }
        borderless
        dismissible={false}
    />
)

export default GorgiasChatIntegrationNotInstalledBanner
