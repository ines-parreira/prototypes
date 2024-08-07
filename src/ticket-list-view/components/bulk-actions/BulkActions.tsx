import React, {useCallback, useMemo, useRef, useState} from 'react'
import {JobType} from '@gorgias/api-queries'

import {Update, useBulkAction} from 'jobs'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {getMoment} from 'utils/date'

import ApplyMacro from './ApplyMacro'
import CloseTickets from './CloseTickets'

import css from './BulkActions.less'

type Job = {
    label: string
    type: JobType
    params?:
        | {
              updates: XOR<Update>
          }
        | (() => {updates: XOR<Update>})
    className?: string
}

const jobs: Record<string, Job> = {
    mark_as_unread: {
        label: 'Mark as unread',
        type: JobType.UpdateTicket,
        params: {
            updates: {
                is_unread: true,
            },
        },
    },
    mark_as_read: {
        label: 'Mark as read',
        type: JobType.UpdateTicket,
        params: {
            updates: {
                is_unread: false,
            },
        },
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
    value: key,
}))

export default function BulkActions({
    onComplete,
    selectedTickets,
}: {
    onComplete: () => void
    selectedTickets: Record<number, boolean>
}) {
    const dropdownButtonRef = useRef(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const ticketIds = useMemo(
        () =>
            Object.entries(selectedTickets).reduce<number[]>(
                (ids, [id, isSelected]) =>
                    isSelected ? [...ids, parseInt(id)] : ids,
                []
            ),
        [selectedTickets]
    )

    const {createJob, isLoading} = useBulkAction(
        ticketIds?.length ? 'ticket' : 'view',
        ticketIds
    )

    const launchJob = useCallback(
        async ({type, params}: {type: Job['type']; params: Job['params']}) => {
            await createJob(
                type,
                typeof params === 'function' ? params() : params
            )
            onComplete()
        },
        [createJob, onComplete]
    )

    return (
        <div className={css.bulkActions}>
            <CloseTickets
                isDisabled={isLoading}
                onClick={() =>
                    launchJob({
                        type: JobType.UpdateTicket,
                        params: {updates: {status: 'closed'}},
                    })
                }
            />
            <ApplyMacro onComplete={onComplete} ticketIds={ticketIds} />
            <IconButton
                className={isDropdownOpen ? css.moreButtonOpen : undefined}
                ref={dropdownButtonRef}
                size="small"
                fillStyle="ghost"
                intent="secondary"
                title="More actions"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                more_horiz
            </IconButton>
            <Dropdown
                isOpen={isDropdownOpen}
                onToggle={setIsDropdownOpen}
                target={dropdownButtonRef}
                placement="bottom-end"
            >
                <DropdownBody className={css.dropdownBody}>
                    {dropdownItems.map((option) => (
                        <DropdownItem
                            key={option.label}
                            className={
                                option.className
                                    ? css[option.className]
                                    : undefined
                            }
                            option={option}
                            onClick={(value) => {
                                void launchJob({
                                    type: jobs[value].type,
                                    params: jobs[value].params,
                                })
                            }}
                            isDisabled={isLoading}
                            shouldCloseOnSelect
                        >
                            {option.label}
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
