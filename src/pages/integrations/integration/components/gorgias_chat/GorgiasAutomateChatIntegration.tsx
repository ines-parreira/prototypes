import {IntegrationType} from '@gorgias/api-queries'
import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {Map} from 'immutable'
import PageHeader from 'pages/common/components/PageHeader'
import {ConnectedChannelsChatView} from 'pages/automate/connectedChannels/components/ConnectedChannelsChatView'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import {getShopNameFromStoreIntegration} from 'models/selfServiceConfiguration/utils'
import GorgiasChatIntegrationHeader from './GorgiasChatIntegrationHeader'

interface Props {
    integration: Map<any, any>
}
export const GorgiasAutomateChatIntegration = ({integration}: Props) => {
    const storeIntegrations = useStoreIntegrations()
    const shopIntegrationId: number | null = integration.getIn(
        ['meta', 'shop_integration_id'],
        null
    )
    const channelId = integration.getIn(['meta', 'app_id'])

    const storeIntegration = storeIntegrations.find(
        (integration) => integration.id === shopIntegrationId
    )
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/channels/${IntegrationType.GorgiasChat}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            ></PageHeader>
            <GorgiasChatIntegrationHeader integration={integration} />
            <ConnectedChannelsChatView
                channelId={channelId}
                shopType={storeIntegration?.type}
                shopName={
                    storeIntegration
                        ? getShopNameFromStoreIntegration(storeIntegration)
                        : undefined
                }
                hideDropdown
            />
        </div>
    )
}
