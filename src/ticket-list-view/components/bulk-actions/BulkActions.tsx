import React, {useCallback, useMemo, useRef, useState} from 'react'
import {JobType} from '@gorgias/api-queries'
import cn from 'classnames'

import {Update, useBulkAction} from 'jobs'
import {Item} from 'components/Dropdown'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {TagDropdownMenu} from 'tags'
import {getMoment} from 'utils/date'

import ApplyMacro from './ApplyMacro'
import CloseTickets from './CloseTickets'
import css from './style.less'

type Job = {
    label: string
    type: JobType
    params?: (item?: Item | null) => {updates: XOR<Update>}
    className?: string
    subItem?: string
}

export enum Action {
    MarkAsUnread = 'mark_as_unread',
    MarkAsRead = 'mark_as_read',
    ExportTickets = 'export_tickets',
    Delete = 'delete',
}

const jobs: Record<Action | 'tag', Job> = {
    tag: {
        label: 'Add tag',
        type: JobType.UpdateTicket,
        params: (tag?: Item | null) => ({
            updates: {tags: [tag!.name!]},
        }),
    },
    mark_as_unread: {
        label: 'Mark as unread',
        type: JobType.UpdateTicket,
        params: () => ({
            updates: {
                is_unread: true,
            },
        }),
    },
    mark_as_read: {
        label: 'Mark as read',
        type: JobType.UpdateTicket,
        params: () => ({
            updates: {
                is_unread: false,
            },
        }),
    },
    export_tickets: {
        label: 'Export tickets',
        type: JobType.ExportTicket,
    },
    delete: {
        label: 'Delete',
        type: JobType.UpdateTicket,
        params: () => ({
            updates: {trashed_datetime: getMoment().toISOString()},
        }),
        className: 'delete',
    },
}

const dropdownItems = Object.entries(jobs).map(([key, value]) => ({
    ...value,
    value: key as Action,
}))

function isItemNested(value: Action | 'tag'): value is 'tag' {
    return ['tag'].includes(value)
}

export default function BulkActions({
    hasSelectedAll,
    onComplete,
    selectedTickets,
}: {
    hasSelectedAll: boolean
    onComplete: () => void
    selectedTickets: Record<number, boolean>
}) {
    const dropdownButtonRef = useRef(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [level, setLevel] = useState<'tag' | null>(null)

    const ticketIds = useMemo(
        () =>
            Object.entries(selectedTickets).reduce<number[]>(
                (ids, [id, isSelected]) =>
                    isSelected ? [...ids, parseInt(id)] : ids,
                []
            ),
        [selectedTickets]
    )
    const isDisabled = useMemo(
        () => !hasSelectedAll && !ticketIds.length,
        [hasSelectedAll, ticketIds]
    )

    const {createJob, isLoading} = useBulkAction(
        hasSelectedAll ? 'view' : 'ticket',
        ticketIds
    )

    const toggle = useCallback((value: boolean) => {
        setIsDropdownOpen(value)
        setLevel(null)
    }, [])

    const launchJob = useCallback(
        async ({
            type,
            params,
        }: {
            type: Job['type']
            params?: {
                updates: XOR<Update>
            }
        }) => {
            await createJob(type, params)
            onComplete()
        },
        [createJob, onComplete]
    )

    const onClick = useCallback(
        (value: Action | 'tag', options?: Item | null) => {
            if (!level && isItemNested(value)) {
                setLevel(value)
                return
            }
            const params = jobs[value].params?.(options)

            void launchJob({
                type: jobs[value].type,
                params,
            })

            if (level) {
                toggle(false)
            }
        },
        [launchJob, level, toggle]
    )

    const onClickBack = useCallback(() => {
        setLevel(null)
    }, [setLevel])

    return (
        <div className={css.bulkActions}>
            <CloseTickets
                isDisabled={isLoading || isDisabled}
                onClick={() =>
                    launchJob({
                        type: JobType.UpdateTicket,
                        params: {updates: {status: 'closed'}},
                    })
                }
            />
            <ApplyMacro
                isDisabled={isLoading || isDisabled}
                onComplete={onComplete}
                ticketIds={ticketIds}
            />
            <IconButton
                className={cn(css.button, {
                    [css.isOpen]: isDropdownOpen,
                })}
                ref={dropdownButtonRef}
                isDisabled={isLoading || isDisabled}
                size="small"
                fillStyle="ghost"
                intent="secondary"
                title="More actions"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                more_horiz
            </IconButton>
            <Dropdown
                className={css.dropdown}
                isOpen={isDropdownOpen}
                onToggle={toggle}
                target={dropdownButtonRef}
                placement="bottom-end"
            >
                {level ? (
                    <>
                        <DropdownHeader
                            prefix={
                                <i className="material-icons">arrow_back</i>
                            }
                            onClick={onClickBack}
                        >
                            Back
                        </DropdownHeader>
                        {level === 'tag' && (
                            <TagDropdownMenu
                                onClick={(item) => onClick(level, item)}
                            />
                        )}
                    </>
                ) : (
                    <DropdownBody>
                        {dropdownItems.map((option) => (
                            <DropdownItem
                                key={option.label}
                                className={
                                    option.className
                                        ? css[option.className]
                                        : undefined
                                }
                                option={option}
                                onClick={onClick}
                                isDisabled={isLoading}
                                shouldCloseOnSelect={
                                    !isItemNested(option.value)
                                }
                            >
                                {option.label}
                            </DropdownItem>
                        ))}
                    </DropdownBody>
                )}
            </Dropdown>
        </div>
    )
}
