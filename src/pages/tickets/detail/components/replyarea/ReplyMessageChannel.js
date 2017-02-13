import React, {PropTypes} from 'react'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {ticketSourceTypes} from '../../../../../utils'
import MessageSourceFields from './MessageSourceFields/'
import {guessReceiversFromTicket} from '../../../../../state/ticket/utils'
import {
    getNewMessageType,
    getNewMessageChannel,
    getNewMessage,
    getMessages,
    hasNewMessageRecipients,
} from '../../../../../state/ticket/selectors'
import * as integrationSelectors from '../../../../../state/integrations/selectors'
import _reduce from 'lodash/reduce'

class ReplyMessageChannel extends React.Component {
    state = {
        isOpen: false,
    }

    componentDidMount() {
        $(this.refs.messageChannelDropdown).dropdown({
            position: 'bottom left',
            hoverable: true,
            on: 'click'
        })

        window.addEventListener('click', this._updateMessageSourceFieldsOpening)
    }

    componentWillReceiveProps(nextProps) {
        const {hasRecipients} = nextProps
        const {hasRecipients: hadRecipients} = this.props

        // at any props change, open the dropdown when no receivers
        if (this._canChangeReceivers() && (!hasRecipients && hadRecipients === hasRecipients)) {
            this._toggleOpening(true)
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
                    this._toggleOpening(hasClickedInComponent)
                }
            } else {
                this._toggleOpening(true)
            }
        } else {
            this._toggleOpening(false)
        }
    }

    _toggleOpening = (state = !this.state.isOpen) => {
        this.setState({
            isOpen: state,
        })
    }

    /**
     * This function gather and builds the data needed to render the receiver
     * (name, mail, className of the icon, and its channel).
     *
     * @returns {string}
     */
    _getClassNames = () => {
        const message = this.props.message
        const channel = this.props.sourceType
        const popupChannelClassNames = _reduce({
            default: '',
            private: 'comment yellow',
            email: 'mail blue',
            chat: 'purple comments',
            'facebook-comment': 'facebook square blue',
            'facebook-message': 'facebook-messenger blue'
        }, (result, value, key) => {
            result[key] = `action icon ${value}`
            return result
        }, {})

        if (!message.get('public')) {
            return popupChannelClassNames.private
        } else if (Object.keys(popupChannelClassNames).includes(channel)) {
            return popupChannelClassNames[channel]
        }

        return popupChannelClassNames.default
    }

    _setSourceType = (sourceType) => {
        this.props.actions.ticket.setSourceType(sourceType)
    }

    _renderTo = () => {
        const {ticket, messages, accountChannels} = this.props

        if (!ticket.getIn(['newMessage', 'public'])) {
            return (
                <div className="receivers-dropdown">
                    <div className="receivers-row">
                        <span className="receivers-list">
                            <span className="receiver-placeholder">Internal note</span>
                        </span>
                    </div>
                </div>
            )
        }

        const parentId = messages.isEmpty()
            ? 'new'
            : `${ticket.get('id', '')} - ${messages.last().get('id', '')}`

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
                isOpen={this.state.isOpen}
            />
        )
    }

    render() {
        const {isUpdate, messages} = this.props
        const popupClassNames = this._getClassNames()

        const sources = ticketSourceTypes(messages.toJS())

        if (isUpdate && messages.isEmpty()) {
            return null
        }

        const channelClassNames = {
            email: 'item',
            chat: classnames('item', {
                hidden: isUpdate ? !sources.includes('chat') : true,
            }),
            facebookComment: classnames('item', {
                hidden: !isUpdate
                || (!sources.includes('facebook-post')
                && !sources.includes('facebook-comment'))
            }),
            facebookMessage: classnames('item', {
                hidden: !isUpdate || !sources.includes('facebook-message'),
            }),
            internal: classnames('item', {
                hidden: !isUpdate,
            })
        }

        return (
            <div
                ref="messageChannel"
                className={classnames('ReplyMessageChannel', {
                    open: this.state.isOpen,
                })}
            >
                <div
                    ref="channelPicker"
                    className="channel-picker"
                >
                    <div
                        ref="messageChannelDropdown"
                        className="ui dropdown"
                    >
                        <i className={popupClassNames} />
                        <i className="icon caret down" />
                        <div
                            className="ui vertical menu"
                            style={{textAlign: 'left', border: 'none', width: 'inherit', marginTop: '8px'}}
                        >
                            <div
                                className={channelClassNames.email}
                                onClick={() => this._setSourceType('email')}
                            >
                                Send as email
                            </div>
                            <div
                                className={channelClassNames.chat}
                                onClick={() => this._setSourceType('chat')}
                            >
                                Send as chat message
                            </div>
                            <div
                                className={channelClassNames.facebookComment}
                                onClick={() => this._setSourceType('facebook-comment')}
                            >
                                Send as Facebook comment
                            </div>
                            <div
                                className={channelClassNames.facebookMessage}
                                onClick={() => this._setSourceType('facebook-message')}

                            >
                                Send as Facebook private message
                            </div>
                            <div
                                className={channelClassNames.internal}
                                onClick={() => this._setSourceType('internal-note')}
                            >
                                Send as internal note
                            </div>
                        </div>
                    </div>
                </div>

                {this._renderTo()}
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
    message: PropTypes.object.isRequired,
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
        message: getNewMessage(state),
        messages: getMessages(state),
        hasRecipients: hasNewMessageRecipients(state),
    }
}

export default connect(mapStateToProps)(ReplyMessageChannel)
