import React, {PropTypes} from 'react'

import TicketReply from './TicketReply'
import TicketMacros from './TicketMacros'
import classNames from 'classnames'

export default class TicketSubmitButtons extends React.Component {
    render = () => {
        const className = classNames('ui', 'green', 'button', {hidden: this.props.ticket.get('status') === 'closed'})
        return (
            <div>
                <button className={className} onClick={this.props.submit('closed')}>Send &amp; Close</button>
                <button className="ui button" onClick={this.props.submit()}>Send</button>
            </div>
        )
    }
}

TicketSubmitButtons.propTypes = {
    ticket: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
}
