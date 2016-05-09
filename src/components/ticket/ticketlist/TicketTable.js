import React, {PropTypes} from 'react'
import TicketTableRow from './TicketTableRow'
import ColumnHeader from './ColumnHeader'
import ShowMoreFieldsDropdown from './../../ShowMoreFieldsDropdown'
import SemanticPaginator from '../../SemanticPaginator'
import {Loader} from '../../Loader'

export default class TicketTable extends React.Component {
    onPageChange = (page) => this.props.fetchPage(page)
    toggleSelectAll = () => {
        const checked = this.refs.toggleSelection.checked
        const checkboxes = this.refs.table.querySelectorAll('.checkbox input')
        for (const checkbox in checkboxes) {
            if (checkboxes.hasOwnProperty(checkbox)) {
                checkboxes[checkbox].checked = checked
            }
        }
    }

    render() {
        const {view, tickets, currentUser} = this.props
        const nbPages = this.props.tickets.getIn(['resp_meta', 'nb_pages'])
        const message = nbPages === 0 ? 'No tickets found.' : 'Loading...'

        if (!(tickets && view && !tickets.get('items').isEmpty() && !view.get('fields').isEmpty())) {
            return (<Loader message={message}/>)
        }
        return (
            <div className="TicketTable">
                <table className="ui selectable very basic padded table" ref="table">
                    <thead>
                    <tr>
                        <th>
                               <span className="ui checkbox">
                                    <input type="checkbox"
                                           ref="toggleSelection"
                                           onChange={this.toggleSelectAll}
                                    />
                                    <label />
                                </span>
                        </th>
                        {view.get('fields').map((field) => (
                            <ColumnHeader
                                key={field.get('name')}
                                field={field}
                                view={view}
                                updateView={this.props.updateView}
                                updateFieldFilter={this.props.updateFieldFilter}
                                updateFieldSearch={this.props.updateFieldSearch}
                            />
                        ))}
                        <ShowMoreFieldsDropdown
                            view={view}
                            updateField={this.props.updateField}
                        />
                    </tr>
                    </thead>
                    <tbody>
                    {tickets.get('items').map((ticket, curIndex) => (
                        <TicketTableRow
                            key={ticket.get('id')}
                            view={view}
                            ticket={ticket}
                            currentUser={currentUser}
                            page={tickets.getIn(['resp_meta', 'page'])}
                        />
                    ))}
                    </tbody>
                </table>

                <SemanticPaginator
                    page={tickets.getIn(['resp_meta', 'page'])}
                    totalPages={tickets.getIn(['resp_meta', 'nb_pages'])}
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
    view: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    updateView: PropTypes.func.isRequired,
    updateField: PropTypes.func.isRequired,
    updateFieldFilter: PropTypes.func.isRequired,
    updateFieldSearch: PropTypes.func.isRequired,
    fetchPage: PropTypes.func.isRequired
}
