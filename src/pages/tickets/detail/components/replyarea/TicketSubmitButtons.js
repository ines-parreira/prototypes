import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {UncontrolledTooltip} from 'reactstrap'
import _sample from 'lodash/sample'

import shortcutManager from '../../../../../services/shortcutManager'
import keymap from '../../../../../config/shortcuts'

import * as currentUserActions from '../../../../../state/currentUser/actions'

import * as currentAccountSelectors from '../../../../../state/currentAccount/selectors'
import * as currentUserSelectors from '../../../../../state/currentUser/selectors'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'

import ConfirmButton from '../../../../common/components/ConfirmButton'

const TIPS = [
    <span>Press <kbd>→</kbd> (right arrow) to go to next ticket</span>,
    <span>Press <kbd>←</kbd> (left arrow) to go to previous ticket</span>,
    <span>Press <kbd>c</kbd> to close the ticket</span>,
    <span>Press <kbd>o</kbd> to open the ticket</span>,
    <span>Press <kbd>#</kbd> to delete the ticket</span>,
    <span>Press <kbd>r</kbd> to reply to the ticket</span>,
    <span>Press <kbd>m</kbd> to display macros</span>,
    'You can add attachments to macros',
    'Insert order info as variables in macros',
]

@connect((state) => {
    return {
        canSendMessage: currentAccountSelectors.isAccountActive(state) && newMessageSelectors.isReady(state),
        currentUserPreferences: currentUserSelectors.getPreferences(state),
        newMessage: state.newMessage,
        isHidingTips: currentUserSelectors.isHidingTips(state),
    }
}, {
    submitSetting: currentUserActions.submitSetting,
})
export default class TicketSubmitButtons extends React.Component {
    static propTypes = {
        canSendMessage: PropTypes.bool.isRequired,
        currentUserPreferences: PropTypes.object.isRequired,
        isHidingTips: PropTypes.bool.isRequired,
        newMessage: PropTypes.object.isRequired,
        submit: PropTypes.func.isRequired,
        submitSetting: PropTypes.func.isRequired,
        ticket: PropTypes.object.isRequired,
    }

    componentWillMount() {
        // pick a tip from list of tips on mount
        this.tip = _sample(TIPS)
    }

    submit = (status, next) => {
        const isSending = this.props.newMessage.getIn(['_internal', 'loading', 'submitMessage'])

        if (isSending) {
            return
        }

        this.props.submit(status, next)
    }

    _hideTips = () => {
        const {currentUserPreferences, submitSetting} = this.props
        const newPreferences = currentUserPreferences.setIn(['data', 'hide_tips'], true)
        return submitSetting(newPreferences.toJS())
    }

    render() {
        const {newMessage, canSendMessage, ticket, isHidingTips} = this.props
        const disabled = !canSendMessage
        const loading = newMessage.getIn(['_internal', 'loading', 'submitMessage'])

        const isUpdating = !!ticket.get('id')
        const hasTitle = !!ticket.get('subject')
        const titleConfirmation = 'Are you sure you want to create a ticket with no subject?'

        return (
            <div className="TicketSubmitButtons d-flex align-items-center justify-content-between">
                <div>
                    <ConfirmButton
                        id="submit-button"
                        type="submit"
                        className="mr-2"
                        color="primary"
                        disabled={disabled}
                        tabIndex="5"
                        skip={hasTitle || isUpdating}
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
                        tabIndex="6"
                        skip={hasTitle || isUpdating}
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

                {
                    !isHidingTips && (
                        <small className="pull-right text-faded hidden-sm-down">
                            <i className="fa fa-fw fa-info-circle mr-1" />
                            {this.tip}
                            <i
                                id="hide-helpers-button"
                                className="fa fa-fw fa-close cursor-pointer ml-1"
                                onClick={this._hideTips}
                            />
                            <UncontrolledTooltip
                                placement="top"
                                target="hide-helpers-button"
                                delay={0}
                            >
                                Permanently hide tips
                            </UncontrolledTooltip>
                        </small>
                    )
                }
            </div>
        )
    }
}
