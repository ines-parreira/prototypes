import {Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {NavLink} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {FeatureFlagKey} from 'config/featureFlags'
import {EmailProvider} from 'models/integration/constants'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

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
    const isNewDomainVerificationEnabled: boolean =
        useFlags()[FeatureFlagKey.NewDomainVerification] ?? false

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
                        to={`/app/settings/channels/email/${integrationId}/outbound-verification`}
                    >
                        {isNewDomainVerificationEnabled
                            ? 'Domain Verification'
                            : 'Outbound Verification'}
                    </NavLink>
                )}
            </SecondaryNavbar>
            {children}
        </div>
    )
}

export default EmailIntegrationUpdateLayout
