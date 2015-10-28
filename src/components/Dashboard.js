import React from 'react'
import TicketTable from './ticket/table/Table'


const Dashboard = React.createClass({
    getInitialState () {
        return {
            fields: [],
            tickets: []
        }
    },
    render() {
        return (
            <div className="Dashboard">
                <TicketTable
                    fields={this.state.fields}
                    tickets={this.state.tickets}/>
            </div>
        )
    }
})

export default Dashboard