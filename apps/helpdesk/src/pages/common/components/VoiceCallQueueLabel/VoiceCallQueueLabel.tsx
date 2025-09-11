import { Skeleton } from '@gorgias/axiom'
import { useGetVoiceQueue } from '@gorgias/helpdesk-queries'

type VoiceCallQueueLabelProps = {
    queueId: number
}

export function VoiceCallQueueLabel({ queueId }: VoiceCallQueueLabelProps) {
    const { data: queueData, isLoading } = useGetVoiceQueue(queueId)
    const queue = queueData?.data

    if (isLoading) {
        return <Skeleton width={100} />
    }

    if (!queue) {
        return <span className="body-semibold">Queue {queueId}</span>
    }

    return <span className="body-semibold">{queue.name}</span>
}
