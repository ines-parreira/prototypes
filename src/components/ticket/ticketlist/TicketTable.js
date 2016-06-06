import React, {PropTypes} from 'react'
import TicketTableRow from './TicketTableRow'
import ColumnHeader from './ColumnHeader'
import ShowMoreFieldsDropdown from './../../ShowMoreFieldsDropdown'
import SemanticPaginator from '../../SemanticPaginator'
import {Loader} from '../../Loader'

export default class TicketTable extends React.Component {
    toggleSelectAll = () => {
        this.props.toggleTicketSelection('all')
    }

    render() {
        const {view, tickets, currentUser} = this.props
        const isLoading = this.props.tickets.get('loading')

        if (!(tickets && view && !tickets.get('items').isEmpty() && !view.get('fields').isEmpty() && !isLoading)) {
            let message = <p>{isLoading ? 'Loading...' : 'This view is empty. Enjoy your day!'}</p>

            if (view.get('dirty') && !isLoading) {
                message = <p>No tickets found.<br/><a onClick={this.props.resetView}>Reset view</a></p>
            }

            return <Loader message={message} loading={isLoading} />
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
                                           checked={tickets.get('items').size === tickets.get('selected').size}
                                    />
                                    <label />
                                </span>
                            </th>
                            {view.get('fields').map((field) => (
                                <ColumnHeader
                                    key={field.get('name')}
                                    field={field}
                                    view={view}
                                    schemas={this.props.schemas}
                                    updateView={this.props.updateView}
                                    addFieldFilter={this.props.addFieldFilter}
                                    updateFieldEnumSearch={this.props.updateFieldEnumSearch}
                                />
                            ))}
                            <ShowMoreFieldsDropdown
                                view={view}
                                updateField={this.props.updateField}
                            />
                        </tr>
                    </thead>
                    <tbody>
                    {tickets.get('items').map(ticket => (
                        <TicketTableRow
                            key={ticket.get('id')}
                            view={view}
                            ticket={ticket}
                            currentUser={currentUser}
                            toggleTicketSelection={this.props.toggleTicketSelection}
                            selected={tickets.get('selected').indexOf(ticket.get('id')) !== -1}
                        />
                    ))}
                    </tbody>
                </table>

                <SemanticPaginator
                    page={tickets.getIn(['resp_meta', 'page'])}
                    totalPages={tickets.getIn(['resp_meta', 'nb_pages'])}
                    onChange={(page) => this.props.fetchPage(page)}
                    radius={1}
                    anchor={2}
                />
            </div>
        )
    }
}

TicketTable.propTypes = {
    tickets: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    schemas: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,

    resetView: PropTypes.func.isRequired,
    updateView: PropTypes.func.isRequired,
    updateField: PropTypes.func.isRequired,
    addFieldFilter: PropTypes.func.isRequired,
    updateFieldEnumSearch: PropTypes.func.isRequired,
    fetchPage: PropTypes.func.isRequired,

    toggleTicketSelection: PropTypes.func.isRequired
}
