import React from 'react'
import {Link} from 'react-router-dom'

import classNames from 'classnames'

import {useFlags} from 'launchdarkly-react-client-sdk'

import {isAdmin} from 'utils'

import {FeatureFlagKey} from 'config/featureFlags'

import useAppSelector from 'hooks/useAppSelector'

import {IntegrationType} from 'models/integration/constants'

import {getCurrentUser} from 'state/currentUser/selectors'
import {NotificationStatus} from 'state/notifications/types'
import {makeGetRedirectUri} from 'state/integrations/selectors'

import BannerNotification from '../BannerNotifications/BannerNotification'

import useStoresRequiringScriptTagMigration from './hooks/useStoresRequiringScriptTagMigration'

const ScriptTagMigrationBanner = () => {
    const migrationDueDate: string | undefined =
        useFlags()[FeatureFlagKey.ChatScopeUpdateDueDate]

    const showMigrationBanner: boolean | undefined =
        useFlags()[FeatureFlagKey.ChatScopeUpdateBanner]

    const reinstallsOnShopifyCallback: boolean | undefined =
        useFlags()[FeatureFlagKey.ChatScopeReinstallOnShopifyCallback]

    const getRedirectUri = useAppSelector(makeGetRedirectUri)

    const currentUser = useAppSelector(getCurrentUser)

    const storesRequiringScriptTagMigration =
        useStoresRequiringScriptTagMigration()

    if (
        !storesRequiringScriptTagMigration ||
        !storesRequiringScriptTagMigration.length
    ) {
        return null
    }

    const storesRequiringPermissionUpdates =
        storesRequiringScriptTagMigration.filter(
            ({storeRequiresPermissionUpdates}) => storeRequiresPermissionUpdates
        )

    const gorgiasChatsRequiringReinstall =
        storesRequiringScriptTagMigration.filter(
            ({gorgiasChatRequiresReinstall}) => gorgiasChatRequiresReinstall
        )

    const redirectUri = getRedirectUri(IntegrationType.Shopify)

    const shopName = storesRequiringPermissionUpdates.length
        ? storesRequiringPermissionUpdates[0].storeIntegration?.meta?.shop_name
        : ''

    const retriggerOAuthFlow = (ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault()
        window.location.href = redirectUri.replace('{shop_name}', shopName)
    }

    if (
        !showMigrationBanner ||
        !migrationDueDate ||
        !isAdmin(currentUser) ||
        (!storesRequiringPermissionUpdates.length &&
            !gorgiasChatsRequiringReinstall.length)
    ) {
        return null
    }

    const reInstallLink =
        gorgiasChatsRequiringReinstall.length > 1
            ? '/app/settings/channels/gorgias_chat'
            : `/app/settings/channels/gorgias_chat/${
                  gorgiasChatsRequiringReinstall[0]?.gorgiasChatIntegration?.get(
                      'id'
                  ) as string
              }/installation`

    return (
        <BannerNotification
            message={
                <>
                    <b>Action required</b>:{' '}
                    {!!storesRequiringPermissionUpdates.length && (
                        <>
                            {storesRequiringPermissionUpdates.length > 1 ? (
                                <Link to="/app/settings/channels/gorgias_chat">
                                    Update your Shopify permissions
                                </Link>
                            ) : (
                                <a onClick={retriggerOAuthFlow} href="#">
                                    Update your Shopify permissions
                                </a>
                            )}{' '}
                        </>
                    )}
                    {!!storesRequiringPermissionUpdates.length &&
                        !!gorgiasChatsRequiringReinstall.length && <>and </>}
                    {!!gorgiasChatsRequiringReinstall.length && (
                        <>
                            <span
                                className={classNames({
                                    'text-capitalize':
                                        !storesRequiringPermissionUpdates.length,
                                })}
                            >
                                re-install
                            </span>{' '}
                            your chat using the{' '}
                            {reinstallsOnShopifyCallback &&
                            storesRequiringPermissionUpdates.length ? (
                                '1-click install method'
                            ) : (
                                <Link to={reInstallLink}>
                                    1-click install method
                                </Link>
                            )}
                        </>
                    )}{' '}
                    to ensure better chat stability by <b>{migrationDueDate}</b>
                </>
            }
            status={NotificationStatus.Error}
            dismissible={false}
            showIcon
        />
    )
}

export default ScriptTagMigrationBanner
