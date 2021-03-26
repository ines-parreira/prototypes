import React, {Component, ReactElement} from 'react'
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
import * as ticketsActions from '../../../../state/tickets/actions.js'
import * as viewsSelectors from '../../../../state/views/selectors'
import {getAgents} from '../../../../state/agents/selectors'
import {getTeams} from '../../../../state/teams/selectors'
import {RootState} from '../../../../state/types'
import {AGENT_ROLE} from '../../../../config/user'
import {AgentLabel, TeamLabel} from '../../../common/utils/labels.js'
import {hasRole} from '../../../../utils'
import TagDropdownMenu from '../../../common/components/TagDropdownMenu/TagDropdownMenu'
import withCancellableRequest, {
    CancellableRequestInjectedProps,
} from '../../../common/utils/withCancellableRequest'
import history from '../../../history'
import {JobType} from '../../../../models/job/types'

import css from './TicketListActions.less'

type OwnProps = {
    view: Map<any, any>
    selectedItemsIds: List<number>
    openMacroModal: () => void
}

type Props = OwnProps &
    ConnectedProps<typeof connector> &
    CancellableRequestInjectedProps<
        'fieldEnumSearchCancellable',
        'cancelFieldEnumSearchCancellable',
        typeof viewsActions.fieldEnumSearch
    >

type State = {
    popoverOpen: string
    teamsSearch: string
    agentsSearch: string
    tagsSearch: string
    tags: List<Map<any, any>>
    isLoadingTags: boolean
    askTrashConfirmation: boolean
    askDeleteConfirmation: boolean
    isLaunchingJob: boolean
}

// TODO(agent-null-names): remove fallbacks in this component when https://github.com/gorgias/gorgias/issues/4413 is fixed
export class TicketListActionsContainer extends Component<Props, State> {
    state = {
        popoverOpen: '',
        teamsSearch: '',
        agentsSearch: '',
        tagsSearch: '',
        tags: fromJS([]) as List<Map<any, any>>,
        isLoadingTags: false,
        askTrashConfirmation: false,
        askDeleteConfirmation: false,
        isLaunchingJob: false,
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketListActions')
    }

    _bindKeys = () => {
        shortcutManager.bind('TicketListActions', {
            CREATE_TICKET: {
                action: (e) => {
                    e.preventDefault()
                    history.push('/app/ticket/new')
                },
            },
            OPEN_TICKET: {
                action: () => this._bulkUpdate('status', 'open'),
            },
            CLOSE_TICKET: {
                action: () => this._bulkUpdate('status', 'closed'),
            },
            OPEN_ASSIGNEE: {
                action: (e) => {
                    if (!this._hasChecked()) {
                        return
                    }
                    e.preventDefault()
                    this._toggleAgentsDropdown()
                },
            },
            OPEN_TAGS: {
                action: (e) => {
                    if (!this._hasChecked()) {
                        return
                    }
                    e.preventDefault()
                    this._toggleTagsDropdown()
                },
            },
            OPEN_MACRO: {
                action: (e) => {
                    if (!this._hasChecked()) {
                        return
                    }
                    e.preventDefault()
                    this.props.openMacroModal()
                },
            },
            DELETE_TICKET: {
                action: () => {
                    if (!this._hasChecked()) {
                        return
                    }
                    this._toggleTrashConfirmation()
                },
            },
            HIDE_POPOVER: {
                key: 'esc',
                action: () => {
                    this._togglePopover()
                },
            },
        })
    }

    _hasChecked = () => {
        return !this.props.selectedItemsIds.isEmpty()
    }

    _isPopoverOpen = (popoverOpen: string) => {
        return this.state.popoverOpen === popoverOpen
    }

    _togglePopover = (popoverOpen = '') => {
        return this.setState({popoverOpen})
    }

    _toggleTeamsDropdown = () => {
        const opens = !this._isPopoverOpen('teams')
        this._togglePopover(opens ? 'teams' : '')

        if (opens) {
            this.setState({teamsSearch: ''})
        }
    }

