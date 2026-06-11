import type { AxiosError } from 'axios'
import { useAsyncFn } from '@gorgias/toolkit-react'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { deleteVerification } from 'models/singleSenderVerification/resources'
import type { SenderVerification } from 'models/singleSenderVerification/types'
import { ConfirmButton } from 'pages/common/components/button/ConfirmButton'
import { removeVerification } from 'state/entities/singleSenderVerification/actions'

type Props = {
    isLoading?: boolean
    isDisabled?: boolean
    verification: SenderVerification
    onConfirm?: (verification?: SenderVerification) => void
}

export function DeleteVerificationButton({
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
                toast.success('Verification deleted successfully')
                dispatch(removeVerification(verification.integration_id))
            } catch (error) {
                const { response } = error as AxiosError<{
                    error: { msg: string }
                }>
                const errorMsg =
                    response && response.data.error
                        ? response.data.error.msg
                        : 'Failed to delete verification'
                toast.error(errorMsg)
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
