import React, {PropTypes} from 'react'
import md5 from 'md5'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem} from 'reactstrap'

import {ticketSourceTypes} from '../../../../../utils'
import MessageSourceFields from './MessageSourceFields/'
import {guessReceiversFromTicket} from '../../../../../state/ticket/utils'
import {
    getNewMessageType,
    getNewMessageChannel,
    getMessages,
    hasNewMessageRecipients,
} from '../../../../../state/ticket/selectors'
import * as integrationSelectors from '../../../../../state/integrations/selectors'
import _reduce from 'lodash/reduce'

import css from './ReplyMessageChannel.less'

class ReplyMessageChannel extends React.Component {
    state = {
        isReceiversAreaOpen: false,
    }

    componentDidMount() {
        window.addEventListener('click', this._updateMessageSourceFieldsOpening)
    }

    componentWillReceiveProps(nextProps) {
        const {hasRecipients} = nextProps
        const {hasRecipients: hadRecipients} = this.props

        // at any props change, open the dropdown when no receivers
        if (this._canChangeReceivers() && (!hasRecipients && hadRecipients === hasRecipients)) {
            this._toggleReceiversArea(true)
        }
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

    _getChannelIconClassName = (sourceType) => {
        const popupChannelClassNames = _reduce({
            default: '',
            'internal-note': 'comment yellow',
            email: 'mail blue',
            chat: 'purple comments',
            'facebook-comment': 'facebook square blue',
            'facebook-message': 'facebook-messenger blue'
        }, (result, value, key) => {
            result[key] = `action icon ${value}`
            return result
        }, {})

        if (Object.keys(popupChannelClassNames).includes(sourceType)) {
            return popupChannelClassNames[sourceType]
        }

        return popupChannelClassNames.default
    }

    _setSourceType = (sourceType) => {
        this.props.actions.ticket.setSourceType(sourceType)
    }

    _renderReceiversArea = () => {
        const {ticket, messages, accountChannels} = this.props

        if (!ticket.getIn(['newMessage', 'public'])) {
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

        const disabledChannels = ['facebook-post', 'facebook-message', 'chat', 'api']

        const isInputEnabled =
            !disabledChannels.includes(this.props.sourceType)
            || !this.props.isUpdate

        return (
            <MessageSourceFields
                initialValues={guessReceiversFromTicket(ticket, accountChannels)}
                enabled={isInputEnabled}
                parentId={parentId.toString()}
                canOpen={this._canChangeReceivers()}
                isOpen={this.state.isReceiversAreaOpen}
            />
        )
    }

    render() {
        const {isUpdate, messages} = this.props

        const sources = ticketSourceTypes(messages.toJS())

        if (isUpdate && messages.isEmpty()) {
            return null
        }

        const suggestChat = isUpdate && sources.includes('chat')
        const suggestFacebookComment = isUpdate && (sources.includes('facebook-post') || sources.includes('facebook-comment'))
        const suggestFacebookMessage = isUpdate && sources.includes('facebook-message')
        const suggestInternalNote = isUpdate

        return (
            <div
                ref="messageChannel"
                className={classnames('ReplyMessageChannel', {
                    open: this.state.isReceiversAreaOpen,
                })}
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
                            <i className={this._getChannelIconClassName(this.props.sourceType)} />
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem
                                type="button"
                                onClick={() => {
                                    this._setSourceType('email')
                                }}
                            >
                                <i className={classnames('mr-2', this._getChannelIconClassName('email'))} />
                                Email
                            </DropdownItem>
                            {
                                suggestChat && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            this._setSourceType('chat')
                                        }}
                                    >
                                        <i className={classnames('mr-2', this._getChannelIconClassName('chat'))} />
                                        Chat message
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestFacebookComment && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            this._setSourceType('facebook-comment')
                                        }}
                                    >
                                        <i className={classnames('mr-2', this._getChannelIconClassName('facebook-comment'))} />
                                        Facebook comment
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestFacebookMessage && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            this._setSourceType('facebook-message')
                                        }}
                                    >
                                        <i className={classnames('mr-2', this._getChannelIconClassName('facebook-message'))} />
                                        Facebook private message
                                    </DropdownItem>
                                )
                            }
                            {
                                suggestInternalNote && (
                                    <DropdownItem
                                        type="button"
                                        onClick={() => {
                                            this._setSourceType('internal-note')
                                        }}
                                    >
                                        <i className={classnames('mr-2', this._getChannelIconClassName('internal-note'))} />
                                        Internal note
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

ReplyMessageChannel.propTypes = {
    ticket: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    settings: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    sourceType: PropTypes.string.isRequired,
    channel: PropTypes.string.isRequired,
    accountChannels: PropTypes.object.isRequired,
    messages: PropTypes.object.isRequired,
    hasRecipients: PropTypes.bool.isRequired,
}

const mapStateToProps = (state, ownProps) => {
    const sourceType = getNewMessageType(state)
    return {
        sourceType,
        channel: getNewMessageChannel(state),
        accountChannels: integrationSelectors.getChannelsByType(sourceType)(state),
        isUpdate: !!ownProps.ticket.get('id'),
        messages: getMessages(state),
        hasRecipients: hasNewMessageRecipients(state),
    }
}

export default connect(mapStateToProps)(ReplyMessageChannel)
