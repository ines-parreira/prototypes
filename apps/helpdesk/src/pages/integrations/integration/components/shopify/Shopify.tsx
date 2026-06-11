import type { List as ImmutableList, Map } from 'immutable'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import { useActionCentralizedLibraryEnabled } from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import { IntegrationType } from 'models/integration/types'
import { PageHeader } from 'pages/common/components/PageHeader'
import { Detail } from 'pages/common/components/ProductDetail'
import { SecondaryNavbar } from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import { ConnectLink } from 'pages/integrations/components/ConnectLink'
import { AppActionsTab } from 'pages/integrations/integration/components/app/AppActionsTab'
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { getIntegrationConfig } from 'state/integrations/helpers'
import { assetsUrl } from 'utils'

import { Create } from './Create'
import { Integration } from './Integration'
import { List } from './List'

const connectionsPath = 'connections'
const actionsPath = 'actions'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Shopify({ integration, integrations, loading, redirectUri }: Props) {
    const { integrationId } = useParams<{ integrationId: string }>()

    const { isEnabled: isActionLibraryEnabled } =
        useActionCentralizedLibraryEnabled()

    const isNew = integrationId === 'new'
    const isActions = integrationId === actionsPath
    const isIntegration =
        integrationId &&
        integrationId !== connectionsPath &&
        integrationId !== actionsPath
    const isConnections = integrationId === connectionsPath

    const shopifyConfig = getIntegrationConfig(IntegrationType.Shopify)

    if (!shopifyConfig) return null

    const baseURL = `/app/settings/integrations/shopify`
    const links = [
        [`${baseURL}/`, 'App Details'],
        [`${baseURL}/${connectionsPath}`, 'Connections'],
        ...(isActionLibraryEnabled
            ? [[`${baseURL}/${actionsPath}`, 'Actions']]
            : []),
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
    const ActionsCTA = (
        <ConnectLink
            connectUrl={connectProps.connectUrl}
            integrationTitle={IntegrationType.Shopify}
            isExternal={connectProps.isExternalConnectUrl}
        >
            <Button>Add connection</Button>
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
                {isConnections
                    ? CTA
                    : isActions && isActionLibraryEnabled
                      ? ActionsCTA
                      : null}
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
                    {isActions && isActionLibraryEnabled ? (
                        <AppActionsTab
                            appId="shopify"
                            appName={shopifyConfig.title}
                            appIcon={
                                shopifyConfig.image
                                    ? assetsUrl(shopifyConfig.image)
                                    : undefined
                            }
                        />
                    ) : isConnections ? (
                        <List
                            integrations={integrations}
                            loading={loading}
                            redirectUri={redirectUri}
                        />
                    ) : (
                        <Detail {...detailProps} />
                    )}
                </>
            )}
        </div>
    )
}

export { Shopify }
