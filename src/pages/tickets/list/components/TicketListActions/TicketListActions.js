// @flow
import React from 'react'
import {connect} from 'react-redux'
import classnames from 'classnames'
import {fromJS, List, type Map} from 'immutable'
import moment from 'moment'
import {bindActionCreators} from 'redux'
import {browserHistory} from 'react-router'
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

import shortcutManager from '../../../../../services/shortcutManager/index'

import * as viewsActions from '../../../../../state/views/actions'
import * as ticketsActions from '../../../../../state/tickets/actions'
import * as viewsSelectors from '../../../../../state/views/selectors'

import {getAgents} from '../../../../../state/agents/selectors'
import {getTeams} from '../../../../../state/teams/selectors'

import type {currentUserType} from '../../../../../state/types'
import type {teamsType} from '../../../../../state/teams/types'
import type {agentsType} from '../../../../../state/agents/types'
import type {viewType} from '../../../../../state/views/types'
import {AGENT_ROLE} from '../../../../../config/user'
import {
    DELETE_TICKET_JOB_TYPE,
    EXPORT_TICKET_JOB_TYPE,
    UPDATE_TICKET_JOB_TYPE,
} from '../../../../../constants/job'
import {AgentLabel, TeamLabel} from '../../../../common/utils/labels'
import {hasRole} from '../../../../../utils'
import TagDropdownMenu from '../../../../common/components/TagDropdownMenu/TagDropdownMenu'

import css from './TicketListActions.less'

type Props = {
    view: viewType,
    actions: {
        views: typeof viewsActions,
        tickets: typeof ticketsActions,
    },
    selectedItemsIds: List<Map<*, *>>,
    fieldEnumSearch: typeof viewsActions.fieldEnumSearch,
    currentUser: currentUserType,
    teams: teamsType,
    agents: agentsType,
    areFiltersValid: boolean,
    isActiveViewTrashView: boolean,
    openMacroModal: () => void,
    activeView: viewType,
    allViewItemsSelected: boolean,
    getViewCount: (id: number) => number,
}

type State = {
    popoverOpen: string,
    teamsSearch: string,
    agentsSearch: string,
    tagsSearch: string,
    tags: List<Map<*, *>>,
    isLoadingTags: boolean,
    askTrashConfirmation: boolean,
    askDeleteConfirmation: boolean,
    isLaunchingJob: boolean,
}

