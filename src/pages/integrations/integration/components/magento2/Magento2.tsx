import React from 'react'
import {Link, useParams, NavLink} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'
import {List as ImmutableList, Map} from 'immutable'

import {useFlags} from 'launchdarkly-react-client-sdk'
import {PlanName} from 'utils/paywalls'
import useAppSelector from 'hooks/useAppSelector'
import {IntegrationType} from 'models/integration/types'
import {makeHasFeature} from 'state/billing/selectors'
import {getIntegrationConfig} from 'state/integrations/helpers'
import {AccountFeature} from 'state/currentAccount/types'
import SecondaryNavbar from 'pages/common/components/SecondaryNavbar/SecondaryNavbar'
import PageHeader from 'pages/common/components/PageHeader'
import Detail from 'pages/common/components/ProductDetail'
import {mapAppToDetail} from 'pages/integrations/mappers/appToDetail'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import Button from 'pages/common/components/button/Button'

import {FeatureFlagKey} from 'config/featureFlags'
import Integration from './Integration'
import Create from './Create'
import List from './List'

import css from './Magento2.less'

const connectionsPath = 'connections'

type Props = {
    integrations: ImmutableList<Map<any, any>>
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Magento2({integration, integrations, loading, redirectUri}: Props) {
    const hasAccessToNewBilling: boolean | undefined =
        useFlags()[FeatureFlagKey.NewBillingInterface]

    const upgradePlanPathname = hasAccessToNewBilling
        ? '/app/settings/billing'
        : '/app/settings/billing/plans'

    const getHasFeature = useAppSelector(makeHasFeature)
    const {integrationId} = useParams<{integrationId: string}>()

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
    const CTA = (
        <>
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
                            {...connectProps}
                        />
                    )}
                </>
            )}
        </div>
    )
}

export default Magento2
