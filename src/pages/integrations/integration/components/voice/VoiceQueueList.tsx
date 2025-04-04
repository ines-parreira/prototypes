import { useRef } from 'react'

import { TableVirtuoso, VirtuosoHandle } from 'react-virtuoso'

import { VoiceQueue, VoiceQueueStatus } from '@gorgias/api-queries'
import { Badge, Label, Skeleton } from '@gorgias/merchant-ui-kit'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import history from 'pages/history'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'

import { PHONE_INTEGRATION_BASE_URL, QUEUE_LIST_PAGE_SIZE } from './constants'

import css from './VoiceQueueList.less'

type VoiceQueueListProps = {
    queues: VoiceQueue[]
    onScroll: () => {}
}

export default function VoiceQueueList({
    queues,
    onScroll,
}: VoiceQueueListProps) {
    const virtuosoRef = useRef<VirtuosoHandle>(null)

    return (
        <div className={css.body}>
            <TableVirtuoso<VoiceQueue>
                ref={virtuosoRef}
                endReached={onScroll}
                data={queues}
                fixedHeaderContent={() => {
                    // we need 3 cells in the header to match the width of the body
                    return (
                        <>
                            <HeaderCellProperty
                                title="Name"
                                titleClassName={css.headerCell}
                            />

                            <HeaderCellProperty
                                title=""
                                titleClassName={css.headerCell}
                            />
                            <HeaderCellProperty
                                title=""
                                titleClassName={css.headerCell}
                            />
                        </>
                    )
                }}
                components={{
                    EmptyPlaceholder: TableBodySkeleton,
                    TableHead: ({ children }) => (
                        <TableHead className={css.header}>{children}</TableHead>
                    ),
                    TableRow: (props) => {
                        const { children, ...rest } = props
                        const queue = queues[props['data-index']]
                        return (
                            <TableBodyRow
                                key={queue.id}
                                {...rest}
                                onClick={() => {
                                    const redirectURL = `${PHONE_INTEGRATION_BASE_URL}/queues/${queue.id}`
                                    history.push(redirectURL)
                                }}
                            >
                                {children}
                            </TableBodyRow>
                        )
                    },
                }}
                itemContent={(index, queue) => (
                    <VoiceQueueListItem queue={queue} />
                )}
            ></TableVirtuoso>
        </div>
    )
}

const VoiceQueueListItem = ({ queue }: { queue: VoiceQueue }) => {
    const redirectURL = `${PHONE_INTEGRATION_BASE_URL}/queues/${queue.id}`
    return (
        <>
            <BodyCell width={'90%'}>
                <Label>{queue.name}</Label>
            </BodyCell>
            <BodyCell width={'5%'}>
                <Badge
                    type={
                        queue.status === VoiceQueueStatus.Enabled
                            ? 'success'
                            : 'error'
                    }
                >
                    {queue.status}
                </Badge>
            </BodyCell>
            <BodyCell width={'5%'}>
                <ForwardIcon href={redirectURL} />
            </BodyCell>
        </>
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
