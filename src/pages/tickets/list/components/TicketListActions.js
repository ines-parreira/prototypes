// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import moment from 'moment'
import {bindActionCreators} from 'redux'
import {
    UncontrolledButtonDropdown,
    ButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Input,
    Popover,
    PopoverTitle,
    PopoverContent,
} from 'reactstrap'
import _debounce from 'lodash/debounce'
import _isUndefined from 'lodash/isUndefined'

import shortcutManager from '../../../../services/shortcutManager'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as macroActions from '../../../../state/macro/actions'

import {getAgents} from '../../../../state/users/selectors'

import type {List, Map} from 'immutable'
import type {currentUserType} from '../../../../state/types'
import type {agentsType} from '../../../../state/agents/types'
import type {viewType} from '../../../../state/views/types'

type Props = {
    view: viewType,
    actions: {
        views: typeof viewsActions,
        macro: typeof macroActions
    },
    selectedItemsIds: List<Map<*,*>>,
    fieldEnumSearch: typeof viewsActions.fieldEnumSearch,
    currentUser: currentUserType,
    agents: agentsType,
    isActiveViewTrashView: boolean
}

type State = {
    popoverOpen: string,
    agentsSearch: string,
    tagsSearch: string,
    tags: List<Map<*,*>>,
    isLoadingTags: boolean,
    askTrashConfirmation: boolean,
    askDeleteConfirmation: boolean
}

class TicketListActions extends React.Component<Props, State> {
    state = {
        popoverOpen: '',
        agentsSearch: '',
        tagsSearch: '',
        tags: fromJS([]),
        isLoadingTags: false,
        askTrashConfirmation: false,
        askDeleteConfirmation: false,
    }

    componentDidMount() {
        this._bindKeys()
    }

    componentWillUnmount() {
        shortcutManager.unbind('TicketListActions')
    }

