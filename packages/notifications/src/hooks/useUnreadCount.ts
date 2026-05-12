import { useKnockFeed } from '@knocklabs/react'
import { useEffectOnce } from '@repo/hooks'

export function useUnreadCount(): number {
    const { feedClient, useFeedStore } = useKnockFeed()

    const unreadCount = useFeedStore((state) => state.metadata.unread_count)

    useEffectOnce(() => {
        void feedClient.fetch()
    })

    return unreadCount
}
