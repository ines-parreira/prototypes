import { useState } from 'react'

import { useGetTeam, useGetVoiceQueue } from '@gorgias/api-queries'
import { Button } from '@gorgias/merchant-ui-kit'

import CollapsibleDetails from 'pages/tickets/detail/components/TicketVoiceCall/CollapsibleDetails'

import EditQueueModal from './EditQueueModal'
import SummaryBlock from './SummaryBlock'
import { getVoiceQueueSummaryData } from './utils'

import css from './VoiceQueueSummary.less'

type VoiceQueueSummaryProps = {
    queue_id: number
}

function VoiceQueueSummary({ queue_id }: VoiceQueueSummaryProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const {
        data: queueData,
        isLoading,
        refetch,
    } = useGetVoiceQueue(queue_id, {
        with_integrations: true,
    })
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

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true)
    }

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false)
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
                        fillStyle={'ghost'}
                        intent={'secondary'}
                        size={'small'}
                        onClick={handleOpenEditModal}
                        className={css.linkButton}
                        trailingIcon={'open_in_new'}
                    >
                        Edit settings
                    </Button>
                </SummaryBlock>
            </CollapsibleDetails>

            <EditQueueModal
                isOpen={isEditModalOpen}
                onClose={handleCloseEditModal}
                queue={queue}
                onUpdateSuccess={refetch}
            />
        </div>
    )
}

export default VoiceQueueSummary
