import { useGetCurrentUser } from '@gorgias/helpdesk-queries'

export function useCurrentUserId() {
    const { data: currentUserData } = useGetCurrentUser()
    const currentUser = currentUserData?.data
    const currentUserId = currentUser?.id

    return { currentUserId }
}
