import React, {Component} from 'react'
import classnames from 'classnames'
import md5 from 'md5'
import {connect, ConnectedProps} from 'react-redux'
import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import {RootState} from '../../../../../state/types'
import {KeymapActions} from '../../../../../services/shortcutManager/shortcutManager'
import {getChannelsByType} from '../../../../../state/integrations/selectors'
import {prepare} from '../../../../../state/newMessage/actions'
import * as newMessageSelectors from '../../../../../state/newMessage/selectors'
import {getMessages} from '../../../../../state/ticket/selectors'
import {guessReceiversFromTicket} from '../../../../../state/ticket/utils'
import KeyboardShortcuts from '../../../../common/components/KeyboardShortcuts'
import SourceIcon from '../../../../common/components/SourceIcon'
import {TicketMessageSourceType} from '../../../../../business/types/ticket'

import MultiSelectAsyncField from './MessageSourceFields/components/MultiSelectAsyncField/MultiSelectAsyncField.js'
import MessageSourceFields from './MessageSourceFields/MessageSourceFields.js'

import css from './ReplyMessageChannel.less'

const changeReceiversAllowedSourceTypes = [
    TicketMessageSourceType.Email,
    TicketMessageSourceType.Phone,
]

type OwnProps = {
    className?: string
}

type Props = OwnProps & ConnectedProps<typeof connector>

export class ReplyMessageChannelContainer extends Component<Props> {
    state = {
        isReceiversAreaOpen: false,
    }

    channelPickerRef: Maybe<HTMLDivElement>
    messageChannelRef: Maybe<HTMLDivElement>
    multiSelectAsyncFieldRef?: any //$TsFixMe: type this once MultiSelectAsyncField is also migrated to TS

    componentDidMount() {
        window.addEventListener('click', this.updateMessageSourceFieldsOpening)
    }

    componentWillUnmount() {
        window.removeEventListener(
            'click',
            this.updateMessageSourceFieldsOpening
        )
    }

    keymap: KeymapActions = {
        FORWARD_REPLY: {
            action: (e: Event) => {
                e.preventDefault()
                this.props.prepareNewMessage(
                    TicketMessageSourceType.EmailForward
                )

                if (this.multiSelectAsyncFieldRef) {
                    //eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
                    this.multiSelectAsyncFieldRef.focusInput()
                }
            },
            key: 'f',
        },
        INTERNAL_NOTE_REPLY: {
            action: (e) => {
                e.preventDefault()
                this.props.prepareNewMessage(
                    TicketMessageSourceType.InternalNote
                )
            },
            key: 'i',
        },
    }

    canChangeReceivers = () => {
        return changeReceiversAllowedSourceTypes.includes(this.props.sourceType)
    }

    /**
     * Update the open status of the receivers dropdown (collapsed or open to edit its values)
     */
    updateMessageSourceFieldsOpening = (e: Event) => {
        const {hasRecipients} = this.props

        // open recipients area only for emails
        if (this.canChangeReceivers()) {
            if (hasRecipients) {
                if (!e) {
                    return
                }

                // ignore click if clicked on ignored components (such as the channel picker dropdown)
                const shouldBeIgnored =
                    !this.channelPickerRef ||
                    (this.channelPickerRef &&
                        this.channelPickerRef.contains(e.target as Node))

                if (!shouldBeIgnored) {
                    const hasClickedInComponent =
                        this.messageChannelRef &&
                        this.messageChannelRef.contains(e.target as Node)

                    this.toggleReceiversArea(!!hasClickedInComponent)
                }
            } else {
                this.toggleReceiversArea(true)
            }
        } else {
            this.toggleReceiversArea(false)
        }
    }

    toggleReceiversArea = (state = !this.state.isReceiversAreaOpen) => {
        this.setState({isReceiversAreaOpen: state})
    }

    renderReceiversArea = () => {
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
            : `${ticket.get('id', '') as string} - ${
                  messages.last().get('id', '') as string
              } - ${md5(messages.last().get('source') as string)}`

        const disabledSources = [
            TicketMessageSourceType.Api,
            TicketMessageSourceType.Chat,
            TicketMessageSourceType.FacebookMessage,
            TicketMessageSourceType.FacebookMessenger,
            TicketMessageSourceType.FacebookPost,
            TicketMessageSourceType.FacebookMentionPost,
            TicketMessageSourceType.InstagramAdComment,
            TicketMessageSourceType.InstagramAdMedia,
            TicketMessageSourceType.InstagramComment,
            TicketMessageSourceType.InstagramMedia,
            TicketMessageSourceType.InstagramDirectMessage, // TODO(check if we need this)
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
                canOpen={this.canChangeReceivers()}
                isOpen={this.state.isReceiversAreaOpen}
                inputRef={(ref: typeof MultiSelectAsyncField) =>
                    (this.multiSelectAsyncFieldRef = ref)
                }
            />
        )
    }

