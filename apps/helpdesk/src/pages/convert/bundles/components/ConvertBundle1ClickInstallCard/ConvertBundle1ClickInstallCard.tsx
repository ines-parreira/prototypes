import React, { useMemo } from 'react'

import { useAsyncFn } from '@repo/hooks'
import classnames from 'classnames'

import { Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import client from 'models/api/resources'
import {
    Bundle,
    BundleInstallationMethodResponse,
    BundleStatus,
} from 'models/convert/bundle/types'
import { transformBundleError } from 'pages/convert/common/utils/transformBundleError'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import css from './ConvertBundle1ClickInstallCard.less'

type Props = {
    chatIntegrationId?: number
    integrationId?: number
    isConnectedToShopify: boolean
    isThemeAppExtensionInstallation: boolean
    bundle?: Bundle
    onChange?: (isInstalled: boolean) => void
}

const ConvertBundle1ClickInstallCard = ({
    chatIntegrationId,
    integrationId,
    isConnectedToShopify,
    isThemeAppExtensionInstallation,
    bundle,
    onChange,
}: Props) => {
    const dispatch = useAppDispatch()

    const isOneClickInstalled =
        bundle?.status === BundleStatus.Installed &&
        bundle?.method === BundleInstallationMethodResponse.OneClick

    const isThemeAppInstalled =
        bundle?.status === BundleStatus.Installed &&
        bundle?.method === BundleInstallationMethodResponse.ThemeApp

    const [{ loading: isUninstallSubmitting }, handleUninstall] =
        useAsyncFn(async () => {
            if (!bundle) {
                return
            }

            if (isThemeAppExtensionInstallation) {
                window.location.href = `/app/settings/channels/gorgias_chat/${chatIntegrationId}/installation`
                return
            }

            try {
                await client.post(
                    `/api/revenue-addon-bundle/${bundle.id}/uninstall/`,
                    {},
                )

                if (onChange) {
                    onChange(false)
                }

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'Bundle uninstalled',
                    }),
                )
            } catch (error) {
                void dispatch(
                    notify(
                        transformBundleError(
                            error,
                            "Couldn't uninstall bundle",
                            bundle.shop_integration_id,
                        ),
                    ),
                )
            }
        }, [bundle, isThemeAppExtensionInstallation, chatIntegrationId])

    const [{ loading: isInstallSubmitting }, handleInstall] = useAsyncFn(
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
                    }),
                )
            } catch (error) {
                void dispatch(
                    notify(
                        transformBundleError(
                            error,
                            "Couldn't install bundle",
                            integrationId,
                        ),
                    ),
                )
            }
        },
    )

    const shouldDisplay = useMemo(() => {
        return (
            isConnectedToShopify &&
            (!isThemeAppExtensionInstallation || isThemeAppInstalled)
        )
    }, [
        isConnectedToShopify,
        isThemeAppExtensionInstallation,
        isThemeAppInstalled,
    ])

    return (
        <>
            {shouldDisplay && (
                <div className={classnames(css.containerFlex, css.container)}>
                    {isOneClickInstalled || isThemeAppInstalled ? (
                        <i
                            className="material-icons text-success"
                            style={{ fontSize: 24 }}
                        >
                            check_circle
                        </i>
                    ) : null}
                    <div>
                        {isThemeAppExtensionInstallation &&
                            isThemeAppInstalled && (
                                <>
                                    <div className={css.title}>
                                        Quick installation for Shopify
                                    </div>
                                    <div>
                                        Campaign bundle added to your Shopify
                                        store together with Chat.
                                    </div>
                                </>
                            )}
                        {!isThemeAppExtensionInstallation && (
                            <>
                                <div className={css.title}>
                                    1-click installation for Shopify
                                </div>
                                <div>
                                    Add the Campaign bundle to your Shopify
                                    store in one click.
                                </div>
                            </>
                        )}
                    </div>
                    {isOneClickInstalled || isThemeAppInstalled ? (
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
