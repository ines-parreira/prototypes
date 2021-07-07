import classnames from 'classnames'
import md5 from 'md5'
import PropTypes from 'prop-types'
import React from 'react'
import {connect} from 'react-redux'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import {getChannelsByType} from '../../../../../state/integrations/selectors.ts'
import {prepare} from '../../../../../state/newMessage/actions.ts'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors.ts'
import {getMessages} from '../../../../../state/ticket/selectors.ts'
import {guessReceiversFromTicket} from '../../../../../state/ticket/utils'
import KeyboardShortcuts from '../../../../common/components/KeyboardShortcuts.tsx'
import SourceIcon from '../../../../common/components/SourceIcon.tsx'
import {TicketMessageSourceType} from '../../../../../business/types/ticket.ts'
import {
    API_SOURCE,
    CHAT_SOURCE,
    EMAIL_FORWARD_SOURCE,
    EMAIL_SOURCE,
    FACEBOOK_COMMENT_SOURCE,
    FACEBOOK_MESSAGE_SOURCE,
    FACEBOOK_MESSENGER_SOURCE,
    FACEBOOK_POST_SOURCE,
    FACEBOOK_MENTION_POST_SOURCE,
    FACEBOOK_MENTION_COMMENT_SOURCE,
    INSTAGRAM_AD_COMMENT_SOURCE,
    INSTAGRAM_AD_MEDIA_SOURCE,
    INSTAGRAM_COMMENT_SOURCE,
    INSTAGRAM_MEDIA_SOURCE,
    INSTAGRAM_DM_SOURCE,
    INTERNAL_NOTE_SOURCE,
    FACEBOOK_REVIEW_COMMENT_SOURCE,
    INSTAGRAM_MENTION_COMMENT_SOURCE,
} from '../../../../../config/ticket.ts'

import MessageSourceFields from './MessageSourceFields/'

import css from './ReplyMessageChannel.less'

const changeReceiversAllowedSourceTypes = [
    TicketMessageSourceType.Email,
    TicketMessageSourceType.Phone,
]

export class ReplyMessageChannelContainer extends React.Component {
    static propTypes = {
        accountChannels: PropTypes.object.isRequired,
        channel: PropTypes.string.isRequired,
        hasRecipients: PropTypes.bool.isRequired,
        isForward: PropTypes.bool.isRequired,
        isNewMessagePublic: PropTypes.bool.isRequired,
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
        window.removeEventListener(
            'click',
            this._updateMessageSourceFieldsOpening
        )
    }

    _keymap = {
        FORWARD_REPLY: {
            action: (e) => {
                e.preventDefault()
                this.props.prepareNewMessage('email-forward')

                if (this._messageSourceFields) {
                    this._messageSourceFields.focusInput()
                }
            },
        },
        INTERNAL_NOTE_REPLY: {
            action: (e) => {
                e.preventDefault()
                this.props.prepareNewMessage('internal-note')
            },
        },
    }

