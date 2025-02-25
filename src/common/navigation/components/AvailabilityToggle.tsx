import React, { useCallback } from 'react'

import cn from 'classnames'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import ToggleInput from 'pages/common/forms/ToggleInput'
import { submitSetting } from 'state/currentUser/actions'
import {
    isAvailable as getIsAvailable,
    getIsPreferencesLoading,
    getPreferences,
} from 'state/currentUser/selectors'

import css from './UserMenu.less'

export default function AvailabilityToggle() {
    const dispatch = useAppDispatch()
    const currentUserPreferences = useAppSelector(getPreferences)
    const isAvailable = useAppSelector(getIsAvailable)
    const isLoading = useAppSelector(getIsPreferencesLoading)

    const updateAvailability = useCallback(() => {
        const newPreferences = currentUserPreferences.updateIn(
            ['data', 'available'],
            (status) => !status,
        )
        logEvent(SegmentEvent.MenuUserLinkClicked, { link: 'available-on-off' })
        void dispatch(submitSetting(newPreferences.toJS(), false))
    }, [currentUserPreferences, dispatch])

    return (
        <button
            className={cn(
                css['dropdown-item-user-menu'],
                css.availabilityToggle,
            )}
            onClick={updateAvailability}
        >
            <span>Available</span>
            <ToggleInput isToggled={isAvailable} isLoading={isLoading} />
        </button>
    )
}
