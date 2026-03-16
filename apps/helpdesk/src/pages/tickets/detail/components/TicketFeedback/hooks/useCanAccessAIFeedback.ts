import { isTeamLead } from '@repo/utils'

import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

export function useCanAccessAIFeedback(): boolean {
    const { data: currentUserData } = useGetCurrentUser()

    if (!currentUserData?.data) {
        return false
    }

    return isTeamLead(currentUserData.data)
}
