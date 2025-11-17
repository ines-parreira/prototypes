import { useCallback, useMemo } from 'react'

import { useHistory, useRouteMatch } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import { useTrackingBundleInstallationWarningCheck } from 'pages/aiAgent/hooks/useTrackingBundleInstallationWarningCheck'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin, isTeamLead } from 'utils'

const ticketsPages = [
    '/app/tickets/:ticketId?',
    '/app/ticket/:ticketId?',
    '/app/ticket/new',
    '/app/views/:ticketId?',
]

export const useWarningBannerIsDisplayed = ({
    storeName,
    storeIntegrationFromStoreFilter,
}: {
    storeName?: string
    storeIntegrationFromStoreFilter?: StoreIntegration
}) => {
    const currentUser = useAppSelector(getCurrentUser)

    const isTicketsPage = !!useRouteMatch(ticketsPages)
    const history = useHistory()

    const { uninstalledChatIntegrationId, isLoading } =
        useTrackingBundleInstallationWarningCheck({
            storeName: storeName || storeIntegrationFromStoreFilter?.name,
        })

    const redirectionPath = useMemo(() => {
        if (!uninstalledChatIntegrationId) {
            return ''
        }

        return `/app/settings/channels/gorgias_chat/${uninstalledChatIntegrationId}/installation`
    }, [uninstalledChatIntegrationId])

    const redirectToChatSettings = useCallback(() => {
        if (!redirectionPath) {
            return
        }

        history.push(redirectionPath)
    }, [history, redirectionPath])

    const isBannerDisplayed = useMemo(
        () =>
            !!uninstalledChatIntegrationId &&
            !isTicketsPage &&
            !!redirectionPath &&
            (isAdmin(currentUser) || isTeamLead(currentUser)),
        [
            currentUser,
            redirectionPath,
            isTicketsPage,
            uninstalledChatIntegrationId,
        ],
    )

    return {
        isBannerDisplayed,
        isLoading,
        redirectionPath,
        redirectToChatSettings,
    }
}
