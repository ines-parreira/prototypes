import { useHistory, useParams } from 'react-router-dom'

import { useGetOnboardingData } from 'pages/aiAgent/Onboarding/hooks/useGetOnboardingData'

const useCheckOnboardingCompleted = (): null => {
    const { shopName } = useParams<{ shopName: string }>()
    const { data, isLoading } = useGetOnboardingData(shopName)
    const history = useHistory()

    // Return early if still loading
    if (isLoading) {
        return null
    }

    if (data?.completedDatetime) {
        history.push(`/app/ai-agent/${data.shopType}/${shopName}/knowledge`)
    }

    return null
}

export default useCheckOnboardingCompleted
