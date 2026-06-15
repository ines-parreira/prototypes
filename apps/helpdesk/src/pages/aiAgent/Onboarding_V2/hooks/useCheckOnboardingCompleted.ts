import { useHistory, useParams } from 'react-router-dom'

import { toast } from '@gorgias/axiom'

import { useGetOnboardingData } from 'pages/aiAgent/Onboarding_V2/hooks/useGetOnboardingData'

const useCheckOnboardingCompleted = (skip = false): null => {
    const { shopName } = useParams<{ shopName: string }>()
    const { data, isLoading } = useGetOnboardingData(shopName)
    const history = useHistory()

    // Skip while the user is actively completing setup: finishing the wizard
    // sets `completedDatetime`, which would otherwise trip this revisit guard
    // and redirect away with an error toast mid-completion.
    if (skip || isLoading) {
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

export { useCheckOnboardingCompleted }
