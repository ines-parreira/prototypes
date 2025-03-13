import { useQuery } from '@tanstack/react-query'

import { getOnboardingData } from 'models/aiAgent/resources/configuration'

export const useGetOnboardings = () => {
    return useQuery({
        queryKey: ['onboardingData', 'all'],
        queryFn: getOnboardingData,
        staleTime: Infinity,
    })
}
