import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {Map} from 'immutable'
import {useQueryClient} from '@tanstack/react-query'
import classnames from 'classnames'
import {Link} from 'react-router-dom'
import client from 'models/api/resources'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import useAppDispatch from 'hooks/useAppDispatch'
import {getIconFromType} from 'state/integrations/helpers'
import BundleManualInstallationCard from 'pages/convert/bundles/components/BundleManualInstallationCard/BundleManualInstallationCard'
import {bundleKeys} from 'models/convert/bundle/queries'
import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import {Bundle, BundleActionResponse} from 'models/convert/bundle/types'
import {convertStatusKeys} from 'pages/settings/revenue/hooks/useGetConvertStatus'
import ConvertBundle1ClickInstallCard from '../ConvertBundle1ClickInstallCard'
import css from './ConvertBundleDetail.less'

type Props = {
    chatIntegration?: Map<any, any>
    storeIntegration?: Map<any, any>
    bundle?: Bundle
    onChange?: (isInstalled: boolean) => void
}

const ConvertBundleDetail = ({
    bundle,
    chatIntegration,
    storeIntegration,
    onChange,
}: Props) => {
    const queryClient = useQueryClient()
    const dispatch = useAppDispatch()

    const isConnectedToShopify = useMemo(
        () =>
            Boolean(
                storeIntegration &&
                    storeIntegration.get('type') === SHOPIFY_INTEGRATION_TYPE
            ),
        [storeIntegration]
    )

    const [code, setCode] = useState('')
    const fetchBundleCode = () => {
        if (!bundle) return

        client
            .get<BundleActionResponse>(
                `/api/revenue-addon-bundle/${bundle.id}/`
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

    useEffect(fetchBundleCode, [bundle, dispatch])

    const storeIntegrationId = useMemo(() => {
        if (
            chatIntegration &&
            chatIntegration.get('type') === GORGIAS_CHAT_INTEGRATION_TYPE
        ) {
            return chatIntegration.getIn([
                'meta',
                'shop_integration_id',
            ]) as number
        }
        return 0
    }, [chatIntegration])

    const chatIntegrationId = useMemo(() => {
        if (!!chatIntegration && chatIntegration.get('id')) {
            return chatIntegration.get('id') as number
        }
    }, [chatIntegration])

    const integrationId = useMemo(
        () => (!!storeIntegrationId ? storeIntegrationId : chatIntegrationId),
        [storeIntegrationId, chatIntegrationId]
    )

    const handle1ClickInstall = useCallback(
        async (isInstalled) => {
            await queryClient.invalidateQueries({
                queryKey: bundleKeys.lists(),
            })
            await queryClient.invalidateQueries({
                queryKey: convertStatusKeys.all(),
            })

            if (onChange) {
                onChange(isInstalled)
            }
        },
        [onChange, queryClient]
    )

    return (
        <div className={css.content}>
            {!!chatIntegration && !!chatIntegrationId && (
                <>
                    <div className={css.sectionHeading}>Chat</div>
                    <div className={css.store}>
                        <i
                            className={classnames(
                                'material-icons',
                                css.storeIcon
                            )}
                        >
                            forum
                        </i>
                        <b>{chatIntegration.get('name')}</b>
                        <Link
                            to={`/app/settings/channels/gorgias_chat/${chatIntegrationId}/installation`}
                            className={css.manageLink}
                        >
                            Manage Chat
                        </Link>
                    </div>
                </>
            )}
            {!!storeIntegration && (
                <>
                    <div className={css.sectionHeading}>Store</div>
                    <div className={css.store}>
                        {getIconFromType(storeIntegration.get('type')) ? (
                            <img
                                className={css.storeIcon}
                                alt="logo"
                                src={getIconFromType(
                                    storeIntegration.get('type')
                                )}
                            />
                        ) : (
                            <i
                                className={classnames(
                                    'material-icons',
                                    css.storeIcon
                                )}
                            >
                                store
                            </i>
                        )}
                        {storeIntegration.get('name') ? (
                            <b>{storeIntegration.get('name')}</b>
                        ) : (
                            <>No store connected to Chat</>
                        )}
                    </div>
                </>
            )}

            <div className={css.sectionHeading}>
                Campaign bundle installation method
            </div>

            <p>
                Installing the campaign bundle is required to display campaigns
                on your store.
            </p>

            <ConvertBundle1ClickInstallCard
                bundle={bundle}
                isConnectedToShopify={isConnectedToShopify}
                integrationId={integrationId}
                onChange={handle1ClickInstall}
            />

            <BundleManualInstallationCard
                bundleCode={code}
                isBordered={true}
                isConnected={Boolean(storeIntegration)}
                isConnectedToShopify={isConnectedToShopify}
            />
        </div>
    )
}

export default ConvertBundleDetail
