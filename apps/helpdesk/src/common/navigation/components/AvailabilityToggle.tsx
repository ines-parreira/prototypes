import { useCallback } from 'react'

import cn from 'classnames'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { submitSetting } from 'state/currentUser/actions'
import {
    getCurrentUser,
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
    const currentUser = useAppSelector(getCurrentUser)

    const updateAvailability = useCallback(() => {
        const newPreferences = currentUserPreferences.updateIn(
            ['data', 'available'],
            (status) => !status,
        )
        logEvent(SegmentEvent.MenuUserLinkClicked, {
            link: 'available-on-off',
            user_email: currentUser.get('email'),
            user_role: currentUser.getIn(['role', 'name']),
        })
        void dispatch(submitSetting(newPreferences.toJS(), false))
    }, [currentUserPreferences, dispatch, currentUser])

    return (
        <button
            className={cn(
                css['dropdown-item-user-menu'],
                css.availabilityToggle,
            )}
            onClick={updateAvailability}
        >
            <span>Available</span>
            <ToggleField value={isAvailable} isLoading={isLoading} />
        </button>
    )
}
