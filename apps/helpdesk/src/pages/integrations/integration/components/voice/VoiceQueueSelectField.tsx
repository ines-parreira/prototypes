import { useRef, useState } from 'react'

import { useId } from '@repo/hooks'

import { useGetVoiceQueue, VoiceQueue } from '@gorgias/helpdesk-queries'
import { Button, Label, Skeleton } from '@gorgias/merchant-ui-kit'

import { useVoiceQueueSearch } from 'domains/reporting/hooks/common/useVoiceQueueSearch'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import InfiniteScroll from 'pages/common/components/InfiniteScroll/InfiniteScroll'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import CreateNewQueueModal from './CreateNewQueueModal'
import VoiceQueueSelectFieldEmpty from './VoiceQueueSelectFieldEmpty'

import css from './VoiceQueueSelectField.less'

type VoiceQueueSelectProps = {
    name?: string
    value?: number
    onChange: (queueId: number) => void
}

export default function VoiceQueueSelectField({
    value,
    onChange,
    name,
}: VoiceQueueSelectProps) {
    const id = useId()
    const fieldsetName = name || 'radio-field-' + id

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isCreateNewModalOpen, setIsCreateNewModalOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const {
        onLoad,
        voiceQueues: options,
        shouldLoadMore,
        isLoading,
        isError,
        refetch,
    } = useVoiceQueueSearch()

    const selectedOption = options?.find((queue) => queue.id === value)

    const { data: voiceQueue } = useGetVoiceQueue(
        value ?? 0,
        {
            with_integrations: true,
        },
        {
            query: {
                enabled: !selectedOption && !!value,
                staleTime: 60_000,
            },
        },
    )

    const selectedQueue = selectedOption ?? voiceQueue?.data

    const selectedQueueName = value
        ? (selectedQueue?.name ?? `Queue #${value}`)
        : undefined

    const getQueueName = (queue: VoiceQueue) => {
        return queue?.name ?? `Queue #${queue.id}`
    }

    const createNewQueueModal = (
        <CreateNewQueueModal
            isOpen={isCreateNewModalOpen}
            onClose={() => setIsCreateNewModalOpen(false)}
            onCreateSuccess={(id) => {
                refetch()
                onChange(id)
            }}
        />
    )

    if (isLoading) {
        return <LoadingSkeleton />
    }

    if (isError) {
        return (
            <div className={css.error}>
                <p>
                    There was an error while trying to fetch the queues. Please
                    try again later.
                </p>
                <Button intent={'secondary'} onClick={() => refetch()}>
                    Retry
                </Button>
            </div>
        )
    }

    if (options?.length === 0) {
        return (
            <>
                <VoiceQueueSelectFieldEmpty
                    onAddClick={() => {
                        setIsDropdownOpen(false)
                        setIsCreateNewModalOpen(true)
                    }}
                />
                {createNewQueueModal}
            </>
        )
    }

    return (
        <fieldset name={fieldsetName} className={css.container}>
            <div className={css.labelWithTooltip}>
                <Label>Queue name</Label>
                <IconTooltip>
                    When you assign a queue to this line, its settings—including
                    assigned agents/teams, distribution mode, wait time, queue
                    limit, and wait music—will be applied automatically. View or
                    adjust settings in Queues.
                </IconTooltip>
            </div>
            <SelectInputBox
                label={selectedQueueName}
                onToggle={setIsDropdownOpen}
                floating={floatingRef}
                ref={targetRef}
                placeholder={'Select queue'}
                isDisabled={isLoading}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isDropdownOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                            fallbackPlacements={['bottom', 'top']}
                        >
                            <DropdownSearch autoFocus />
                            <DropdownBody>
                                <InfiniteScroll
                                    onLoad={onLoad}
                                    shouldLoadMore={shouldLoadMore}
                                >
                                    {options?.map((option) => (
                                        <DropdownItem
                                            key={option.id}
                                            option={{
                                                label: getQueueName(option),
                                                value: option.id,
                                            }}
                                            onClick={() => onChange(option.id)}
                                            shouldCloseOnSelect
                                        />
                                    ))}
                                </InfiniteScroll>
                            </DropdownBody>
                            <Button
                                intent="secondary"
                                className={css.createNewButton}
                                leadingIcon="add"
                                onClick={() => {
                                    setIsDropdownOpen(false)
                                    setIsCreateNewModalOpen(true)
                                }}
                            >
                                Create queue
                            </Button>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            <div className={css.caption}>
                Assigning a queue applies its settings automatically. Adjust
                settings in{' '}
                <a
                    href={
                        `${PHONE_INTEGRATION_BASE_URL}/queues` +
                        (selectedQueue ? `/${selectedQueue.id}` : '')
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    Queues
                </a>
                .
            </div>
            {createNewQueueModal}
        </fieldset>
    )
}

const LoadingSkeleton = () => {
    return (
        <>
            <Skeleton height={32} />
            <Skeleton height={32} />
            <Skeleton height={32} />
            <Skeleton height={32} width={'33%'} />
        </>
    )
}
