import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'

import ChatIntegrationNavigation from '../../../GorgiasChatIntegrationNavigation'

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
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/integrations/${
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
            <ChatIntegrationNavigation integration={integration} />

            {children}
        </div>
    )
}
