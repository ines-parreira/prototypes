import React, { useEffect, useMemo } from 'react'

import {
    AlertBannerTypes,
    BannerCategories,
    ContextBanner,
    useBanners,
} from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, ZendeskIntegration } from 'models/integration/types'
import { ImportStatus } from 'pages/settings/importData/zendesk/types'
import { getIntegrationsByType } from 'state/integrations/selectors'

export const useZendeskImportFailedBanner = () => {
    const { addBanner, removeBanner } = useBanners()

    const zendeskIntegrations: ZendeskIntegration[] = useAppSelector(
        getIntegrationsByType(IntegrationType.Zendesk),
    )

    const failedIntegration = useMemo(
        () =>
            zendeskIntegrations.find(
                (integration) =>
                    integration.meta?.status === ImportStatus.Failure &&
                    integration.meta?.continuous_import_enabled,
            ),
        [zendeskIntegrations],
    )

    const banner = useMemo(
        () => ({
            'aria-label': 'Zendesk Import Failed Banner',
            category: BannerCategories.ZENDESK_IMPORT_FAILURE_BANNER,
            type: AlertBannerTypes.Warning,
            instanceId: 'zendesk-import-failure-banner',
            preventDismiss: false,
            message: (
                <>
                    The Zendesk import of customer tickets is on hold.
                    We&apos;re here to help — please contact Gorgias Support for
                    next steps.
                </>
            ),
        }),
        [],
    )

    useEffect(() => {
        if (!failedIntegration) {
            removeBanner(banner.category, banner.instanceId)
        } else {
            addBanner(banner as ContextBanner)
        }
    }, [failedIntegration, addBanner, banner, removeBanner])
}
