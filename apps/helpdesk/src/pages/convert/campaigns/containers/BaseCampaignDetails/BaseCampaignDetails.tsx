import type { ReactNode } from 'react'
import React from 'react'

import type { Map } from 'immutable'
import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'

type OwnProps = {
    children: ReactNode
    integration: Map<any, any>
    campaign: Map<any, any>
    isEditMode?: boolean
}

export const BaseCampaignDetails = ({
    children,
    integration,
    campaign,
    isEditMode = false,
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
                        <BreadcrumbItem>
                            {isEditMode ? campaign.get('name') : 'Add campaign'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            {children}
        </div>
    )
}
