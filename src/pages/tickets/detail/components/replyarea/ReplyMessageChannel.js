import React, {PropTypes} from 'react'
import md5 from 'md5'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import {ticketSourceTypes} from '../../../../../utils'
import MessageSourceFields from './MessageSourceFields/'
import {guessReceiversFromTicket} from '../../../../../state/ticket/utils'
import * as newMessageActions from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getMessages} from '../../../../../state/ticket/selectors'
import * as integrationSelectors from '../../../../../state/integrations/selectors'

import SourceIcon from '../../../../common/components/SourceIcon'
import KeyboardShortcuts from '../../../../common/components/KeyboardShortcuts'

import css from './ReplyMessageChannel.less'

@connect((state) => {
    const ticket = state.ticket
    const sourceType = newMessageSelectors.getNewMessageType(state)
    return {
        accountChannels: integrationSelectors.getChannelsByType(sourceType)(state),
        channel: newMessageSelectors.getNewMessageChannel(state),
        hasRecipients: newMessageSelectors.hasNewMessageRecipients(state),
        isForward: newMessageSelectors.isForward(state),
        isNewMessagePublic: newMessageSelectors.isNewMessagePublic(state),
        isUpdate: !!ticket.get('id'),
        messages: getMessages(state),
        sourceType,
        ticket,
    }
}, {
    prepareNewMessage: newMessageActions.prepare,
})
export default class ReplyMessageChannel extends React.Component {
    static propTypes = {
        accountChannels: PropTypes.object.isRequired,
        channel: PropTypes.string.isRequired,
        hasRecipients: PropTypes.bool.isRequired,
        isForward: PropTypes.bool.isRequired,
        isNewMessagePublic: PropTypes.bool.isRequired,
        isUpdate: PropTypes.bool.isRequired,
        messages: PropTypes.object.isRequired,
        sourceType: PropTypes.string.isRequired,
        ticket: PropTypes.object.isRequired,
        prepareNewMessage: PropTypes.func.isRequired,
        className: PropTypes.string,
    }

    state = {
        isReceiversAreaOpen: false,
    }

    componentDidMount() {
        window.addEventListener('click', this._updateMessageSourceFieldsOpening)
    }

    componentWillUnmount() {
        window.removeEventListener('click', this._updateMessageSourceFieldsOpening)
    }

    _keymap = {
        FORWARD_REPLY: {
            action: (e) => {
                e.preventDefault()
                this.props.prepareNewMessage('email-forward')

                if (this._messageSourceFields) {
                    this._messageSourceFields.focusInput()
                }
            }
        },
        INTERNAL_NOTE_REPLY: {
            action: (e) => {
                e.preventDefault()
                this.props.prepareNewMessage('internal-note')
            }
        }
    }

    _canChangeReceivers = () => {
        return this.props.sourceType === 'email'
    }

    /**
     * Update the open status of the receivers dropdown (collapsed or open to edit its values)
     * @param e
     * @private
     */
    _updateMessageSourceFieldsOpening = (e) => {
        const {hasRecipients} = this.props

        // list of components on which the click does not change opening
        const ignoredComponentsRefs = ['channelPicker']

        // open recipients area only for emails
        if (this._canChangeReceivers()) {
            if (hasRecipients) {
                if (!e) {
                    return
                }

                // ignore click if clicked on ignored components (such as the channel picker dropdown)
                const shouldBeIgnored = ignoredComponentsRefs.some((id) => {
                    return !this.refs[id] || (this.refs[id] && this.refs[id].contains(e.target))
                })

                if (!shouldBeIgnored) {
                    const hasClickedInComponent = this.refs.messageChannel
                        && this.refs.messageChannel.contains(e.target)

                    this._toggleReceiversArea(hasClickedInComponent)
                }
            } else {
                this._toggleReceiversArea(true)
            }
        } else {
            this._toggleReceiversArea(false)
        }
    }

    _toggleReceiversArea = (state = !this.state.isReceiversAreaOpen) => {
        this.setState({isReceiversAreaOpen: state})
    }