    _canChangeReceivers = () => {
        return changeReceiversAllowedSourceTypes.includes(this.props.sourceType)
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
                    return (
                        !this[id] || (this[id] && this[id].contains(e.target))
                    )
                })

                if (!shouldBeIgnored) {
                    const hasClickedInComponent =
                        this.messageChannelRef &&
                        this.messageChannelRef.contains(e.target)

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
        const {
            ticket,
            messages,
            sourceType,
            isNewMessagePublic,
            accountChannels,
        } = this.props

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
            : `${ticket.get('id', '')} - ${messages
                  .last()
                  .get('id', '')} - ${md5(messages.last().get('source'))}`

        const disabledSources = [
            API_SOURCE,
            CHAT_SOURCE,
            FACEBOOK_MESSAGE_SOURCE,
            FACEBOOK_MESSENGER_SOURCE,
            FACEBOOK_POST_SOURCE,
            FACEBOOK_MENTION_POST_SOURCE,
            FACEBOOK_MENTION_COMMENT_SOURCE,
            INSTAGRAM_AD_COMMENT_SOURCE,
            INSTAGRAM_AD_MEDIA_SOURCE,
            INSTAGRAM_COMMENT_SOURCE,
            INSTAGRAM_MEDIA_SOURCE,
            INSTAGRAM_DM_SOURCE, // TODO(check if we need this)
        ]

        const isInputEnabled =
            !disabledSources.includes(this.props.sourceType) ||
            !this.props.ticket.get('id')

        return (
            <MessageSourceFields
                initialValues={guessReceiversFromTicket(
                    ticket,
                    sourceType,
                    accountChannels
                )}
                enabled={isInputEnabled}
                parentId={parentId.toString()}
                canOpen={this._canChangeReceivers()}
                isOpen={this.state.isReceiversAreaOpen}
                inputRef={(ref) => (this._messageSourceFields = ref)}
            />
        )
    }

    render() {
        const {prepareNewMessage, isForward, className, ticket} = this.props

        const isTicketExisting = !!ticket.get('id')
        const replyOptions = ticket.get('reply_options')

        const suggestEmail = !isTicketExisting || !!replyOptions.get('email')
        const suggestInternalNote = !!replyOptions.get('internal-note')
        const suggestChat = isTicketExisting && !!replyOptions.get('chat')
        const suggestFacebookComment =
            isTicketExisting && !!replyOptions.get('facebook-comment')
        const suggestFacebookReviewComment =
            isTicketExisting && !!replyOptions.get('facebook-review-comment')
        const suggestFacebookMessenger =
            isTicketExisting && !!replyOptions.get('facebook-messenger')
        const suggestInstagram =
            isTicketExisting && !!replyOptions.get('instagram-comment')
        const suggestInstagramAd =
            isTicketExisting && !!replyOptions.get('instagram-ad-comment')
        const suggestInstagramDM =
            isTicketExisting && !!replyOptions.get('instagram-direct-message')
        const suggestInstagramMention =
            isTicketExisting && !!replyOptions.get('instagram-mention-comment')
        const suggestTwitterTweet =
            isTicketExisting &&
            !!replyOptions.get(TicketMessageSourceType.TwitterTweet)
        const suggestPhone =
            isTicketExisting &&
            !!replyOptions.get(TicketMessageSourceType.Phone)
        const suggestForwardByEmail = isTicketExisting
        const iconLabel = isForward ? 'email-forward' : this.props.sourceType

        return (
            <div
                ref={(ref) => (this.messageChannelRef = ref)}
                className={classnames(css.component, className)}
            >
                <div
                    ref={(ref) => (this.channelPickerRef = ref)}
                    className="mt-1 mr-2"
                >
                    <UncontrolledDropdown>
                        <DropdownToggle
                            caret
                            color=""
                            type="button"
                            className={css.dropdownToggle}
                        >
                            <SourceIcon type={iconLabel} className="md-2" />
                        </DropdownToggle>
                        <DropdownMenu>
                            {suggestEmail && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(EMAIL_SOURCE)
                                    }}
                                >
                                    <SourceIcon type={EMAIL_SOURCE} />
                                    Reply via email
                                </DropdownItem>
                            )}
                            {suggestForwardByEmail && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(EMAIL_FORWARD_SOURCE)
                                    }}
                                >
                                    <SourceIcon type={EMAIL_FORWARD_SOURCE} />
                                    Forward by email
                                </DropdownItem>
                            )}
                            {suggestChat && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(CHAT_SOURCE)
                                    }}
                                >
                                    <SourceIcon type={CHAT_SOURCE} />
                                    Reply via chat
                                </DropdownItem>
                            )}
                            {suggestFacebookComment && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            FACEBOOK_COMMENT_SOURCE
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={FACEBOOK_COMMENT_SOURCE}
                                    />
                                    Reply via Facebook comment
                                </DropdownItem>
                            )}
                            {suggestFacebookReviewComment && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            FACEBOOK_REVIEW_COMMENT_SOURCE
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={FACEBOOK_REVIEW_COMMENT_SOURCE}
                                    />
                                    Reply via Facebook recommendations
                                </DropdownItem>
                            )}
                            {suggestFacebookMessenger && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            FACEBOOK_MESSENGER_SOURCE
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={FACEBOOK_MESSENGER_SOURCE}
                                    />
                                    Reply via Messenger
                                </DropdownItem>
                            )}
                            {suggestInstagramDM && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(INSTAGRAM_DM_SOURCE)
                                    }}
                                >
                                    <SourceIcon type={INSTAGRAM_DM_SOURCE} />
                                    Reply via Instagram direct message
                                </DropdownItem>
                            )}
                            {suggestInstagram && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            INSTAGRAM_COMMENT_SOURCE
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={INSTAGRAM_COMMENT_SOURCE}
                                    />
                                    Reply via Instagram
                                </DropdownItem>
                            )}
                            {suggestInstagramAd && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            INSTAGRAM_AD_COMMENT_SOURCE
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={INSTAGRAM_AD_COMMENT_SOURCE}
                                    />
                                    Reply via Instagram
                                </DropdownItem>
                            )}
                            {suggestInstagramMention && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            INSTAGRAM_MENTION_COMMENT_SOURCE
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={INSTAGRAM_MENTION_COMMENT_SOURCE}
                                    />
                                    Reply via Instagram mention
                                </DropdownItem>
                            )}
                            {suggestTwitterTweet && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.TwitterTweet
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.TwitterTweet
                                        }
                                    />
                                    Reply via Twitter tweet
                                </DropdownItem>
                            )}
                            {suggestInternalNote && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(INTERNAL_NOTE_SOURCE)
                                    }}
                                >
                                    <SourceIcon type={INTERNAL_NOTE_SOURCE} />
                                    Leave an internal note
                                </DropdownItem>
                            )}
                            {suggestPhone && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.Phone
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={TicketMessageSourceType.Phone}
                                    />
                                    Make outbound call
                                </DropdownItem>
                            )}
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

const connector = connect(
    (state) => {
        const ticket = state.ticket
        const sourceType = newMessageSelectors.getNewMessageType(state)
        return {
            accountChannels: getChannelsByType(sourceType)(state),
            channel: newMessageSelectors.getNewMessageChannel(state),
            hasRecipients: newMessageSelectors.hasNewMessageRecipients(state),
            isForward: newMessageSelectors.isForward(state),
            isNewMessagePublic: newMessageSelectors.isNewMessagePublic(state),
            messages: getMessages(state),
            sourceType,
            ticket,
        }
    },
    {
        prepareNewMessage: prepare,
    }
)

export default connector(ReplyMessageChannelContainer)
