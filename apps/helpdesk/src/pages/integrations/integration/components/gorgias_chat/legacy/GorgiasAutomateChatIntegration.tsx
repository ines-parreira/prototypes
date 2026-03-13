import type { Map } from 'immutable'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { IntegrationType } from '@gorgias/helpdesk-queries'

import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { ConnectedChannelsChatView } from 'pages/automate/connectedChannels/legacy/components/ConnectedChannelsChatView'
import PageHeader from 'pages/common/components/PageHeader'

import { Tab } from '../../../types'
import GorgiasChatIntegrationHeader from './GorgiasChatIntegrationHeader'

import css from './GorgiasAutomateChatIntegration.less'

interface Props {
    integration: Map<any, any>
}
export const GorgiasAutomateChatIntegration = ({ integration }: Props) => {
    const storeIntegrations = useStoreIntegrations()
    const shopIntegrationId: number | null = integration.getIn(
        ['meta', 'shop_integration_id'],
        null,
    )
    const channelId = integration.getIn(['meta', 'app_id'])

    const storeIntegration = storeIntegrations.find(
        (integration) => integration.id === shopIntegrationId,
    )
    return (
        <div className={css.container}>
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
            />
            <GorgiasChatIntegrationHeader
                integration={integration}
                tab={Tab.Automate}
            />
            <ConnectedChannelsChatView
                integration={integration}
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
