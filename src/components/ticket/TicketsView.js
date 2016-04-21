import React, { PropTypes } from 'react'
import { Map, List } from 'immutable'
import _ from 'lodash'
import { browserHistory } from 'react-router'

import TicketTable from './TicketTable'
import FilterTopbar from './FilterTopbar'
import ShowMoreFieldsDropdown from './../ShowMoreFieldsDropdown'
import Search from '../Search'
import { TICKET_STATUSES, CELL_WIDTH } from '../../constants'

export default class TicketsView extends React.Component {
    getWidth = () => {
        return _.sumBy(this.props.columns.toJS(), 'width') + CELL_WIDTH  // One extra cell for the row checkbox
    }

    getFilterSpecs = () => {
        /*
        * In the future this should perhaps be replaced by information gleaned from the swagger API spec
        */
        return {
            'ticket.tags': {
                name: 'ticket.tags',
                allValues: this.props.allTags,
                columnName: 'tags',
                callee: 'contains',
                search: true,
                getRepr: (value) => {
                    if (value) {
                        return value.get('name')
                    } else {
                        return ''
                    }
                },
                getID: (value) => {
                    if (value) {
                        return value.get('name')
                    } else {
                        return ''
                    }
                }
            },
            'ticket.assignee_user.id': {
                name: 'ticket.assignee_user.id',
                allValues: this.props.agents,
                columnName: 'assignee',
                callee: 'eq',
                search: true,
                getRepr: (value) => {
                    if (value) {
                        return value.get('name')
                    } else {
                        return ''
                    }
                },
                getID: (value) => {
                    if (value) {
                        return value.get('id')
                    } else {
                        return ''
                    }
                }
            },
            'ticket.status': {
                name: 'ticket.status',
                allValues: List(TICKET_STATUSES),
                columnName: 'status',
                callee: 'eq',
                search: false,
                getRepr: (value) => value,
                getID: (value) => value,
            }
        }
    }

    getFilterSpecForColumn = (columnName) => {
        return _.keyBy(_.values(this.getFilterSpecs()), 'columnName')[columnName]
    }

    updateView = (data) => {
        // TODO: Just pass through the view
        const slug = this.props.view.get('slug')
        return this.props.actions.view.updateView(slug, data)
    }

    updateFilters = (data) => {
        this.props.actions.view.updateFilters(this.props.view.get('slug'), data)
    }

    clearFilter = (name) => {
        this.props.actions.view.clearFilter(this.props.view.get('slug'), name)
    }

    render() {
        const groupedFilters = this.props.view.get('groupedFilters', Map())
        const style = { maxWidth: this.getWidth(), width: this.getWidth() }

        return (
            <div className="TicketsView" style={style}>
                <div className="sticky-header" style={style}>
                    <div className="ui text menu">
                        <div className="left menu item">
                            <ShowMoreFieldsDropdown
                                columns={this.props.columns.map((c) => c.get('name'))}
                                updateView={this.updateView}
                            />
                        </div>
                        <div className="right menu item">
                            <Search id="ticket" search={this.props.search}/>
                        </div>
                    </div>

                    <div className="ui grid view-header">
                        <div className="twelve wide column">
                            <h1 className="ui header">{this.props.view.get('name')}</h1>
                        </div>
                        <div className="four wide column">
                            <button
                                className="ui right floated green button"
                                onClick={() => { browserHistory.push(`/app/ticket/new?view=${this.props.view.get('slug')}`) }}
                            >
                                CREATE TICKET
                            </button>
                        </div>
                    </div>

                    <FilterTopbar
                        view={this.props.view}
                        groupedFilters={groupedFilters}
                        filterSpecs={this.getFilterSpecs()}
                        updateFilters={this.updateFilters}
                        clearFilter={this.clearFilter}
                        submitView={this.props.actions.view.submitView}
                        width={this.getWidth()}
                    />
                </div>

                <TicketTable
                    actions={this.props.actions}
                    view={this.props.view.get('slug')}
                    isDirty={this.props.view.get('dirty')}
                    tickets={this.props.tickets}
                    columns={this.props.columns.toJS()}
                    groupedFilters={groupedFilters}
                    getFilterSpecForColumn={this.getFilterSpecForColumn}
                    updateFilters={this.updateFilters}
                    currentUser={this.props.currentUser}
                    fetchPage={this.props.fetchPage}
                    width={this.getWidth()}
                />
            </div>
        )
    }
}

TicketsView.propTypes = {
    actions: PropTypes.object.isRequired,
    tickets: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    columns: PropTypes.object.isRequired,
    allTags: PropTypes.object.isRequired,
    allUsers: PropTypes.object.isRequired,
    agents: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    fetchPage: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired
}

