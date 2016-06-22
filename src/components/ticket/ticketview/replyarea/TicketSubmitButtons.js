import React, {PropTypes} from 'react'
import classNames from 'classnames'

export default class TicketSubmitButtons extends React.Component {
    render = () => {
        const subAndCloseClassName = classNames('ui', 'green', 'button', {hidden: this.props.ticket.get('status') === 'closed', loading: this.props.ticket.getIn(['state', 'loading'])})
        const subClassName = classNames('ui', 'basic', 'green', 'button', {disabled: !this.props.ticket.getIn(['state', 'dirty']), loading: this.props.ticket.getIn(['state', 'loading'])})
        return (
            <div className="TicketSubmitButtons">
                <button className={subAndCloseClassName} tabIndex="4" onClick={this.props.submit('closed', true)}>Send &amp; Close</button>
                <button className={subClassName} tabIndex="5" onClick={this.props.submit()}>Send</button>
            </div>
        )
    }
}

TicketSubmitButtons.propTypes = {
    ticket: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired
}
