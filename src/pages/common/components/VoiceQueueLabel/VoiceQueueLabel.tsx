import { Skeleton } from '@gorgias/merchant-ui-kit'

import {
    skeletonColumnsWidth,
    VoiceCallTableColumnName,
} from 'pages/stats/voice/components/VoiceCallTable/constants'
import { useVoiceQueueContext } from 'pages/stats/voice/hooks/useVoiceQueueContext'

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
