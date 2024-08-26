import React, {useCallback, useMemo, useRef, useState} from 'react'
import {JobType} from '@gorgias/api-queries'
import cn from 'classnames'

import {Item} from 'components/Dropdown'
import useAppSelector from 'hooks/useAppSelector'
import {Update, useBulkAction} from 'jobs'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import {getCurrentUserState} from 'state/currentUser/selectors'
import {isActiveViewTrashView as getIsActiveViewTrashView} from 'state/views/selectors'
import {TagDropdownMenu} from 'tags'
import {hasRole} from 'utils'
import {getMoment} from 'utils/date'

import {UserRole} from 'config/types/user'
import ApplyMacro from './ApplyMacro'
import CloseTickets from './CloseTickets'
import TeamAssigneeDropdownMenu from './TeamAssigneeDropdownMenu'
import UserAssigneeDropdownMenu from './UserAssigneeDropdownMenu'
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
    Untrash = 'untrash',
    Delete = 'delete',
    Trash = 'trash',
}

const getActions = (
    hasAgentRole: boolean,
    isActiveViewTrashView: boolean
): Record<string, Job> => ({
    tag: {
        label: 'Add tag',
        type: JobType.UpdateTicket,
        params: (tag?: Item | null) => ({
            updates: {tags: [tag!.name!]},
        }),
    },
    agent: {
        label: 'Assign to',
        type: JobType.UpdateTicket,
        params: (agent?: Item | null) => ({
            updates: {
                assignee_user: agent
                    ? {
                          id: agent.id!,
                          name: agent.name!,
                      }
                    : null,
            },
        }),
    },
    team: {
        label: 'Assign to team',
        type: JobType.UpdateTicket,
        params: (team?: Item | null) => ({
            updates: {
                assignee_team_id: team?.id ?? null,
            },
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
    ...(hasAgentRole
        ? {
              export_tickets: {
                  label: 'Export tickets',
                  type: JobType.ExportTicket,
              },
          }
        : {}),
    ...(hasAgentRole
        ? isActiveViewTrashView
            ? {
                  untrash: {
                      label: 'Undelete',
                      type: JobType.UpdateTicket,
                      params: () => ({
                          updates: {
                              trashed_datetime: null,
                          },
                      }),
                  },
                  delete: {
                      label: 'Delete forever',
                      type: JobType.DeleteTicket,
                      className: 'delete',
                  },
              }
            : {
                  trash: {
                      label: 'Delete',
                      type: JobType.UpdateTicket,
                      params: () => ({
                          updates: {
                              trashed_datetime: getMoment().toISOString(),
                          },
                      }),
                      className: 'delete',
                  },
              }
        : {}),
})

const getDropdownItems = (actions: ReturnType<typeof getActions>) =>
    Object.entries(actions).map(([key, value]) => ({
        ...value,
        value: key as Action,
    }))

function isItemNested(
    value: Action | 'agent' | 'tag' | 'team'
): value is 'tag' | 'agent' | 'team' {
    return ['agent', 'tag', 'team'].includes(value)
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
    const [level, setLevel] = useState<'agent' | 'team' | 'tag' | null>(null)
    const currentUser = useAppSelector(getCurrentUserState)
    const hasAgentRole = useMemo(
        () => hasRole(currentUser, UserRole.Agent),
        [currentUser]
    )
    const isActiveViewTrashView = useAppSelector(getIsActiveViewTrashView)
    const actions = getActions(hasAgentRole, isActiveViewTrashView)
    const dropdownItems = getDropdownItems(actions)

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
        (value: Action | 'agent' | 'tag' | 'team', options?: Item | null) => {
            if (!level && isItemNested(value)) {
                setLevel(value)
                return
            }
            const params = actions[value].params?.(options)

            void launchJob({
                type: actions[value].type,
                params,
            })
            if (level) {
                toggle(false)
            }
        },
        [actions, launchJob, level, toggle]
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
                        {level === 'tag' ? (
                            <TagDropdownMenu
                                onClick={(item) => onClick(level, item)}
                            />
                        ) : level === 'agent' ? (
                            <UserAssigneeDropdownMenu
                                onClick={(item) => onClick(level, item)}
                            />
                        ) : (
                            <TeamAssigneeDropdownMenu
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
