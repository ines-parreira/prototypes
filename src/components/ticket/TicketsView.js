import React, {PropTypes} from 'react'
import TicketTable from './TicketTable'
import Search from '../Search'

export default class TicketsView extends React.Component {
    render() {
        if (!this.props.tickets.size) {
            return null
        }

        const tickets = this.props.tickets.toJS()

        return (
            <div className="TicketsView">
                <div className="ui text menu">
                    <a className="ui dropdown item">
                        <i className="columns icon"/>
                        Show more fields

                        <div className="menu">
                            <div className="item">
                                <div className="ui checkbox">
                                    <label>
                                        <input type="checkbox"/>
                                        Ticket: Last updated date
                                    </label>
                                </div>
                            </div>
                            <div className="item">
                                <div className="ui checkbox">
                                    <label>
                                        <input type="checkbox" />
                                        Ticket: Checked
                                    </label>
                                </div>
                            </div>
                        </div>
                    </a>
                    <div className="right menu item">
                        <div className="item">
                            <Search />
                        </div>
                    </div>
                </div>

                <h1 className="ui header">{tickets.meta.view.name}</h1>
                <TicketTable
                    tickets={tickets.data}
                    pushState={this.props.pushState}
                />
            </div>
        )
    }
}

TicketsView.propTypes = {
    tickets: PropTypes.shape({
        meta: PropTypes.object.isRequired,
        data: PropTypes.array.isRequired
    }).isRequired,
    pushState: PropTypes.func.isRequired
}
