// @flow

import React, {Component} from 'react'
import {NavLink} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import PageHeader from '../../../../../common/components/PageHeader.tsx'
import SecondaryNavbar from '../../../../../common/components/SecondaryNavbar/SecondaryNavbar.tsx'

type Props = {
    integration: Object,
    isUpdate: boolean,
    urlParams: Object,
    children?: any,
}

export default class HTTPIntegrationLayout extends Component<Props> {
    render() {
        const {children, integration, isUpdate, urlParams} = this.props
        const integrationsUrl = '/app/settings/integrations'
        const integrationId = integration.get('id')
        const isOnEventsPage = urlParams.extra === 'events'
        const eventId = urlParams.subId
        const HTTPIntegrationUrl = `${integrationsUrl}/http`

        return (
            <div className="full-width">
                <PageHeader
                    title={
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <NavLink to={integrationsUrl} exact>
                                    Integrations
                                </NavLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <NavLink to={HTTPIntegrationUrl} exact>
                                    HTTP
                                </NavLink>
                            </BreadcrumbItem>
                            <BreadcrumbItem active={!isOnEventsPage}>
                                {isUpdate
                                    ? integration.get('name')
                                    : 'Add new HTTP integration'}
                            </BreadcrumbItem>
                            {eventId ? (
                                <BreadcrumbItem active>
                                    #{eventId}
                                </BreadcrumbItem>
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
}
