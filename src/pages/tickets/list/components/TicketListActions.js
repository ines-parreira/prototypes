import React, {PropTypes} from 'react'
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
import _capitalize from 'lodash/capitalize'
import _debounce from 'lodash/debounce'

import * as viewsActions from '../../../../state/views/actions'
import * as viewsSelectors from '../../../../state/views/selectors'
import * as macroActions from '../../../../state/macro/actions'

import {getAgents} from '../../../../state/users/selectors'

class TicketListActions extends React.Component {
    state = {
        agentsDropdownOpen: false,
        agentsSearch: '',
        tagsDropdownOpen: false,
        tagsSearch: '',
        tags: fromJS([]),
        isLoadingTags: false,
        askTrashConfirmation: false,
        askDeleteConfirmation: false,
    }

    _toggleAgentsDropdown = () => {
        const opens = !this.state.agentsDropdownOpen

        this.setState({
            agentsDropdownOpen: opens,
        })

        if (opens) {
            this.setState({agentsSearch: ''})
        }
    }

    _toggleTagsDropdown = () => {
        const opens = !this.state.tagsDropdownOpen

        this.setState({
            tagsDropdownOpen: opens,
        })

        if (opens) {
            const search = ''
            this.setState({tagsSearch: search})
            this._queryTags(search)
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
        this.setState({askTrashConfirmation: false})
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

    _toggleTrashConfirmation = () => {
        this.setState({askTrashConfirmation: !this.state.askTrashConfirmation})
    }

    _toggleDeleteConfirmation = () => {
        this.setState({askDeleteConfirmation: !this.state.askDeleteConfirmation})
    }

    _renderBulkActions = () => {
        const {currentUser, isActiveViewTrashView} = this.props

        const areItemsSelected = !this.props.selectedItemsIds.isEmpty()

        const agents = this.props.agents.filter((agent) => {
            return agent.get('name').toLowerCase().includes(this.state.agentsSearch.toLowerCase())
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
                        {
                            ['open', 'new'].map((status) => {
                                return (
                                    <DropdownItem
                                        key={status}
                                        type="button"
                                        onClick={() => this._bulkUpdate('status', status)}
                                    >
                                        {_capitalize(status)}
                                    </DropdownItem>
                                )
                            })
                        }
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
                <ButtonDropdown
                    className="mr-2"
                    isOpen={this.state.agentsDropdownOpen}
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
                                this.state.agentsDropdownOpen && ( // rebuild input on each opening so "autoFocus" works
                                    <Input
                                        placeholder="Search agents..."
                                        autoFocus
                                        value={this.state.agentsSearch}
                                        onChange={e => this.setState({agentsSearch: e.target.value})}
                                    />
                                )
                            }
                        </DropdownItem>
                        <DropdownItem divider/>
                        {
                            agents.isEmpty() ? (
                                <DropdownItem header>
                                    Could not find any agent
                                </DropdownItem>
                            ) : (
                                agents.map((agent) => {
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
                    </DropdownMenu>
                </ButtonDropdown>
                <ButtonDropdown
                    className="mr-2"
                    isOpen={this.state.tagsDropdownOpen}
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
                                this.state.tagsDropdownOpen && ( // rebuild input on each opening so "autoFocus" works
                                    <Input
                                        placeholder="Search tags..."
                                        autoFocus
                                        value={this.state.tagsSearch}
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
                            onClick={this.props.actions.macro.openModal}
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
                    isOpen={this.state.askTrashConfirmation}
                    target="bulk-more-button"
                    toggle={this._toggleTrashConfirmation}
                >
                    <PopoverTitle>Are you sure?</PopoverTitle>
                    <PopoverContent>
                        <p>
                            Are you sure you want to delete {this.props.selectedItemsIds.size}{' '}
                            ticket{this.props.selectedItemsIds.size > 1 && 's'}?
                        </p>
                        <Button
                            type="submit"
                            color="success"
                            onClick={this._bulkTrash}
                        >
                            Confirm
                        </Button>
                    </PopoverContent>
                </Popover>
                <Popover
                    placement="bottom"
                    isOpen={this.state.askDeleteConfirmation}
                    target="bulk-more-button"
                    toggle={this._toggleDeleteConfirmation}
                >
                    <PopoverTitle>Are you sure?</PopoverTitle>
                    <PopoverContent>
                        <p>
                            Are you sure you want to delete {this.props.selectedItemsIds.size}{' '}
                            ticket{this.props.selectedItemsIds.size > 1 && 's'} forever?
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

TicketListActions.propTypes = {
    view: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired, // tickets actions
    selectedItemsIds: PropTypes.object.isRequired, // list of ids of selected tickets

    fieldEnumSearch: PropTypes.func.isRequired,
    currentUser: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    isActiveViewTrashView: PropTypes.bool.isRequired,
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