    _toggleAgentsDropdown = () => {
        const opens = !this._isPopoverOpen('agents')
        this._togglePopover(opens ? 'agents' : '')

        if (opens) {
            this.setState({agentsSearch: ''})
        }
    }

    _toggleTagsDropdown = () => {
        const opens = !this._isPopoverOpen('tags')
        this._togglePopover(opens ? 'tags' : '')

        if (opens) {
            const search = ''
            this._queryTags(search)
            this.setState({tagsSearch: search})
        }
    }

    _addTag = (name: string) => {
        if (!name) {
            return
        }

        this._bulkUpdate('tags', [name])
        this.setState({tagsSearch: ''})
    }

    _searchTags = (search: string) => {
        this.setState({tagsSearch: search})
        this._queryTagsOnSearch(search)
    }

    _queryTags = (search: string) => {
        const {fieldEnumSearchCancellable} = this.props
        this.setState({isLoadingTags: true})

        const field = fromJS({
            filter: {type: 'tag'},
        })

        void fieldEnumSearchCancellable(field, search).then((data) => {
            if (!data) {
                return
            }
            this.setState({
                tags: data,
                isLoadingTags: false,
            })
        })
    }

    _queryTagsOnSearch = _debounce(this._queryTags, 300)

    _createJob = async (
        jobType: string,
        jobParams: Record<string, unknown>
    ) => {
        this.setState({isLaunchingJob: true})
        const actionsToUse = this.props.allViewItemsSelected
            ? this.props.actions.views
            : this.props.actions.tickets
        const actionsArgs = this.props.allViewItemsSelected
            ? this.props.activeView
            : this.props.selectedItemsIds

        try {
            await actionsToUse.createJob(actionsArgs, jobType, jobParams)
            this.props.actions.views.updateSelectedItemsIds(fromJS([]))
        } catch {
            // Don't raise an exception in the console
        } finally {
            this.setState({isLaunchingJob: false})
        }
    }

    _bulkUpdate = (key: string, value: any) => {
        if (!this._hasChecked()) {
            return
        }
        void this._createJob(JobType.UpdateTicket, {updates: {[key]: value}})
    }

    _bulkExport = () => {
        void this._createJob(JobType.ExportTicket, {})
    }

    _bulkTrash = () => {
        this._toggleTrashConfirmation(false)
        void this._createJob(JobType.UpdateTicket, {
            updates: {trashed_datetime: moment.utc()},
        })
    }

    _bulkUnTrash = () => {
        void this._createJob(JobType.UpdateTicket, {
            updates: {trashed_datetime: null},
        })
    }

    _bulkDelete = () => {
        this.setState({askDeleteConfirmation: false})
        void this._createJob(JobType.DeleteTicket, {})
    }

    _renderTagsMenu = () => {
        const {tagsSearch} = this.state

        if (this.state.isLoadingTags) {
            return (
                <DropdownItem disabled>
                    <i className="material-icons md-spin mr-2">refresh</i>
                    Loading...
                </DropdownItem>
            )
        }

        let options = this.state.tags.map((tag) => {
            const name = tag!.get('name')
            return (
                <DropdownItem
                    key={name}
                    type="button"
                    onClick={() => this._bulkUpdate('tags', [tag!.get('name')])}
                >
                    {name}
                </DropdownItem>
            )
        }) as List<ReactElement>

        const isInEnum = !!this.state.tags.find(
            (tag) => tag!.get('name') === tagsSearch
        )

        if (!isInEnum && tagsSearch) {
            if (!this.state.tags.isEmpty()) {
                options = options.push(<DropdownItem key="divider" divider />)
            }

            options = options.push(
                <DropdownItem
                    key="create"
                    type="button"
                    onClick={() => this._addTag(tagsSearch)}
                >
                    <b>Create</b> {tagsSearch}
                </DropdownItem>
            )
        }

        return options
    }

