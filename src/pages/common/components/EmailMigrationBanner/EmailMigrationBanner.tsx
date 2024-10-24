import React, {ComponentProps} from 'react'
import {useHistory, useLocation} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import {EmailMigrationStatus} from 'models/integration/types'
import {getEmailMigrationStatus} from 'state/integrations/selectors'

import BannerNotification from '../BannerNotifications/BannerNotification'
import {computeEmailMigrationStatusBanner} from './helpers'
import useMigrationBannerStatus from './hooks/useMigrationBannerStatus'

export default function EmailMigrationBanner() {
    const fetchMigrationStatus = useMigrationBannerStatus()
    const migrationStatus = useAppSelector(getEmailMigrationStatus)
    const history = useHistory()
    const location = useLocation()

    useEffectOnce(() => {
        void fetchMigrationStatus()
    })

    const bannerSettings = migrationStatus
        ? computeEmailMigrationStatusBanner(migrationStatus)
        : null

    const migrationPageURL = `/app/settings/channels/email/migration`

    const shouldHideBanner =
        !bannerSettings ||
        migrationStatus?.status === EmailMigrationStatus.Completed ||
        location.pathname.startsWith(migrationPageURL)

    if (shouldHideBanner) {
        return null
    }

    return (
        <BannerNotification
            message={bannerSettings?.message ?? ''}
            status={
                bannerSettings?.status as ComponentProps<
                    typeof BannerNotification
                >['status']
            }
            actionHTML={bannerSettings?.actionHTML ?? ''}
            id={'migration-status'}
            dismissible={false}
            allowHTML={true}
            showIcon={true}
            onClick={() => {
                history.push(migrationPageURL)
            }}
        />
    )
}
