import {useKnockFeed} from '@knocklabs/react'

export default function useCount() {
    const {useFeedStore} = useKnockFeed()
    return useFeedStore((state) => state.metadata.unread_count)
}
