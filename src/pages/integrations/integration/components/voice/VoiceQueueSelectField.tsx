import { useRef, useState } from 'react'

import { Link } from 'react-router-dom'

import {
    ListVoiceQueuesOrderBy,
    useListVoiceQueues,
    VoiceQueue,
} from '@gorgias/api-queries'
import { Button, Label, Skeleton } from '@gorgias/merchant-ui-kit'

import useId from 'hooks/useId'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import DropdownSearch from 'pages/common/components/dropdown/DropdownSearch'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import { PHONE_INTEGRATION_BASE_URL } from './constants'
import CreateNewQueueModal from './CreateNewQueueModal'

import css from './VoiceQueueSelectField.less'

type VoiceQueueSelectProps = {
    name?: string
    value?: number
    onChange: (queueId: number) => void
}

function VoiceQueueSelectField({
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

    // todo: we'll need to fetch more pages of data once we figure out pagination
    const { data, isFetching, error, refetch } = useListVoiceQueues(
        {
            order_by: ListVoiceQueuesOrderBy.CreatedDatetimeDesc,
        },
        {
            query: {
                refetchOnWindowFocus: false,
            },
        },
    )
    const options = data?.data?.data
    const selectedQueue = options?.find((queue) => queue.id === value)

    const selectedQueueName = value
        ? (selectedQueue?.name ?? `Queue #${value}`)
        : undefined

    const getQueueName = (queue: VoiceQueue) => {
        return queue?.name ?? `Queue #${queue.id}`
    }

    if (isFetching) {
        return <LoadingSkeleton />
    }

    if (!!error) {
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
            <div className={css.noQueues}>
                <div className={css.description}>
                    <div className={css.title}>No call queues yet?</div>
                    <div>
                        Queues route calls to the right team for faster
                        responses. We apply default settings to get you started,
                        which you can customize anytime.
                    </div>
                </div>
                <Button
                    leadingIcon="add"
                    fillStyle={'ghost'}
                    className={css.button}
                    onClick={() => {
                        setIsDropdownOpen(false)
                        setIsCreateNewModalOpen(true)
                    }}
                >
                    Create New Call Queue
                </Button>
                <CreateNewQueueModal
                    isOpen={isCreateNewModalOpen}
                    onClose={() => setIsCreateNewModalOpen(false)}
                    onCreateSuccess={(id) => {
                        refetch()
                        onChange(id)
                    }}
                />
            </div>
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
                isDisabled={isFetching}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isDropdownOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                            placement="bottom"
                        >
                            <DropdownSearch autoFocus />
                            <DropdownBody>
                                {options?.map((option) => (
                                    <DropdownItem
                                        key={option.id}
                                        option={{
                                            label: getQueueName(option),
                                            value: option.id,
                                        }}
                                        onClick={() => onChange(option.id)}
                                        shouldCloseOnSelect
                                        className={css.dropdownItem}
                                    />
                                ))}
                            </DropdownBody>
                            <DropdownItem
                                className={css.createNew}
                                option={{
                                    // @ts-expect-error
                                    label: (
                                        <Button
                                            intent="secondary"
                                            className={css.createNewButton}
                                            leadingIcon="add"
                                        >
                                            Create queue
                                        </Button>
                                    ),
                                    value: 'create-new',
                                }}
                                onClick={() => {
                                    setIsDropdownOpen(false)
                                    setIsCreateNewModalOpen(true)
                                }}
                            />
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
            <div className={css.caption}>
                Assigning a queue applies its settings automatically. Adjust
                settings in{' '}
                <Link to={`${PHONE_INTEGRATION_BASE_URL}/queues`}>Queues</Link>.
            </div>
            <CreateNewQueueModal
                isOpen={isCreateNewModalOpen}
                onClose={() => setIsCreateNewModalOpen(false)}
                onCreateSuccess={(id) => {
                    refetch()
                    onChange(id)
                }}
            />
        </fieldset>
    )
}

export default VoiceQueueSelectField

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