    _bindKeys = () => {
        shortcutManager.bind('TicketListActions', {
            OPEN_TICKET: {
                action: () => this._bulkUpdate('status', 'open')
            },
            CLOSE_TICKET: {
                action: () => this._bulkUpdate('status', 'closed')
            },
            OPEN_ASSIGNEE: {
                action: (e) => {
                    if (!this._hasChecked()) {
                        return
                    }
                    e.preventDefault()
                    this._toggleAgentsDropdown()
                }
            },
            OPEN_TAGS: {
                action: (e) => {
                    if (!this._hasChecked()) {
                        return
                    }
                    e.preventDefault()
                    this._toggleTagsDropdown()
                }
            },
            OPEN_MACRO: {
                action: (e) => {
                    if (!this._hasChecked()) {
                        return
                    }
                    e.preventDefault()
                    this.props.actions.macro.openModal()
                }
            },
            DELETE_TICKET: {
                action: () => {
                    if (!this._hasChecked()) {
                        return
                    }
                    this._toggleTrashConfirmation()
                }
            },
            HIDE_POPOVER: {
                key: 'esc',
                action: () => {
                    this._togglePopover()
                }
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

    _toggleAgentsDropdown = (visible) => {
        const opens = !_isUndefined(visible) ? visible : !this._isPopoverOpen('agents')
        this._togglePopover(opens ? 'agents' : '')

        if (opens) {
            return this.setState({agentsSearch: ''})
        }
    }

    _toggleTagsDropdown = (visible) => {
        const opens = !_isUndefined(visible) ? visible : !this._isPopoverOpen('tags')
        this._togglePopover(opens ? 'tags' : '')

        if (opens) {
            const search = ''
            this._queryTags(search)
            return this.setState({tagsSearch: search})
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
            filter: {type: 'tag'}
        })

        this.props.fieldEnumSearch(field, search)
            .then((data) => {
                this.setState({
                    tags: data,
                    isLoadingTags: false,
                })
            })
    }

    _queryTagsOnSearch = _debounce(this._queryTags, 300)

    _bulkUpdate = (key, value) => {
        return this.props.actions.views.bulkUpdate(this.props.view, this.props.selectedItemsIds, key, value)
    }

    _bulkTrash = () => {
        const {actions, view, selectedItemsIds} = this.props
        this._toggleTrashConfirmation(false)
        return actions.views.bulkUpdate(view, selectedItemsIds, 'trashed_datetime', moment.utc())
    }

    _bulkUnTrash = () => {
        const {actions, view, selectedItemsIds} = this.props
        return actions.views.bulkUpdate(view, selectedItemsIds, 'trashed_datetime', null)
    }

    _bulkDelete = () => {
        const {actions, view, selectedItemsIds} = this.props
        this.setState({askDeleteConfirmation: false})
        return actions.views.bulkDelete(view, selectedItemsIds)
    }

    _renderTagsMenu = () => {
        const {tagsSearch} = this.state

        if (this.state.isLoadingTags) {
            return (
                <DropdownItem disabled>
                    <i className="fa fa-fw fa-circle-o-notch fa-spin mr-2"/>
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

        const isInEnum = !!this.state.tags.find(tag => tag.get('name') === tagsSearch)

        if (!isInEnum && tagsSearch) {
            if (!this.state.tags.isEmpty()) {
                options = options.push(
                    <DropdownItem
                        key="divider"
                        divider
                    />
                )
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
        const opens = !_isUndefined(visible) ? visible : !this._isPopoverOpen('trash')
        this._togglePopover(opens ? 'trash' : '')
    }

    _toggleDeleteConfirmation = () => {
        this.setState({askDeleteConfirmation: !this.state.askDeleteConfirmation})
    }

    _renderBulkActions = () => {
        const {
            currentUser,
            isActiveViewTrashView,
            selectedItemsIds,
            agents,
            actions
        } = this.props

        const {
            agentsSearch,
            tagsSearch,
            askDeleteConfirmation
        } = this.state

        const areItemsSelected = !selectedItemsIds.isEmpty()

        const filteredAgents = agents.filter((agent) => {
            return agent.get('name').toLowerCase().includes(agentsSearch.toLowerCase())
        })

        return (
            <div className="d-inline-flex align-items-center">
                <UncontrolledButtonDropdown
                    className="mr-2"
                    size="sm"
                >
                    <Button
                        type="button"
                        color="secondary"
                        onClick={() => this._bulkUpdate('status', 'closed')}
                        disabled={!areItemsSelected}
                    >
                        Close
                    </Button>
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={!areItemsSelected}
                    />
                    <DropdownMenu>
                        <DropdownItem header>
                            Set status
                        </DropdownItem>
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
                    isOpen={this._isPopoverOpen('agents')}
                    toggle={this._toggleAgentsDropdown}
                    size="sm"
                >
                    <Button
                        type="button"
                        color="secondary"
                        onClick={() => this._bulkUpdate('assignee_user', {
                            id: currentUser.get('id'),
                            name: currentUser.get('name'),
                        })}
                        disabled={!areItemsSelected}
                    >
                        Assign to me
                    </Button>
                    <DropdownToggle
                        caret
                        type="button"
                        color="secondary"
                        disabled={!areItemsSelected}
                    />
                    <DropdownMenu
                        right
                        style={{width: '230px'}}
                    >
                        <DropdownItem
                            header
                            className="dropdown-item-input"
                        >
                            <div className="mb-2">Assign to:</div>
                            {
                                this._isPopoverOpen('agents') && ( // rebuild input on each opening so "autoFocus" works
                                    <Input
                                        placeholder="Search agents..."
                                        autoFocus
                                        value={agentsSearch}
                                        onChange={e => this.setState({agentsSearch: e.target.value})}
                                    />
                                )
                            }
                        </DropdownItem>
                        <DropdownItem divider/>
                        {
                            filteredAgents.isEmpty() ? (
                                <DropdownItem header>
                                    Could not find any agent
                                </DropdownItem>
                            ) : (
                                filteredAgents.map((agent) => {
                                    return (
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
                                            {agent.get('name')}
                                        </DropdownItem>
                                    )
                                })
                            )

                        }
                        <DropdownItem divider/>
                        <DropdownItem
                            key="clear"
                            type="button"
                            onClick={() => this._bulkUpdate('assignee_user', null)}
                        >
                            <span
                                style={{textTransform: 'none'}}
                                className="text-warning"
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
                        disabled={!areItemsSelected}
                    >
                        Add tag
                    </DropdownToggle>
                    <DropdownMenu
                        right
                        disabled={!areItemsSelected}
                        style={{width: '230px'}}
                    >
                        <DropdownItem
                            header
                            className="dropdown-item-input"
                        >
                            <div className="mb-2">Add tag:</div>
                            {
                                this._isPopoverOpen('tags') && ( // rebuild input on each opening so "autoFocus" works
                                    <Input
                                        placeholder="Search tags..."
                                        autoFocus
                                        value={tagsSearch}
                                        onChange={e => this._searchTags(e.target.value)}
                                    />
                                )
                            }
                        </DropdownItem>
                        <DropdownItem divider/>
                        {this._renderTagsMenu()}
                    </DropdownMenu>
                </ButtonDropdown>
                <UncontrolledButtonDropdown
                    size="sm"
                >
                    <DropdownToggle
                        id="bulk-more-button"
                        color="secondary"
                        type="button"
                        caret
                        disabled={!areItemsSelected}
                    >
                        More
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem
                            type="button"
                            onClick={actions.macro.openModal}
                        >
                            Apply macro
                        </DropdownItem>
                        <DropdownItem divider/>
                        {isActiveViewTrashView ?
                            ([
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
                                </DropdownItem>
                            ]) : (
                                <DropdownItem
                                    type="button"
                                    className="text-danger"
                                    onClick={this._toggleTrashConfirmation}
                                >
                                    Delete
                                </DropdownItem>
                            )
                        }
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <Popover
                    placement="bottom"
                    isOpen={this._isPopoverOpen('trash')}
                    target="bulk-more-button"
                    toggle={this._toggleTrashConfirmation}
                >
                    <PopoverTitle>Are you sure?</PopoverTitle>
                    <PopoverContent>
                        <p>
                            Are you sure you want to delete {selectedItemsIds.size}{' '}
                            ticket{selectedItemsIds.size > 1 && 's'}?
                        </p>
                        <Button
                            type="submit"
                            color="success"
                            onClick={this._bulkTrash}
                            autoFocus
                        >
                            Confirm
                        </Button>
                    </PopoverContent>
                </Popover>
                <Popover
                    placement="bottom"
                    isOpen={askDeleteConfirmation}
                    target="bulk-more-button"
                    toggle={this._toggleDeleteConfirmation}
                >
                    <PopoverTitle>Are you sure?</PopoverTitle>
                    <PopoverContent>
                        <p>
                            Are you sure you want to delete {selectedItemsIds.size}{' '}
                            ticket{selectedItemsIds.size > 1 && 's'} forever?
                        </p>
                        <Button
                            type="submit"
                            color="success"
                            onClick={this._bulkDelete}
                        >
                            Confirm
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
        )
    }

    render() {
        return (
            <div className="d-inline-flex align-items-center hidden-sm-down">
                {this._renderBulkActions()}
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        agents: getAgents(state),
        isActiveViewTrashView: viewsSelectors.isActiveViewTrashView(state),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            views: bindActionCreators(viewsActions, dispatch),
            macro: bindActionCreators(macroActions, dispatch),
        },
        fieldEnumSearch: bindActionCreators(viewsActions.fieldEnumSearch, dispatch),
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketListActions)
