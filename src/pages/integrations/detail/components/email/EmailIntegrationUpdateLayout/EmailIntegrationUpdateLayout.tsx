import React from 'react'
import {Map} from 'immutable'
import {Link} from 'react-router-dom'
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
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/email">
                                Email
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {integration.get('name')}{' '}
                            <span className="text-faded">
                                {integration.getIn(['meta', 'address'])}
                            </span>
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            />
            <SecondaryNavbar>
                <Link to={`/app/settings/integrations/email/${integrationId}`}>
                    Preferences
                </Link>
                <Link
                    to={`/app/settings/integrations/email/${integrationId}/dns`}
                >
                    Domain Verification
                </Link>
            </SecondaryNavbar>
            {children}
        </div>
    )
}

export default EmailIntegrationUpdateLayout
