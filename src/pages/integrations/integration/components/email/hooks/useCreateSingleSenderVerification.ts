import {useAsyncFn} from 'react-use'
import {AxiosError} from 'axios'
import useAppDispatch from 'hooks/useAppDispatch'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {createVerification} from 'models/singleSenderVerification/resources'
import {setVerification} from 'state/entities/singleSenderVerification/actions'
import {SenderInformation} from 'models/singleSenderVerification/types'

export default function useCreateSingleSenderVerification() {
    const dispatch = useAppDispatch()

    const [{loading: isLoading}, handleVerificationCreate] = useAsyncFn(
        async (id: number, values: SenderInformation) => {
            if (!id) return

            try {
                const verification = await createVerification(id, values)
                dispatch(setVerification(verification))
                void dispatch(
                    notify({
                        message: 'Verification created successfully',
                        status: NotificationStatus.Success,
                    })
                )
            } catch (error) {
                const {response} = error as AxiosError<{error: {msg: string}}>
                const errorMsg =
                    response && response.data.error
                        ? response.data.error.msg
                        : 'Failed to create verification'

                void dispatch(
                    notify({
                        message: errorMsg,
                        status: NotificationStatus.Error,
                    })
                )
            }
        },
        [dispatch]
    )

    return {
        isLoading,
        createVerification: handleVerificationCreate,
    }
}
