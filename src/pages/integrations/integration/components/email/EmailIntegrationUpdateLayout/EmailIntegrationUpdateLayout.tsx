import React from 'react'
import {Map} from 'immutable'
import {NavLink} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import PageHeader from '../../../../../common/components/PageHeader'
import SecondaryNavbar from '../../../../../common/components/SecondaryNavbar/SecondaryNavbar'

type Props = {
    integration: Map<string, any>
    children?: any
}

const EmailIntegrationUpdateLayout = ({integration, children}: Props) => {
    const integrationId: number = integration.get('id')

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
                <NavLink
                    to={`/app/settings/channels/email/${integrationId}/dns`}
                    exact
                >
                    Domain Verification
                </NavLink>
            </SecondaryNavbar>
            {children}
        </div>
    )
}

export default EmailIntegrationUpdateLayout
