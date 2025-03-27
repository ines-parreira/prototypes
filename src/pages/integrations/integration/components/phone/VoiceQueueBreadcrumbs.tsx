import { Link } from 'react-router-dom'
import { Breadcrumb, BreadcrumbItem } from 'reactstrap'

import { useGetVoiceQueue } from '@gorgias/api-queries'
import { VoiceQueueStatus } from '@gorgias/api-types'

import { PHONE_INTEGRATION_BASE_URL } from '../voice/constants'
import VoiceQueueStatusToggle from '../voice/VoiceQueueStatusToggle'

import css from './VoiceQueueBreadcrumbs.less'

export default function VoiceQueueBreadcrumbs({
    queueId,
}: {
    queueId: string
}) {
    const isIdNumber = !isNaN(Number(queueId))

    const { data: queue } = useGetVoiceQueue(Number(queueId), undefined, {
        query: {
            refetchOnWindowFocus: false,
            enabled: isIdNumber,
        },
    })

    return (
        <div className={css.container}>
            <Breadcrumb style={{ margin: 0 }}>
                <BreadcrumbItem>
                    <Link to={`${PHONE_INTEGRATION_BASE_URL}/queues`}>
                        Voice
                    </Link>
                </BreadcrumbItem>
                {queueId === 'new' && (
                    <BreadcrumbItem>Add call queue</BreadcrumbItem>
                )}
                {isIdNumber && (
                    <BreadcrumbItem>
                        {queue?.data?.name ?? 'Edit queue'}
                    </BreadcrumbItem>
                )}
            </Breadcrumb>

            {isIdNumber && queue?.data && (
                <VoiceQueueStatusToggle
                    queueId={Number(queueId)}
                    isEnabled={queue.data.status === VoiceQueueStatus.Enabled}
                />
            )}
        </div>
    )
}
