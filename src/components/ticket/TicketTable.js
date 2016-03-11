import React, {PropTypes} from 'react'
import moment from 'moment'
import 'moment-timezone'
import TicketTableRow from './TicketTableRow'
import SemanticPaginator from '../SemanticPaginator'
import classNames from 'classNames'
import { CELL_WIDTH } from '../../constants'


export default class TicketTable extends React.Component {
    columnHeaderFieldContent = (column) => {
        const sort = column.sortable ? <i className="sort icon"></i> : null
        return <span>{column.header} {sort}</span>
    }

    renderColumnHeaderField = (column) => {
        const style = {width: column.width}
        const className = classNames(column.name, "wide", "column")

        return (
            <div style={style} className={className} key={column.name}>
                {this.columnHeaderFieldContent(column)}
            </div>
        )
    }

    getWidth = () => {
        return _.sumBy(this.props.columns, 'width') + CELL_WIDTH  // One extra cell for the row checkbox
    }

    renderLoading = () => {
        const resp_meta = this.props.tickets.get('resp_meta')
        const message = resp_meta.nb_pages === 0 ? "No tickets found." : "Loading..."

        return (
            <div className="loading-container">
                <div className="loading">
                    <p>{message}</p>
                </div>
            </div>
        )
    }

    onPageChange = (page) => {
        return this.props.actions.ticket.fetchPageFromAlgolia(this.props.view, page)
    }

    render = () => {
        // TODO: Do this with CSS rather than explicitly calculating & passing total width
        const width = this.getWidth()
        const style = {width: width}

        if (_.isEmpty(this.props.tickets.get('items'))) {
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
                            {
                                this.props.columns.map(this.renderColumnHeaderField)
                            }
                        </div>
                    </div>
                    <div>
                        {
                            this.props.tickets.get('items').map((ticket) => {
                                return (
                                    <TicketTableRow
                                        key={ticket.id}
                                        ticket={ticket}
                                        width={width}
                                        columns={this.props.columns}
                                        currentUser={this.props.currentUser}
                                        pushState={this.props.pushState} />
                                )
                            })
                        }
                    </div>
                </div>
                <SemanticPaginator
                    page={this.props.tickets.get('resp_meta').page}
                    totalPages={this.props.tickets.get('resp_meta').nb_pages}
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
    view: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    allTags: PropTypes.array.isRequired,
    allUsers: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired,
}
