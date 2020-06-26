import classnames from 'classnames'
import md5 from 'md5'
import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from 'reactstrap'

import * as integrationSelectors from '../../../../../state/integrations/selectors'
import * as newMessageActions from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getMessages} from '../../../../../state/ticket/selectors'
import {guessReceiversFromTicket} from '../../../../../state/ticket/utils'
import KeyboardShortcuts from '../../../../common/components/KeyboardShortcuts'
import SourceIcon from '../../../../common/components/SourceIcon'

import {
    API_SOURCE,
    CHAT_SOURCE,
    EMAIL_FORWARD_SOURCE,
    EMAIL_SOURCE,
    FACEBOOK_COMMENT_SOURCE,
    FACEBOOK_MESSAGE_SOURCE,
    FACEBOOK_MESSENGER_SOURCE,
    FACEBOOK_POST_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_AD_MEDIA_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
    INSTAGRAM_MEDIA_SOURCE,
    INTERNAL_NOTE_SOURCE
} from '../../../../../config/ticket'

import MessageSourceFields from './MessageSourceFields/'
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

    channelPickerRef: ?HTMLDivElement
    messageChannelRef: ?HTMLDivElement

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
        const ignoredComponentsRefs = ['channelPickerRef']

        // open recipients area only for emails
        if (this._canChangeReceivers()) {
            if (hasRecipients) {
                if (!e) {
                    return
                }

                // ignore click if clicked on ignored components (such as the channel picker dropdown)
                const shouldBeIgnored = ignoredComponentsRefs.some((id) => {
                    return !this[id] || (this[id] && this[id].contains(e.target))
                })

                if (!shouldBeIgnored) {
                    const hasClickedInComponent = this.messageChannelRef
                        && this.messageChannelRef.contains(e.target)

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

        const disabledSources = [
            API_SOURCE, CHAT_SOURCE, FACEBOOK_MESSAGE_SOURCE, FACEBOOK_MESSENGER_SOURCE, FACEBOOK_POST_SOURCE,
            INSTAGRAM_AD_COMMENT_SOURCE, INSTAGRAM_AD_MEDIA_SOURCE, INSTAGRAM_COMMENT_SOURCE, INSTAGRAM_MEDIA_SOURCE,
        ]

        const isInputEnabled =
            !disabledSources.includes(this.props.sourceType)
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
        const {isUpdate, messages, prepareNewMessage, isForward, className, ticket} = this.props

        if (isUpdate && messages.isEmpty()) {
            return null
        }

        const replyOptions = ticket.get('reply_options')

        const suggestEmail = !isUpdate || !!replyOptions.get('email')
        const suggestChat = isUpdate && !!replyOptions.get('chat')
        const suggestFacebookComment = isUpdate && !!replyOptions.get('facebook-comment')
        const suggestFacebookMessenger = isUpdate && !!replyOptions.get('facebook-messenger')
        const suggestInstagram = isUpdate && !!replyOptions.get('instagram-comment')
        const suggestInstagramAd = isUpdate && !!replyOptions.get('instagram-ad-comment')
        const suggestInternalNote = isUpdate && !!replyOptions.get('internal-note')
        const suggestForwardByEmail = isUpdate
        const iconLabel = isForward ? 'email-forward' : this.props.sourceType

        return (
            <div
                ref={(ref) => this.messageChannelRef = ref}
                className={classnames(css.component, className)}
            >
                <div
                    ref={(ref) => this.channelPickerRef = ref}
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
                            {
                                suggestEmail && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage(EMAIL_SOURCE)
                                        }}
                                    >
                                        <SourceIcon type={EMAIL_SOURCE} />
                                        Reply via email
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestForwardByEmail && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage(EMAIL_FORWARD_SOURCE)
                                        }}
                                    >
                                        <SourceIcon type={EMAIL_FORWARD_SOURCE} />
                                        Forward by email
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestChat && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage(CHAT_SOURCE)
                                        }}
                                    >
                                        <SourceIcon type={CHAT_SOURCE} />
                                        Reply via chat
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestFacebookComment && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage(FACEBOOK_COMMENT_SOURCE)
                                        }}
                                    >
                                        <SourceIcon type={FACEBOOK_COMMENT_SOURCE} />
                                        Reply via Facebook comment
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestFacebookMessenger && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage(FACEBOOK_MESSENGER_SOURCE)
                                        }}
                                    >
                                        <SourceIcon type={FACEBOOK_MESSENGER_SOURCE} />
                                        Reply via Messenger
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestInstagram && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage(INSTAGRAM_COMMENT_SOURCE)
                                        }}
                                    >
                                        <SourceIcon type={INSTAGRAM_COMMENT_SOURCE} />
                                        Reply via Instagram
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestInstagramAd && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage(INSTAGRAM_AD_COMMENT_SOURCE)
                                        }}
                                    >
                                        <SourceIcon type={INSTAGRAM_AD_COMMENT_SOURCE} />
                                        Reply via Instagram
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestInternalNote && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            prepareNewMessage(INTERNAL_NOTE_SOURCE)
                                        }}
                                    >
                                        <SourceIcon type={INTERNAL_NOTE_SOURCE} />
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
