import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'

import GorgiasChatIntegrationHeader from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationHeader'

type OwnProps = {
    children: ReactNode
    integration: Map<any, any>
}

export const BaseCampaignDetails = ({
    children,
    integration,
}: OwnProps): JSX.Element => {
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/channels/${
                                    integration.get('type') as string
                                }/${integration.get('id') as string}`}
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
            <GorgiasChatIntegrationHeader integration={integration} />

            {children}
        </div>
    )
}
