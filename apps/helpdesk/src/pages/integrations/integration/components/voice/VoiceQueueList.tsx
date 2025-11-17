import { useRef } from 'react'

import { history } from '@repo/routing'
import type { VirtuosoHandle } from 'react-virtuoso'
import { TableVirtuoso } from 'react-virtuoso'

import {
    Badge,
    LegacyIconButton as IconButton,
    Label,
    Skeleton,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import type { VoiceQueue } from '@gorgias/helpdesk-queries'
import { VoiceQueueStatus } from '@gorgias/helpdesk-queries'

import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import ForwardIcon from 'pages/integrations/common/components/ForwardIcon'

import { PHONE_INTEGRATION_BASE_URL, QUEUE_LIST_PAGE_SIZE } from './constants'
import SummaryBlock from './SummaryBlock'
import { getVoiceQueueSummaryData } from './utils'

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
                    // TODO(React18) Get rid of the casting to any when going to react-18 types
                    TableHead: ({ children }: any) => (
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

    const summaryData = getVoiceQueueSummaryData(queue)

    return (
        <>
            <BodyCell width={'85%'}>
                <Label>{queue.name}</Label>
            </BodyCell>
            <BodyCell width={'5%'}>
                <IconButton
                    icon="info"
                    id={`info-${queue.id}`}
                    fillStyle="ghost"
                    intent="secondary"
                    iconClassName="material-icons-outlined"
                />
                <Tooltip placement="top" target={`info-${queue.id}`}>
                    <SummaryBlock summaryData={summaryData} isTransparent />
                </Tooltip>
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
