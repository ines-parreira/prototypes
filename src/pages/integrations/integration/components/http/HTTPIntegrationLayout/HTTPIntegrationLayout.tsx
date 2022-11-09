import React, {ReactNode} from 'react'
import {NavLink, useParams} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {Map} from 'immutable'

import PageHeader from '../../../../../common/components/PageHeader'
import SecondaryNavbar from '../../../../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration: Map<any, any>
    isUpdate: boolean
    children?: ReactNode
}

export default function HTTPIntegrationLayout({
    children,
    integration,
    isUpdate,
}: Props) {
    const {extra, subId} = useParams<{
        extra: string
        subId: string
    }>()
    const integrationsUrl = '/app/settings/integrations'
    const integrationId = integration.get('id') as number
    const isOnEventsPage = extra === 'events'
    const eventId = subId
    const HTTPIntegrationUrl = `${integrationsUrl}/http`

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <NavLink to={HTTPIntegrationUrl} exact>
                                HTTP integration
                            </NavLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem active={!isOnEventsPage}>
                            {isUpdate
                                ? integration.get('name')
                                : 'Add new HTTP integration'}
                        </BreadcrumbItem>
                        {eventId ? (
                            <BreadcrumbItem active>#{eventId}</BreadcrumbItem>
                        ) : null}
                    </Breadcrumb>
                }
            />
            {isUpdate ? (
                <SecondaryNavbar>
                    <NavLink
                        to={`${integrationsUrl}/http/${integrationId}`}
                        exact
                    >
                        Settings
                    </NavLink>
                    <NavLink
                        to={`${integrationsUrl}/http/${integrationId}/events`}
                        exact
                    >
                        Logs
                    </NavLink>
                </SecondaryNavbar>
            ) : null}
            {children}
        </div>
    )
}
