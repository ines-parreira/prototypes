import { useHistory, useLocation } from 'react-router-dom'

import { AlertBanner } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import useEffectOnce from 'hooks/useEffectOnce'
import { EmailMigrationStatus } from 'models/integration/types'
import { getEmailMigrationStatus } from 'state/integrations/selectors'

import { computeEmailMigrationStatusBanner } from './helpers'
import useMigrationBannerStatus from './hooks/useMigrationBannerStatus'

export default function EmailMigrationBanner() {
    const fetchMigrationStatus = useMigrationBannerStatus()
    const migrationStatus = useAppSelector(getEmailMigrationStatus)
    const history = useHistory()
    const location = useLocation()

    useEffectOnce(() => {
        void fetchMigrationStatus()
    })

    const migrationPageURL = `/app/settings/channels/email/migration`

    const bannerSettings = migrationStatus
        ? computeEmailMigrationStatusBanner(migrationStatus, () => {
              history.push(migrationPageURL)
          })
        : null

    const shouldHideBanner =
        !bannerSettings ||
        migrationStatus?.status === EmailMigrationStatus.Completed ||
        location.pathname.startsWith(migrationPageURL)

    if (shouldHideBanner) {
        return null
    }

    return (
        <AlertBanner
            message={bannerSettings?.message ?? ''}
            type={bannerSettings?.type}
            CTA={bannerSettings?.CTA}
        />
    )
}
