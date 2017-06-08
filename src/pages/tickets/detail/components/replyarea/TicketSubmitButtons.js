import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import _pick from 'lodash/pick'
import {UncontrolledTooltip} from 'reactstrap'

import shortcutManager from '../../../../common/utils/shortcutManager'
import keymap from '../../../../common/utils/keymap'
import {logEvent} from '../../../../../store/middlewares/amplitudeTracker'

import * as currentAccountSelectors from '../../../../../state/currentAccount/selectors'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'

import ConfirmButton from '../../../../common/components/ConfirmButton'

@connect((state) => {
    return {
        canSendMessage: currentAccountSelectors.isAccountActive(state),
        isNewMessageReady: newMessageSelectors.isReady(state),
        newMessage: state.newMessage,
    }
})
export default class TicketSubmitButtons extends React.Component {
    static propTypes = {
        ticket: PropTypes.object.isRequired,
        newMessage: PropTypes.object.isRequired,
        submit: PropTypes.func.isRequired,
        canSendMessage: PropTypes.bool.isRequired,
        isNewMessageReady: PropTypes.bool.isRequired,
    }

    static defaultProps = {
        canSendMessage: true,
        isNewMessageReady: false,
    }

    submit = (status, next) => {
        const isSending = this.props.newMessage.getIn(['_internal', 'loading', 'submitMessage'])

        // we use `next` var to determine if the ticket is closed after send action
        if (!isSending) {
            logEvent('Sent message', {
                ticket: _pick(this.props.ticket.toJS(), ['id', 'channel']),
                andClose: next,
            })
        }

        return this.props.submit(status, next)
    }

    render() {
        const {newMessage, isNewMessageReady, canSendMessage, ticket} = this.props
        const disabled = !canSendMessage || !isNewMessageReady
        const loading = newMessage.getIn(['_internal', 'loading', 'submitMessage'])

        const hasTitle = !!ticket.get('subject')
        const titleConfirmation = 'Are you sure you want to create a ticket with no subject?'

        return (
            <div className="TicketSubmitButtons">
                <ConfirmButton
                    id="submit-button"
                    type="submit"
                    className="mr-2"
                    color="primary"
                    disabled={disabled}
                    tabIndex="4"
                    skip={hasTitle}
                    confirm={() => this.submit()}
                    content={titleConfirmation}
                    loading={loading}
                >
                    Send
                </ConfirmButton>
                <UncontrolledTooltip
                    placement="top"
                    target="submit-button"
                    delay={0}
                >
                    {shortcutManager.getActionKeys(keymap.TicketDetailContainer.actions.SUBMIT_TICKET)}
                </UncontrolledTooltip>

                <ConfirmButton
                    id="submit-and-close-button"
                    type="submit"
                    color="primary"
                    outline
                    disabled={disabled}
                    tabIndex="5"
                    skip={hasTitle}
                    confirm={() => this.submit('closed', true)}
                    content={titleConfirmation}
                    loading={loading}
                >
                    Send &amp; Close
                </ConfirmButton>
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
