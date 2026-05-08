import type { List as ImmutableList, Map } from 'immutable'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import { useActionCentralizedLibraryEnabled } from 'hooks/integrations/useActionCentralizedLibraryEnabled'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import Detail from 'pages/common/components/ProductDetail'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import AppActionsTab from 'pages/integrations/integration/components/app/AppActionsTab'
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { getIntegrationConfig } from 'state/integrations/helpers'
import { getEligibleShopifyIntegrationsFor } from 'state/integrations/selectors'
import { assetsUrl } from 'utils'

import Integration from './Integration'
import List from './List'

const connectionsPath = 'connections'
const actionsPath = 'actions'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Recharge({ integration, integrations, loading, redirectUri }: Props) {
    const availableShopifyIntegrations = useAppSelector((state) =>
        getEligibleShopifyIntegrationsFor(state)(IntegrationType.Recharge),
    )

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
    const hasNoAvailableShopifyIntegrations = !availableShopifyIntegrations.size
    const alertBanner = hasNoAvailableShopifyIntegrations
        ? {
              message: integrations.size
                  ? `You are all set! All your Shopify stores have Recharge connected.`
                  : `To connect the Recharge app you need to have at least one Shopify store connected to Gorgias.`,
              CTA: !integrations.size
                  ? {
                        type: 'internal' as const,
                        to: '/app/settings/integrations/shopify',
                        text: 'Connect Shopify',
                    }
                  : undefined,
          }
        : undefined

    const rechargeConfig = getIntegrationConfig(IntegrationType.Recharge)
    if (!rechargeConfig) return null

    const baseURL = `/app/settings/integrations/recharge`
    const links = [
        [`${baseURL}/`, 'App Details'],
        [`${baseURL}/${connectionsPath}`, 'Connections'],
        ...(isActionLibraryEnabled
            ? [[`${baseURL}/${actionsPath}`, 'Actions']]
            : []),
    ]

    const connectProps = {
        connectUrl: '/app/settings/integrations/recharge/new',
        isExternalConnectUrl: false,
        isConnectionDisabled: hasNoAvailableShopifyIntegrations,
    }

    const detailProps = mapAppToDetail({ ...rechargeConfig })
    detailProps.alertBanner = alertBanner
    const CTA = (
        <ConnectLink
            connectUrl={connectProps.connectUrl}
            isExternal={connectProps.isExternalConnectUrl}
            isDisabled={connectProps.isConnectionDisabled}
            integrationTitle={IntegrationType.Recharge}
            disabledMessage={
                (connectProps.isConnectionDisabled && alertBanner?.message) ||
                ''
            }
        >
            <Button isDisabled={connectProps.isConnectionDisabled}>
                Connect {IntegrationType.Recharge}
            </Button>
        </ConnectLink>
    )
    const ActionsCTA = (
        <ConnectLink
            connectUrl={connectProps.connectUrl}
            isExternal={connectProps.isExternalConnectUrl}
            isDisabled={connectProps.isConnectionDisabled}
            integrationTitle={IntegrationType.Recharge}
            disabledMessage={
                (connectProps.isConnectionDisabled && alertBanner?.message) ||
                ''
            }
        >
            <Button isDisabled={connectProps.isConnectionDisabled}>
                Add new connection
            </Button>
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
                                    to={`/app/settings/integrations/recharge/${connectionsPath}`}
                                >
                                    {rechargeConfig.title}
                                </Link>
                            ) : (
                                rechargeConfig.title
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
                    {isActions && isActionLibraryEnabled ? (
                        <AppActionsTab
                            appId="recharge"
                            appName={rechargeConfig.title}
                            appIcon={
                                rechargeConfig.image
                                    ? assetsUrl(rechargeConfig.image)
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

export default Recharge
