import { useEffect, useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { useHistory, useLocation } from 'react-router-dom'

import { BannerCategories, useBanners } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { EmailMigrationStatus } from 'models/integration/types'
import { computeEmailMigrationStatusBanner } from 'pages/common/components/EmailMigrationBanner/helpers'
import useMigrationBannerStatus from 'pages/common/components/EmailMigrationBanner/hooks/useMigrationBannerStatus'
import { getEmailMigrationStatus } from 'state/integrations/selectors'

const MIGRATION_PAGE_URL = '/app/settings/channels/email/migration'
const INSTANCE_ID = 'email_migration'

export const useEmailMigrationBanner = () => {
    const bannerList: Record<string, boolean> = useFlag(
        FeatureFlagKey.GlobalBannerRefactor,
        {
            emailMigrationBanner: false,
        },
    )

    const fetchMigrationStatus = useMigrationBannerStatus()
    const migrationStatus = useAppSelector(getEmailMigrationStatus)
    const history = useHistory()
    const location = useLocation()
    const { addBanner, removeBanner } = useBanners()

    useEffectOnce(() => {
        void fetchMigrationStatus()
    })

    const bannerSettings = useMemo(
        () =>
            migrationStatus
                ? computeEmailMigrationStatusBanner(migrationStatus, () => {
                      history.push(MIGRATION_PAGE_URL)
                  })
                : null,
        [migrationStatus, history],
    )

    const shouldHideBanner = useMemo(() => {
        return (
            !bannerSettings ||
            migrationStatus?.status === EmailMigrationStatus.Completed ||
            location.pathname.startsWith(MIGRATION_PAGE_URL) ||
            !bannerList.emailMigrationBanner
        )
    }, [
        bannerSettings,
        migrationStatus?.status,
        location.pathname,
        bannerList.emailMigrationBanner,
    ])

    const banner = useMemo(
        () => ({
            category: BannerCategories.EMAIL_MIGRATION_BANNER,
            type: bannerSettings?.type,
            instanceId: INSTANCE_ID,
            message: bannerSettings?.message ?? '',
            CTA: bannerSettings?.CTA,
            preventDismiss: true,
        }),
        [bannerSettings?.type, bannerSettings?.message, bannerSettings?.CTA],
    )

    useEffect(() => {
        if (shouldHideBanner) {
            removeBanner(banner.category, banner.instanceId)
        } else {
            addBanner(banner)
        }
    }, [addBanner, removeBanner, banner, shouldHideBanner, bannerSettings])
}
