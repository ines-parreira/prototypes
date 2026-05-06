import { useEffect, useRef } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import useAppDispatch from 'hooks/useAppDispatch'
import { fetchVisibleViewsCounts } from 'state/views/actions'

export default function useInitialViewCountsFetch() {
    const dispatch = useAppDispatch()
    const { value: hasNewScheduler, isLoading } = useFlagWithLoading(
        FeatureFlagKey.UIVisionBetaBaseline,
    )
    const hasFetched = useRef(false)

    useEffect(() => {
        if (isLoading || hasFetched.current) return
        hasFetched.current = true

        if (!hasNewScheduler) {
            dispatch(fetchVisibleViewsCounts())
        }
    }, [isLoading, hasNewScheduler, dispatch])
}
