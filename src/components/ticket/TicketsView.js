import React, {PropTypes} from 'react'
import TicketTable from './TicketTable'
import Search from '../Search'

export default class TicketsView extends React.Component {
    render() {
        return (
            <div className="TicketsView">
                <div className="ui secondary menu">
                    <a className="active item">
                        <i className="columns icon"/> Show more fields
                    </a>
                    <div className="right menu">
                        <div className="item">
                            <Search />
                        </div>
                    </div>
                </div>

                <h1 className="ui header">{this.props.title}</h1>
                <TicketTable
                    tickets={this.props.tickets}
                    pushState={this.props.pushState}
                />
            </div>
        )
    }
}

TicketsView.propTypes = {
    title: PropTypes.string.isRequired,
    tickets: PropTypes.object.isRequired,
    pushState: PropTypes.func.isRequired
}
