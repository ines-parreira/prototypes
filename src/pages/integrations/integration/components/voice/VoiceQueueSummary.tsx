import {
    PhoneRingingBehaviour,
    useGetTeam,
    useGetVoiceQueue,
    VoiceQueueTargetScope,
} from '@gorgias/api-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import CollapsibleDetails from 'pages/tickets/detail/components/TicketVoiceCall/CollapsibleDetails'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import SummaryBlock from './SummaryBlock'

import css from './VoiceQueueSummary.less'

type VoiceQueueSummaryProps = {
    queue_id: number
}

function VoiceQueueSummary({ queue_id }: VoiceQueueSummaryProps) {
    const { data: queueData, isLoading } = useGetVoiceQueue(queue_id)
    const queue = queueData?.data

    const teamIds = queue?.linked_targets.filter(
        (target) => target.team_id !== null,
    )
    const teamId = teamIds?.[0]?.team_id ?? 0
    const teamResponse = useGetTeam(teamId, {
        query: { enabled: !!teamId },
    })
    const specificTeamName = teamResponse?.data?.data?.name ?? 'Specific team'

    if (isLoading || !queue) {
        return <></>
    }

    const summaryData = {
        'Ring to':
            queue.target_scope === VoiceQueueTargetScope.Specific
                ? specificTeamName
                : 'All available agents',
        'Number of agents': queue.agent_ids ? queue.agent_ids.length : 0,
        'Distribution mode':
            queue.distribution_mode === PhoneRingingBehaviour.RoundRobin
                ? 'Round-robin'
                : 'Broadcast',
        'Ring time per agent': `${queue.ring_time} seconds`,
        'Wait time': `${queue.wait_time} seconds`,
        'Queue capacity': queue.capacity ?? 0,
    }

    return (
        <div>
            <CollapsibleDetails
                title={
                    <span className={css.collapsibleTitle}>
                        Show Queue Settings
                    </span>
                }
            >
                <SummaryBlock summaryData={summaryData}>
                    <Button
                        as="a"
                        target="_blank"
                        rel="noopener noreferrer"
                        fillStyle={'ghost'}
                        intent={'secondary'}
                        size={'small'}
                        href={`${PHONE_INTEGRATION_BASE_URL}/queues/${queue_id}`}
                        className={css.linkButton}
                        trailingIcon={'open_in_new'}
                    >
                        Edit settings
                    </Button>
                </SummaryBlock>
            </CollapsibleDetails>
        </div>
    )
}

export default VoiceQueueSummary
