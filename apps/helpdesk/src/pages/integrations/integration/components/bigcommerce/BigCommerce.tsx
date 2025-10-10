import { List as ImmutableList, Map } from 'immutable'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { LegacyButton as Button } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import Detail from 'pages/common/components/ProductDetail'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { getIntegrationConfig } from 'state/integrations/helpers'

import Integration from './Integration'
import List from './List'
import { getConnectUrl } from './Utils'

const connectionsPath = 'connections'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function BigCommerce({
    integration,
    integrations,
    loading,
    redirectUri,
}: Props) {
    const { integrationId } = useParams<{ integrationId: string }>()

    const isIntegration = integrationId && integrationId !== connectionsPath
    const isConnections = integrationId === connectionsPath

    const bigcommerceConfig = getIntegrationConfig(IntegrationType.BigCommerce)

    if (!bigcommerceConfig) return null

    const baseURL = `/app/settings/integrations/bigcommerce`
    const links = [
        [`${baseURL}/`, 'App Details'],
        [`${baseURL}/${connectionsPath}`, 'Connections'],
    ]

    const connectProps = {
        connectUrl: getConnectUrl(),
        isExternalConnectUrl: true,
    }

    const detailProps = mapAppToDetail(bigcommerceConfig)
    const CTA = (
        <ConnectLink
            connectUrl={connectProps.connectUrl}
            integrationTitle={IntegrationType.BigCommerce}
            isExternal={connectProps.isExternalConnectUrl}
        >
            <Button>Connect BigCommerce</Button>
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
                                    to={`/app/settings/integrations/bigcommerce/${connectionsPath}`}
                                >
                                    {bigcommerceConfig?.title}
                                </Link>
                            ) : (
                                bigcommerceConfig?.title
                            )}
                        </BreadcrumbItem>
                        {isIntegration && (
                            <BreadcrumbItem active>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                }
            >
                {isConnections && CTA}
            </PageHeader>

            {isIntegration ? (
                <Integration
                    integration={integration}
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
                    {!isConnections ? (
                        <Detail {...detailProps} />
                    ) : (
                        <List integrations={integrations} loading={loading} />
                    )}
                </>
            )}
        </div>
    )
}

export default BigCommerce
