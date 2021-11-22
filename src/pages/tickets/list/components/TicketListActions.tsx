import React, {
    ReactElement,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {fromJS, List, Map} from 'immutable'
import moment from 'moment'
import {bindActionCreators} from 'redux'
import {
    Button,
    ButtonDropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Input,
    Popover,
    PopoverBody,
    PopoverHeader,
    UncontrolledButtonDropdown,
} from 'reactstrap'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'

import shortcutManager from '../../../../services/shortcutManager'
import * as viewsActions from '../../../../state/views/actions'
import * as ticketsActions from '../../../../state/tickets/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import {getAgents} from '../../../../state/agents/selectors'
import {getTeams} from '../../../../state/teams/selectors'
import {RootState} from '../../../../state/types'
import {AGENT_ROLE} from '../../../../config/user'
import {AgentLabel, TeamLabel} from '../../../common/utils/labels'
import {hasRole} from '../../../../utils'
import TagDropdownMenu from '../../../common/components/TagDropdownMenu/TagDropdownMenu'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../../common/utils/withCancellableRequest'
import history from '../../../history'
import {JobType} from '../../../../models/job/types'
import {getTickets} from '../../../../state/tickets/selectors'
import {UserRole} from '../../../../config/types/user'

import css from './TicketListActions.less'

const SHORTCUT_MANAGER_COMPONENT_NAME = 'TicketListActions'

type OwnProps = {
    view: Map<any, any>
    selectedItemsIds: List<number>
    openMacroModal: () => void
    searchTagsDebounceDelay?: number
}

type Props = OwnProps &
    ConnectedProps<typeof connector> &
    CancellableRequestInjectedProps<
        'fieldEnumSearchCancellable',
        'cancelFieldEnumSearchCancellable',
        typeof viewsActions.fieldEnumSearch
    >

enum ActionDropdown {
    Teams = 'teams',
    Agents = 'agents',
    Tags = 'tags',
    Trash = 'trash',
}

// TODO(agent-null-names): remove fallbacks in this component when https://github.com/gorgias/gorgias/issues/4413 is fixed
export const TicketListActionsContainer = ({
    selectedItemsIds,
    allViewItemsSelected,
    actions,
    activeView,
    fieldEnumSearchCancellable,
    openMacroModal,
    teams,
    agents,
    getViewCount,
    areFiltersValid,
    currentUser,
    isActiveViewTrashView,
    searchTagsDebounceDelay = 1000,
    tickets,
}: Props) => {
    const [openDropdown, setOpenDropdown] = useState<ActionDropdown | null>(
        null
    )
    const [teamsSearchQuery, setTeamsSearchQuery] = useState('')
    const [agentsSearchQuery, setAgentsSearchQuery] = useState('')
    const [tagsSearchQuery, setTagsSearchQuery] = useState('')
    const [tags, setTags] = useState(fromJS([]) as List<Map<any, any>>)
    const [isLoadingTags, setIsLoadingTags] = useState(false)
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
        useState(false)
    const [isLaunchingJob, setIsLaunchingJob] = useState(false)

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
        return agents.filter((agent) => {
            const agentLabel =
                (agent!.get('name') as string) ||
                (agent!.get('email') as string)
            return agentLabel
                .toLowerCase()
                .includes(agentsSearchQuery.toLowerCase())
        }) as List<Map<any, any>>
    }, [agents, agentsSearchQuery])

    const selectedCount = useMemo(() => {
        return allViewItemsSelected
            ? getViewCount(activeView.get('id'))
            : selectedItemsIds.size
    }, [allViewItemsSelected, getViewCount, selectedItemsIds.size])

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

    const toggleTagsDropdown = () => {
        const isOpen = toggleDropdown(ActionDropdown.Tags)
        if (isOpen) {
            const search = ''
            queryTags(search)
            setTagsSearchQuery(search)
        }
    }

    const addTag = (name: string) => {
        if (!name) {
            return
        }

        bulkUpdate('tags', [name])
        setTagsSearchQuery('')
    }

    const searchTags = (search: string) => {
        setTagsSearchQuery(search)
        queryTagsOnSearch(search)
    }

    const queryTags = (search: string) => {
        setIsLoadingTags(true)

        const field = fromJS({
            filter: {type: 'tag'},
        })

        void fieldEnumSearchCancellable(field, search).then((data) => {
            if (!data) {
                return
            }
            setTags(data)
            setIsLoadingTags(false)
        })
    }

    const queryTagsOnSearch = useCallback(
        _debounce(queryTags, searchTagsDebounceDelay),
        []
    )

    const createJob = async (
        jobType: JobType,
        jobParams: Record<string, unknown>
    ) => {
        setIsLaunchingJob(true)
        const actionsToUse = allViewItemsSelected
            ? actions.views
            : actions.tickets
        const actionsArgs = allViewItemsSelected ? activeView : selectedItemsIds

        try {
            // eslint-disable-next-line @typescript-eslint/await-thenable
            await actionsToUse.createJob(actionsArgs as any, jobType, jobParams)
            actions.views.updateSelectedItemsIds(fromJS([]))
        } catch {
            // Don't raise an exception in the console
        } finally {
            setIsLaunchingJob(false)
        }
    }

    const bulkUpdate = (key: string, value: any) => {
        if (!hasSelectedItems) {
            return
        }
        void createJob(JobType.UpdateTicket, {updates: {[key]: value}})
    }

    const bulkExport = () => {
        void createJob(JobType.ExportTicket, {})
    }

    const bulkTrash = () => {
        toggleTrashConfirmation(false)
        void createJob(JobType.UpdateTicket, {
            updates: {trashed_datetime: moment.utc()},
        })
    }

    const bulkUnTrash = () => {
        void createJob(JobType.UpdateTicket, {
            updates: {trashed_datetime: null},
        })
    }

    const bulkDelete = () => {
        setIsDeleteConfirmationOpen(false)
        void createJob(JobType.DeleteTicket, {})
    }

    useEffect(() => {
        shortcutManager.bind(SHORTCUT_MANAGER_COMPONENT_NAME, {
            CREATE_TICKET: {
                action: (e) => {
                    e.preventDefault()
                    history.push('/app/ticket/new')
                },
            },
            OPEN_TICKET: {
                action: () => bulkUpdate('status', 'open'),
            },
            CLOSE_TICKET: {
                action: () => bulkUpdate('status', 'closed'),
            },
            OPEN_ASSIGNEE: {
                action: (e) => {
                    if (!hasSelectedItems) {
                        return
                    }
                    e.preventDefault()
                    toggleAgentsDropdown()
                },
            },
            OPEN_TAGS: {
                action: (e) => {
                    if (!hasSelectedItems) {
                        return
                    }
                    e.preventDefault()
                    toggleTagsDropdown()
                },
            },
            OPEN_MACRO: {
                action: (e) => {
                    if (!hasSelectedItems) {
                        return
                    }
                    e.preventDefault()
                    openMacroModal()
                },
            },
            DELETE_TICKET: {
                action: () => {
                    if (
                        !hasSelectedItems ||
                        !hasRole(currentUser, UserRole.Agent)
                    ) {
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
                action: (event) => {
                    if (!isMarkAsReadActionAvailable) {
                        return
                    }
                    event.preventDefault()
                    bulkUpdate('is_unread', false)
                },
            },
            MARK_TICKET_UNREAD: {
                action: (event) => {
                    if (!isMarkAsUnreadActionAvailable) {
                        return
                    }
                    event.preventDefault()
                    bulkUpdate('is_unread', true)
                },
            },
        })
        return () => {
            shortcutManager.unbind(SHORTCUT_MANAGER_COMPONENT_NAME)
        }
    })

    const renderTagsMenu = () => {
        if (isLoadingTags) {
            return (
                <DropdownItem disabled>
                    <i className="material-icons md-spin mr-2">refresh</i>
                    Loading...
                </DropdownItem>
            )
        }

        let options = tags.map((tag) => {
            const name = tag!.get('name')
            return (
                <DropdownItem
                    key={name}
                    type="button"
                    onClick={() => bulkUpdate('tags', [tag!.get('name')])}
                >
                    {name}
                </DropdownItem>
            )
        }) as List<ReactElement>

        const isInEnum = !!tags.find(
            (tag) => tag!.get('name') === tagsSearchQuery
        )

        if (!isInEnum && tagsSearchQuery) {
            if (!tags.isEmpty()) {
                options = options.push(<DropdownItem key="divider" divider />)
            }

            options = options.push(
                <DropdownItem
                    key="create"
                    type="button"
                    onClick={() => addTag(tagsSearchQuery)}
                >
                    <b>Create</b> {tagsSearchQuery}
                </DropdownItem>
            )
        }

        return options
    }

    const toggleTrashConfirmation = (visible?: any) => {
        const opens = !_isUndefined(visible)
            ? visible
            : openDropdown !== ActionDropdown.Trash
        setOpenDropdown(opens ? ActionDropdown.Trash : null)
        toggleDeleteConfirmation()
    }

    const toggleDeleteConfirmation = () => {
        setIsDeleteConfirmationOpen(!isDeleteConfirmationOpen)
    }

    return (
        <div className="d-none d-md-inline-flex align-items-center">
            <div className="d-inline-flex align-items-center">
                <UncontrolledButtonDropdown className="mr-2" size="sm">
                    <Button
                        type="button"
                        color="secondary"
                        onClick={() => bulkUpdate('status', 'closed')}
                        disabled={isDisabled}
                    >
                        Close
                    </Button>
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={isDisabled}
                    />
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
                    className="mr-2"
                    size="sm"
                    isOpen={openDropdown === ActionDropdown.Agents}
                    toggle={toggleAgentsDropdown}
                    a11y={false}
                >
                    <Button
                        type="button"
                        color="secondary"
                        onClick={() =>
                            bulkUpdate('assignee_user', {
                                id: currentUser.get('id'),
                                name: currentUser.get('name'),
                            })
                        }
                        disabled={isDisabled}
                    >
                        Assign to me
                    </Button>
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={isDisabled}
                    />
                    <DropdownMenu
                        right
                        className={css['assignee-dropdown-list']}
                    >
                        <DropdownItem header className="mb-2">
                            ASSIGN TO:
                        </DropdownItem>
                        <DropdownItem
                            className="dropdown-item-input"
                            toggle={false}
                        >
                            {openDropdown === ActionDropdown.Agents && ( // rebuild input on each opening so "autoFocus" works
                                <Input
                                    placeholder="Search agents..."
                                    autoFocus
                                    value={agentsSearchQuery}
                                    onChange={(event) =>
                                        setAgentsSearchQuery(event.target.value)
                                    }
                                />
                            )}
                        </DropdownItem>
                        <DropdownItem divider />
                        {filteredAgents.isEmpty() ? (
                            <DropdownItem header>
                                Could not find any agent
                            </DropdownItem>
                        ) : (
                            <div className={css['agents-dropdown-list']}>
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
                    className="mr-2"
                    isOpen={openDropdown === ActionDropdown.Teams}
                    toggle={toggleTeamsDropdown}
                    size="sm"
                    a11y={false}
                >
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={isDisabled}
                    >
                        Assign to team
                    </DropdownToggle>
                    <DropdownMenu
                        right
                        className={css['assignee-dropdown-list']}
                    >
                        <DropdownItem header className="mb-2">
                            ASSIGN TO:
                        </DropdownItem>
                        <DropdownItem
                            className="dropdown-item-input"
                            toggle={false}
                        >
                            {openDropdown === ActionDropdown.Teams && ( // rebuild input on each opening so "autoFocus" works
                                <Input
                                    placeholder="Search teams..."
                                    autoFocus
                                    value={teamsSearchQuery}
                                    onChange={(event) =>
                                        setTeamsSearchQuery(event.target.value)
                                    }
                                />
                            )}
                        </DropdownItem>
                        <DropdownItem divider />
                        {filteredTeams.isEmpty() ? (
                            <DropdownItem header>
                                Could not find any team
                            </DropdownItem>
                        ) : (
                            <div className={css['teams-dropdown-list']}>
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
                <ButtonDropdown
                    className="mr-2"
                    isOpen={openDropdown === ActionDropdown.Tags}
                    toggle={toggleTagsDropdown}
                    size="sm"
                    a11y={false}
                >
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={isDisabled}
                    >
                        Add tag
                    </DropdownToggle>
                    <TagDropdownMenu right disabled={isDisabled}>
                        <DropdownItem header className="mb-2">
                            ADD TAG:
                        </DropdownItem>
                        <DropdownItem
                            className="dropdown-item-input"
                            toggle={false}
                        >
                            {openDropdown === ActionDropdown.Tags && ( // rebuild input on each opening so "autoFocus" works
                                <Input
                                    placeholder="Search tags..."
                                    autoFocus
                                    value={tagsSearchQuery}
                                    onChange={(event) =>
                                        searchTags(event.target.value)
                                    }
                                />
                            )}
                        </DropdownItem>
                        <DropdownItem divider />
                        {renderTagsMenu()}
                    </TagDropdownMenu>
                </ButtonDropdown>
                <UncontrolledButtonDropdown size="sm">
                    <DropdownToggle
                        color="secondary"
                        type="button"
                        caret
                        disabled={isDisabled}
                    >
                        More
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
                        {hasRole(currentUser, AGENT_ROLE) && (
                            <DropdownItem type="button" onClick={bulkExport}>
                                Export tickets
                            </DropdownItem>
                        )}
                        {hasRole(currentUser, UserRole.Agent) && (
                            <>
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
                    isOpen={isDeleteConfirmationOpen}
                    target="bulk-more-button"
                    toggle={toggleDeleteConfirmation}
                    trigger="legacy"
                >
                    <PopoverHeader>Are you sure?</PopoverHeader>
                    <PopoverBody>
                        <p>
                            Are you sure you want to delete {selectedCount}{' '}
                            ticket{selectedCount > 1 && 's'}
                            {isActiveViewTrashView && ' forever'}?
                        </p>
                        <Button
                            type="submit"
                            color="success"
                            onClick={
                                isActiveViewTrashView ? bulkDelete : bulkTrash
                            }
                            autoFocus
                        >
                            Confirm
                        </Button>
                    </PopoverBody>
                </Popover>
            </div>
        </div>
    )
}

const connector = connect(
    (state: RootState) => {
        return {
            currentUser: state.currentUser,
            teams: getTeams(state),
            agents: getAgents(state) as List<Map<any, any>>,
            isActiveViewTrashView: viewsSelectors.isActiveViewTrashView(state),
            allViewItemsSelected:
                viewsSelectors.areAllActiveViewItemsSelected(state),
            areFiltersValid: viewsSelectors.areFiltersValid(state),
            activeView: viewsSelectors.getActiveView(state),
            getViewCount: viewsSelectors.makeGetViewCount(state),
            tickets: getTickets(state),
        }
    },
    (dispatch) => {
        return {
            actions: {
                views: bindActionCreators(viewsActions, dispatch),
                tickets: bindActionCreators(ticketsActions, dispatch),
            },
        }
    }
)

export default withCancellableRequest(
    'fieldEnumSearchCancellable',
    viewsActions.fieldEnumSearch
)(connector(TicketListActionsContainer))
