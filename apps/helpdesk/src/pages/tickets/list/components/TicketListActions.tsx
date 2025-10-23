import { MouseEvent, useMemo, useRef, useState } from 'react'

import { useShortcuts } from '@repo/utils'
import classnames from 'classnames'
import { fromJS, List, Map } from 'immutable'
import moment from 'moment'
import {
    ButtonDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown,
} from 'reactstrap'

import {
    LegacyButton as Button,
    ButtonGroup,
    LegacyIconButton as IconButton,
} from '@gorgias/axiom'
import { JobType } from '@gorgias/helpdesk-queries'

import { logEvent, SegmentEvent } from 'common/segment'
import { Popover } from 'components/Popover'
import { UserRole } from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItemInternal from 'pages/common/components/dropdown/DropdownItem'
import TextInput from 'pages/common/forms/input/TextInput'
import { AgentLabel, TeamLabel } from 'pages/common/utils/labels'
import css from 'pages/tickets/list/components/TicketListActions.less'
import { getHumanAgents } from 'state/agents/selectors'
import { getTeams } from 'state/teams/selectors'
import { createJob as createJobTicket } from 'state/tickets/actions'
import { getTickets } from 'state/tickets/selectors'
import {
    createJob as createJobView,
    updateSelectedItemsIds,
} from 'state/views/actions'
import {
    areAllActiveViewItemsSelected,
    getActiveView,
    areFiltersValid as getAreFiltersValid,
    isActiveViewTrashView as getIsActiveViewTrashView,
    getViewCount,
} from 'state/views/selectors'
import { TagDropdownMenu } from 'tags'
import PriorityDropdownMenu from 'ticket-list-view/components/bulk-actions/PriorityDropdownMenu'
import { hasRole } from 'utils'

export const SHORTCUT_MANAGER_COMPONENT_NAME = 'TicketListActions'

type Props = {
    openMacroModal: () => void
    selectedItemsIds: List<number>
}

enum ActionDropdown {
    Teams = 'teams',
    Agents = 'agents',
    Tags = 'tags',
    Trash = 'trash',
    Priority = 'priority',
    More = 'more',
}

