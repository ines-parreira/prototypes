import React, {ReactNode} from 'react'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'

type OwnProps = {
    children: ReactNode
    integration: Map<any, any>
    campaign: Map<any, any>
}

export const BaseCampaignDetails = ({
    children,
    integration,
    campaign,
}: OwnProps): JSX.Element => {
    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/convert/${
                                    integration.get('id') as string
                                }/campaigns`}
                            >
                                Campaigns
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>{campaign.get('name')}</BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            {children}
        </div>
    )
}