// TODO(agent-null-names): remove fallbacks in this component when https://github.com/gorgias/gorgias/issues/4413 is fixed
class TicketListActions extends React.Component<Props, State> {
    state = {
        popoverOpen: '',
        teamsSearch: '',
        agentsSearch: '',
        tagsSearch: '',
        tags: fromJS([]),
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
                    browserHistory.push('/app/ticket/new')
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

    _addTag = (name) => {
        if (!name) {
            return
        }

        this._bulkUpdate('tags', [name])
        this.setState({tagsSearch: ''})
    }

    _searchTags = (search) => {
        this.setState({tagsSearch: search})
        this._queryTagsOnSearch(search)
    }

    _queryTags = (search) => {
        this.setState({isLoadingTags: true})

        const field = fromJS({
            filter: {type: 'tag'},
        })

        this.props.fieldEnumSearch(field, search).then((data) => {
            this.setState({
                tags: data,
                isLoadingTags: false,
            })
        })
    }

    _queryTagsOnSearch = _debounce(this._queryTags, 300)

    _createJob = async (jobType: string, jobParams: Object) => {
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

    _bulkUpdate = (key, value) => {
        if (!this._hasChecked()) {
            return
        }
        this._createJob(UPDATE_TICKET_JOB_TYPE, {updates: {[key]: value}})
    }

    _bulkExport = () => {
        this._createJob(EXPORT_TICKET_JOB_TYPE, {})
    }

    _bulkTrash = () => {
        this._toggleTrashConfirmation(false)
        this._createJob(UPDATE_TICKET_JOB_TYPE, {
            updates: {trashed_datetime: moment.utc()},
        })
    }

    _bulkUnTrash = () => {
        this._createJob(UPDATE_TICKET_JOB_TYPE, {
            updates: {trashed_datetime: null},
        })
    }

    _bulkDelete = () => {
        this.setState({askDeleteConfirmation: false})
        this._createJob(DELETE_TICKET_JOB_TYPE, {})
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
            const name = tag.get('name')
            return (
                <DropdownItem
                    key={name}
                    type="button"
                    onClick={() => this._bulkUpdate('tags', [tag.get('name')])}
                >
                    {name}
                </DropdownItem>
            )
        })

        const isInEnum = !!this.state.tags.find(
            (tag) => tag.get('name') === tagsSearch
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

    _toggleTrashConfirmation = (visible) => {
        const opens = !_isUndefined(visible)
            ? visible
            : !this._isPopoverOpen('trash')
        this._togglePopover(opens ? 'trash' : '')
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
            team.get('name').toLowerCase().includes(teamsSearch.toLowerCase())
        )

        const filteredAgents = agents.filter((agent) => {
            const agentLabel = agent.get('name') || agent.get('email')
            return agentLabel.toLowerCase().includes(agentsSearch.toLowerCase())
        })

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
                                        key={agent.get('id')}
                                        type="button"
                                        onClick={() => {
                                            this._bulkUpdate('assignee_user', {
                                                id: agent.get('id'),
                                                name: agent.get('name'),
                                            })
                                        }}
                                    >
                                        <AgentLabel
                                            name={
                                                agent.get('name') ||
                                                agent.get('email')
                                            }
                                            profilePictureUrl={agent.getIn([
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
                                        key={team.get('id')}
                                        type="button"
                                        className={css['teams-dropdown-item']}
                                        onClick={() => {
                                            this._bulkUpdate(
                                                'assignee_team_id',
                                                team.get('id')
                                            )
                                        }}
                                    >
                                        <TeamLabel
                                            name={team.get('name')}
                                            emoji={team.getIn([
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
                        id="bulk-more-button"
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
                </UncontrolledButtonDropdown>
                <Popover
                    placement="bottom"
                    isOpen={this._isPopoverOpen('trash')}
                    target="bulk-more-button"
                    toggle={this._toggleTrashConfirmation}
                >
                    <PopoverHeader>Are you sure?</PopoverHeader>
                    <PopoverBody>
                        <p>
                            Are you sure you want to delete {selectedCount}{' '}
                            ticket{selectedCount > 1 && 's'}?
                        </p>
                        <Button
                            type="submit"
                            color="success"
                            onClick={this._bulkTrash}
                            autoFocus
                        >
                            Confirm
                        </Button>
                    </PopoverBody>
                </Popover>
                <Popover
                    placement="bottom"
                    isOpen={askDeleteConfirmation}
                    target="bulk-more-button"
                    toggle={this._toggleDeleteConfirmation}
                >
                    <PopoverHeader>Are you sure?</PopoverHeader>
                    <PopoverBody>
                        <p>
                            Are you sure you want to delete {selectedCount}{' '}
                            ticket{selectedCount > 1 && 's'} forever?
                        </p>
                        <Button
                            type="submit"
                            color="success"
                            onClick={this._bulkDelete}
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

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        teams: getTeams(state),
        agents: getAgents(state),
        isActiveViewTrashView: viewsSelectors.isActiveViewTrashView(state),
        allViewItemsSelected: viewsSelectors.areAllActiveViewItemsSelected(
            state
        ),
        areFiltersValid: viewsSelectors.areFiltersValid(state),
        activeView: viewsSelectors.getActiveView(state),
        getViewCount: viewsSelectors.makeGetViewCount(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            views: bindActionCreators(viewsActions, dispatch),
            tickets: bindActionCreators(ticketsActions, dispatch),
        },
        fieldEnumSearch: bindActionCreators(
            viewsActions.fieldEnumSearch,
            dispatch
        ),
    }
}

//$FlowFixMe
export default connect(mapStateToProps, mapDispatchToProps)(TicketListActions)
