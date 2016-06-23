import React, {PropTypes} from 'react'


export default class TicketAssignee extends React.Component {
    componentDidMount() {
        const ticketOwnerDropdown = $(this.refs.popupTicketOwner)

        ticketOwnerDropdown.dropdown({
            inline: true,
            hoverable: true,
            onChange: (value) => {
                if (value !== 'clear') {
                    const agent = this.props.agents.find(curAgent => curAgent.get('id').toString() === value)
                    this.props.setAgent({id: agent.get('id'), name: agent.get('name')})
                } else {
                    this.props.setAgent(null)
                }
            }
        })
    }

    renderTicketOwner(currentAssignee) {
        if (currentAssignee) {
            return (
                <span>
                    <span className="agent-label ui medium yellow label">A</span>
                    <span className="secondary-action">{currentAssignee.toUpperCase()}</span>
                </span>
            )
        }

        return <span className="secondary-action">UNASSIGNED</span>
    }

    render() {
        const { currentAssignee, agents } = this.props

        let divider = null
        let clearItem = null

        if (currentAssignee) {
            divider = <div className="divider"></div>
            clearItem = <div className="item" data-value="clear">Clear assignee</div>
        }

        return (
            <div
                ref="popupTicketOwner"
                className="TicketAssignee ticket-owner-btn ticket-details-item ui search button input pointing dropdown link item"
                        onClick={() => this.refs.assigneeSearch.focus()}
            >
                {this.renderTicketOwner(currentAssignee)}

                <div className="ui vertical menu">
                    <div className="ui search input">
                        <input id="ticket-owner-input" ref="assigneeSearch" type="text" placeholder="Search agents..."/>
                    </div>
                    <div className="hidden item"></div>
                    {
                        agents.map((agent) =>
                            <div
                                className="item"
                                key={agent.get('id')}
                                data-value={agent.get('id')}
                            >
                                {agent.get('name')}
                            </div>
                        )
                    }

                    {divider}
                    {clearItem}
                </div>
            </div>
        )
    }
}

TicketAssignee.propTypes = {
    currentAssignee: PropTypes.string, // not required because it can be null
    agents: PropTypes.object.isRequired,
    setAgent: PropTypes.func.isRequired
}
