import { useCallback, useEffect, useMemo } from 'react'

import { useHistory, useLocation, useRouteMatch } from 'react-router-dom'

import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import useAppSelector from 'hooks/useAppSelector'
import { useStoreActivations } from 'pages/aiAgent/Activation/hooks/useStoreActivations'
import { useTrackingBundleInstallationWarningCheck } from 'pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin, isTeamLead } from 'utils'

const ticketsPages = [
    '/app/tickets/:ticketId?',
    '/app/ticket/:ticketId?',
    '/app/ticket/new',
    '/app/views/:ticketId?',
]

export function useTrackingBundleInstallationWarningBanner() {
    const { addBanner, removeBanner } = useBanners()

    const { pathname } = useLocation()

    const { storeActivations } = useStoreActivations({
        pageName: pathname,
        withChatIntegrationsStatus: true,
        withStoresKnowledgeStatus: true,
    })

    const history = useHistory()

    const { uninstalledChatIntegrationId } =
        useTrackingBundleInstallationWarningCheck({
            storeActivations,
        })

    const currentUser = useAppSelector(getCurrentUser)

    const isTicketsPage = !!useRouteMatch(ticketsPages)

    const redirectionPath = useMemo(() => {
        if (!uninstalledChatIntegrationId) {
            return ''
        }

        return `/app/settings/channels/gorgias_chat/${uninstalledChatIntegrationId}/installation`
    }, [uninstalledChatIntegrationId])

    const onClick = useCallback(() => {
        history.push(redirectionPath)
    }, [history, redirectionPath])

    const displayBanner = useMemo(
        () =>
            !!uninstalledChatIntegrationId &&
            !isTicketsPage &&
            !!redirectionPath &&
            (isAdmin(currentUser) || isTeamLead(currentUser)),
        [
            currentUser,
            isTicketsPage,
            redirectionPath,
            uninstalledChatIntegrationId,
        ],
    )

    useEffect(() => {
        if (displayBanner) {
            addBanner({
                preventDismiss: false,
                category: BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
                instanceId:
                    BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
                type: AlertBannerTypes.Warning,
                message: `Please update your chat's manual installation script to enable tracking for your Shopping Assistant.`,
                CTA: {
                    type: 'action',
                    text: 'Update Installation',
                    onClick,
                },
            })
        } else {
            removeBanner(
                BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
                BannerCategories.TRACKING_BUNDLE_INSTALLATION_WARNING,
            )
        }
    }, [displayBanner, addBanner, removeBanner, onClick])
}
