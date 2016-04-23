import React, { PropTypes } from 'react'
import 'moment-timezone'
import TicketTableRow from './TicketTableRow'
import PlainColumnHeader from './PlainColumnHeader'
import ColumnHeader from './ColumnHeader'
import SemanticPaginator from '../SemanticPaginator'


const columnToFilterName = {
    assignee: 'ticket.assignee_user.id',
    tags: 'ticket.tags',
    status: 'ticket.status',
}


export default class TicketTable extends React.Component {
    onPageChange = (page) => this.props.fetchPage(page)

    renderLoading = () => {
        const nbPages = this.props.tickets.getIn(['resp_meta', 'nb_pages'])
        const message = nbPages === 0 ? 'No tickets found.' : 'Loading...'

        return (
            <div className="loading-container">
                <div className="loading">
                    <p>{message}</p>
                </div>
            </div>
        )
    }

    renderColumnHeader = (column) => {
        const filterSpec = this.props.getFilterSpecForColumn(column.name)

        if (!filterSpec) {
            return <PlainColumnHeader key={column.name} column={column} />
        }

        return (
            <ColumnHeader
                key={column.name}
                column={column}
                groupedFilters={this.props.groupedFilters}
                updateFilters={this.props.updateFilters}
                filterSpec={filterSpec}
            />
        )
    }

    render = () => {
        // TODO: Do this with CSS rather than explicitly calculating & passing total width
        const style = { maxWidth: this.props.width }
        const ticketTableStyle = { marginTop: this.props.isDirty ? '14em' : '9em' }

        if (this.props.tickets.get('items').size === 0) {
            return this.renderLoading()
        }

        return (
            <div className="TicketTable" style={ticketTableStyle}>
                <div>
                    <div className="ui grid" style={style}>
                        <div className="row head-row" >
                            <div className="one-fixed wide column">
                                <span className="ui checkbox">
                                    <input type="checkbox"/>
                                    <label></label>
                                </span>
                            </div>
                            {this.props.columns.map(this.renderColumnHeader)}
                        </div>
                    </div>
                    <div>
                        {
                            this.props.tickets.get('items').toJS().map((ticket, curIndex) => (
                                <TicketTableRow
                                    key={ticket.id}
                                    ticket={ticket}
                                    view={this.props.view}
                                    page={this.props.tickets.getIn(['resp_meta', 'page'])}
                                    width={this.props.width}
                                    columns={this.props.columns}
                                    currentUser={this.props.currentUser}
                                    pushState={this.props.pushState}
                                    curIndex={curIndex}
                                    saveIndex={this.props.actions.ticket.saveIndex}
                                />
                            ))
                        }
                    </div>
                </div>
                <SemanticPaginator
                    page={this.props.tickets.getIn(['resp_meta', 'page'])}
                    totalPages={this.props.tickets.getIn(['resp_meta', 'nb_pages'])}
                    onChange={this.onPageChange}
                    radius={0}
                    anchor={3}
                />
            </div>
        )
    }
}

TicketTable.propTypes = {
    tickets: PropTypes.object.isRequired,
    view: PropTypes.string,
    isDirty: PropTypes.bool,
    actions: PropTypes.object.isRequired,
    groupedFilters: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    currentUser: PropTypes.object.isRequired,
    updateFilters: PropTypes.func.isRequired,
    getFilterSpecForColumn: PropTypes.func.isRequired,
    fetchPage: PropTypes.func.isRequired
}
