import React, {PropTypes} from 'react'


export default class TicketAssignee extends React.Component {
    componentDidMount() {
        const ticketOwnerDropdown = $(`#popup-ticket-owner-${this.props.suffix}`)

        ticketOwnerDropdown.dropdown({
            inline: true,
            position: 'bottom left',
            hoverable: true,
            onChange: (value, text) => {
                const agent = this.props.agents.find(curAgent => curAgent.get('name') === text)
                this.props.setAgent({id: agent.get('id'), name: agent.get('name')})
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
        const { currentAssignee, agents, suffix } = this.props
        return (
            <div
                id={`popup-ticket-owner-${suffix}`}
                className="ticket-owner-btn ticket-details-item ui search button input pointing dropdown link item"
            >
                {this.renderTicketOwner(currentAssignee)}

                <div className="ui vertical menu">
                    <div className="ui search input">
                          <input id="ticket-owner-input" type="text" placeholder="Search agents..."/>
                    </div>
                    {
                        agents.map((agent) =>
                            <div
                                className="item"
                                key={agent.get('id')}
                            >
                                {agent.get('name')}
                            </div>
                        )
                    }
                </div>
            </div>
        )
    }
}

TicketAssignee.propTypes = {
    currentAssignee: PropTypes.string, // not required because it can be null
    agents: PropTypes.object.isRequired,
    setAgent: PropTypes.func.isRequired,
    suffix: PropTypes.string.isRequired
}

