import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import {Button, FormGroup, UncontrolledTooltip} from 'reactstrap'
import {connect} from 'react-redux'
import PageHeader from '../../../pages/common/components/PageHeader'
import TextAreaField from '../../../pages/common/forms/TextAreaField'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import * as currentAccountActions from '../../../state/currentAccount/actions'

function mapStateToProps(state) {
    return {
        chatSettings: currentAccountSelectors.getChatSettings(state)
    }
}
const mapDispatchToProps = {
    submitSetting: currentAccountActions.submitSetting
}

@connect(mapStateToProps, mapDispatchToProps)
export default class ChatContainer extends Component {
    static propTypes = {
        submitSetting: PropTypes.func.isRequired,
        chatSettings: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)
        const setting = props.chatSettings
        this.state = {
            autoResponderEnabled: setting.getIn(['data', 'autoResponderEnabled']) || false,
            autoResponderText: setting.getIn(['data', 'autoResponderText']) ||
            'We\'re not online at the moment. Leave us your email and we\'ll follow up shortly.',
            isUpdating: false
        }
    }

    _onChangeAutoResponderEnabled = ({target: {checked}}) => {
        this.setState({autoResponderEnabled: checked})
    }

    _onChangeAutoResponderText = ({target: {value}}) => {
        this.setState({autoResponderText: value})
    }

    _submitAccountChatSetting = (event) => {
        event.preventDefault()

        const {chatSettings, submitSetting} = this.props
        this.setState({isUpdating: true})
        const setting = {
            id: chatSettings.get('id'),
            type: 'chat',
            data: {
                autoResponderEnabled: this.state.autoResponderEnabled,
                autoResponderText: this.state.autoResponderText
            }
        }

        submitSetting(setting)
            .then(() => this.setState({isUpdating: false}))
    }

    render() {
        const {autoResponderEnabled, autoResponderText, isUpdating} = this.state

        return (
            <div>
                <PageHeader title="Chat" icon="comments"/>
                <div className="mb-3">
                    <p>
                        When your team is not available to chat, you can configure an auto-response for your customers.
                        This will impact chat & Facebook Messenger.
                    </p>
                    <form onSubmit={this._submitAccountChatSetting}>
                        <FormGroup>
                            <label className="control-label">
                                Auto-responder status
                            </label>
                            <div className="ui field">
                                <div className="ui checkbox">
                                    <input
                                        id="enable-auto-responder"
                                        name="enable-auto-responder"
                                        type="checkbox"
                                        checked={autoResponderEnabled}
                                        onChange={this._onChangeAutoResponderEnabled}
                                    />
                                    <label
                                        className="clickable"
                                        htmlFor="enable-auto-responder"
                                    >
                                        Enable auto-responder when no agent is available for chat
                                    </label>
                                </div>
                            </div>

                        </FormGroup>
                        <FormGroup>
                            <div className="ui field">
                                <TextAreaField
                                    label={
                                        <span>

                                        Auto-responder text
                                         <span>
                                    <i
                                        id="auto-response-text"
                                        className="help circle link icon"
                                    />
                                    <UncontrolledTooltip
                                        placement="top"
                                        target="auto-response-text"
                                        delay={0}
                                    >
                                        When all people available for chat reach the maximum number of open chats,
                                        the user gets this auto-response.
                                    </UncontrolledTooltip>
                                </span>
                                    </span>
                                    }
                                    input={{
                                        value: autoResponderText,
                                        onChange: this._onChangeAutoResponderText,
                                    }}
                                />
                            </div>
                        </FormGroup>
                        <FormGroup>
                            <Button
                                type="submit"
                                color="primary"
                                className={classnames({
                                    'btn-loading': isUpdating
                                })}
                                disabled={isUpdating}

                            >
                                Save
                            </Button>
                        </FormGroup>
                    </form>
                </div>
            </div>
        )
    }
}
