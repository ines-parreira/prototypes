// @flow

import React, {Component} from 'react'
import {Link} from 'react-router'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import PageHeader from '../../../../../common/components/PageHeader'
import SecondaryNavbar from '../../../../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration: Object,
    isUpdate: boolean,
    urlParams: Object,
    children?: any
}


export default class HTTPIntegrationLayout extends Component<Props> {
    render() {
        const {children, integration, isUpdate, urlParams} = this.props
        const integrationsUrl = '/app/settings/integrations'
        const integrationId = integration.get('id')
        const linkProps = {
            className: 'nav-link',
            activeClassName: 'disabled'
        }
        const isOnEventsPage = urlParams.extra === 'events'
        const eventId = urlParams.subId
        const HTTPIntegrationUrl = `${integrationsUrl}/http`
        const integrationUrl = `${HTTPIntegrationUrl}/${integrationId}`

        return (
            <div className="full-width">
                <PageHeader
                    title={(
                        <Breadcrumb>
                            <BreadcrumbItem>
                                <Link to={integrationsUrl}>Integrations</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                <Link to={HTTPIntegrationUrl}>HTTP</Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem active={!isOnEventsPage}>
                                {isUpdate
                                    ? isOnEventsPage
                                        ? <Link to={integrationUrl}>{integration.get('name')}</Link>
                                        : integration.get('name')
                                    : 'Add new HTTP integration'
                                }
                            </BreadcrumbItem>
                            {isOnEventsPage
                                ?
                                <BreadcrumbItem active={!eventId}>
                                    {eventId
                                        ? <Link to={`${integrationUrl}/events`}>Logs</Link>
                                        : 'Logs'
                                    }
                                </BreadcrumbItem>
                                : null
                            }
                            {eventId
                                ? <BreadcrumbItem active>#{eventId}</BreadcrumbItem>
                                : null
                            }
                        </Breadcrumb>
                    )}
                />
                {isUpdate ?
                    <SecondaryNavbar>
                        <Link
                            to={`${integrationsUrl}/http/${integrationId}`}
                            {...linkProps}
                        >
                            Settings
                        </Link>
                        <Link
                            to={`${integrationsUrl}/http/${integrationId}/events`}
                            {...linkProps}
                        >
                            Logs
                        </Link>
                    </SecondaryNavbar>
                    :
                    null
                }
                {children}
            </div>
        )
    }
}
