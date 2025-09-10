import classNames from 'classnames'

import { Skeleton } from '@gorgias/axiom'
import {
    useListVoiceQueues,
    VoiceQueue,
    VoiceQueueStatus,
} from '@gorgias/helpdesk-queries'

import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import DropdownSection from 'pages/common/components/dropdown/DropdownSection'

import css from './CallTransferDropdown.less'

type Props = {
    setSelectedQueueId: (queueId: number) => void
    clearErrors?: () => void
}

const QueueCallTransferDropdownContent = ({
    setSelectedQueueId,
    clearErrors,
}: Props) => {
    const { data, isLoading } = useListVoiceQueues({
        limit: 100,
        with_availability_info: true,
    })

    const queues = data?.data.data

    if (!queues || isLoading) {
        return (
            <div className={css.dropdownSkeleton}>
                <Skeleton height={45} />
                <Skeleton height={45} />
                <Skeleton height={45} />
                <Skeleton height={45} />
                <Skeleton height={45} />
                <Skeleton height={31} />
            </div>
        )
    }

    const isQueueAvailable = (queue: VoiceQueue) =>
        queue.status !== VoiceQueueStatus.Disabled && !queue.is_full

    const availableQueues = queues.filter(isQueueAvailable)
    const unavailableQueues = queues.filter((queue) => !isQueueAvailable(queue))

    return (
        <>
            <DropdownSearch />
            <DropdownBody className={css.dropdownBody} onClick={clearErrors}>
                <DropdownSection
                    title={`Available (${availableQueues.length})`}
                    alwaysRender
                >
                    {availableQueues &&
                        availableQueues.map((queue) => (
                            <QueueDropdownItem
                                key={`queue-${queue.id}`}
                                queue={queue}
                                onSelect={setSelectedQueueId}
                            />
                        ))}
                </DropdownSection>
                <DropdownSection
                    title={`Unavailable (${unavailableQueues.length})`}
                    alwaysRender
                >
                    {unavailableQueues &&
                        unavailableQueues.map((queue) => (
                            <QueueDropdownItem
                                key={`queue-${queue.id}`}
                                queue={queue}
                                onSelect={setSelectedQueueId}
                                isDisabled
                            />
                        ))}
                </DropdownSection>
            </DropdownBody>
        </>
    )
}

type QueueDropdownItemProps = {
    queue: VoiceQueue
    onSelect: (queueId: number) => void
    isDisabled?: boolean
}

const QueueDropdownItem = ({
    queue,
    onSelect,
    isDisabled,
}: QueueDropdownItemProps) => {
    const getQueueStatusLabel = () => {
        if (queue.status === VoiceQueueStatus.Disabled) {
            return 'Disabled'
        }

        if (queue.is_full) {
            return 'Capacity reached'
        }

        return `${queue.queued_calls_count} / ${queue.capacity} calls`
    }

    return (
        <DropdownItem
            option={{
                label: queue.name,
                value: queue.id,
            }}
            onClick={onSelect}
            isDisabled={isDisabled}
        >
            <div className={css.queueItem}>
                <span>{queue.name}</span>
                <span
                    className={classNames(css.status, {
                        [css.enabledStatus]: !isDisabled,
                    })}
                >
                    {getQueueStatusLabel()}
                </span>
            </div>
        </DropdownItem>
    )
}

export default QueueCallTransferDropdownContent
