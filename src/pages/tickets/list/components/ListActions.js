import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

export default class ListActions extends React.Component {
    componentDidUpdate(prevProps) {
        if (!prevProps.shouldDisplayBulkActions && this.props.shouldDisplayBulkActions) {
            $('#bulkStatusDropdown').dropdown({
                hoverable: true,
                on: 'click',
                action: (text, value) => this.bulkUpdate('status', value)
            })

            const bulkMoreDD = $('#bulkMoreDropdown')
            bulkMoreDD.dropdown({
                hoverable: true,
                on: 'click',
                action: (text, value) => {
                    switch (value) {
                        case 'normal':
                            this.bulkUpdate('priority', 'normal')
                            break
                        case 'high':
                            this.bulkUpdate('priority', 'high')
                            break
                        case 'delete':
                            this.bulkDelete()
                            break
                        case 'macro':
                            this.props.actions.macro.openModal()
                            break
                        default:
                            break
                    }

                    bulkMoreDD.dropdown('hide')
                }
            })

            $('#bulkTagDropdown').dropdown({
                hoverable: true,
                on: 'click',
                allowAdditions: true,
                action: (text, value) => {
                    const tag = this.props.tags.find(curTag => curTag.get('name') === value)

                    if (tag) {
                        this.bulkUpdate('tag', tag.toJS())
                    } else {
                        this.bulkUpdate('tag', {name: value})
                    }
                }
            })

            $('#bulkAssigneeDropdown').dropdown({
                hoverable: true,
                on: 'click',
                action: (text, value) => {
                    const agent = this.props.agents.find(curAgent => curAgent.get('id').toString() === value)

                    if (agent) {
                        this.bulkUpdate('assignee_user', {id: agent.get('id'), name: agent.get('name')})
                    }
                }
            })
        }
    }

    bulkUpdate(key, value) {
        this.props.actions.tickets.bulkUpdate(this.props.selected, key, value, this.props.views)
    }

    bulkDelete() {
        if (window.confirm(`Are you sure you want to delete ${this.props.selected.size} tickets?`)) {
            this.props.actions.tickets.bulkDelete(this.props.selected)
        }
    }

    renderBulkActions() {
        const {shouldDisplayBulkActions, currentUser, tags, agents} = this.props

        if (!shouldDisplayBulkActions) {
            return null
        }

        return (
            <div>
                <div className="BulkAction ui right floated buttons">

                    <div
                        id="bulkTagDropdown"
                        className="ui basic grey button floating dropdown"
                        onClick={() => this.refs.tagSearch.focus()}
                    >
                        Tag <i className="dropdown icon" />

                        <div className="menu">
                            <div className="ui search input">
                                <input ref="tagSearch" type="text" placeholder="Search tags..." />
                            </div>
                            <div className="hidden item" key="placeholder"></div>
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

                    <div id="bulkMoreDropdown" className="ui basic grey button floating dropdown">
                        More <i className="dropdown icon" />
                        <div className="menu">
                            <div className="item" data-value="macro">Apply macro...</div>

                            <div className="item" data-value="high">
                                Mark as high priority
                            </div>

                            <div className="item" data-value="normal">
                                Mark as normal priority
                            </div>

                            <div className="divider"></div>
                            <div className="red text item" data-value="delete">Delete tickets</div>
                        </div>
                    </div>

                </div>

                <div className="BulkAction ui right floated buttons">
                    <div className="ui basic grey button" onClick={() => this.bulkUpdate('status', 'closed')}>
                        Close
                    </div>
                    <div id="bulkStatusDropdown" className="ui basic grey floating dropdown icon button item">
                        <i className="dropdown icon" />
                        <div className="menu">
                            <div className="item" data-value="open">open</div>
                            <div className="item" data-value="new">new</div>
                        </div>
                    </div>
                </div>

                <div className="BulkAction ui right floated buttons">
                    <div
                        className="ui basic grey button"
                        onClick={() => this.bulkUpdate('assignee_user', {
                            id: currentUser.get('id'),
                            name: currentUser.get('name')
                        })}
                    >
                        Assign to me
                    </div>
                    <div
                        id="bulkAssigneeDropdown"
                        className="ui basic grey floating dropdown icon button"
                        onClick={() => this.refs.agentSearch.focus()}
                    >
                        <i className="dropdown icon" />
                        <div className="menu">
                            <div className="ui search input">
                                <input ref="agentSearch" type="text" placeholder="Search agents..." />
                            </div>
                            <div className="hidden item" key="placeholder"></div>
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

            </div>
        )
    }

    render() {
        const {shouldDisplayBulkActions} = this.props

        return (
            <div className="ListActions">

                <button
                    className="ui right floated green button"
                    onClick={() => {
                        browserHistory.push('/app/ticket/new')
                    }}
                >
                    CREATE TICKET
                </button>

                <ReactCSSTransitionGroup
                    transitionName="fade"
                    transitionAppear
                    transitionAppearTimeout={200}
                    transitionEnterTimeout={200}
                    transitionLeaveTimeout={200}
                >
                    {this.renderBulkActions(shouldDisplayBulkActions)}
                </ReactCSSTransitionGroup>

            </div>
        )
    }
}

ListActions.propTypes = {
    views: PropTypes.object.isRequired,
    shouldDisplayBulkActions: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired, // tickets actions
    selected: PropTypes.object.isRequired, // list of ids of selected tickets

    currentUser: PropTypes.object.isRequired,
    tags: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired
}
