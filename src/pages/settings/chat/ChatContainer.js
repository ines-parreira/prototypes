import React, {Component, PropTypes} from 'react'
import classnames from 'classnames'
import {Form, Label, Button, FormGroup} from 'reactstrap'
import {connect} from 'react-redux'

import * as currentAccountSelectors from '../../../state/currentAccount/selectors'
import * as currentAccountActions from '../../../state/currentAccount/actions'

import {TIMES_BEFORE_SPLIT} from './../../../config'

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

export class ChatContainer extends Component {
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
            timeBeforeSplit: setting.getIn(['data', 'time_before_split'], TIMES_BEFORE_SPLIT[0].value),
            isUpdating: false
        }
    }

    _submitAccountChatSetting = (event) => {
        event.preventDefault()

        const {chatSettings, submitSetting} = this.props
        this.setState({isUpdating: true})

        const setting = chatSettings.mergeDeep({
            type: 'chat',
            data: {
                autoResponderEnabled: this.state.autoResponderEnabled,
                autoResponderText: this.state.autoResponderText,
                time_before_split: this.state.timeBeforeSplit
            }
        }).toJS()

        return submitSetting(setting)
            .then(() => this.setState({isUpdating: false}))
    }

    render() {
        const {autoResponderEnabled, autoResponderText, isUpdating, timeBeforeSplit} = this.state

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
                                name="autoResponderEnabled"
                                type="checkbox"
                                label="Enable auto-responder when no agent is available for chat"
                                value={autoResponderEnabled}
                                onChange={value => this.setState({autoResponderEnabled: value})}
                            />
                        </FormGroup>

                        <InputField
                            type="textarea"
                            name="autoResponderText"
                            label="Auto-responder text"
                            value={autoResponderText}
                            onChange={value => this.setState({autoResponderText: value})}
                            rows="3"
                            required
                        />

                        <InputField
                            type="select"
                            name="timeBeforeSplit"
                            label="Inactivity period between chat tickets"
                            help="After a certain period without any new message on a chat ticket, Gorgias will create a new ticket the next time the customer contacts you over chat."
                            value={timeBeforeSplit}
                            onChange={timeBeforeSplit => this.setState({timeBeforeSplit})}
                        >
                            {
                                TIMES_BEFORE_SPLIT.map((interval, idx) => (
                                    <option
                                        key={idx}
                                        value={interval.value}
                                    >
                                        {interval.label}
                                    </option>
                                ))
                            }
                        </InputField>

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

export default connect(mapStateToProps, mapDispatchToProps)(ChatContainer)
