import React, {PropTypes} from 'react'
import classNames from 'classnames'

export default class TicketSubmitButtons extends React.Component {
    render = () => {
        const className = classNames('ui', 'green', 'button', {hidden: this.props.ticket.get('status') === 'closed'})
        return (
            <div>
                <button className={className} onClick={this.props.submit('closed', true)}>Submit &amp; Close</button>
                <button className="ui basic green button" onClick={this.props.submit()}>Submit</button>
            </div>
        )
    }
}

TicketSubmitButtons.propTypes = {
    ticket: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired
}
