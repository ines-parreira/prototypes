import React from 'react'
import {Link, useParams, NavLink} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {List as ImmutableList, Map} from 'immutable'

import {getIntegrationConfig} from 'state/integrations/helpers'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import PageHeader from 'pages/common/components/PageHeader'
import {IntegrationType} from 'models/integration/types'

import Detail from '../../../components/Detail/Detail'
import {isProduction, isStaging} from '../../../../../utils/environment'
import Integration from './Integration'
import List from './List'

const connectionsPath = 'connections'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function BigCommerce({integration, integrations, loading, redirectUri}: Props) {
    const {integrationId} = useParams<{integrationId: string}>()

    const isIntegration = integrationId && integrationId !== connectionsPath
    const isConnections = integrationId === connectionsPath

    const bigcommerceConfig = getIntegrationConfig(IntegrationType.BigCommerce)

    const baseURL = `/app/settings/integrations/bigcommerce`
    const links = [
        [`${baseURL}/`, 'App Details'],
        [`${baseURL}/${connectionsPath}`, 'Connections'],
    ]
    let connectUrl =
        'https://store-pk360c6roo.mybigcommerce.com/manage/marketplace/apps/my-apps'
    if (isStaging()) {
        connectUrl =
            'https://store-pk360c6roo.mybigcommerce.com/manage/app/39647'
    }
    if (isProduction()) {
        connectUrl =
            'https://store-pk360c6roo.mybigcommerce.com/manage/marketplace/apps/38723' // will replace with published app
    }
    const connectProps = {
        connectUrl: connectUrl,
        isExternalConnectUrl: true,
    }

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
            />

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
                    {!isConnections && bigcommerceConfig ? (
                        <Detail {...bigcommerceConfig} {...connectProps} />
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

export default BigCommerce
