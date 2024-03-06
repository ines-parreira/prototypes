import React from 'react'
import classnames from 'classnames'
import useAsyncFn from 'hooks/useAsyncFn'
import client from 'models/api/resources'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {transformBundleError} from 'pages/settings/revenue/utils/transformBundleError'
import {
    RevenueBundle,
    RevenueBundleInstallationMethodResponse,
    RevenueBundleStatus,
} from 'models/revenueBundles/types'
import useAppDispatch from 'hooks/useAppDispatch'
import Button from 'pages/common/components/button/Button'
import css from './ConvertBundle1ClickInstallCard.less'

type Props = {
    integrationId?: number
    isConnectedToShopify: boolean
    bundle?: RevenueBundle
    onChange?: (isInstalled: boolean) => void
}

const ConvertBundle1ClickInstallCard = ({
    bundle,
    isConnectedToShopify,
    integrationId,
    onChange,
}: Props) => {
    const dispatch = useAppDispatch()

    const isOneClickInstalled =
        bundle?.status === RevenueBundleStatus.Installed &&
        bundle?.method === RevenueBundleInstallationMethodResponse.OneClick

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

                if (onChange) {
                    onChange(false)
                }

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

    const [{loading: isInstallSubmitting}, handleInstall] = useAsyncFn(
        async () => {
            try {
                await client.post(`/api/revenue-addon-bundle/install/`, {
                    integration_id: integrationId,
                })

                if (onChange) {
                    onChange(true)
                }

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
                            integrationId
                        )
                    )
                )
            }
        }
    )

    return (
        <>
            {isConnectedToShopify && (
                <div className={classnames(css.containerFlex, css.container)}>
                    {isOneClickInstalled ? (
                        <i
                            className="material-icons text-success"
                            style={{fontSize: 24}}
                        >
                            check_circle
                        </i>
                    ) : null}
                    <div>
                        <div className={css.title}>
                            1-click installation for Shopify
                        </div>
                        <div>
                            Add the Campaign bundle to your Shopify store in one
                            click.
                        </div>
                    </div>
                    {isOneClickInstalled ? (
                        <Button
                            intent="secondary"
                            isLoading={isUninstallSubmitting}
                            onClick={handleUninstall}
                            className={css.actionButton}
                        >
                            Uninstall
                        </Button>
                    ) : (
                        <Button
                            intent="secondary"
                            isLoading={isInstallSubmitting}
                            onClick={handleInstall}
                            className={css.actionButton}
                        >
                            Install
                        </Button>
                    )}
                </div>
            )}
        </>
    )
}

export default ConvertBundle1ClickInstallCard
