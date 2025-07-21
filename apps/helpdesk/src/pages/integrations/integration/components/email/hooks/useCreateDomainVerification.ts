import { useState } from 'react'

import useAppDispatch from 'hooks/useAppDispatch'
import { GorgiasApiError } from 'models/api/types'
import { EmailProvider } from 'models/integration/constants'
import { createDomainVerification as createDomainVerificationRequest } from 'models/integration/resources/email'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

export default function useCreateDomainVerification() {
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useAppDispatch()

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

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        response?.data?.error?.msg ??
                        'Failed to create domain verification',
                }),
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