    _toggleTrashConfirmation = (visible?: any) => {
        const opens = !_isUndefined(visible)
            ? visible
            : !this._isPopoverOpen('trash')
        this._togglePopover(opens ? 'trash' : '')
        this._toggleDeleteConfirmation()
    }

    _toggleDeleteConfirmation = () => {
        this.setState({
            askDeleteConfirmation: !this.state.askDeleteConfirmation,
        })
    }

    _renderBulkActions = () => {
        const {
            currentUser,
            isActiveViewTrashView,
            selectedItemsIds,
            teams,
            agents,
            openMacroModal,
            allViewItemsSelected,
            activeView,
            getViewCount,
            areFiltersValid,
        } = this.props

        const {
            teamsSearch,
            agentsSearch,
            tagsSearch,
            askDeleteConfirmation,
            isLaunchingJob,
        } = this.state

        const areItemsSelected = !selectedItemsIds.isEmpty()

        const filteredTeams = teams.filter((team) =>
            (team!.get('name') as string)
                .toLowerCase()
                .includes(teamsSearch.toLowerCase())
        ) as List<Map<any, any>>

        const filteredAgents = agents.filter((agent) => {
            const agentLabel =
                (agent!.get('name') as string) ||
                (agent!.get('email') as string)
            return agentLabel.toLowerCase().includes(agentsSearch.toLowerCase())
        }) as List<Map<any, any>>

        const selectedCount = allViewItemsSelected
            ? getViewCount(activeView.get('id'))
            : selectedItemsIds.size

        return (
            <div className="d-inline-flex align-items-center">
                <UncontrolledButtonDropdown className="mr-2" size="sm">
                    <Button
                        type="button"
                        color="secondary"
                        onClick={() => this._bulkUpdate('status', 'closed')}
                        disabled={
                            !areItemsSelected ||
                            isLaunchingJob ||
                            !areFiltersValid
                        }
                    >
                        Close
                    </Button>
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={
                            !areItemsSelected ||
                            isLaunchingJob ||
                            !areFiltersValid
                        }
                    />
                    <DropdownMenu right>
                        <DropdownItem header>SET STATUS</DropdownItem>
                        <DropdownItem
                            key="open"
                            type="button"
                            onClick={() => this._bulkUpdate('status', 'open')}
                        >
                            Open
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <ButtonDropdown
                    className="mr-2"
                    size="sm"
                    isOpen={this._isPopoverOpen('agents')}
                    toggle={this._toggleAgentsDropdown}
                    a11y={false}
                >
                    <Button
                        type="button"
                        color="secondary"
                        onClick={() =>
                            this._bulkUpdate('assignee_user', {
                                id: currentUser.get('id'),
                                name: currentUser.get('name'),
                            })
                        }
                        disabled={
                            !areItemsSelected ||
                            isLaunchingJob ||
                            !areFiltersValid
                        }
                    >
                        Assign to me
                    </Button>
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={
                            !areItemsSelected ||
                            isLaunchingJob ||
                            !areFiltersValid
                        }
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
                            {this._isPopoverOpen('agents') && ( // rebuild input on each opening so "autoFocus" works
                                <Input
                                    placeholder="Search agents..."
                                    autoFocus
                                    value={agentsSearch}
                                    onChange={(event) =>
                                        this.setState({
                                            agentsSearch: event.target.value,
                                        })
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
                                            this._bulkUpdate('assignee_user', {
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
                            onClick={() =>
                                this._bulkUpdate('assignee_user', null)
                            }
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
                    isOpen={this._isPopoverOpen('teams')}
                    toggle={this._toggleTeamsDropdown}
                    size="sm"
                    a11y={false}
                >
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={
                            !areItemsSelected ||
                            isLaunchingJob ||
                            !areFiltersValid
                        }
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
                            {this._isPopoverOpen('teams') && ( // rebuild input on each opening so "autoFocus" works
                                <Input
                                    placeholder="Search teams..."
                                    autoFocus
                                    value={teamsSearch}
                                    onChange={(event) =>
                                        this.setState({
                                            teamsSearch: event.target.value,
                                        })
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
                                            this._bulkUpdate(
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
                            onClick={() =>
                                this._bulkUpdate('assignee_team_id', null)
                            }
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
                    isOpen={this._isPopoverOpen('tags')}
                    toggle={this._toggleTagsDropdown}
                    size="sm"
                    a11y={false}
                >
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={
                            !areItemsSelected ||
                            isLaunchingJob ||
                            !areFiltersValid
                        }
                    >
                        Add tag
                    </DropdownToggle>
                    <TagDropdownMenu
                        right
                        disabled={
                            !areItemsSelected ||
                            isLaunchingJob ||
                            !areFiltersValid
                        }
                    >
                        <DropdownItem header className="mb-2">
                            ADD TAG:
                        </DropdownItem>
                        <DropdownItem
                            className="dropdown-item-input"
                            toggle={false}
                        >
                            {this._isPopoverOpen('tags') && ( // rebuild input on each opening so "autoFocus" works
                                <Input
                                    placeholder="Search tags..."
                                    autoFocus
                                    value={tagsSearch}
                                    onChange={(event) =>
                                        this._searchTags(event.target.value)
                                    }
                                />
                            )}
                        </DropdownItem>
                        <DropdownItem divider />
                        {this._renderTagsMenu()}
                    </TagDropdownMenu>
                </ButtonDropdown>
                <UncontrolledButtonDropdown size="sm">
                    <DropdownToggle
                        color="secondary"
                        type="button"
                        caret
                        disabled={
                            !areItemsSelected ||
                            isLaunchingJob ||
                            !areFiltersValid
                        }
                    >
                        More
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem type="button" onClick={openMacroModal}>
                            Apply macro
                        </DropdownItem>
                        {hasRole(currentUser, AGENT_ROLE) && (
                            <DropdownItem
                                type="button"
                                onClick={this._bulkExport}
                            >
                                Export tickets
                            </DropdownItem>
                        )}
                        <DropdownItem divider />
                        {isActiveViewTrashView ? (
                            [
                                <DropdownItem
                                    key="undelete-button"
                                    type="button"
                                    onClick={this._bulkUnTrash}
                                >
                                    Undelete
                                </DropdownItem>,
                                <DropdownItem
                                    key="delete-button"
                                    type="button"
                                    className="text-danger"
                                    onClick={this._toggleDeleteConfirmation}
                                >
                                    Delete forever
                                </DropdownItem>,
                            ]
                        ) : (
                            <DropdownItem
                                type="button"
                                className="text-danger"
                                onClick={this._toggleTrashConfirmation}
                            >
                                Delete
                            </DropdownItem>
                        )}
                    </DropdownMenu>
                    <div
                        className={css['delete-popover-target']}
                        id="bulk-more-button"
                    />
                </UncontrolledButtonDropdown>
                <Popover
                    placement="bottom"
                    isOpen={askDeleteConfirmation}
                    target="bulk-more-button"
                    toggle={this._toggleDeleteConfirmation}
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
                                isActiveViewTrashView
                                    ? this._bulkDelete
                                    : this._bulkTrash
                            }
                            autoFocus
                        >
                            Confirm
                        </Button>
                    </PopoverBody>
                </Popover>
            </div>
        )
    }

    render() {
        return (
            <div className="d-none d-md-inline-flex align-items-center">
                {this._renderBulkActions()}
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        return {
            currentUser: state.currentUser,
            teams: getTeams(state) as List<Map<any, any>>,
            agents: getAgents(state) as List<Map<any, any>>,
            isActiveViewTrashView: viewsSelectors.isActiveViewTrashView(state),
            allViewItemsSelected: viewsSelectors.areAllActiveViewItemsSelected(
                state
            ),
            areFiltersValid: viewsSelectors.areFiltersValid(state),
            activeView: viewsSelectors.getActiveView(state),
            getViewCount: viewsSelectors.makeGetViewCount(state),
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
