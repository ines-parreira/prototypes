import { useGetTeam, useGetVoiceQueue } from '@gorgias/api-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import CollapsibleDetails from 'pages/tickets/detail/components/TicketVoiceCall/CollapsibleDetails'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import SummaryBlock from './SummaryBlock'
import { getVoiceQueueSummaryData } from './utils'

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

    const summaryData = getVoiceQueueSummaryData(queue, specificTeamName)

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
