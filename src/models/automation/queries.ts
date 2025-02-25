import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { fetchChatsApplicationAutomationSettings } from 'models/chatApplicationAutomationSettings/resources'

export const automationKeys = {
    settings: (appIds: string[]) => ['automationSettings', appIds] as const,
}

export const useGetChatsApplicationAutomationSettings = (
    applicationIds: string[],
    overrides?: UseQueryOptions<
        Awaited<ReturnType<typeof fetchChatsApplicationAutomationSettings>>
    >,
) => {
    return useQuery({
        queryKey: automationKeys.settings(applicationIds),
        queryFn: async () => {
            if (applicationIds.length === 0) {
                return []
            }
            return fetchChatsApplicationAutomationSettings(applicationIds)
        },

        ...overrides,
    })
}
