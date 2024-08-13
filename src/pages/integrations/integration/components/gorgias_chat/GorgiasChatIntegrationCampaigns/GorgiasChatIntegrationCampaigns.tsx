import React from 'react'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {useFlags} from 'launchdarkly-react-client-sdk'
import PageHeader from 'pages/common/components/PageHeader'
import {IntegrationType} from 'models/integration/constants'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'

import {FeatureFlagKey} from 'config/featureFlags'
import ConvertCampaignsListPlaceholder from 'pages/convert/common/components/ConvertCampaignsListPlaceholder/ConvertCampaignsListPlaceholder'
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

            <GorgiasChatIntegrationHeader integration={integration} />

            <ConvertCampaignsListPlaceholder integration={integration} />
        </div>
    )
}

export default GorgiasChatIntegrationCampaignsComponent
