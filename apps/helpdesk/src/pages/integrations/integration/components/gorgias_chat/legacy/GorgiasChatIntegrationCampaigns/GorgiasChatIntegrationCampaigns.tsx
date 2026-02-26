import type { Map } from 'immutable'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { IntegrationType } from 'models/integration/constants'
import PageHeader from 'pages/common/components/PageHeader'
import ConvertCampaignsListPlaceholder from 'pages/convert/common/components/ConvertCampaignsListPlaceholder/ConvertCampaignsListPlaceholder'
import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader'
import { Tab } from 'pages/integrations/integration/types'

type Props = {
    integration: Map<any, any>
}

export const GorgiasChatIntegrationCampaignsComponent = ({
    integration,
}: Props) => {
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
            />

            <GorgiasChatIntegrationHeader
                integration={integration}
                tab={Tab.Campaigns}
            />

            <ConvertCampaignsListPlaceholder integration={integration} />
        </div>
    )
}

export default GorgiasChatIntegrationCampaignsComponent