    _renderReceiversArea = () => {
        const {ticket, messages, sourceType, isNewMessagePublic, accountChannels} = this.props

        if (!isNewMessagePublic) {
            return (
                <div className={classnames(css.sourceLabel, 'mt-1')}>
                    Internal note
                </div>
            )
        }

        // Here we add the hash of the source of the last message, because if the source changes, we want to trigger
        // the re-set of the receivers of the new message.
        const parentId = messages.isEmpty()
            ? 'new'
            : `${ticket.get('id', '')} - ${messages.last().get('id', '')} - ${md5(messages.last().get('source'))}`

        const disabledChannels = ['facebook-post', 'facebook-message', 'chat', 'api', 'facebook-messenger',
            'instagram-comment', 'instagram-media']

        const isInputEnabled =
            !disabledChannels.includes(this.props.sourceType)
            || !this.props.isUpdate

        return (
            <MessageSourceFields
                initialValues={guessReceiversFromTicket(ticket, sourceType, accountChannels)}
                enabled={isInputEnabled}
                parentId={parentId.toString()}
                canOpen={this._canChangeReceivers()}
                isOpen={this.state.isReceiversAreaOpen}
                inputRef={(ref) => this._messageSourceFields = ref}
            />
        )
    }

    render() {
        const {isUpdate, messages, prepareNewMessage, isForward, className} = this.props

        const sources = ticketSourceTypes(messages.toJS())

        if (isUpdate && messages.isEmpty()) {
            return null
        }

        const suggestChat = isUpdate && sources.includes('chat')
        const suggestFacebookComment = isUpdate && (sources.includes('facebook-post') || sources.includes('facebook-comment'))
        const suggestFacebookMessage = isUpdate && sources.includes('facebook-message')
        const suggestFacebookMessenger = isUpdate && sources.includes('facebook-messenger')
        const suggestInstagram = isUpdate && (sources.includes('instagram-media') || sources.includes('instagram-comment'))
        const suggestInternalNote = isUpdate
        const suggestForwardByEmail = isUpdate
        const iconLabel = isForward ? 'email-forward' : this.props.sourceType

        return (
            <div
                ref="messageChannel"
                className={classnames(css.component, className)}
            >
                <div
                    ref="channelPicker"
                    className="mt-1 mr-2"
                >
                    <UncontrolledDropdown>
                        <DropdownToggle
                            caret
                            color=""
                            type="button"
                            className={css.dropdownToggle}
                        >
                            <SourceIcon
                                type={iconLabel}
                                className="md-2"
                            />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem
                                type="button"
                                onClick={() => {
                                    prepareNewMessage('email')
                                }}
                            >
                                <SourceIcon type="email" />
                                Reply via email
                            </DropdownItem>
                            {
                                suggestForwardByEmail && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage('email-forward')
                                        }}
                                    >
                                        <SourceIcon type="email-forward" />
                                        Forward by email
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestChat && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage('chat')
                                        }}
                                    >
                                        <SourceIcon type="chat" />
                                        Reply via chat
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestFacebookComment && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage('facebook-comment')
                                        }}
                                    >
                                        <SourceIcon type="facebook-comment" />
                                        Reply via Facebook comment
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestFacebookMessenger && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage('facebook-messenger')
                                        }}
                                    >
                                        <SourceIcon type="facebook-messenger" />
                                        Reply via Messenger
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestFacebookMessage && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage('facebook-message')
                                        }}
                                    >
                                        <SourceIcon type="facebook-message" />
                                        Reply via Messenger
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestInstagram && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage('instagram-comment')
                                        }}
                                    >
                                        <SourceIcon type="instagram-comment" />
                                        Reply via Instagram
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestInternalNote && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage('internal-note')
                                        }}
                                    >
                                        <SourceIcon type="internal-note" />
                                        Leave an internal note
                                    </DropdownItem>
                                )
                            }
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>

                {this._renderReceiversArea()}

                <KeyboardShortcuts
                    name="TicketDetailContainer"
                    keymap={this._keymap}
                />
            </div>
        )
    }
}
