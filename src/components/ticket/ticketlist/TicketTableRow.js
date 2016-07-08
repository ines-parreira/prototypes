import React, {PropTypes} from 'react'
import {browserHistory} from 'react-router'
import TicketTableCell from './TicketTableCell'

export default class TicketTableRow extends React.Component {
    handleClick = () => {
        this.props.saveIndex()
        browserHistory.push(`/app/ticket/${this.props.ticket.get('id')}`)
    }

    stopPropagation = (ev) => {
        // TODO: Do we want to keep :checked state in the DOM?
        ev.stopPropagation()
    }

    render() {
        // const style = {maxWidth: this.props.width}
        const {view, ticket, currentUser, toggleTicketSelection, selected} = this.props

        // Unfortunately need to render a new .ui.grid for every row since
        // semantic needs .rows to be a direct child of them, which react-infinite
        // doesn't allow
        return (
            <tr onClick={this.handleClick}>
                <td>
                    <span className="ui fitted checkbox" onClick={this.stopPropagation}>
                        <input type="checkbox" checked={selected} onChange={() => toggleTicketSelection(ticket.get('id'))}/>
                        <label />
                    </span>
                </td>
                {view.get('fields', []).map((field) => (
                    <TicketTableCell
                        key={`${ticket.id}-${field.get('name')}`}
                        ticket={ticket}
                        currentUser={currentUser}
                        field={field}
                    />
                ))}
                <td></td>
            </tr>
        )
    }
}

TicketTableRow.propTypes = {
    ticket: PropTypes.object.isRequired,
    view: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    toggleTicketSelection: PropTypes.func.isRequired,
    selected: PropTypes.bool.isRequired,
    saveIndex: PropTypes.func.isRequired
}
