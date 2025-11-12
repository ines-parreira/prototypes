import { useCallback, useMemo, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import moment from 'moment'

import useAppSelector from 'hooks/useAppSelector'
import { tryLocalStorage } from 'services/common/utils'
import { getCurrentUser } from 'state/currentUser/selectors'
import { isAdmin } from 'utils'

export default function useIsOnboardingHidden() {
    const currentUser = useAppSelector(getCurrentUser)

    const hidingDate = useMemo(
        () => moment(currentUser.get('created_datetime')).add(10, 'days'),
        [currentUser],
    )

    const [isHidden, setIsHidden] = useState(
        () =>
            !isAdmin(currentUser) ||
            (tryLocalStorage(() =>
                window.localStorage.getItem('hideBoarding'),
            ) as string) ||
            moment().isAfter(hidingDate),
    )

    const handleHide = useCallback(() => {
        setIsHidden(true)
        logEvent(SegmentEvent.OnboardingWidgetClicked, {
            name: 'Hide',
        })
        tryLocalStorage(() =>
            window.localStorage.setItem('hideBoarding', 'true'),
        )
    }, [])

    return useMemo(
        () => [!!isHidden, handleHide] as const,
        [handleHide, isHidden],
    )
}
