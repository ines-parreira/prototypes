import React, { PropTypes } from 'react'
import { Map, List } from 'immutable'
import _ from 'lodash'

import TicketTable from './TicketTable'
import FilterTopbar from './FilterTopbar'
import ShowMoreFieldsDropdown from './ShowMoreFieldsDropdown'
import Search from '../Search'
import { TICKET_STATUSES, CELL_WIDTH } from '../../constants'

export default class TicketsView extends React.Component {
    renderShowMoreFieldsDropdown = () => {
        // Only render jQuery-laden initialization once we have the columns
        if (this.props.columns.size === 0) {
            return null
        }

        return (
            <ShowMoreFieldsDropdown
                columns={this.props.columns.map((c) => c.get('name'))}
                updateView={this.updateView}
            />
        )
    }

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
        const style = { maxWidth: this.getWidth() }

        return (
            <div className="TicketsView" style={style}>
                <div className="ui text menu">
                    <div className="left menu item">
                        {this.renderShowMoreFieldsDropdown()}
                    </div>
                    <div className="right menu item">
                        <Search id="ticket" search={this.props.search}/>
                    </div>
                </div>

                <h1 className="ui header">{this.props.view.get('name')}</h1>

                <FilterTopbar
                    view={this.props.view}
                    groupedFilters={groupedFilters}
                    filterSpecs={this.getFilterSpecs()}
                    updateFilters={this.updateFilters}
                    clearFilter={this.clearFilter}
                    submitView={this.props.actions.view.submitView}
                    editMode={this.props.view.get('editMode')}
                    width={this.getWidth()}
                />

                <TicketTable
                    actions={this.props.actions}
                    tickets={this.props.tickets}
                    columns={this.props.columns.toJS()}
                    groupedFilters={groupedFilters}
                    getFilterSpecForColumn={this.getFilterSpecForColumn}
                    updateFilters={this.updateFilters}
                    currentUser={this.props.currentUser}
                    pushState={this.props.pushState}
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
    pushState: PropTypes.func.isRequired,
    fetchPage: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired
}

