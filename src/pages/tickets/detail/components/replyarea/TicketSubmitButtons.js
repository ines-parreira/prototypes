import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import _pick from 'lodash/pick'
import classNames from 'classnames'
import {Button, UncontrolledTooltip} from 'reactstrap'
import moment from 'moment'

import {hasReachedLimit} from '../../../../../utils'
import shortcutManager from '../../../../common/utils/shortcutManager'
import keymap from '../../../../common/utils/keymap'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'

import * as ticketSelectors from '../../../../../state/ticket/selectors'

@connect((state) => {
    const {currentAccount, billing} = state
    const isAccountActive = currentAccount.get('deactivated_datetime') === null
    const hasCreditCard = currentAccount.getIn(['meta', 'hasCreditCard'])
    const plan = billing.get('plan')
    const tickets = billing.getIn(['currentUsage', 'data', 'tickets'], 0)
    const hasReachedMaxLimit = hasReachedLimit('max', tickets, plan, currentAccount.get('created_datetime', moment()))

    return {
        canSendMessage: isAccountActive && (hasCreditCard || !hasReachedMaxLimit),
        isTicketDirty: ticketSelectors.isDirty(state),
        newMessage: state.newMessage,
    }
})
export default class TicketSubmitButtons extends React.Component {
    static propTypes = {
        ticket: PropTypes.object.isRequired,
        newMessage: PropTypes.object.isRequired,
        submit: PropTypes.func.isRequired,
        canSendMessage: PropTypes.bool.isRequired,
        isTicketDirty: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        canSendMessage: true,
        isTicketDirty: false,
    }

    submit = (status, next) => {
        const isSending = this.props.newMessage.getIn(['_internal', 'loading', 'submitMessage'])

        this.props.submit(status, next)
        // we use `next` var to determine if the ticket is closed after send action
        if (!isSending) {
            logEvent('Sent message', {
                ticket: _pick(this.props.ticket.toJS(), ['id', 'channel']),
                andClose: next,
            })
        }
    }

    render() {
        const {newMessage, isTicketDirty, canSendMessage} = this.props
        const disabled = !canSendMessage || !isTicketDirty
        const commonClasses = {
            'btn-loading': newMessage.getIn(['_internal', 'loading', 'submitMessage']),
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
