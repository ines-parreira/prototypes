import { useEffect, useState } from 'react'

import type { VoiceQueue } from '@gorgias/helpdesk-queries'
import { useListVoiceQueues } from '@gorgias/helpdesk-queries'

import { VoiceQueueContext } from 'domains/reporting/pages/voice/components/VoiceQueue/VoiceQueueContext'

type Props = {
    children: React.ReactNode
    queueIds: number[]
}

export default function VoiceQueueProvider({ children, queueIds }: Props) {
    const [fetchedQueues, setFetchedQueues] = useState<
        Record<number, VoiceQueue>
    >({})
    const [isReady, setIsReady] = useState(false)

    const queuesIdsToFetch = queueIds?.filter(
        (queueId) => !fetchedQueues[queueId],
    )

    const { data, isFetching } = useListVoiceQueues(
        {
            id: queuesIdsToFetch,
        },
        {
            query: {
                enabled: queuesIdsToFetch.length > 0,
            },
        },
    )

    useEffect(() => {
        if (isFetching) {
            setIsReady(false)
        } else if (data?.data.data) {
            setFetchedQueues((prevQueues) =>
                data.data.data.reduce(
                    (acc, queue) => ({ ...acc, [queue.id]: queue }),
                    prevQueues,
                ),
            )
            setIsReady(true)
        }
    }, [data, isFetching])

    const getQueueFromId = (id: number) => {
        return fetchedQueues[id] || (!isReady ? undefined : null)
    }

    return (
        <VoiceQueueContext.Provider value={{ getQueueFromId }}>
            {children}
        </VoiceQueueContext.Provider>
    )
}
