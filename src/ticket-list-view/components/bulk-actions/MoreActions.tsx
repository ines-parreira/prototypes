import React, {
    ComponentProps,
    useCallback,
    useMemo,
    useRef,
    useState,
} from 'react'
import {JobType} from '@gorgias/api-queries'
import cn from 'classnames'

import {logEvent, SegmentEvent} from 'common/segment'
import {Item} from 'components/Dropdown'
import {Popover} from 'components/Popover'
import useAppSelector from 'hooks/useAppSelector'
import {Update} from 'jobs'
import IconButton from 'pages/common/components/button/IconButton'
import Button from 'pages/common/components/button/Button'
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
import TeamAssigneeDropdownMenu from './TeamAssigneeDropdownMenu'
import css from './style.less'
import ApplyMacro from './ApplyMacro'
import {Action, Job} from './types'

const getActions = (
    hasUserRole: boolean,
    isActiveViewTrashView: boolean
): Record<string, Job> => ({
    tag: {
        label: 'Add tag',
        type: JobType.UpdateTicket,
        params: (tag?: Item | null) => ({
            updates: {tags: [tag!.name!]},
        }),
        event: 'tags',
    },
    team: {
        label: 'Assign to team',
        type: JobType.UpdateTicket,
        params: (team?: Item | null) => ({
            updates: {
                assignee_team_id: team?.id ?? null,
            },
        }),
        event: 'assignee_team_id',
    },
    mark_as_unread: {
        label: 'Mark as unread',
        type: JobType.UpdateTicket,
        params: () => ({
            updates: {
                is_unread: true,
            },
        }),
        event: 'is_unread',
    },
    mark_as_read: {
        label: 'Mark as read',
        type: JobType.UpdateTicket,
        params: () => ({
            updates: {
                is_unread: false,
            },
        }),
        event: 'is_unread',
    },
    macro: {
        label: 'Apply macro',
    },
    ...(hasUserRole
        ? {
              export_tickets: {
                  label: 'Export tickets',
                  type: JobType.ExportTicket,
                  event: 'export',
              },
          }
        : {}),
    ...(hasUserRole
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
                      event: 'untrash',
                  },
                  delete: {
                      label: 'Delete forever',
                      type: JobType.DeleteTicket,
                      className: 'delete',
                      event: 'delete',
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
                      event: 'trash',
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
    value: Action
): value is Action.Tag | Action.Team | Action.Macro {
    return [Action.Tag, Action.Team, Action.Macro].includes(value)
}

export default function MoreActions({
    isDisabled,
    isLoading,
    launchJob,
    onComplete,
    selectionCount,
    ticketIds,
}: {
    isDisabled: boolean
    isLoading: boolean
    launchJob: (
        job: Job,
        params?: {
            updates: XOR<Update>
        },
        action?: Action
    ) => Promise<void>
    onComplete: () => void
    selectionCount: number | null
    ticketIds: number[]
}) {
    const dropdownButtonRef = useRef(null)
    const [isConfirmationPopoverOpen, setIsConfirmationPopoverOpen] =
        useState(false)
    const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [level, setLevel] = useState<
        Action.Tag | Action.Team | Action.Macro | null
    >(null)
    const currentUser = useAppSelector(getCurrentUserState)
    const hasAgentRole = useMemo(
        () => hasRole(currentUser, UserRole.Agent),
        [currentUser]
    )
    const isActiveViewTrashView = useAppSelector(getIsActiveViewTrashView)
    const actions = getActions(hasAgentRole, isActiveViewTrashView)
    const dropdownItems = getDropdownItems(actions)

    const toggle = useCallback((value: boolean) => {
        setIsDropdownOpen(value)
        setLevel(null)
    }, [])

    const buttonPropsPopover: ComponentProps<typeof Button> = useMemo(
        () => ({
            intent: 'destructive',
            onClick: () => {
                const action = isActiveViewTrashView
                    ? actions['delete']
                    : actions['trash']
                void launchJob(action, action.params?.())
            },
        }),
        [actions, isActiveViewTrashView, launchJob]
    )

    const onClick = useCallback(
        (value: Action, options?: Item | null) => {
            if (!level && isItemNested(value)) {
                setLevel(value)
                if (value === Action.Macro) {
                    setIsMacroModalOpen(true)
                }
                return
            }

            if (value === Action.Delete || value === Action.Trash) {
                setIsConfirmationPopoverOpen(true)
            } else {
                const params = actions[value].params?.(options)
                void launchJob(actions[value], params, value)
            }

            if (level) {
                toggle(false)
            }
        },
        [actions, launchJob, level, toggle]
    )

    const onApplyMacro = useCallback(() => {
        logEvent(SegmentEvent.BulkAction, {
            type: 'apply-macro',
            location: 'split-view-mode',
        })
        onComplete()
    }, [onComplete])

    const onClickBack = useCallback(() => {
        setLevel(null)
    }, [setLevel])

    return (
        <>
            <IconButton
                className={cn(css.button, {
                    [css.isOpen]: isDropdownOpen || isConfirmationPopoverOpen,
                })}
                ref={dropdownButtonRef}
                isDisabled={isLoading || isDisabled}
                size="small"
                fillStyle="ghost"
                intent="secondary"
                title="More actions"
                onClick={() => {
                    setIsDropdownOpen(!isDropdownOpen)
                    setIsConfirmationPopoverOpen(false)
                }}
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
                        {level === Action.Tag ? (
                            <TagDropdownMenu
                                className={css.dropdownMenu}
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
                                    !isItemNested(option.value) ||
                                    option.value === 'macro'
                                }
                            >
                                {option.label}
                            </DropdownItem>
                        ))}
                    </DropdownBody>
                )}
            </Dropdown>
            {isMacroModalOpen && (
                <ApplyMacro
                    onApplyMacro={onApplyMacro}
                    setIsOpen={setIsMacroModalOpen}
                    ticketIds={ticketIds}
                />
            )}
            <Popover
                target={dropdownButtonRef}
                isOpen={isConfirmationPopoverOpen}
                setIsOpen={setIsConfirmationPopoverOpen}
                buttonProps={buttonPropsPopover}
            >
                Are you sure you want to delete {selectionCount} ticket
                {selectionCount !== 1 && 's'}
                {isActiveViewTrashView && ' forever'}?
            </Popover>
        </>
    )
}
