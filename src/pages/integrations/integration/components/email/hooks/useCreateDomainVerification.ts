import {useState} from 'react'
import useAppDispatch from 'hooks/useAppDispatch'
import {NotificationStatus} from 'state/notifications/types'
import {createDomainVerification as createDomainVerificationRequest} from 'models/integration/resources/email'
import {notify} from 'state/notifications/actions'
import {GorgiasApiError} from 'models/api/types'

export default function useCreateDomainVerification() {
    const [isLoading, setIsLoading] = useState(false)

    const dispatch = useAppDispatch()

    const createDomainVerification = async (
        domainName: string,
        dkimKeySize: number,
        provider?: string
    ) => {
        try {
            setIsLoading(true)
            return await createDomainVerificationRequest(
                domainName,
                dkimKeySize,
                provider
            )
        } catch (error) {
            const {response} = error as GorgiasApiError

            void dispatch(
                notify({
                    status: NotificationStatus.Error,
                    message:
                        response?.data?.error?.msg ??
                        'Failed to create domain verification',
                })
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
