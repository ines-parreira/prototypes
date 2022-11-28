import React from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import {EmailProvider} from 'models/integration/constants'

type Props = {
    integration: Map<string, any>
    children?: any
}

const EmailIntegrationUpdateLayout = ({integration, children}: Props) => {
    const integrationId: number = integration.get('id')
    const integrationProvider: EmailProvider = integration.getIn([
        'meta',
        'provider',
    ])

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <NavLink to="/app/settings/channels/email">
                                Email
                            </NavLink>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {integration.get('name')}{' '}
                            <span className="text-faded align-top">
                                {integration.getIn(['meta', 'address'])}
                            </span>
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SecondaryNavbar>
                <NavLink
                    to={`/app/settings/channels/email/${integrationId}`}
                    exact
                >
                    Preferences
                </NavLink>
                {integrationProvider !== EmailProvider.Sendgrid && (
                    <NavLink
                        to={`/app/settings/channels/email/${integrationId}/dns`}
                        exact
                    >
                        Domain Verification
                    </NavLink>
                )}
                {integrationProvider === EmailProvider.Sendgrid && (
                    <NavLink
                        to={`/app/settings/channels/email/${integrationId}/outbound`}
                        exact
                    >
                        Outbound Verification
                    </NavLink>
                )}
            </SecondaryNavbar>
            {children}
        </div>
    )
}

export default EmailIntegrationUpdateLayout