    render() {
        const {prepareNewMessage, isForward, className, ticket} = this.props

        const isTicketExisting = !!ticket.get('id')
        const replyOptions = ticket.get('reply_options') as Map<any, any>

        const suggestEmail = !isTicketExisting || !!replyOptions.get('email')
        const suggestInternalNote = !!replyOptions.get('internal-note')
        const suggestChat = isTicketExisting && !!replyOptions.get('chat')
        const suggestFacebookComment =
            isTicketExisting && !!replyOptions.get('facebook-comment')
        const suggestFacebookMentionComment =
            isTicketExisting && !!replyOptions.get('facebook-mention-comment')
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
        const suggestYotpoReview =
            isTicketExisting &&
            !!replyOptions.get(TicketMessageSourceType.YotpoReview)
        const suggestForwardByEmail = isTicketExisting
        const iconLabel = isForward
            ? TicketMessageSourceType.EmailForward
            : this.props.sourceType

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
                                        prepareNewMessage(
                                            TicketMessageSourceType.Email
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={TicketMessageSourceType.Email}
                                    />
                                    Reply via email
                                </DropdownItem>
                            )}
                            {suggestForwardByEmail && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.EmailForward
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.EmailForward
                                        }
                                    />
                                    Forward by email
                                </DropdownItem>
                            )}
                            {suggestChat && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.Chat
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={TicketMessageSourceType.Chat}
                                    />
                                    Reply via chat
                                </DropdownItem>
                            )}
                            {suggestFacebookComment && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.FacebookComment
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.FacebookComment
                                        }
                                    />
                                    Reply via Facebook comment
                                </DropdownItem>
                            )}
                            {suggestFacebookMentionComment && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.FacebookMentionComment
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.FacebookMentionComment
                                        }
                                    />
                                    Reply via Facebook mention comment
                                </DropdownItem>
                            )}
                            {suggestFacebookReviewComment && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.FacebookReviewComment
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.FacebookReviewComment
                                        }
                                    />
                                    Reply via Facebook recommendations
                                </DropdownItem>
                            )}
                            {suggestFacebookMessenger && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.FacebookMessenger
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.FacebookMessenger
                                        }
                                    />
                                    Reply via Messenger
                                </DropdownItem>
                            )}
                            {suggestInstagramDM && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.InstagramDirectMessage
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.InstagramDirectMessage
                                        }
                                    />
                                    Reply via Instagram direct message
                                </DropdownItem>
                            )}
                            {suggestInstagram && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.InstagramComment
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.InstagramComment
                                        }
                                    />
                                    Reply via Instagram
                                </DropdownItem>
                            )}
                            {suggestInstagramAd && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.InstagramAdComment
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.InstagramAdComment
                                        }
                                    />
                                    Reply via Instagram
                                </DropdownItem>
                            )}
                            {suggestInstagramMention && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.InstagramMentionComment
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.InstagramMentionComment
                                        }
                                    />
                                    Reply via Instagram mention
                                </DropdownItem>
                            )}
                            {suggestYotpoReview && (
                                <DropdownItem
                                    type="button"
                                    onClick={() => {
                                        prepareNewMessage(
                                            TicketMessageSourceType.YotpoReview
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.YotpoReview
                                        }
                                    />
                                    Reply on Yotpo review
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
                                        prepareNewMessage(
                                            TicketMessageSourceType.InternalNote
                                        )
                                    }}
                                >
                                    <SourceIcon
                                        type={
                                            TicketMessageSourceType.InternalNote
                                        }
                                    />
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

                {this.renderReceiversArea()}

                <KeyboardShortcuts
                    name="TicketDetailContainer"
                    keymap={this.keymap}
                />
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => {
        const sourceType = newMessageSelectors.getNewMessageType(state)
        return {
            accountChannels: getChannelsByType(sourceType)(state),
            channel: newMessageSelectors.getNewMessageChannel(state),
            hasRecipients: newMessageSelectors.hasNewMessageRecipients(state),
            isForward: newMessageSelectors.isForward(state),
            isNewMessagePublic: newMessageSelectors.isNewMessagePublic(state),
            messages: getMessages(state),
            sourceType,
            ticket: state.ticket,
        }
    },
    {
        prepareNewMessage: prepare,
    }
)

export default connector(ReplyMessageChannelContainer)
