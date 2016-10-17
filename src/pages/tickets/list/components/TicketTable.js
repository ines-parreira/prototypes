import React, {PropTypes} from 'react'
import {fromJS} from 'immutable'
import TicketTableRow from './TicketTableRow'
import ColumnHeader from './ColumnHeader'
import ShowMoreFieldsDropdown from '../../../common/components/ShowMoreFieldsDropdown'
import SemanticPaginator from '../../../common/components/SemanticPaginator'
import {Loader} from '../../../common/components/Loader'

export default class TicketTable extends React.Component {
    toggleSelectAll = () => {
        this.props.toggleTicketSelection('all')
    }

    render() {
        const {view, tickets, currentUser, style, getWidth} = this.props
        const isLoading = tickets.getIn(['_internal', 'loading', 'fetchList'])

        // if loading => show message
        if (isLoading) {
            return (
                <div className="ticket-table" style={style}>
                    <div style={{
                        maxWidth: getWidth()
                    }}>
                        <Loader
                            loading={isLoading}
                        />
                    </div>
                </div>
            )
        }

        // if empty view or view fields => show message
        if (tickets.get('items').isEmpty() || view.get('fields').isEmpty()) {
            let message = <p>This view is empty. Enjoy your day!</p>

            if (view.get('dirty')) {
                message = <p>No tickets found.<br /><a onClick={this.props.resetView}>Reset view</a></p>
            }

            return (
                <div className="ticket-table" style={style}>
                    <div style={{
                        maxWidth: getWidth()
                    }}>
                        <Loader
                            message={message}
                            loading={false}
                        />
                    </div>
                </div>
            )
        }

        // temporary remove priority from available fields
        const updatedView = view.set('fields', view.get('fields').filter(f => f.get('name') !== 'priority'))
        const checked = tickets.get('items').size === tickets.getIn(['_internal', 'selectedItemsIds']).size

        return (
            <div className="ticket-table" style={style}>
                <table className="ui selectable very basic padded table" ref="table">
                    <thead>
                        <tr>
                            <th>
                                <span className="ui checkbox">
                                    <input
                                        type="checkbox"
                                        ref="toggleSelection"
                                        onChange={this.toggleSelectAll}
                                        checked={checked}
                                    />
                                    <label />
                                </span>
                            </th>
                            {
                                updatedView
                                    .get('fields')
                                    .map((field) => (
                                        <ColumnHeader
                                            key={field.get('name')}
                                            field={field}
                                            view={updatedView}
                                            schemas={this.props.schemas}
                                            updateView={this.props.updateView}
                                            addFieldFilter={this.props.addFieldFilter}
                                            updateFieldEnumSearch={this.props.updateFieldEnumSearch}
                                            timezone={currentUser.get('timezone')}
                                        />
                                    ))
                            }
                            <ShowMoreFieldsDropdown view={updatedView} />
                        </tr>
                    </thead>
                    <tbody>
                    {
                        tickets
                            .get('items', fromJS([]))
                            .map((ticket, index) => (
                                <TicketTableRow
                                    key={ticket.get('id')}
                                    view={updatedView}
                                    ticket={ticket}
                                    currentUser={currentUser}
                                    toggleTicketSelection={this.props.toggleTicketSelection}
                                    selected={!!~tickets.getIn(['_internal', 'selectedItemsIds']).indexOf(ticket.get('id'))}
                                    saveIndex={() => this.props.saveIndex(index)}
                                />
                            ))
                    }
                    </tbody>
                </table>

                <SemanticPaginator
                    page={tickets.getIn(['_internal', 'pagination', 'page'])}
                    totalPages={tickets.getIn(['_internal', 'pagination', 'nb_pages'])}
                    onChange={(page) => this.props.setPage(page)}
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
    addFieldFilter: PropTypes.func.isRequired,
    updateFieldEnumSearch: PropTypes.func.isRequired,
    setPage: PropTypes.func.isRequired,

    saveIndex: PropTypes.func.isRequired,

    toggleTicketSelection: PropTypes.func.isRequired,
    getWidth: PropTypes.func.isRequired,

    style: PropTypes.object.isRequired
}

TicketTable.defaultProps = {
    tickets: fromJS({}),
    view: fromJS({}),
    schemas: fromJS({}),
    currentUser: fromJS({})
}
