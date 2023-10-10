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

import useStoreRequiringScriptTagMigration from './hooks/useStoreRequiringScriptTagMigration'

const ScriptTagMigrationBanner = () => {
    const migrationDueDate: string | undefined =
        useFlags()[FeatureFlagKey.ChatScopeUpdateBanner]

    const getRedirectUri = useAppSelector(makeGetRedirectUri)

    const currentUser = useAppSelector(getCurrentUser)

    const storeRequiringScriptTagMigration =
        useStoreRequiringScriptTagMigration()

    if (!storeRequiringScriptTagMigration) {
        return null
    }

    const {
        storeIntegration,
        storeRequiresPermissionUpdates,
        gorgiasChatIntegration,
    } = storeRequiringScriptTagMigration

    const shopName = storeIntegration?.meta?.shop_name || ''

    const redirectUri = getRedirectUri(IntegrationType.Shopify)

    const retriggerOAuthFlow = (ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault()
        window.location.href = redirectUri.replace('{shop_name}', shopName)
    }

    if (!migrationDueDate || !storeIntegration || !isAdmin(currentUser)) {
        return null
    }

    return (
        <BannerNotification
            message={
                <>
                    <b>Action required</b>:{' '}
                    {storeRequiresPermissionUpdates && (
                        <>
                            <a onClick={retriggerOAuthFlow} href="#">
                                Update your Shopify permissions
                            </a>{' '}
                            and{' '}
                        </>
                    )}
                    <span
                        className={classNames({
                            'text-capitalize': !storeRequiresPermissionUpdates,
                        })}
                    >
                        re-install
                    </span>{' '}
                    your chat using the{' '}
                    <Link
                        to={`/app/settings/channels/gorgias_chat/${
                            gorgiasChatIntegration?.get('id') as string
                        }/installation`}
                    >
                        1-click install method
                    </Link>{' '}
                    to ensure better chat stability by {migrationDueDate}
                </>
            }
            status={NotificationStatus.Error}
            dismissible={false}
            showIcon
        />
    )
}

export default ScriptTagMigrationBanner
