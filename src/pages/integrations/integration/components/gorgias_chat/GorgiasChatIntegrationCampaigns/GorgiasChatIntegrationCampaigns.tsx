import {Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {FeatureFlagKey} from 'config/featureFlags'
import {IntegrationType} from 'models/integration/constants'
import PageHeader from 'pages/common/components/PageHeader'
import ConvertCampaignsListPlaceholder from 'pages/convert/common/components/ConvertCampaignsListPlaceholder/ConvertCampaignsListPlaceholder'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'
import {Tab} from 'pages/integrations/integration/types'

import GorgiasChatIntegrationConnectedChannel from '../GorgiasChatIntegrationConnectedChannel'

type Props = {
    integration: Map<any, any>
}

export const GorgiasChatIntegrationCampaignsComponent = ({
    integration,
}: Props) => {
    const changeAutomateSettingButtomPosition =
        useFlags()[FeatureFlagKey.ChangeAutomateSettingButtomPosition]
    const newChannelsView = useFlags()[FeatureFlagKey.NewChannelsView]
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
            >
                {!changeAutomateSettingButtomPosition && !newChannelsView && (
                    <GorgiasChatIntegrationConnectedChannel
                        integration={integration}
                    />
                )}
            </PageHeader>

            <GorgiasChatIntegrationHeader
                integration={integration}
                tab={Tab.Campaigns}
            />

            <ConvertCampaignsListPlaceholder integration={integration} />
        </div>
    )
}

export default GorgiasChatIntegrationCampaignsComponent
