import {Breadcrumb, BreadcrumbItem, Container} from 'reactstrap'
import React, {useEffect, useMemo, useState} from 'react'

import {Link, useParams} from 'react-router-dom'
import classnames from 'classnames'

import _head from 'lodash/head'
import {useAsyncFn} from 'react-use'
import css from 'pages/settings/settings.less'

import PageHeader from 'pages/common/components/PageHeader'

import {IntegrationType} from 'models/integration/constants'
import useAppSelector from 'hooks/useAppSelector'

import useAppDispatch from 'hooks/useAppDispatch'

import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import Button from 'pages/common/components/button/Button'
import {
    RevenueBundle,
    RevenueBundleActionResponse,
    RevenueBundleStatus,
} from 'models/revenueBundles/types'
import * as integrationsSelectors from 'state/integrations/selectors'

import client from 'models/api/resources'
import IconButton from 'pages/common/components/button/IconButton'
import Collapse from 'pages/common/components/Collapse/Collapse'
import InstallationCodeSnippet from 'pages/common/components/InstallationCodeSnippet/InstallationCodeSnippet'
import {getIconFromType} from 'state/integrations/helpers'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {useRevenueAddonApi} from '../../hooks/useRevenueAddonApi'
import Loader from '../../../../common/components/Loader/Loader'
import {transformBundleError} from '../../utils/transformBundleError'
import pageCss from './BundlesView.less'

export const BundleDetailView = () => {
    const dispatch = useAppDispatch()

    const {bundleId} = useParams<{bundleId: string}>()

    const storeIntegrations = useAppSelector(
        integrationsSelectors.getIntegrationsByTypes([IntegrationType.Shopify])
    )

    const {client: revenueClient} = useRevenueAddonApi()

    const [bundle, setBundle] = useState<RevenueBundle>()

    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
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

                fetchBundle()

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

    const isConvertSubscriber = useIsConvertSubscriber()
    if (!isConvertSubscriber) {
        return (
            <div className={css.pageContainer}>
                You don't have access to this page, please contact your CSM.
            </div>
        )
    }

    return loading ? (
        <Loader message="Loading..." minHeight={'400px'} />
    ) : (
        <div className="w-100">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to={`/app/settings/revenue/bundles`}>
                                Bundle management
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {currentIntegration && currentIntegration.name}
                        </BreadcrumbItem>
                    </Breadcrumb>
                }
            ></PageHeader>

            <Container fluid className={classnames(css.pageContainer, css.pb0)}>
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
                        {bundle?.status === RevenueBundleStatus.Installed ? (
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
                                Add the Revenue bundle to your Shopify store in
                                one click.
                            </div>
                        </div>
                        {bundle?.status === RevenueBundleStatus.Installed ? (
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
                    <div className={pageCss.container}>
                        <div
                            className={pageCss.header}
                            onClick={() => {
                                setIsOpen(!isOpen)
                            }}
                        >
                            <div>
                                <div className={pageCss.title}>
                                    Manual installation
                                </div>
                                <div>
                                    Add the Revenue tracking to specific pages
                                    on a Shopify store and to other e-commerce
                                    platforms or website.
                                </div>
                            </div>
                            <IconButton fillStyle="ghost" intent="secondary">
                                {isOpen
                                    ? 'keyboard_arrow_up'
                                    : 'keyboard_arrow_down'}
                            </IconButton>
                        </div>

                        <Collapse isOpen={isOpen}>
                            <div className={pageCss.code}>
                                <InstallationCodeSnippet code={code} />
                            </div>
                        </Collapse>
                    </div>
                </div>
            </Container>
        </div>
    )
}
