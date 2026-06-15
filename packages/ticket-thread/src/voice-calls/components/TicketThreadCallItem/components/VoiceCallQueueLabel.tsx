import { Skeleton, Text } from '@gorgias/axiom'
import { useGetVoiceQueue } from '@gorgias/helpdesk-queries'

type VoiceCallQueueLabelProps = {
    queueId: number
    size?: 'sm'
}

export function VoiceCallQueueLabel({
    queueId,
    size,
}: VoiceCallQueueLabelProps) {
    const { data, isLoading } = useGetVoiceQueue(queueId, undefined, {
        query: {
            refetchOnWindowFocus: false,
        },
    })

    if (isLoading) {
        return <Skeleton width={60} />
    }

    const queueName = data?.data?.name
    return (
        <Text as="span" variant="bold" size={size}>
            {queueName ?? `Queue ${queueId}`}
        </Text>
    )
}
