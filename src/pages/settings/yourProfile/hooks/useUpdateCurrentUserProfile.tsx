import { useUpdateCurrentUser } from 'hooks/currentUser/useUpdateCurrentUser'
import useAppDispatch from 'hooks/useAppDispatch'
import * as constants from 'state/currentUser/constants'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export function useUpdateCurrentUserProfile() {
    const dispatch = useAppDispatch()

    return useUpdateCurrentUser({
        mutation: {
            onSuccess: (response) => {
                dispatch({
                    type: constants.SUBMIT_CURRENT_USER_SUCCESS,
                    resp: response.data,
                })

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: 'User successfully updated',
                    }),
                )
            },
            onError: (error) => {
                dispatch({
                    type: constants.SUBMIT_CURRENT_USER_ERROR,
                    error,
                    verbose: true,
                    reason: 'Failed to update user',
                })
            },
        },
    })
}

export function useUpdateCurrentUserProfilePicture() {
    const dispatch = useAppDispatch()

    return useUpdateCurrentUser({
        mutation: {
            onSuccess: (response) => {
                dispatch({
                    type: constants.SUBMIT_CURRENT_USER_SUCCESS,
                    resp: response.data,
                })

                void dispatch(
                    notify({
                        status: NotificationStatus.Success,
                        message: response.data.meta?.profile_picture_url
                            ? 'User picture successfully uploaded'
                            : 'User picture successfully removed',
                    }),
                )
            },
            onError: (error) => {
                dispatch({
                    type: constants.SUBMIT_CURRENT_USER_ERROR,
                    error,
                    verbose: true,
                    reason: 'Failed to update user picture',
                })
            },
        },
    })
}
