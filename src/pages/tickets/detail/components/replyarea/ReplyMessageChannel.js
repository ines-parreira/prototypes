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

import {sourceTypeToIcon} from './../../../../../config/ticket'

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
                    return !this.refs[id] || (this.refs[id] && $(this.refs[id])[0].contains(e.target))
                })

                if (!shouldBeIgnored) {
                    const hasClickedInComponent = this.refs.messageChannel
                        && $(this.refs.messageChannel)[0].contains(e.target)

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
                <div className="message-source-fields">
                    <div className="message-source-field">
                        <span className="receivers-list">
                            Internal note
                        </span>
                    </div>
                </div>
            )
        }

        // Here we add the hash of the source of the last message, because if the source changes, we want to trigger
        // the re-set of the receivers of the new message.
        const parentId = messages.isEmpty()
            ? 'new'
            : `${ticket.get('id', '')} - ${messages.last().get('id', '')} - ${md5(messages.last().get('source'))}`

        const disabledChannels = ['facebook-post', 'facebook-message', 'chat', 'api', 'facebook-messenger']

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
            />
        )
    }

    render() {
        const {isUpdate, messages, prepareNewMessage, isForward} = this.props

        const sources = ticketSourceTypes(messages.toJS())

        if (isUpdate && messages.isEmpty()) {
            return null
        }

        const suggestChat = isUpdate && sources.includes('chat')
        const suggestFacebookComment = isUpdate && (sources.includes('facebook-post') || sources.includes('facebook-comment'))
        const suggestFacebookMessage = isUpdate && sources.includes('facebook-message')
        const suggestFacebookMessenger = isUpdate && sources.includes('facebook-messenger')
        const suggestInternalNote = isUpdate
        const suggestForwardByEmail = isUpdate
        const iconLabel = isForward ? 'email-forward' : this.props.sourceType

        return (
            <div
                ref="messageChannel"
                className="ReplyMessageChannel open"
            >
                <div
                    ref="channelPicker"
                    className={classnames('channel-picker', css['channel-dropdown'])}
                >
                    <UncontrolledDropdown>
                        <DropdownToggle
                            caret
                            type="button"
                            className={css['dropdown-toggle']}
                        >
                            <i className={sourceTypeToIcon(iconLabel)} />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem
                                type="button"
                                onClick={() => {
                                    prepareNewMessage('email')
                                }}
                            >
                                <i className={classnames('mr-2', sourceTypeToIcon('email'))} />
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
                                        <i className={classnames('mr-2', sourceTypeToIcon('email-forward'))} />
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
                                        <i className={classnames('mr-2', sourceTypeToIcon('chat'))} />
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
                                        <i className={classnames('mr-2', sourceTypeToIcon('facebook-comment'))} />
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
                                        <i className={classnames('mr-2', sourceTypeToIcon('facebook-messenger'))} />
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
                                        <i className={classnames('mr-2', sourceTypeToIcon('facebook-message'))} />
                                        Reply via Messenger
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
                                        <i className={classnames('mr-2', sourceTypeToIcon('internal-note'))} />
                                        Leave an internal note
                                    </DropdownItem>
                                )
                            }
                        </DropdownMenu>
                    </UncontrolledDropdown>
                </div>

                {this._renderReceiversArea()}
            </div>
        )
    }
}
