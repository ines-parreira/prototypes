import React, {MouseEvent, useMemo, useRef, useState} from 'react'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import moment from 'moment'
import {
    ButtonDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Popover,
    PopoverBody,
    PopoverHeader,
    UncontrolledButtonDropdown,
} from 'reactstrap'
import {JobType} from '@gorgias/api-queries'

import {useAppNode} from 'appNode'
import {SegmentEvent, logEvent} from 'common/segment'
import {UserRole} from 'config/types/user'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import useShortcuts from 'hooks/useShortcuts'

import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import IconButton from 'pages/common/components/button/IconButton'
import Group from 'pages/common/components/layout/Group'
import TextInput from 'pages/common/forms/input/TextInput'
import {AgentLabel, TeamLabel} from 'pages/common/utils/labels'

import {
    createJob as createJobView,
    updateSelectedItemsIds,
} from 'state/views/actions'
import {createJob as createJobTicket} from 'state/tickets/actions'
import {getTickets} from 'state/tickets/selectors'
import {
    areAllActiveViewItemsSelected,
    areFiltersValid as getAreFiltersValid,
    getActiveView,
    isActiveViewTrashView as getIsActiveViewTrashView,
    getViewCount,
} from 'state/views/selectors'
import {getHumanAgents} from 'state/agents/selectors'
import {getTeams} from 'state/teams/selectors'
import {TagDropdownMenu} from 'tags'
import {hasRole} from 'utils'

