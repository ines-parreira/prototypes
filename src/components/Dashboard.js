import React from 'react'
import TicketTable from './ticket/table/Table'

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            fields: ['id', 'Priority', 'Subject', 'Tags', 'Assignee', 'Last Updated'],
            tickets: [
                {
                    id: 1,
                    priority: 'high',
                    subject: 'I\'m getting billed for an account I thought I had...',
                    tag: ['Refund', 'Billing'],
                    assignee: 'Avi Davis',
                    updated_datetime: '2015-10-29'
                },
                {
                    id: 2,
                    priority: 'normal',
                    subject: 'Inviting friends to join',
                    tag: ['Referral'],
                    assignee: 'Avi Davis',
                    updated_datetime: '2015-11-01'
                },
                {
                    id: 3,
                    priority: 'normal',
                    subject: 'Different couse options',
                    tag: ['Help', 'Courses'],
                    assignee: null,
                    updated_datetime: '2015-11-01'
                }
            ]
        }
    }

    render() {
        return (
            <div className="">
                <h1 class="ui dividing header">My Tickets</h1>
                <TicketTable
                    fields={this.state.fields}
                    tickets={this.state.tickets}/>
            </div>
        )
    }
}
