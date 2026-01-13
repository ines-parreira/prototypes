import { useHistory, useParams } from 'react-router-dom'

import useAppDispatch from 'hooks/useAppDispatch'
import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

const useCheckOnboardingCompleted = (): null => {
    const { shopName } = useParams<{ shopName: string }>()
    const { data, isLoading } = useGetOnboardingData(shopName)
    const history = useHistory()
    const dispatch = useAppDispatch()

    // Return early if still loading
    if (isLoading) {
        return null
    }

    if (data?.completedDatetime) {
        dispatch(
            notify({
                status: NotificationStatus.Error,
                message:
                    'This store has already completed its onboarding. Redirecting to the AI agent settings.',
                id: 'onboarding-already-completed',
            }),
        )
        history.push(`/app/ai-agent/${data.shopType}/${shopName}/settings`)
    }

    return null
}

export default useCheckOnboardingCompleted
