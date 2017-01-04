import React, {PropTypes} from 'react'
import _pick from 'lodash/pick'
import classNames from 'classnames'
import {isTicketDifferent} from './../../../common/utils'
import shortcutManager from '../../../../common/utils/shortcutManager'
import keymap from '../../../../common/utils/keymap'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'

export default class TicketSubmitButtons extends React.Component {
    static defaultProps = {
        canSendMessage: true
    }

    shouldComponentUpdate(nextProps) {
        const {canSendMessage, ticket} = this.props
        return isTicketDifferent(ticket, nextProps.ticket) || canSendMessage !== nextProps.canSendMessage
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
        logEvent('Sent message', {
            ticket: _pick(this.props.ticket.toJS(), ['id']),
            andClose: next
        })
    }

    render() {
        const {canSendMessage} = this.props
        const ticketState = this.props.ticket.get('state')
        const commonClasses = ['ui', 'green', 'button', {
            loading: this.props.ticket.getIn(['_internal', 'loading', 'submitMessage']),
            disabled: !canSendMessage || !ticketState.get('dirty')
        }]

        return (
            <div className="TicketSubmitButtons">
                <button
                    type="submit"
                    className={classNames(...commonClasses)}
                    tabIndex="4"
                    onClick={() => this.submit()}
                    data-html={shortcutManager.getActionKeys(keymap.TicketDetailContainer.actions.SUBMIT_TICKET)}
                >
                    Send
                </button>
                <button
                    type="submit"
                    className={classNames(...commonClasses, 'basic')}
                    tabIndex="5"
                    onClick={() => this.submit('closed', true)}
                    data-html={shortcutManager.getActionKeys(keymap.TicketDetailContainer.actions.SUBMIT_CLOSE_TICKET)}
                >
                    Send &amp; Close
                </button>
            </div>
        )
    }
}

TicketSubmitButtons.propTypes = {
    ticket: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    canSendMessage: PropTypes.bool.isRequired
}
