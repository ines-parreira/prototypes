import React from 'react'
import {Link, useParams, NavLink} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {List as ImmutableList, Map} from 'immutable'

import {isFeatureEnabled} from 'utils/account'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import {getCurrentPlan} from 'state/billing/selectors'
import {getIntegrationConfig} from 'state/integrations/helpers'
import {AccountFeature} from 'state/currentAccount/types'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import PageHeader from 'pages/common/components/PageHeader'

import Detail from '../../../components/Detail/Detail'
import Integration from './Integration'
import Create from './Create'
import List from './List'

const connectionsPath = 'connections'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Magento2({integration, integrations, loading, redirectUri}: Props) {
    const currentPlan = useAppSelector(getCurrentPlan)
    const {integrationId} = useParams<{integrationId: string}>()

    const isInPlan =
        currentPlan &&
        isFeatureEnabled(
            currentPlan.features[AccountFeature.MagentoIntegration]
        )

    const isNew = integrationId === 'new' && isInPlan
    const isIntegration =
        integrationId && integrationId !== connectionsPath && isInPlan
    const isConnections = integrationId === connectionsPath && isInPlan

    const magento2Config = getIntegrationConfig(IntegrationType.Magento2)

    const baseURL = `/app/settings/integrations/magento2`
    const links = [
        [`${baseURL}/`, 'App Details'],
        [`${baseURL}/${connectionsPath}`, 'Connections'],
    ]

    const connectProps = {
        connectUrl: '/app/settings/integrations/magento2/new',
        isExternalConnectUrl: false,
        ...(!isInPlan && {
            notification: {
                message: 'Feature not available on your current plan.',
            },
            isConnectionDisabled: true,
        }),
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
                                    to={`/app/settings/integrations/magento2/${connectionsPath}`}
                                >
                                    {magento2Config?.title}
                                </Link>
                            ) : (
                                magento2Config?.title
                            )}
                        </BreadcrumbItem>
                        {isIntegration && (
                            <BreadcrumbItem active>
                                {isNew
                                    ? 'Add integration'
                                    : integration.get('name')}
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                }
            />

            {isIntegration ? (
                isNew ? (
                    <Create
                        integration={integration}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                ) : (
                    <Integration
                        integration={integration}
                        loading={loading}
                        redirectUri={redirectUri}
                    />
                )
            ) : (
                <>
                    {isInPlan && (
                        <SecondaryNavbar>
                            {links.map(([to, text]) => (
                                <NavLink key={to} to={to} exact>
                                    {text}
                                </NavLink>
                            ))}
                        </SecondaryNavbar>
                    )}
                    {!isConnections && magento2Config ? (
                        <Detail {...magento2Config} {...connectProps} />
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

export default Magento2
