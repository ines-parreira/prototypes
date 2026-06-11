import { useEffect, useRef } from 'react'

import { useHasNewViewCountScheduler } from '@repo/views'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { fetchVisibleViewsCounts } from 'state/views/actions'

export function useInitialViewCountsFetch() {
    const dispatch = useAppDispatch()
    const { value: hasNewScheduler, isLoading } = useHasNewViewCountScheduler()
    const hasFetched = useRef(false)

    useEffect(() => {
        if (isLoading || hasFetched.current) return
        hasFetched.current = true

        if (!hasNewScheduler) {
            dispatch(fetchVisibleViewsCounts())
        }
    }, [isLoading, hasNewScheduler, dispatch])
}
