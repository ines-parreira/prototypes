import { useMemo } from 'react'

import { POSITIONS } from 'reapop'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export const useSkillNotify = () => {
    const dispatch = useAppDispatch()

    return useMemo(() => {
        const success = (message: string) =>
            dispatch(
                notify({
                    message,
                    status: NotificationStatus.Success,
                    position: POSITIONS.bottomRight,
                }),
            )

        const error = (message: string) =>
            dispatch(
                notify({
                    message,
                    status: NotificationStatus.Error,
                    position: POSITIONS.bottomRight,
                }),
            )

        return { success, error }
    }, [dispatch])
}
