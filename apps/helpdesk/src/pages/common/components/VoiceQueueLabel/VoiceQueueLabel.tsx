import { Skeleton } from '@gorgias/axiom'

import {
    skeletonColumnsWidth,
    VoiceCallTableColumnName,
} from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import { useVoiceQueueContext } from 'domains/reporting/pages/voice/hooks/useVoiceQueueContext'

export const LOADING_TEST_ID = 'voice-queue-label-loading'

type Props = {
    queueId: number
    queueName?: string | null
}

function VoiceQueueLabel({ queueId, queueName }: Props) {
    const { getQueueFromId } = useVoiceQueueContext()
    const queue = getQueueFromId(queueId)

    if (queue === undefined) {
        return (
            <Skeleton
                inline
                width={skeletonColumnsWidth[VoiceCallTableColumnName.Queue]}
                containerTestId={LOADING_TEST_ID}
            />
        )
    }

    if (queue === null) {
        return <>{queueName ?? ''}</>
    }

    return <>{queue.name}</>
}

export default VoiceQueueLabel