// TODO(agent-null-names): remove fallbacks in this component when https://github.com/gorgias/gorgias/issues/4413 is fixed
export const TicketListActions = ({
    openMacroModal,
    selectedItemsIds,
}: Props) => {
    const dispatch = useAppDispatch()

    const currentUser = useAppSelector((state) => state.currentUser)
    const teams = useAppSelector(getTeams)
    const agents = useAppSelector(getHumanAgents)
    const isActiveViewTrashView = useAppSelector(getIsActiveViewTrashView)
    const allViewItemsSelected = useAppSelector(areAllActiveViewItemsSelected)
    const areFiltersValid = useAppSelector(getAreFiltersValid)
    const activeView = useAppSelector(getActiveView)
    const viewCount = useAppSelector(getViewCount(activeView.get('id')))

    const tickets = useAppSelector(getTickets)

    const [openDropdown, setOpenDropdown] = useState<ActionDropdown | null>(
        null,
    )
    const [teamsSearchQuery, setTeamsSearchQuery] = useState('')
    const [agentsSearchQuery, setAgentsSearchQuery] = useState('')
    const tagDropdownButtonRef = useRef(null)
    const moreDropdownButtonRef = useRef(null)

    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
        useState(false)
    const [isLaunchingJob, setIsLaunchingJob] = useState(false)
    const hasAgentRole = useMemo(
        () => hasRole(currentUser, UserRole.Agent),
        [currentUser],
    )

    const hasSelectedItems = !selectedItemsIds.isEmpty()
    const isDisabled = !hasSelectedItems || isLaunchingJob || !areFiltersValid

    const filteredTeams = useMemo(() => {
        return teams.filter((team) =>
            (team!.get('name') as string)
                .toLowerCase()
                .includes(teamsSearchQuery.toLowerCase()),
        )
    }, [teams, teamsSearchQuery])

    const filteredAgents = useMemo(() => {
        return agents.filter((agent: Map<any, any>) => {
            const agentLabel =
                (agent.get('name') as string) || (agent.get('email') as string)
            return agentLabel
                .toLowerCase()
                .includes(agentsSearchQuery.toLowerCase())
        }) as List<Map<any, any>>
    }, [agents, agentsSearchQuery])

    const selectedCount = useMemo(
        () => (allViewItemsSelected ? viewCount : selectedItemsIds.size),
        [allViewItemsSelected, viewCount, selectedItemsIds.size],
    )

    const selectedTickets = useMemo<List<Map<any, any>>>(() => {
        return selectedItemsIds
            .map((id) => {
                return tickets.find(
                    (ticket: Map<any, any>) => ticket.get('id') === id,
                ) as Map<any, any> | undefined
            })
            .filter((ticket) => !!ticket) as List<Map<any, any>>
    }, [tickets, selectedItemsIds])

    const isMarkAsReadActionAvailable = useMemo<boolean>(() => {
        return (
            allViewItemsSelected ||
            !!selectedTickets.find(
                (ticket) => ticket!.get('is_unread') as boolean,
            )
        )
    }, [selectedTickets, allViewItemsSelected])

    const isMarkAsUnreadActionAvailable = useMemo<boolean>(() => {
        return (
            allViewItemsSelected ||
            !!selectedTickets.find((ticket) => !ticket!.get('is_unread'))
        )
    }, [selectedTickets, allViewItemsSelected])

    const toggleDropdown = (dropdown: ActionDropdown): boolean => {
        const newOpenDropdown = openDropdown !== dropdown ? dropdown : null
        setOpenDropdown(newOpenDropdown)
        return !!newOpenDropdown
    }

    const toggleTeamsDropdown = () => {
        const isOpen = toggleDropdown(ActionDropdown.Teams)
        if (isOpen) {
            setTeamsSearchQuery('')
        }
    }

    const toggleAgentsDropdown = () => {
        const isOpen = toggleDropdown(ActionDropdown.Agents)
        if (isOpen) {
            setAgentsSearchQuery('')
        }
    }

    const addTag = (name?: string) => {
        if (!name) {
            return
        }
        bulkUpdate('tags', [name])
    }

    const createJob = async (
        jobType: JobType,
        jobParams: Record<string, unknown>,
    ) => {
        setIsLaunchingJob(true)
        try {
            if (allViewItemsSelected) {
                await dispatch(createJobView(activeView, jobType, jobParams))
            } else {
                await dispatch(
                    createJobTicket(selectedItemsIds, jobType, jobParams),
                )
            }

            dispatch(updateSelectedItemsIds(fromJS([])))
        } catch {
            // Don't raise an exception in the console
        } finally {
            setIsLaunchingJob(false)
        }
    }

    const bulkUpdate = (
        key:
            | 'assignee_team_id'
            | 'assignee_user'
            | 'is_unread'
            | 'status'
            | 'tags'
            | 'priority',
        value: any,
    ) => {
        if (!hasSelectedItems) {
            return
        }
        logEvent(SegmentEvent.BulkAction, {
            type: key,
            location: 'full-width-mode',
            ...('is_unread' === key || 'status' === key ? { value } : {}),
        })
        void createJob(JobType.UpdateTicket, { updates: { [key]: value } })
    }

    const bulkExport = () => {
        logEvent(SegmentEvent.TicketExport, {
            type: 'bulk-action-export',
        })
        logEvent(SegmentEvent.BulkAction, {
            type: 'export',
            location: 'full-width-mode',
        })
        void createJob(JobType.ExportTicket, {})
    }

    const bulkTrash = () => {
        logEvent(SegmentEvent.BulkAction, {
            type: 'trash',
            location: 'full-width-mode',
        })
        toggleTrashConfirmation(false)
        void createJob(JobType.UpdateTicket, {
            updates: { trashed_datetime: moment.utc() },
        })
    }

    const bulkUnTrash = () => {
        logEvent(SegmentEvent.BulkAction, {
            type: 'untrash',
            location: 'full-width-mode',
        })
        void createJob(JobType.UpdateTicket, {
            updates: { trashed_datetime: null },
        })
    }

    const bulkDelete = () => {
        logEvent(SegmentEvent.BulkAction, {
            type: 'delete',
            location: 'full-width-mode',
        })
        setIsDeleteConfirmationOpen(false)
        void createJob(JobType.DeleteTicket, {})
    }

    const actions = {
        OPEN_TICKET: {
            action: () => bulkUpdate('status', 'open'),
        },
        CLOSE_TICKET: {
            action: () => bulkUpdate('status', 'closed'),
        },
        OPEN_ASSIGNEE: {
            action: (e: Event) => {
                if (!hasSelectedItems) {
                    return
                }
                e.preventDefault()
                toggleAgentsDropdown()
            },
        },
        OPEN_TAGS: {
            action: (e: Event) => {
                if (!hasSelectedItems) {
                    return
                }
                e.preventDefault()
                toggleDropdown(ActionDropdown.Tags)
            },
        },
        OPEN_MACRO: {
            action: (e: Event) => {
                if (!hasSelectedItems) {
                    return
                }
                e.preventDefault()
                openMacroModal()
            },
        },
        DELETE_TICKET: {
            action: () => {
                if (!hasSelectedItems || !hasAgentRole) {
                    return
                }
                toggleTrashConfirmation()
            },
        },
        HIDE_POPOVER: {
            key: 'esc',
            action: () => {
                setOpenDropdown(null)
            },
        },
        MARK_TICKET_READ: {
            action: (event: Event) => {
                if (!isMarkAsReadActionAvailable) {
                    return
                }
                event.preventDefault()
                bulkUpdate('is_unread', false)
            },
        },
        MARK_TICKET_UNREAD: {
            action: (event: Event) => {
                if (!isMarkAsUnreadActionAvailable) {
                    return
                }
                event.preventDefault()
                bulkUpdate('is_unread', true)
            },
        },
    }

    useShortcuts(SHORTCUT_MANAGER_COMPONENT_NAME, actions)

    const toggleTrashConfirmation = (visible?: boolean | MouseEvent) => {
        const opens =
            visible !== undefined
                ? !!visible
                : openDropdown !== ActionDropdown.Trash
        setOpenDropdown(opens ? ActionDropdown.Trash : null)
        toggleDeleteConfirmation()
    }

    const toggleDeleteConfirmation = () => {
        setIsDeleteConfirmationOpen(!isDeleteConfirmationOpen)
    }

    return (
        <div className={css.wrapper}>
            <UncontrolledButtonDropdown>
                <ButtonGroup>
                    <Button
                        intent="secondary"
                        onClick={() => bulkUpdate('status', 'closed')}
                        isDisabled={isDisabled}
                        size="small"
                        className={css.button}
                    >
                        Close
                    </Button>
                    <DropdownToggle tag="span" disabled={isDisabled}>
                        <IconButton
                            intent="secondary"
                            size="small"
                            isDisabled={isDisabled}
                            icon="arrow_drop_down"
                            className={css.arrow}
                        />
                    </DropdownToggle>
                </ButtonGroup>
                <DropdownMenu right>
                    <DropdownItem header>SET STATUS</DropdownItem>
                    <DropdownItem
                        key="open"
                        type="button"
                        onClick={() => bulkUpdate('status', 'open')}
                    >
                        Open
                    </DropdownItem>
                </DropdownMenu>
            </UncontrolledButtonDropdown>
            <ButtonDropdown
                isOpen={openDropdown === ActionDropdown.Agents}
                toggle={toggleAgentsDropdown}
                a11y={false}
            >
                <ButtonGroup>
                    <Button
                        intent="secondary"
                        size="small"
                        onClick={() =>
                            bulkUpdate('assignee_user', {
                                id: currentUser.get('id'),
                                name: currentUser.get('name'),
                            })
                        }
                        isDisabled={isDisabled}
                        className={css.button}
                    >
                        Assign to me
                    </Button>
                    <DropdownToggle tag="span" disabled={isDisabled}>
                        <IconButton
                            intent="secondary"
                            size="small"
                            isDisabled={isDisabled}
                            icon="arrow_drop_down"
                            className={css.arrow}
                        />
                    </DropdownToggle>
                </ButtonGroup>
                <DropdownMenu right className={css['assignee-dropdown-list']}>
                    <DropdownItem header className="mb-2">
                        ASSIGN TO:
                    </DropdownItem>
                    <DropdownItem
                        className="dropdown-item-input"
                        toggle={false}
                    >
                        <TextInput
                            placeholder="Search agents..."
                            autoFocus
                            value={agentsSearchQuery}
                            onChange={setAgentsSearchQuery}
                        />
                    </DropdownItem>
                    <DropdownItem divider />
                    {filteredAgents.isEmpty() ? (
                        <DropdownItem header>
                            Could not find any agent
                        </DropdownItem>
                    ) : (
                        <div className={css['dropdown-list']}>
                            {filteredAgents.toArray().map((agent) => (
                                <DropdownItem
                                    key={agent!.get('id')}
                                    type="button"
                                    onClick={() => {
                                        bulkUpdate('assignee_user', {
                                            id: agent!.get('id'),
                                            name: agent!.get('name'),
                                        })
                                    }}
                                >
                                    <AgentLabel
                                        name={
                                            agent!.get('name') ||
                                            agent!.get('email')
                                        }
                                        profilePictureUrl={agent!.getIn([
                                            'meta',
                                            'profile_picture_url',
                                        ])}
                                        shouldDisplayAvatar
                                    />
                                </DropdownItem>
                            ))}
                        </div>
                    )}
                    <DropdownItem divider />
                    <DropdownItem
                        key="clear"
                        type="button"
                        onClick={() => bulkUpdate('assignee_user', null)}
                    >
                        <span
                            className={classnames(
                                'text-warning',
                                css['clear-assignee'],
                            )}
                        >
                            Clear assignee
                        </span>
                    </DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
            <ButtonDropdown
                isOpen={openDropdown === ActionDropdown.Teams}
                toggle={toggleTeamsDropdown}
                a11y={false}
            >
                <DropdownToggle tag="span" disabled={isDisabled}>
                    <Button
                        intent="secondary"
                        size="small"
                        isDisabled={isDisabled}
                        className="skip-default"
                        trailingIcon="arrow_drop_down"
                    >
                        Assign to team
                    </Button>
                </DropdownToggle>
                <DropdownMenu right className={css['assignee-dropdown-list']}>
                    <DropdownItem header className="mb-2">
                        ASSIGN TO:
                    </DropdownItem>
                    <DropdownItem
                        className="dropdown-item-input"
                        toggle={false}
                    >
                        <TextInput
                            placeholder="Search teams..."
                            autoFocus
                            value={teamsSearchQuery}
                            onChange={setTeamsSearchQuery}
                        />
                    </DropdownItem>
                    <DropdownItem divider />
                    {filteredTeams.isEmpty() ? (
                        <DropdownItem header>
                            Could not find any team
                        </DropdownItem>
                    ) : (
                        <div className={css['dropdown-list']}>
                            {filteredTeams.toArray().map((team) => (
                                <DropdownItem
                                    key={team!.get('id')}
                                    type="button"
                                    className={css['teams-dropdown-item']}
                                    onClick={() => {
                                        bulkUpdate(
                                            'assignee_team_id',
                                            team!.get('id'),
                                        )
                                    }}
                                >
                                    <TeamLabel
                                        name={team!.get('name')}
                                        emoji={team!.getIn([
                                            'decoration',
                                            'emoji',
                                        ])}
                                        shouldDisplayAvatar
                                    />
                                </DropdownItem>
                            ))}
                        </div>
                    )}
                    <DropdownItem divider />
                    <DropdownItem
                        key="clear"
                        type="button"
                        onClick={() => bulkUpdate('assignee_team_id', null)}
                    >
                        <span
                            className={classnames(
                                'text-warning',
                                css['clear-assignee'],
                            )}
                        >
                            Clear assignee
                        </span>
                    </DropdownItem>
                </DropdownMenu>
            </ButtonDropdown>
            <Button
                ref={tagDropdownButtonRef}
                intent="secondary"
                size="small"
                isDisabled={isDisabled}
                onClick={() => toggleDropdown(ActionDropdown.Tags)}
                trailingIcon="arrow_drop_down"
            >
                Add tag
            </Button>
            <Dropdown
                isOpen={openDropdown === ActionDropdown.Tags}
                onToggle={() => toggleDropdown(ActionDropdown.Tags)}
                target={tagDropdownButtonRef}
                placement="bottom-start"
            >
                <TagDropdownMenu onClick={(item) => addTag(item.name)} />
            </Dropdown>
            <Button
                ref={moreDropdownButtonRef}
                intent="secondary"
                size="small"
                isDisabled={isDisabled}
                onClick={() => toggleDropdown(ActionDropdown.More)}
                trailingIcon="arrow_drop_down"
            >
                More
            </Button>
            <Dropdown
                isOpen={openDropdown === ActionDropdown.More}
                onToggle={() => toggleDropdown(ActionDropdown.More)}
                target={moreDropdownButtonRef}
                placement="bottom-end"
                className={css.dropdown}
            >
                <DropdownItemInternal
                    option={{ label: 'Apply macro', value: 'apply-macro' }}
                    onClick={openMacroModal}
                >
                    Apply macro
                </DropdownItemInternal>
                {isMarkAsReadActionAvailable && (
                    <DropdownItemInternal
                        option={{
                            label: 'Mark as read',
                            value: 'mark-as-read',
                        }}
                        onClick={() => bulkUpdate('is_unread', false)}
                    >
                        Mark as read
                    </DropdownItemInternal>
                )}
                {isMarkAsUnreadActionAvailable && (
                    <DropdownItemInternal
                        option={{
                            label: 'Mark as unread',
                            value: 'mark-as-unread',
                        }}
                        onClick={() => bulkUpdate('is_unread', true)}
                    >
                        Mark as unread
                    </DropdownItemInternal>
                )}
                <DropdownItemInternal
                    option={{
                        label: 'Change priority',
                        value: 'change-priority',
                    }}
                    onClick={() => toggleDropdown(ActionDropdown.Priority)}
                >
                    Change priority
                </DropdownItemInternal>
                {hasAgentRole && (
                    <>
                        <DropdownItemInternal
                            option={{
                                label: 'Export tickets',
                                value: 'export-tickets',
                            }}
                            onClick={bulkExport}
                        >
                            Export tickets
                        </DropdownItemInternal>
                        <div className={css.divider} />
                        {isActiveViewTrashView ? (
                            <>
                                <DropdownItemInternal
                                    option={{
                                        label: 'Undelete',
                                        value: 'undelete',
                                    }}
                                    onClick={bulkUnTrash}
                                    shouldCloseOnSelect
                                >
                                    Undelete
                                </DropdownItemInternal>
                                <DropdownItemInternal
                                    option={{
                                        label: 'Delete forever',
                                        value: 'delete-forever',
                                    }}
                                    className="text-danger"
                                    onClick={toggleDeleteConfirmation}
                                    shouldCloseOnSelect
                                >
                                    Delete forever
                                </DropdownItemInternal>
                            </>
                        ) : (
                            <DropdownItemInternal
                                className="text-danger"
                                option={{ label: 'Delete', value: 'delete' }}
                                onClick={() => toggleTrashConfirmation(true)}
                            >
                                Delete
                            </DropdownItemInternal>
                        )}
                    </>
                )}
            </Dropdown>
            <Dropdown
                isOpen={openDropdown === ActionDropdown.Priority}
                onToggle={() => toggleDropdown(ActionDropdown.Priority)}
                target={moreDropdownButtonRef}
                placement="bottom-end"
            >
                <DropdownHeader
                    prefix={<i className="material-icons">arrow_back</i>}
                    onClick={() => toggleDropdown(ActionDropdown.More)}
                >
                    Back
                </DropdownHeader>
                <PriorityDropdownMenu
                    onClick={(item) => bulkUpdate('priority', item!.name!)}
                />
            </Dropdown>
            <Popover
                placement="bottom"
                className={css.popover}
                isOpen={isDeleteConfirmationOpen}
                target={moreDropdownButtonRef}
                setIsOpen={toggleDeleteConfirmation}
                buttonProps={{
                    size: 'small',
                    intent: 'primary',
                    onClick: isActiveViewTrashView ? bulkDelete : bulkTrash,
                    className: css.popoverFooter,
                }}
            >
                <div className={css.popoverHeader}>Are you sure?</div>
                <div className={css.popoverBody}>
                    Are you sure you want to delete {selectedCount} ticket
                    {selectedCount && selectedCount > 1 && 's'}
                    {isActiveViewTrashView && ' forever'}?
                </div>
            </Popover>
        </div>
    )
}
