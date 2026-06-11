import { useState } from 'react'

import type { AxiosError } from 'axios'

import { toast } from '@gorgias/axiom'

import { deleteVerification as deleteVerificationRequest } from 'models/singleSenderVerification/resources'

export function useDeleteSingleSenderVerification() {
    const [isLoading, setIsLoading] = useState(false)

    const deleteVerification = async (id: number) => {
        try {
            setIsLoading(true)
            await deleteVerificationRequest(id)
            toast.success('Verification deleted successfully')
        } catch (error) {
            const { response } = error as AxiosError<{ error: { msg: string } }>
            const errorMsg =
                response && response.data.error
                    ? response.data.error.msg
                    : 'Failed to delete verification'
            toast.error(errorMsg)
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        deleteVerification,
    }
}
