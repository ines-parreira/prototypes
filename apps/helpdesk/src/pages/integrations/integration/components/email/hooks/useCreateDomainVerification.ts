import { useState } from 'react'

import { toast } from '@gorgias/axiom'

import type { GorgiasApiError } from 'models/api/types'
import type { EmailProvider } from 'models/integration/constants'
import { createDomainVerification as createDomainVerificationRequest } from 'models/integration/resources/email'

export function useCreateDomainVerification() {
    const [isLoading, setIsLoading] = useState(false)

    const createDomainVerification = async (payload: {
        domainName: string
        dkimKeySize?: number
        provider: EmailProvider
    }) => {
        try {
            setIsLoading(true)
            return await createDomainVerificationRequest(payload)
        } catch (error) {
            const { response } = error as GorgiasApiError

            toast.error(
                response?.data?.error?.msg ??
                    'Failed to create domain verification',
            )
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    return {
        isLoading,
        createDomainVerification,
    }
}
