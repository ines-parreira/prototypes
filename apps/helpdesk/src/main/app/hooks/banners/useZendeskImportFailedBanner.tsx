import React, { useEffect, useMemo } from 'react'

import { useHistory } from 'react-router-dom'

import {
    AlertBannerTypes,
    BannerCategories,
    ContextBanner,
    useBanners,
} from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType, ZendeskIntegration } from 'models/integration/types'
import { ImportStatus } from 'pages/settings/importZendesk/zendesk/types'
import { getIntegrationsByType } from 'state/integrations/selectors'

export const useZendeskImportFailedBanner = () => {
    const { addBanner, removeBanner } = useBanners()
    const history = useHistory()
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

    const url = `/app/settings/import-zendesk/zendesk/${failedIntegration?.id}`

    const banner = useMemo(
        () => ({
            'aria-label': 'Zendesk Import Failed Banner',
            category: BannerCategories.ZENDESK_IMPORT_FAILURE_BANNER,
            type: AlertBannerTypes.Warning,
            instanceId: 'zendesk-import-failure-banner',
            preventDismiss: false,
            message: (
                <>
                    The Zendesk import of customer tickets is on hold. Please
                    restart the import to ensure all of your tickets are in
                    Gorgias.
                </>
            ),
            CTA: {
                type: 'action',
                text: 'View import data settings',
                onClick: () => {
                    history.push(url)
                },
            },
        }),
        [url, history],
    )

    useEffect(() => {
        if (!failedIntegration) {
            removeBanner(banner.category, banner.instanceId)
        } else {
            addBanner(banner as ContextBanner)
        }
    }, [failedIntegration, addBanner, banner, removeBanner])
}
