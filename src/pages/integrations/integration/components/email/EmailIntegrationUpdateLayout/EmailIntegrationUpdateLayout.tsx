import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {NavLink} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {FeatureFlagKey} from 'config/featureFlags'
import {EmailProvider} from 'models/integration/constants'
import {Integration} from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'

import {isBaseEmailIntegration, isGenericEmailIntegration} from '../helpers'

type Props = {
    integration: Integration
    children?: any
}

const EmailIntegrationUpdateLayout = ({integration, children}: Props) => {
    const integrationId = integration.id
    const isNewDomainVerificationEnabled: boolean =
        useFlags()[FeatureFlagKey.NewDomainVerification] ?? false

    if (!isGenericEmailIntegration(integration)) {
        return null
    }

    const isBaseIntegration = isBaseEmailIntegration(integration)
    const integrationProvider = integration.meta?.provider

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
                            {integration.name}{' '}
                            <span className="text-faded align-top">
                                {integration.meta?.address}
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
                {!isBaseIntegration &&
                    integrationProvider !== EmailProvider.Sendgrid && (
                        <NavLink
                            to={`/app/settings/channels/email/${integrationId}/dns`}
                            exact
                        >
                            Domain Verification
                        </NavLink>
                    )}
                {!isBaseIntegration &&
                    integrationProvider === EmailProvider.Sendgrid && (
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
