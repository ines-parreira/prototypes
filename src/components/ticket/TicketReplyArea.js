import React, {PropTypes} from 'react'

import TicketReply from './TicketReply'
import TicketMacros from './TicketMacros'

export default class TicketReplyArea extends React.Component {
    render = () => {
        if (this.props.macros.get('show')) {
            return (
                <TicketMacros
                    items={this.props.macros.get('items')}
                    selected={this.props.macros.get('selected')}
                    applyMacro={this.props.applyMacro}
                    previewMacro={this.props.previewMacro}
                    />
            )
        }
        return (
            <TicketReply
                ticket={this.props.ticket}
                currentUser={this.props.currentUser}
                />
        )
    }
}

TicketReplyArea.propTypes = {
    ticket: PropTypes.object.isRequired,
    macros: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
    applyMacro: PropTypes.func.isRequired,
    previewMacro: PropTypes.func.isRequired,
}
