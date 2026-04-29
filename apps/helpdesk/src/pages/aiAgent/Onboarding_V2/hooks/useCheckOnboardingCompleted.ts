import { useHistory, useParams } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'

const useCheckOnboardingCompleted = (): null => {
    const { shopName } = useParams<{ shopName: string }>()
    const { data, isLoading } = useGetOnboardingData(shopName)
    const history = useHistory()

    // Return early if still loading
    if (isLoading) {
        return null
    }

    if (data?.completedDatetime) {
        toast.error(
            'This store has already completed its onboarding. Redirecting to the AI agent settings.',
            { id: 'onboarding-already-completed' },
        )
        history.push(`/app/ai-agent/${data.shopType}/${shopName}/settings`)
    }

    return null
}

export default useCheckOnboardingCompleted
