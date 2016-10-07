import React, {PropTypes} from 'react'
import _ from 'lodash'
import classNames from 'classnames'
import {getModifier} from '../../../../../utils'
import {isTicketDifferent} from './../../../common/utils'

export default class TicketSubmitButtons extends React.Component {
    shouldComponentUpdate(nextProps) {
        return isTicketDifferent(this.props.ticket, nextProps.ticket)
    }

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
        // we use `next` var to determine if the ticket is closed after send action
        amplitude.getInstance().logEvent('Sent message', {
            ticket: _.pick(this.props.ticket.toJS(), ['id']),
            andClose: next
        })
    }

    render() {
        const ticketState = this.props.ticket.get('state')
        const commonClasses = ['ui', 'green', 'button', {
            loading: ticketState.get('loading'),
            disabled: !ticketState.get('dirty')
        }]
        return (
            <div className="TicketSubmitButtons">
                <button type="submit"
                    className={classNames(...commonClasses)}
                    tabIndex="4"
                    onClick={() => this.submit()}
                    data-html={`${getModifier()} + Enter`}
                >
                    Send
                </button>
                <button type="submit"
                    className={classNames(...commonClasses, 'inverted')}
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
