import { useEffect, useRef } from 'react'

import { useHasNewViewCountScheduler } from '@repo/views'
import type { Program } from 'estree'
import type { Map } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'
import pollingManager from 'services/pollingManager'
import { CollectionOperator, EqualityOperator } from 'state/rules/types'
import {
    getActiveView,
    shouldFetchActiveViewTickets as getShouldFetchActiveViewTickets,
} from 'state/views/selectors'
import { getViewFilters } from 'state/views/utils'

export default function usePollingManager() {
    const { value: hasNewScheduler, isLoading } = useHasNewViewCountScheduler()
    const currentUser = useAppSelector((state) => state.currentUser)
    const activeView = useAppSelector(getActiveView)
    const shouldFetchActiveViewTickets = useAppSelector(
        getShouldFetchActiveViewTickets,
    )

    const isCurrentUserActive = currentUser.get('is_active')
    const isPreviousCurrentUserActive = useRef()

    useEffect(() => {
        if (isLoading || hasNewScheduler) return
        if (isPreviousCurrentUserActive.current && !isCurrentUserActive) {
            if (activeView.get('filters_ast')) {
                if (shouldFetchActiveViewTickets) {
                    const filtersAST = (
                        activeView.get('filters_ast') as Map<any, any>
                    ).toJS() as Program

                    const viewFilters = getViewFilters(filtersAST)

                    const isChatView = viewFilters.some(
                        (filter) =>
                            filter.left === 'ticket.channel' &&
                            (filter.operator === EqualityOperator.Eq ||
                                CollectionOperator.ContainsAny) &&
                            (filter.right as string | undefined)?.includes(
                                'chat',
                            ),
                    )

                    if (isChatView) {
                        pollingManager.stopRecentViewCountsInterval()
                        return
                    }
                }
            }

            // Stop polling when current user becomes inactive
            pollingManager.stop()
        } else if (
            !isPreviousCurrentUserActive.current &&
            isCurrentUserActive
        ) {
            // Start polling when current user becomes active
            pollingManager.start()
        }
        return () => {
            isPreviousCurrentUserActive.current = isCurrentUserActive
        }
    }, [
        hasNewScheduler,
        isLoading,
        activeView,
        isCurrentUserActive,
        shouldFetchActiveViewTickets,
    ])

    useEffect(() => {
        if (isLoading || hasNewScheduler) return
        return () => pollingManager.stop()
    }, [hasNewScheduler, isLoading])
}
