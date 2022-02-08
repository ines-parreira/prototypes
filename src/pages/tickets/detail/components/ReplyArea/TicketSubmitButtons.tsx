import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import _sample from 'lodash/sample'
import classnames from 'classnames'
import {Map} from 'immutable'

import Button, {ButtonIntent} from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {RootState} from '../../../../../state/types'
import shortcutManager from '../../../../../services/shortcutManager'
import keymap from '../../../../../config/shortcuts'
import {isAccountActive} from '../../../../../state/currentAccount/selectors'
import {submitSetting} from '../../../../../state/currentUser/actions'
import {
    getPreferences,
    isHidingTips,
} from '../../../../../state/currentUser/selectors'
import {isReady} from '../../../../../state/newMessage/selectors'
import Tooltip from '../../../../common/components/Tooltip'
import {SubmitArgs} from '../../TicketDetailContainer'

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

type Props = {
    submit: (params: SubmitArgs) => void
    ticket: Map<any, any>
} & ConnectedProps<typeof connector>

export class TicketSubmitButtonsContainer extends Component<Props> {
    tip: JSX.Element | string | undefined

    componentWillMount() {
        // pick a tip from list of tips on mount
        this.tip = _sample(TIPS)
    }

    submit = (status?: string, next?: any) => {
        const isSending = this.props.newMessage.getIn([
            '_internal',
            'loading',
            'submitMessage',
        ])

        if (isSending) {
            return
        }

        this.props.submit({status, next})
    }

    hideTips = () => {
        const {currentUserPreferences, submitSetting} = this.props
        const newPreferences = currentUserPreferences.setIn(
            ['data', 'hide_tips'],
            true
        )
        return submitSetting(newPreferences.toJS(), false)
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
                    {hasTitle || isUpdating ? (
                        <Button
                            id="submit-button"
                            className="mr-2"
                            isDisabled={disabled}
                            tabIndex={5}
                            onClick={() => this.submit()}
                            isLoading={loading}
                        >
                            Send
                        </Button>
                    ) : (
                        <ConfirmButton
                            id="submit-button"
                            confirmationContent={titleConfirmation}
                            className="mr-2"
                            isDisabled={disabled}
                            tabIndex={5}
                            onConfirm={() => this.submit()}
                            isLoading={loading}
                        >
                            Send
                        </ConfirmButton>
                    )}
                    {!disabled && (
                        <Tooltip
                            placement="top"
                            target="submit-button"
                            offset="0, 4px"
                        >
                            {shortcutManager.getActionKeys(
                                keymap.TicketDetailContainer.actions
                                    .SUBMIT_TICKET
                            )}
                        </Tooltip>
                    )}
                    {hasTitle || isUpdating ? (
                        <Button
                            id="submit-and-close-button"
                            intent={ButtonIntent.Secondary}
                            isDisabled={disabled}
                            onClick={() => this.submit('closed', true)}
                            isLoading={loading}
                        >
                            Send &amp; Close
                        </Button>
                    ) : (
                        <ConfirmButton
                            id="submit-and-close-button"
                            confirmationContent={titleConfirmation}
                            intent={ButtonIntent.Secondary}
                            isDisabled={disabled}
                            onConfirm={() => this.submit('closed', true)}
                            isLoading={loading}
                        >
                            Send &amp; Close
                        </ConfirmButton>
                    )}
                    {!disabled && (
                        <Tooltip
                            placement="top"
                            target="submit-and-close-button"
                            offset="0, 4px"
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
                        <i className="material-icons md-1 mr-1 align-text-bottom">
                            info
                        </i>
                        {this.tip}
                        <i
                            id="hide-helpers-button"
                            className="material-icons md-1 cursor-pointer ml-1 mr-1 align-text-bottom"
                            onClick={this.hideTips}
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

const connector = connect(
    (state: RootState) => ({
        canSendMessage: isAccountActive(state) && isReady(state),
        currentUserPreferences: getPreferences(state),
        isHidingTips: isHidingTips(state),
        newMessage: state.newMessage,
    }),
    {
        submitSetting,
    }
)

export default connector(TicketSubmitButtonsContainer)
