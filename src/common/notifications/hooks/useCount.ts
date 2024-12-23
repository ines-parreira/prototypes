import {useKnockFeed} from '@knocklabs/react'
import {useEffect} from 'react'

export default function useCount() {
    const {feedClient, useFeedStore} = useKnockFeed()

    const unreadCount = useFeedStore((state) => state.metadata.unread_count)

    useEffect(() => {
        if (unreadCount === 0) {
            void feedClient.fetch()
        }
    }, [feedClient, unreadCount])

    return unreadCount
}
