import { useState } from 'react'

import type { AxiosError } from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import { deleteVerification as deleteVerificationRequest } from 'models/singleSenderVerification/resources'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export default function useDeleteSingleSenderVerification() {
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useAppDispatch()

    const deleteVerification = async (id: number) => {
        try {
            setIsLoading(true)
            await deleteVerificationRequest(id)
            void dispatch(
                notify({
                    message: 'Verification deleted successfully',
                    status: NotificationStatus.Success,
                }),
            )
        } catch (error) {
            const { response } = error as AxiosError<{ error: { msg: string } }>
            const errorMsg =
                response && response.data.error
                    ? response.data.error.msg
                    : 'Failed to delete verification'
            void dispatch(
                notify({
                    message: errorMsg,
                    status: NotificationStatus.Error,
                }),
            )
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        deleteVerification,
    }
}
