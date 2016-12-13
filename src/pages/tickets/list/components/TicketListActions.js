import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {fromJS} from 'immutable'
import {browserHistory} from 'react-router'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import * as ViewsActions from '../../../../state/views/actions'
import * as MacroActions from '../../../../state/macro/actions'

class TicketListActions extends React.Component {
    componentDidUpdate(prevProps) {
        const prevAreBulkActionsDisplayed = prevProps.selectedItemsIds.size > 0
        const areBulkActionsDisplayed = this.props.selectedItemsIds.size > 0

        if (!prevAreBulkActionsDisplayed && areBulkActionsDisplayed) {
            $(this.refs.bulkStatusDropdown).dropdown({
                hoverable: true,
                on: 'click',
                action: (text, value) => this._bulkUpdate('status', value)
            })

            $(this.refs.bulkMoreDropdown).dropdown({
                hoverable: true,
                on: 'click',
                action: (text, value) => {
                    switch (value) {
                        case 'normal':
                            this._bulkUpdate('priority', 'normal')
                            break
                        case 'high':
                            this._bulkUpdate('priority', 'high')
                            break
                        case 'delete':
                            this._bulkDelete()
                            break
                        case 'macro':
                            this.props.actions.macro.openModal()
                            break
                        default:
                            break
                    }

                    $(this.refs.bulkMoreDropdown).dropdown('hide')
                }
            })

            $(this.refs.bulkTagDropdown).dropdown({
                hoverable: true,
                on: 'click',
                allowAdditions: true,
                action: (text, value) => {
                    const tag = this.props.tags.find(curTag => curTag.get('name') === value)

                    if (tag) {
                        this._bulkUpdate('tag', tag.toJS())
                    } else {
                        this._bulkUpdate('tag', {name: value})
                    }
                }
            })

            $(this.refs.bulkAssigneeDropdown).dropdown({
                hoverable: true,
                on: 'click',
                action: (text, value) => {
                    const agent = this.props.agents.find(curAgent => curAgent.get('id').toString() === value)

                    if (agent) {
                        this._bulkUpdate('assignee_user', {id: agent.get('id'), name: agent.get('name')})
                    }
                }
            })
        }
    }

    _bulkUpdate(key, value) {
        this.props.actions.views.bulkUpdate(this.props.view, this.props.selectedItemsIds, key, value)
    }

    _bulkDelete() {
        const {actions, view, selectedItemsIds} = this.props
        const message = `Are you sure you want to delete ${selectedItemsIds.size} tickets ?`
        if (window.confirm(message)) {
            actions.views.bulkDelete(view, selectedItemsIds)
        }
    }

    renderBulkActions() {
        const {currentUser, tags, agents} = this.props

        return (
            <div className="flex-spaced-row">
                <div className="BulkAction ui tiny buttons">
                    <div
                        className="ui basic grey button"
                        onClick={() => this._bulkUpdate('assignee_user', {
                            id: currentUser.get('id'),
                            name: currentUser.get('name')
                        })}
                    >
                        Assign to me
                    </div>
                    <div
                        ref="bulkAssigneeDropdown"
                        className="ui basic grey floating dropdown icon button"
                        onClick={() => this.refs.agentSearch.focus()}
                    >
                        <i className="dropdown icon" />
                        <div className="menu">
                            <div className="ui search input">
                                <input
                                    ref="agentSearch"
                                    type="text"
                                    placeholder="Search agents..."
                                />
                            </div>
                            <div
                                className="hidden item"
                                key="placeholder"
                            ></div>
                            {
                                agents.map(agent => (
                                    <div
                                        className="item"
                                        key={agent.get('id')}
                                        data-value={agent.get('id')}
                                    >
                                        {agent.get('name')}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>

                <div className="BulkAction ui tiny buttons">
                    <div
                        className="ui basic grey button"
                        onClick={() => this._bulkUpdate('status', 'closed')}
                    >
                        Close
                    </div>
                    <div
                        ref="bulkStatusDropdown"
                        className="ui basic grey floating dropdown icon button item"
                    >
                        <i className="dropdown icon" />
                        <div className="menu">
                            <div
                                className="item"
                                data-value="open"
                            >
                                open
                            </div>
                            <div
                                className="item"
                                data-value="new"
                            >
                                new
                            </div>
                        </div>
                    </div>
                </div>

                <div className="BulkAction ui tiny buttons">
                    <div
                        ref="bulkTagDropdown"
                        className="ui basic grey button floating dropdown"
                        onClick={() => this.refs.tagSearch.focus()}
                    >
                        Tag <i className="dropdown icon" />

                        <div className="menu">
                            <div className="ui search input">
                                <input
                                    ref="tagSearch"
                                    type="text"
                                    placeholder="Search tags..."
                                />
                            </div>
                            <div
                                className="hidden item"
                                key="placeholder"
                            ></div>
                            {
                                tags.map(tag => (
                                    <div
                                        className="item"
                                        key={tag.get('name')}
                                        data-value={tag.get('name')}
                                    >
                                        {tag.get('name')}
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div
                        ref="bulkMoreDropdown"
                        className="ui basic grey button floating dropdown"
                    >
                        More <i className="dropdown icon" />
                        <div className="menu">
                            <div
                                className="item"
                                data-value="macro"
                            >
                                Apply macro...
                            </div>
                            <div
                                className="item"
                                data-value="high"
                            >
                                Mark as high priority
                            </div>

                            <div
                                className="item"
                                data-value="normal"
                            >
                                Mark as normal priority
                            </div>

                            <div className="divider"></div>
                            <div
                                className="red text item"
                                data-value="delete"
                            >
                                Delete tickets
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const {hasBulkActions} = this.props
        const areBulkActionsDisplayed = this.props.selectedItemsIds.size > 0

        if (!hasBulkActions) {
            return null
        }

        return (
            <div className="flex-spaced-row bulk-actions">
                <ReactCSSTransitionGroup
                    transitionName="fade"
                    transitionAppear
                    transitionAppearTimeout={200}
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={200}
                >
                    {areBulkActionsDisplayed && this.renderBulkActions()}
                </ReactCSSTransitionGroup>

                <button
                    className="ui green tiny button"
                    onClick={() => {
                        browserHistory.push('/app/ticket/new')
                    }}
                >
                    Create ticket
                </button>
            </div>
        )
    }
}

TicketListActions.propTypes = {
    view: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired, // tickets actions
    selectedItemsIds: PropTypes.object.isRequired, // list of ids of selected tickets

    currentUser: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    hasBulkActions: PropTypes.bool.isRequired
}

function mapStateToProps(state) {
    return {
        currentUser: state.currentUser,
        tags: state.tags.get('items', fromJS([])),
        agents: state.users.get('agents', fromJS([])),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: {
            views: bindActionCreators(ViewsActions, dispatch),
            macro: bindActionCreators(MacroActions, dispatch),
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TicketListActions)
