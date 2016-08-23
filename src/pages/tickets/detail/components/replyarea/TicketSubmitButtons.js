import React, {PropTypes} from 'react'
import classNames from 'classnames'
import {getModifier} from '../../../../../utils'

export default class TicketSubmitButtons extends React.Component {
    componentDidMount() {
        const settings = {
            variation: 'tiny inverted',
            position: 'bottom center',
            delay: 200
        }
        $('.TicketSubmitButtons button').popup(settings)
    }

    submit = (status, next) => {
        $('.TicketSubmitButtons button').popup('hide')
        this.props.submit(status, next)
    }

    render() {
        const ticketState = this.props.ticket.get('state')
        const commonClasses = ['ui', 'green', 'button', {
            loading: ticketState.get('loading'),
            disabled: !ticketState.get('dirty')
        }]
        return (
            <div className="TicketSubmitButtons">
                <button
                    className={classNames(...commonClasses)}
                    tabIndex="4"
                    onClick={() => this.submit()}
                    data-html={`${getModifier()} + Enter`}
                >
                    Send
                </button>
                <button
                    className={classNames(...commonClasses, 'basic')}
                    tabIndex="5"
                    onClick={() => this.submit('closed', true)}
                    data-html={`${getModifier()} + Shift + Enter`}
                >
                    Send &amp; Close
                </button>
            </div>
        )
    }
}

TicketSubmitButtons.propTypes = {
    ticket: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired
}
