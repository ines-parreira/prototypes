import React from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'

import {IntegrationType} from 'models/integration/types'

import useAppSelector from 'hooks/useAppSelector'

import {NotificationStatus} from 'state/notifications/types'
import {getChatInstallationStatus} from 'state/entities/chatInstallationStatus/selectors'

import {Tab} from 'pages/integrations/integration/Integration'
import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'

type Props = {
    integration: Map<any, any>
    showInstallLink?: boolean
}

const GorgiasChatIntegrationNotInstalledBanner: React.FC<Props> = ({
    integration,
    showInstallLink = true,
}) => {
    const {installed} = useAppSelector(getChatInstallationStatus)

    if (installed) return null

    return (
        <BannerNotification
            status={NotificationStatus.Error}
            showIcon
            message="Your chat widget was not seen installed on your website
                        in the past 72 hours. Check its installation and your
                        website to resolve."
            actionHTML={
                showInstallLink ? (
                    <Link
                        to={`/app/settings/channels/${
                            IntegrationType.GorgiasChat
                        }/${integration.get('id') as string}/${
                            Tab.Installation
                        }`}
                    >
                        Install
                    </Link>
                ) : (
                    <a
                        href="https://docs.gorgias.com/en-US/chat-getting-started-81789#installation-monitoring"
                        target="_blank"
                        rel="noreferrer"
                    >
                        More Information
                    </a>
                )
            }
            borderless
            dismissible={false}
        />
    )
}

export default GorgiasChatIntegrationNotInstalledBanner
