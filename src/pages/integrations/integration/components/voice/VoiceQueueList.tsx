import { VoiceQueue, VoiceQueueStatus } from '@gorgias/api-queries'
import { Badge, Label, Skeleton } from '@gorgias/merchant-ui-kit'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import history from 'pages/history'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'

import { PHONE_INTEGRATION_BASE_URL, QUEUE_LIST_PAGE_SIZE } from './constants'

import css from './VoiceQueueList.less'

type VoiceQueueListProps = {
    queues?: VoiceQueue[]
    isFetching: boolean
}

export default function VoiceQueueList({
    queues,
    isFetching,
}: VoiceQueueListProps) {
    return (
        <TableWrapper className={css.table}>
            <TableHead>
                <HeaderCellProperty
                    title="Name"
                    titleClassName={css.headerCell}
                />
            </TableHead>
            <TableBody>
                {isFetching || !queues ? (
                    <TableBodySkeleton />
                ) : (
                    queues.map((queue) => {
                        const redirectURL = `${PHONE_INTEGRATION_BASE_URL}/queues/${queue.id}`

                        return (
                            <TableBodyRow
                                key={queue.id}
                                onClick={() => {
                                    history.push(redirectURL)
                                }}
                            >
                                <BodyCell>
                                    <Label>{queue.name}</Label>
                                </BodyCell>
                                <BodyCell size="small">
                                    <Badge
                                        type={
                                            queue.status ===
                                            VoiceQueueStatus.Enabled
                                                ? 'success'
                                                : 'error'
                                        }
                                    >
                                        {queue.status}
                                    </Badge>
                                </BodyCell>
                                <BodyCell>
                                    <ForwardIcon href={redirectURL} />
                                </BodyCell>
                            </TableBodyRow>
                        )
                    })
                )}
            </TableBody>
        </TableWrapper>
    )
}

const TableBodySkeleton = () => {
    return (
        <>
            {Array.from({ length: QUEUE_LIST_PAGE_SIZE }, (_, index) => (
                <TableBodyRow key={index}>
                    <BodyCell>
                        <Skeleton width={500} />
                    </BodyCell>
                </TableBodyRow>
            ))}
        </>
    )
}
