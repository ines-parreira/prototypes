import { PlanName } from '@repo/billing'
import type { List as ImmutableList, Map } from 'immutable'
import { Link, NavLink, useParams } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import PageHeader from 'pages/common/components/PageHeader'
import Detail from 'pages/common/components/ProductDetail'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { makeHasFeature } from 'state/billing/selectors'
import { AccountFeature } from 'state/currentAccount/types'
import { getIntegrationConfig } from 'state/integrations/helpers'

import Create from './Create'
import Integration from './Integration'
import List from './List'

import css from './Magento2.less'

const connectionsPath = 'connections'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Magento2({ integration, integrations, loading, redirectUri }: Props) {
    const upgradePlanPathname = '/app/settings/billing'

    const getHasFeature = useAppSelector(makeHasFeature)
    const { integrationId } = useParams<{ integrationId: string }>()

    const hasMagentoFeature = getHasFeature(AccountFeature.MagentoIntegration)

    const isNew = integrationId === 'new' && hasMagentoFeature
    const isIntegration =
        integrationId && integrationId !== connectionsPath && hasMagentoFeature
    const isConnections = integrationId === connectionsPath && hasMagentoFeature

    const magento2Config = getIntegrationConfig(IntegrationType.Magento2)
    if (!magento2Config) return null

    const baseURL = `/app/settings/integrations/magento2`
    const links = [
        [`${baseURL}/`, 'App Details'],
        [`${baseURL}/${connectionsPath}`, 'Connections'],
    ]

    const connectProps = {
        connectUrl: '/app/settings/integrations/magento2/new',
        isExternalConnectUrl: false,
        isConnectionDisabled: !hasMagentoFeature,
        disabledMessage:
            !hasMagentoFeature && 'App is not available on your current plan',
    }

    const detailProps = mapAppToDetail(magento2Config)

    const connectLink = (
        <ConnectLink
            connectUrl={connectProps.connectUrl}
            isExternal={connectProps.isExternalConnectUrl}
            isDisabled={connectProps.isConnectionDisabled}
            integrationTitle={IntegrationType.Magento2}
        >
            <Button isDisabled={connectProps.isConnectionDisabled}>
                Connect {IntegrationType.Magento2}
            </Button>
        </ConnectLink>
    )

    const CTA = (
        <>
            {connectLink}
            {connectProps.isConnectionDisabled && (
                <div className={css.disabledConnectionNotification}>
                    App is not available on your current plan.{' '}
                    <Link
                        to={{
                            pathname: upgradePlanPathname,
                            state: {
                                openedPlanModal: PlanName.Pro,
                            },
                        }}
                    >
                        See upgrade details.
                    </Link>
                </div>
            )}
        </>
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
                                    ? 'Connect app'
                                    : integration.get('name')}
                            </BreadcrumbItem>
                        )}
                    </Breadcrumb>
                }
            >
                {isConnections && connectLink}
            </PageHeader>

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
                    {hasMagentoFeature && (
                        <SecondaryNavbar>
                            {links.map(([to, text]) => (
                                <NavLink key={to} to={to} exact>
                                    {text}
                                </NavLink>
                            ))}
                        </SecondaryNavbar>
                    )}
                    {!isConnections && magento2Config ? (
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

export default Magento2
