import React, {PropTypes} from 'react'
import moment from 'moment'
import 'moment-timezone'
import TicketTableRow from './TicketTableRow'

export default class TicketTable extends React.Component {
    render() {
        const {currentUser, tickets, pushState} = this.props

        return (
            <table className="ui single line very basic selectable table">
                <thead>
                <tr>
                    <th className="one wide">
                        <span className="ui checkbox">
                            <input type="checkbox"/>
                            <label></label>
                        </span>
                    </th>
                    <th className="ten wide">Ticket Details</th>
                    <th className="three wide">Created <i className="sort icon"></i></th>
                    <th className="two wide">Channel <i className="sort icon"></i></th>
                </tr>
                </thead>
                <tbody>
                {tickets.map((ticket) => {
                    return <TicketTableRow ticket={ticket} currentUser={currentUser} pushState={pushState} />
                })}
                </tbody>
            </table>
        )
    }
}

TicketTable.propTypes = {
    tickets: PropTypes.array.isRequired,
    currentUser: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired
}
