import { useCallback } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@gorgias/helpdesk-queries'

import type { UserViewsOrderingSettingData } from 'config/types/user'
import type { AccountViewsOrderingSettingData } from 'state/currentAccount/types'
import { TicketNavbarElementType } from 'state/ui/ticketNavbar/types'

import type { TicketNavbarElement } from './TicketNavbarContent'

const PUBLIC_VIEWS_ORDERING_QUERY_KEY = queryKeys.account.listAccountSettings({
    type: 'views-ordering',
})
const PRIVATE_VIEWS_ORDERING_QUERY_KEY = ['views', 'ordering', 'private']

export function useTicketNavbarOrderingCacheSync() {
    const queryClient = useQueryClient()

    const syncViewsOrderingQueryCache = useCallback(
        (
            nextSettingData:
                | AccountViewsOrderingSettingData
                | UserViewsOrderingSettingData,
            isPrivateSetting: boolean,
            settingId: number,
        ) => {
            if (isPrivateSetting) {
                queryClient.setQueryData(PRIVATE_VIEWS_ORDERING_QUERY_KEY, {
                    id: settingId,
                    data: nextSettingData,
                })
                return
            }

            void queryClient.invalidateQueries({
                queryKey: PUBLIC_VIEWS_ORDERING_QUERY_KEY,
            })
        },
        [queryClient],
    )

    const syncViewQueriesForSectionMove = useCallback(
        (
            currentElement: TicketNavbarElement,
            nextElement: TicketNavbarElement,
        ) => {
            if (
                currentElement.type !== TicketNavbarElementType.View ||
                nextElement.type !== TicketNavbarElementType.View ||
                currentElement.data.section_id === nextElement.data.section_id
            ) {
                return
            }

            void queryClient.invalidateQueries({
                queryKey: queryKeys.views.listAllViews(),
            })
            void queryClient.invalidateQueries({
                queryKey: queryKeys.views.getView(nextElement.data.id),
            })
        },
        [queryClient],
    )

    return {
        syncViewQueriesForSectionMove,
        syncViewsOrderingQueryCache,
    }
}
