import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {AI_AGENT} from 'pages/automate/common/components/constants'

import {useAiAgentNavigation} from '../../hooks/useAiAgentNavigation'

type Props = {shopName: string; title?: string}

export const GuidanceBreadcrumbs = ({shopName, title}: Props) => {
    const {routes} = useAiAgentNavigation({shopName})
    return (
        <Breadcrumb>
            <BreadcrumbItem>
                <Link to={routes.main}>{AI_AGENT}</Link>
            </BreadcrumbItem>
            {title !== undefined && (
                <BreadcrumbItem active>{title}</BreadcrumbItem>
            )}
        </Breadcrumb>
    )
}
