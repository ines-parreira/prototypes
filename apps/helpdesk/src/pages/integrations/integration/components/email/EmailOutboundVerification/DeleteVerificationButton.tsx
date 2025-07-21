import { AxiosError } from 'axios'

import useAppDispatch from 'hooks/useAppDispatch'
import useAsyncFn from 'hooks/useAsyncFn'
import { deleteVerification } from 'models/singleSenderVerification/resources'
import { SenderVerification } from 'models/singleSenderVerification/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import { removeVerification } from 'state/entities/singleSenderVerification/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

type Props = {
    isLoading?: boolean
    isDisabled?: boolean
    verification: SenderVerification
    onConfirm?: (verification?: SenderVerification) => void
}

export default function DeleteVerificationButton({
    isLoading,
    isDisabled,
    verification,
    onConfirm,
}: Props) {
    const dispatch = useAppDispatch()

    const [{ loading: isDeleteInProgress }, handleDelete] =
        useAsyncFn(async () => {
            try {
                await deleteVerification(verification.integration_id)
                onConfirm?.(verification)
                void dispatch(
                    notify({
                        message: 'Verification deleted successfully',
                        status: NotificationStatus.Success,
                    }),
                )
                dispatch(removeVerification(verification.integration_id))
            } catch (error) {
                const { response } = error as AxiosError<{
                    error: { msg: string }
                }>
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
            }
        }, [verification])

    return (
        <ConfirmButton
            confirmationContent="If you delete verification, you will not be able to send outbound messages with this email."
            onConfirm={handleDelete}
            isLoading={isLoading || isDeleteInProgress}
            isDisabled={isDisabled}
            intent="destructive"
            confirmationTitle={'Delete Verification?'}
            leadingIcon="delete"
        >
            Delete verification
        </ConfirmButton>
    )
}