import css from 'pages/tickets/list/components/TicketListActions.less'
import Dropdown from 'pages/common/components/dropdown/Dropdown'

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
        null
    )
    const [teamsSearchQuery, setTeamsSearchQuery] = useState('')
    const [agentsSearchQuery, setAgentsSearchQuery] = useState('')
    const tagDropdownButtonRef = useRef(null)

    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
        useState(false)
    const [isLaunchingJob, setIsLaunchingJob] = useState(false)
    const appNode = useAppNode()
    const hasAgentRole = useMemo(
        () => hasRole(currentUser, UserRole.Agent),
        [currentUser]
    )

    const hasSelectedItems = !selectedItemsIds.isEmpty()
    const isDisabled = !hasSelectedItems || isLaunchingJob || !areFiltersValid

    const filteredTeams = useMemo(() => {
        return teams.filter((team) =>
            (team!.get('name') as string)
                .toLowerCase()
                .includes(teamsSearchQuery.toLowerCase())
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
        [allViewItemsSelected, viewCount, selectedItemsIds.size]
    )

    const selectedTickets = useMemo<List<Map<any, any>>>(() => {
        return selectedItemsIds
            .map((id) => {
                return tickets.find(
                    (ticket: Map<any, any>) => ticket.get('id') === id
                ) as Map<any, any> | undefined
            })
            .filter((ticket) => !!ticket) as List<Map<any, any>>
    }, [tickets, selectedItemsIds])

    const isMarkAsReadActionAvailable = useMemo<boolean>(() => {
        return (
            allViewItemsSelected ||
            !!selectedTickets.find(
                (ticket) => ticket!.get('is_unread') as boolean
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
        jobParams: Record<string, unknown>
    ) => {
        setIsLaunchingJob(true)
        try {
            if (allViewItemsSelected) {
                await dispatch(createJobView(activeView, jobType, jobParams))
            } else {
                await dispatch(
                    createJobTicket(selectedItemsIds, jobType, jobParams)
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
            | 'tags',
        value: any
    ) => {
        if (!hasSelectedItems) {
            return
        }
        logEvent(SegmentEvent.BulkAction, {
            type: key,
            location: 'full-width-mode',
            ...('is_unread' === key || 'status' === key ? {value} : {}),
        })
        void createJob(JobType.UpdateTicket, {updates: {[key]: value}})
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
            updates: {trashed_datetime: moment.utc()},
        })
    }

    const bulkUnTrash = () => {
        logEvent(SegmentEvent.BulkAction, {
            type: 'untrash',
            location: 'full-width-mode',
        })
        void createJob(JobType.UpdateTicket, {
            updates: {trashed_datetime: null},
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
                <Group>
                    <Button
                        intent="secondary"
                        onClick={() => bulkUpdate('status', 'closed')}
                        isDisabled={isDisabled}
                        size="small"
                    >
                        Close
                    </Button>
                    <DropdownToggle tag="span" disabled={isDisabled}>
                        <IconButton
                            intent="secondary"
                            size="small"
                            isDisabled={isDisabled}
                        >
                            arrow_drop_down
                        </IconButton>
                    </DropdownToggle>
                </Group>
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
                <Group>
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
                    >
                        Assign to me
                    </Button>
                    <DropdownToggle tag="span" disabled={isDisabled}>
                        <IconButton
                            intent="secondary"
                            size="small"
                            isDisabled={isDisabled}
                        >
                            arrow_drop_down
                        </IconButton>
                    </DropdownToggle>
                </Group>
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
                            {filteredAgents.map((agent) => (
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
                                css['clear-assignee']
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
                    >
                        <ButtonIconLabel
                            icon="arrow_drop_down"
                            position="right"
                        >
                            Assign to team
                        </ButtonIconLabel>
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
                            {filteredTeams.map((team) => (
                                <DropdownItem
                                    key={team!.get('id')}
                                    type="button"
                                    className={css['teams-dropdown-item']}
                                    onClick={() => {
                                        bulkUpdate(
                                            'assignee_team_id',
                                            team!.get('id')
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
                                css['clear-assignee']
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
            >
                <ButtonIconLabel icon="arrow_drop_down" position="right">
                    Add tag
                </ButtonIconLabel>
            </Button>
            <Dropdown
                isOpen={openDropdown === ActionDropdown.Tags}
                onToggle={() => toggleDropdown(ActionDropdown.Tags)}
                target={tagDropdownButtonRef}
                placement="bottom-start"
            >
                <TagDropdownMenu onClick={(item) => addTag(item.name)} />
            </Dropdown>
            <UncontrolledButtonDropdown>
                <DropdownToggle tag="span" disabled={isDisabled}>
                    <Button
                        intent="secondary"
                        size="small"
                        isDisabled={isDisabled}
                    >
                        <ButtonIconLabel
                            icon="arrow_drop_down"
                            position="right"
                        >
                            More
                        </ButtonIconLabel>
                    </Button>
                </DropdownToggle>
                <DropdownMenu right>
                    <DropdownItem type="button" onClick={openMacroModal}>
                        Apply macro
                    </DropdownItem>
                    {isMarkAsReadActionAvailable && (
                        <DropdownItem
                            type="button"
                            onClick={() => bulkUpdate('is_unread', false)}
                        >
                            Mark as read
                        </DropdownItem>
                    )}
                    {isMarkAsUnreadActionAvailable && (
                        <DropdownItem
                            type="button"
                            onClick={() => bulkUpdate('is_unread', true)}
                        >
                            Mark as unread
                        </DropdownItem>
                    )}
                    {hasAgentRole && (
                        <>
                            <DropdownItem type="button" onClick={bulkExport}>
                                Export tickets
                            </DropdownItem>
                            <DropdownItem divider />
                            {isActiveViewTrashView ? (
                                [
                                    <DropdownItem
                                        key="undelete-button"
                                        type="button"
                                        onClick={bulkUnTrash}
                                    >
                                        Undelete
                                    </DropdownItem>,
                                    <DropdownItem
                                        key="delete-button"
                                        type="button"
                                        className="text-danger"
                                        onClick={toggleDeleteConfirmation}
                                    >
                                        Delete forever
                                    </DropdownItem>,
                                ]
                            ) : (
                                <DropdownItem
                                    type="button"
                                    className="text-danger"
                                    onClick={toggleTrashConfirmation}
                                >
                                    Delete
                                </DropdownItem>
                            )}
                        </>
                    )}
                </DropdownMenu>
                <div
                    className={css['delete-popover-target']}
                    id="bulk-more-button"
                />
            </UncontrolledButtonDropdown>
            <Popover
                placement="bottom"
                className="popoverDark"
                isOpen={isDeleteConfirmationOpen}
                target="bulk-more-button"
                toggle={toggleDeleteConfirmation}
                trigger="legacy"
                container={appNode ?? undefined}
            >
                <PopoverHeader>Are you sure?</PopoverHeader>
                <PopoverBody>
                    <p>
                        Are you sure you want to delete {selectedCount} ticket
                        {selectedCount && selectedCount > 1 && 's'}
                        {isActiveViewTrashView && ' forever'}?
                    </p>
                    <Button
                        type="submit"
                        onClick={isActiveViewTrashView ? bulkDelete : bulkTrash}
                        autoFocus
                    >
                        Confirm
                    </Button>
                </PopoverBody>
            </Popover>
        </div>
    )
}
