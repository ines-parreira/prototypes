import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

import { UserRole } from 'config/types/user'

export const useShouldDisplayExecutionId = (): boolean => {
    const { data: currentUser } = useGetCurrentUser()

    return currentUser?.data?.role?.name === UserRole.GorgiasAgent
}
