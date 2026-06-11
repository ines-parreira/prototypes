import type { AxiosError } from 'axios'
import { useAsyncFn } from '@gorgias/toolkit-react'

import { toast } from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { createVerification } from 'models/singleSenderVerification/resources'
import type { SenderInformation } from 'models/singleSenderVerification/types'
import { setVerification } from 'state/entities/singleSenderVerification/actions'

export function useCreateSingleSenderVerification() {
    const dispatch = useAppDispatch()

    const [{ loading: isLoading }, handleVerificationCreate] = useAsyncFn(
        async (id: number, values: SenderInformation) => {
            if (!id) return

            try {
                const verification = await createVerification(id, values)
                dispatch(setVerification(verification))
                toast.success('Verification created successfully')
            } catch (error) {
                const { response } = error as AxiosError<{
                    error: { msg: string }
                }>
                const errorMsg =
                    response && response.data.error
                        ? response.data.error.msg
                        : 'Failed to create verification'

                toast.error(errorMsg)
            }
        },
        [dispatch],
    )

    return {
        isLoading,
        createVerification: handleVerificationCreate,
    }
}
