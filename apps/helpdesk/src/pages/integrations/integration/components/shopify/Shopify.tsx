import type { List as ImmutableList, Map } from 'immutable'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import Detail from 'pages/common/components/ProductDetail'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { getIntegrationConfig } from 'state/integrations/helpers'

import Create from './Create'
import Integration from './Integration'
import List from './List'

const connectionsPath = 'connections'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Shopify({ integration, integrations, loading, redirectUri }: Props) {
    const { integrationId } = useParams<{ integrationId: string }>()

    const isNew = integrationId === 'new'
    const isIntegration = integrationId && integrationId !== connectionsPath
    const isConnections = integrationId === connectionsPath

    const shopifyConfig = getIntegrationConfig(IntegrationType.Shopify)

    if (!shopifyConfig) return null

    const baseURL = `/app/settings/integrations/shopify`
    const links = [
        [`${baseURL}/`, 'App Details'],
        [`${baseURL}/${connectionsPath}`, 'Connections'],
    ]

    const connectProps = {
        connectUrl: 'https://apps.shopify.com/helpdesk',
        isExternalConnectUrl: true,
    }

    const detailProps = mapAppToDetail(shopifyConfig)
    const CTA = (
        <ConnectLink
            connectUrl={connectProps.connectUrl}
            integrationTitle={IntegrationType.Shopify}
            isExternal={connectProps.isExternalConnectUrl}
        >
            <Button>Connect {IntegrationType.Shopify}</Button>
        </ConnectLink>
    )
    detailProps.infocard.CTA = CTA

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                All apps
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active={!isIntegration}>
                            {isIntegration ? (
                                <Link
                                    to={`/app/settings/integrations/shopify/${connectionsPath}`}
                                >
                                    {shopifyConfig.title}
                                </Link>
                            ) : (
                                shopifyConfig.title
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
            >
                {isConnections && CTA}
            </PageHeader>

            {isIntegration ? (
                isNew ? (
                    <Create redirectUri={redirectUri} />
                ) : (
                    <Integration
                        integration={integration}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            ) : (
                <>
                    <SecondaryNavbar>
                        {links.map(([to, text]) => (
                            <NavLink key={to} to={to} exact>
                                {text}
                            </NavLink>
                        ))}
                    </SecondaryNavbar>
                    {!isConnections ? (
                        <Detail {...detailProps} />
                    ) : (
                        <List
                            integrations={integrations}
                            loading={loading}
                            redirectUri={redirectUri}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default Shopify
