import React from 'react'
import {Link, useParams, NavLink} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {List as ImmutableList, Map} from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import {getEligibleShopifyIntegrationsFor} from 'state/integrations/selectors'
import {getIntegrationConfig} from 'state/integrations/helpers'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import PageHeader from 'pages/common/components/PageHeader'
import {IntegrationType} from 'models/integration/types'

import Detail from '../../../components/Detail/Detail'
import Integration from './Integration'
import List from './List'

const connectionsPath = 'connections'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Recharge({integration, integrations, loading, redirectUri}: Props) {
    const availableShopifyIntegrations = useAppSelector((state) =>
        getEligibleShopifyIntegrationsFor(state)(IntegrationType.Recharge)
    )

    const {integrationId} = useParams<{integrationId: string}>()

    const isNew = integrationId === 'new'
    const isIntegration = integrationId && integrationId !== connectionsPath
    const isConnections = integrationId === connectionsPath
    const hasNoAvailableShopifyIntegrations = !availableShopifyIntegrations.size
    const notification = hasNoAvailableShopifyIntegrations
        ? {
              message: integrations.size
                  ? `You are all set! All your Shopify stores have Recharge connected.`
                  : `To connect the Recharge app you need to have at least one Shopify store connected to Gorgias.`,
              actionHTML: !integrations.size ? (
                  <Link to="/app/settings/integrations/shopify">
                      Connect Shopify
                  </Link>
              ) : undefined,
          }
        : undefined

    const rechargeConfig = getIntegrationConfig(IntegrationType.Recharge)

    const baseURL = `/app/settings/integrations/recharge`
    const links = [
        [`${baseURL}/`, 'App Details'],
        [`${baseURL}/${connectionsPath}`, 'Connections'],
    ]

    const connectProps = {
        connectUrl: '/app/settings/integrations/recharge/new',
        isExternalConnectUrl: false,
        notification: notification,
        isConnectionDisabled: hasNoAvailableShopifyIntegrations,
    }

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                All Apps
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active={!isIntegration}>
                            {isIntegration ? (
                                <Link
                                    to={`/app/settings/integrations/recharge/${connectionsPath}`}
                                >
                                    {rechargeConfig?.title}
                                </Link>
                            ) : (
                                rechargeConfig?.title
                            )}
                        </BreadcrumbItem>
                        {isIntegration && (
                            <BreadcrumbItem active>
                                {isNew
                                    ? 'Connect app'
                                    : integration.get('name')}
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                }
            />

            {isIntegration ? (
                <Integration
                    integration={integration}
                    availableShopifyIntegrations={availableShopifyIntegrations}
                    loading={loading}
                    redirectUri={redirectUri}
                />
            ) : (
                <>
                    <SecondaryNavbar>
                        {links.map(([to, text]) => (
                            <NavLink key={to} to={to} exact>
                                {text}
                            </NavLink>
                        ))}
                    </SecondaryNavbar>
                    {!isConnections && rechargeConfig ? (
                        <Detail {...rechargeConfig} {...connectProps} />
                    ) : (
                        <List
                            integrations={integrations}
                            loading={loading}
                            redirectUri={redirectUri}
                            {...connectProps}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default Recharge
