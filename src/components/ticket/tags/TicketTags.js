import React, { PropTypes } from 'react'
import Read from './Read'
import Edit from './Edit'


export default class TicketTags extends React.Component {
    constructor() {
        super()
        this.state = {
            edit: false
        }
    }
    toggle = () => {
        this.setState({
            edit: !this.state.edit
        })
    }
    render = () => {
        const { tags, ticketTags, actions } = this.props
        return (
            <div className="ui labels">
                <Read
                    ticketTags={ticketTags}
                    actions={actions}
                    hidden={this.state.edit}
                    toggle={this.toggle}
                />
                <Edit
                    tags={tags}
                    ticketTags={ticketTags}
                    actions={actions}
                    hidden={!this.state.edit}
                    toggle={this.toggle}
                />
            </div>
        )
    }
}


TicketTags.propTypes = {
    tags: PropTypes.array.isRequired,
    ticketTags: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}
