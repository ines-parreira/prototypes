import { Link } from 'react-router-dom'
import { BreadcrumbItem } from 'reactstrap'

import { useGetVoiceQueue } from '@gorgias/api-queries'

import { PHONE_INTEGRATION_BASE_URL } from '../voice/constants'

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
        <>
            <BreadcrumbItem>
                <Link to={`${PHONE_INTEGRATION_BASE_URL}/queues`}>Voice</Link>
            </BreadcrumbItem>
            {queueId === 'new' && (
                <BreadcrumbItem>Add call queue</BreadcrumbItem>
            )}
            {isIdNumber && (
                <BreadcrumbItem>
                    {queue?.data?.name ?? 'Edit queue'}
                </BreadcrumbItem>
            )}
        </>
    )
}
