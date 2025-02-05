import {useQuery} from '@tanstack/react-query'

import {getRealisticResponseTime} from 'pages/aiAgent/Overview/getRealisticResponseTime'

// TODO: replace with real hook
export const useAiAgentType = () => {
    return useQuery({
        queryKey: ['aiAgentTypeMock'],
        queryFn: (): Promise<{aiAgentType: 'sales' | 'support' | 'mixed'}> =>
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve({aiAgentType: 'sales'})
                }, getRealisticResponseTime())
            }),
    })
}
