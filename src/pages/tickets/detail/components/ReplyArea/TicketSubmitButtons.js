import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import _sample from 'lodash/sample'
import classnames from 'classnames'

import shortcutManager from '../../../../../services/shortcutManager/index.ts'
import keymap from '../../../../../config/shortcuts.ts'

import {isAccountActive} from '../../../../../state/currentAccount/selectors.ts'
import {submitSetting} from '../../../../../state/currentUser/actions.ts'
import {
    getPreferences,
    isHidingTips,
} from '../../../../../state/currentUser/selectors.ts'
import {isReady} from '../../../../../state/newMessage/selectors.ts'

import Tooltip from '../../../../common/components/Tooltip.tsx'
import ConfirmButton from '../../../../common/components/ConfirmButton.tsx'

import css from './TicketSubmitButtons.less'

/* eslint-disable react/jsx-key */
const TIPS = [
    <span>
        Press <kbd>→</kbd> (right arrow) to go to next ticket
    </span>,
    <span>
        Press <kbd>←</kbd> (left arrow) to go to previous ticket
    </span>,
    <span>
        Press <kbd>c</kbd> to close the ticket
    </span>,
    <span>
        Press <kbd>o</kbd> to open the ticket
    </span>,
    <span>
        Press <kbd>#</kbd> to delete the ticket
    </span>,
    <span>
        Press <kbd>?</kbd> to display all keyboard shortcuts
    </span>,
    <span>
        Press <kbd>r</kbd> to reply to the ticket
    </span>,
    <span>
        Press <kbd>m</kbd> to display macros
    </span>,
    'You can add attachments to macros',
    'Insert order info as variables in macros',
]
/* eslint-enable */

export class TicketSubmitButtonsContainer extends React.Component {
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
        const isSending = this.props.newMessage.getIn([
            '_internal',
            'loading',
            'submitMessage',
        ])

        if (isSending) {
            return
        }

        this.props.submit(status, next)
    }

    _hideTips = () => {
        const {currentUserPreferences, submitSetting} = this.props
        const newPreferences = currentUserPreferences.setIn(
            ['data', 'hide_tips'],
            true
        )
        return submitSetting(newPreferences.toJS())
    }

    render() {
        const {newMessage, canSendMessage, ticket, isHidingTips} = this.props
        const disabled = !canSendMessage
        const loading = newMessage.getIn([
            '_internal',
            'loading',
            'submitMessage',
        ])

        const isUpdating = !!ticket.get('id')
        const hasTitle = !!ticket.get('subject')
        const titleConfirmation =
            'Are you sure you want to create a ticket with no subject?'

        return (
            <div
                className={classnames(
                    css.component,
                    'd-flex align-items-center justify-content-between'
                )}
            >
                <div>
                    <ConfirmButton
                        id="submit-button"
                        type="submit"
                        className="mr-2"
                        color="success"
                        disabled={disabled}
                        tabIndex="5"
                        skip={hasTitle || isUpdating}
                        confirm={() => this.submit()}
                        content={titleConfirmation}
                        loading={loading}
                    >
                        Send
                    </ConfirmButton>
                    {!disabled && (
                        <Tooltip placement="top" target="submit-button">
                            {shortcutManager.getActionKeys(
                                keymap.TicketDetailContainer.actions
                                    .SUBMIT_TICKET
                            )}
                        </Tooltip>
                    )}
                    <ConfirmButton
                        id="submit-and-close-button"
                        type="submit"
                        color="secondary"
                        disabled={disabled}
                        tabIndex="6"
                        skip={hasTitle || isUpdating}
                        confirm={() => this.submit('closed', true)}
                        content={titleConfirmation}
                        loading={loading}
                    >
                        Send &amp; Close
                    </ConfirmButton>
                    {!disabled && (
                        <Tooltip
                            placement="top"
                            target="submit-and-close-button"
                        >
                            {shortcutManager.getActionKeys(
                                keymap.TicketDetailContainer.actions
                                    .SUBMIT_CLOSE_TICKET
                            )}
                        </Tooltip>
                    )}
                </div>
                {!isHidingTips && (
                    <small className="text-faded d-none d-md-inline-block">
                        <i className="material-icons md-1 mr-1">info</i>
                        {this.tip}
                        <i
                            id="hide-helpers-button"
                            className="material-icons md-1 cursor-pointer ml-1"
                            onClick={this._hideTips}
                        >
                            close
                        </i>
                        <Tooltip placement="top" target="hide-helpers-button">
                            Permanently hide tips
                        </Tooltip>
                    </small>
                )}
            </div>
        )
    }
}

export default connect(
    (state) => {
        return {
            canSendMessage: isAccountActive(state) && isReady(state),
            currentUserPreferences: getPreferences(state),
            newMessage: state.newMessage,
            isHidingTips: isHidingTips(state),
        }
    },
    {
        submitSetting,
    }
)(TicketSubmitButtonsContainer)
