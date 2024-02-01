import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import React, {useEffect, useMemo, useState} from 'react'

import {Link, useHistory, useParams} from 'react-router-dom'
import classnames from 'classnames'

import _head from 'lodash/head'

import css from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'

import {IntegrationType} from 'models/integration/constants'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import useAsyncFn from 'hooks/useAsyncFn'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Button from 'pages/common/components/button/Button'
import {
    RevenueBundle,
    RevenueBundleActionResponse,
    RevenueBundleInstallationMethodResponse,
    RevenueBundleStatus,
} from 'models/revenueBundles/types'
import * as integrationsSelectors from 'state/integrations/selectors'

import client from 'models/api/resources'
import {getIconFromType} from 'state/integrations/helpers'
import BundleManualInstallationCard from 'pages/settings/revenue/components/BundlesView/BundleManualInstallationCard'
import {useRevenueAddonApi} from '../../hooks/useRevenueAddonApi'
import Loader from '../../../../common/components/Loader/Loader'
import {transformBundleError} from '../../utils/transformBundleError'
import pageCss from './BundlesView.less'

export const BundleDetailView = () => {
    const dispatch = useAppDispatch()
    const history = useHistory()

    const {bundleId} = useParams<{bundleId: string}>()

    const storeIntegrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes([IntegrationType.Shopify])
    )

    const {client: revenueClient} = useRevenueAddonApi()

    const [bundle, setBundle] = useState<RevenueBundle>()

    const [loading, setLoading] = useState(true)
    const [code, setCode] = useState('')

    const fetchBundle = () => {
        if (revenueClient) {
            revenueClient
                .get_bundle_installation({
                    id: bundleId,
                })
                .then((response) => {
                    setBundle(response.data as RevenueBundle)
                    setLoading(false)
                })
                .catch(() => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Could not get bundle information',
                        })
                    )
                })

            client
                .get<RevenueBundleActionResponse>(
                    `/api/revenue-addon-bundle/${bundleId}/`
                )
                .then((response) => {
                    setCode(response.data.code)
                })
                .catch(() => {
                    void dispatch(
                        notify({
                            status: NotificationStatus.Error,
                            message: 'Could not get bundle code',
                        })
                    )
                })
        }
    }

    useEffect(fetchBundle, [bundleId, dispatch, revenueClient])

    const currentIntegration = useMemo(
        () =>
            _head(
                storeIntegrations.filter(
                    (integration) =>
                        bundle && integration.id === bundle.shop_integration_id
                )
            ),
        [bundle, storeIntegrations]
    )
    const isConnected = Boolean(currentIntegration)
    const isConnectedToShopify =
        currentIntegration?.type === IntegrationType.Shopify
    const isOneClickInstalled =
        bundle?.status === RevenueBundleStatus.Installed &&
        bundle?.method === RevenueBundleInstallationMethodResponse.OneClick
    const isManuallyInstalled =
        bundle?.status === RevenueBundleStatus.Installed &&
        bundle?.method === RevenueBundleInstallationMethodResponse.Manual

    const [{loading: isUninstallSubmitting}, handleUninstall] =
        useAsyncFn(async () => {
            if (!bundle) {
                return
            }

            try {
                await client.post(
                    `/api/revenue-addon-bundle/${bundle.id}/uninstall/`,
                    {}
                )

                history.push('/app/settings/convert/installations')

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Bundle uninstalled',
                    })
                )
            } catch (error) {
                void dispatch(
                    notify(
                        transformBundleError(
                            error,
                            "Couldn't uninstall bundle",
                            bundle.shop_integration_id
                        )
                    )
                )
            }
        }, [bundle])

    const [{loading: isInstallSubmitting}, handleInstall] =
        useAsyncFn(async () => {
            if (!bundle) {
                return
            }

            try {
                await client.post(`/api/revenue-addon-bundle/install/`, {
                    integration_id: bundle.shop_integration_id,
                })

                fetchBundle()

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Bundle installed successfully',
                    })
                )
            } catch (error) {
                void dispatch(
                    notify(
                        transformBundleError(
                            error,
                            "Couldn't install bundle",
                            bundle.shop_integration_id
                        )
                    )
                )
            }
        }, [bundle])

    return loading ? (
        <Loader message="Loading..." minHeight={'400px'} />
    ) : (
        <div className="w-100">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={`/app/settings/convert/installations`}>
                                Convert installations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {currentIntegration && currentIntegration.name}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            ></PageHeader>

            <Container fluid className={css.pageContainer}>
                <div className={pageCss.content}>
                    <div className={pageCss.sectionHeading}>Store</div>

                    {!!currentIntegration && (
                        <div className={pageCss.store}>
                            <img
                                className={pageCss.storeIcon}
                                alt="logo"
                                src={getIconFromType(currentIntegration.type)}
                            />
                            {currentIntegration.name}
                        </div>
                    )}

                    <div className={pageCss.sectionHeading}>
                        Installation method
                    </div>

                    <div
                        className={classnames(
                            pageCss.containerFlex,
                            pageCss.container
                        )}
                    >
                        {isOneClickInstalled ? (
                            <i
                                className="material-icons text-success"
                                style={{fontSize: 24}}
                            >
                                check_circle
                            </i>
                        ) : null}
                        <div>
                            <div className={pageCss.title}>
                                1-click installation for Shopify
                            </div>
                            <div>
                                Add the Campaign bundle to your Shopify store in
                                one click.
                            </div>
                        </div>
                        {isOneClickInstalled ? (
                            <Button
                                intent="destructive"
                                isLoading={isUninstallSubmitting}
                                onClick={handleUninstall}
                                className={pageCss.actionButton}
                            >
                                Uninstall
                            </Button>
                        ) : (
                            <Button
                                intent="secondary"
                                isLoading={isInstallSubmitting}
                                onClick={handleInstall}
                                className={pageCss.actionButton}
                            >
                                Install
                            </Button>
                        )}
                    </div>

                    <BundleManualInstallationCard
                        bundleCode={code}
                        isConnected={isConnected}
                        isConnectedToShopify={isConnectedToShopify}
                        isInstalledManually={isManuallyInstalled}
                    />
                </div>
            </Container>
        </div>
    )
}
