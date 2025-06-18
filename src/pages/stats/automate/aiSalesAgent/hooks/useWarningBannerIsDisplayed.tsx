import { useCallback, useMemo } from 'react'

import { useHistory, useRouteMatch } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { StoreIntegration } from 'models/integration/types'
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

export const useWarningBannerIsDisplayed = ({
    storeName,
    storeIntegrationFromStoreFilter,
}: {
    storeName?: string
    storeIntegrationFromStoreFilter?: StoreIntegration
}) => {
    const currentUser = useAppSelector(getCurrentUser)

    const { storeActivations, isFetchLoading } = useStoreActivations({
        storeName: storeName || storeIntegrationFromStoreFilter?.name,
        withChatIntegrationsStatus: true,
        withStoresKnowledgeStatus: true,
    })

    const isTicketsPage = !!useRouteMatch(ticketsPages)
    const history = useHistory()

    const { uninstalledChatIntegrationId } =
        useTrackingBundleInstallationWarningCheck({ storeActivations })

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
        isLoading: isFetchLoading,
        redirectionPath,
        redirectToChatSettings,
    }
}
