import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import {Form, Label, Button, FormGroup} from 'reactstrap'
import {connect} from 'react-redux'

import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import * as currentAccountActions from '../../../state/currentAccount/actions'

import InputField from '../../common/forms/InputField'
import BooleanField from '../../common/forms/BooleanField'
import PageHeader from '../../../pages/common/components/PageHeader'

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
                <PageHeader title="Chat" icon="comments" />
                <div className="mb-3">
                    <p>
                        When your team is not available to chat, you can configure an auto-response for your customers.
                        This will impact chat & Facebook Messenger.
                    </p>
                    <Form onSubmit={this._submitAccountChatSetting}>
                        <FormGroup>
                            <Label>
                                Auto-responder status
                            </Label>
                            <BooleanField
                                name="enable_auto_responder"
                                type="checkbox"
                                label="Enable auto-responder when no agent is available for chat"
                                value={autoResponderEnabled}
                                onChange={value => this.setState({autoResponderEnabled: value})}
                            />
                        </FormGroup>

                        <InputField
                            type="textarea"
                            name="text"
                            label="Auto-responder text"
                            value={autoResponderText}
                            onChange={value => this.setState({autoResponderText: value})}
                            help="When all people available for chat reach the maximum number of open chats, the user gets this auto-response"
                            rows="3"
                            required
                        />

                        <div>
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
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}
