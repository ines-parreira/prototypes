import { useKnockFeed } from '@knocklabs/react'
import { useEffectOnce } from '@repo/hooks'

export default function useCount() {
    const { feedClient, useFeedStore } = useKnockFeed()

    const unreadCount = useFeedStore((state) => state.metadata.unread_count)

    useEffectOnce(() => {
        if (unreadCount === 0) {
            void feedClient.fetch()
        }
    })

    return unreadCount
}
