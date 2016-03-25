import React, {PropTypes} from 'react'
import moment from 'moment'
import 'moment-timezone'
import TicketTableRow from './TicketTableRow'
import PlainColumnHeader from './PlainColumnHeader'
import ColumnHeader from './ColumnHeader'
import SemanticPaginator from '../SemanticPaginator'
import classNames from 'classnames'
import { CELL_WIDTH } from '../../constants'


const columnToFilterName = {
    assignee: "ticket.assignee_user.id",
    tags: "ticket.tags",
    status: "ticket.status",
}


export default class TicketTable extends React.Component {
    getWidth = () => {
        return _.sumBy(this.props.columns, 'width') + CELL_WIDTH  // One extra cell for the row checkbox
    }

    renderLoading = () => {
        const nbPages = this.props.tickets.getIn(['resp_meta', 'nb_pages'])
        const message = nbPages === 0 ? "No tickets found." : "Loading..."

        return (
            <div className="loading-container">
                <div className="loading">
                    <p>{message}</p>
                </div>
            </div>
        )
    }

    onPageChange = (page) => {
        return this.props.fetchPage(page)
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
        const width = this.getWidth()
        const style = {width: width}

        if (this.props.tickets.get('items').size === 0) {
            return this.renderLoading()
        }

        return (
            <div className="TicketTable">
                <div>
                    <div className="ui grid" style={style} key={width}>
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
                            this.props.tickets.get('items').toJS().map((ticket) => {
                                return (
                                    <TicketTableRow
                                        key={ticket.id}
                                        ticket={ticket}
                                        width={width}
                                        columns={this.props.columns}
                                        currentUser={this.props.currentUser}
                                        pushState={this.props.pushState}
                                    />
                                )
                            })
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
    actions: PropTypes.object.isRequired,
    groupedFilters: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired,
    updateFilters: PropTypes.func.isRequired,
    getFilterSpecForColumn: PropTypes.func.isRequired,
}
