import React, {PropTypes} from 'react'
import _pick from 'lodash/pick'
import classNames from 'classnames'
import {isTicketDifferent} from './../../../common/utils'
import shortcutManager from '../../../../common/utils/shortcutManager'
import keymap from '../../../../common/utils/keymap'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'
import {Button, UncontrolledTooltip} from 'reactstrap'

export default class TicketSubmitButtons extends React.Component {
    static defaultProps = {
        canSendMessage: true
    }

    shouldComponentUpdate(nextProps) {
        const {canSendMessage, ticket} = this.props
        return isTicketDifferent(ticket, nextProps.ticket) || canSendMessage !== nextProps.canSendMessage
    }

    submit = (status, next) => {
        const isSending = this.props.ticket.getIn(['_internal', 'loading', 'submitMessage'])

        this.props.submit(status, next)
        // we use `next` var to determine if the ticket is closed after send action
        if (!isSending) {
            logEvent('Sent message', {
                ticket: _pick(this.props.ticket.toJS(), ['id']),
                andClose: next
            })
        }
    }

    render() {
        const {canSendMessage} = this.props
        const ticketState = this.props.ticket.get('state')
        const disabled = !canSendMessage || !ticketState.get('dirty')
        const commonClasses = {
            'btn-loading': this.props.ticket.getIn(['_internal', 'loading', 'submitMessage']),
        }

        return (
            <div className="TicketSubmitButtons">
                <Button
                    id="submit-button"
                    color="primary"
                    className={classNames('mr-2', commonClasses)}
                    disabled={disabled}
                    tabIndex="4"
                    onClick={() => this.submit()}
                >
                    Send
                </Button>
                <UncontrolledTooltip
                    placement="top"
                    target="submit-button"
                    delay={0}
                >
                    {shortcutManager.getActionKeys(keymap.TicketDetailContainer.actions.SUBMIT_TICKET)}
                </UncontrolledTooltip>
                <Button
                    id="submit-and-close-button"
                    color="primary"
                    outline
                    className={classNames(commonClasses)}
                    disabled={disabled}
                    tabIndex="5"
                    onClick={() => this.submit('closed', true)}
                >
                    Send &amp; Close
                </Button>
                <UncontrolledTooltip
                    placement="top"
                    target="submit-and-close-button"
                    delay={0}
                >
                    {shortcutManager.getActionKeys(keymap.TicketDetailContainer.actions.SUBMIT_CLOSE_TICKET)}
                </UncontrolledTooltip>
            </div>
        )
    }
}

TicketSubmitButtons.propTypes = {
    ticket: PropTypes.object.isRequired,
    submit: PropTypes.func.isRequired,
    canSendMessage: PropTypes.bool.isRequired
}
