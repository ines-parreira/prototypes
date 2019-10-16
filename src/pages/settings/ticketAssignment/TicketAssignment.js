// @flow
import React from 'react'
import {type Map} from 'immutable'
import classnames from 'classnames'
import {connect} from 'react-redux'
import {Button, Col, Container, Form, Label, Row} from 'reactstrap'

import UserActivityManager from '../../../services/userActivityManager'
import * as currentAccountActions from '../../../state/currentAccount/actions'
import * as currentAccountConstants from '../../../state/currentAccount/constants'
import * as currentAccountSelectors from '../../../state/currentAccount/selectors'

import PageHeader from '../../common/components/PageHeader'
import BooleanField from '../../common/forms/BooleanField'


type Props = {
    chatAssignmentSettings: Map<*,*>,
    submitSetting: (Object) => Promise<*>
}

type State = {
    isLoading: boolean,
    unassignOnReply: boolean
}

export class TicketAssignment extends React.Component<Props, State> {
    state = {
        isLoading: false,
        unassignOnReply: true
    }

    componentDidMount() {
        const {chatAssignmentSettings} = this.props

        if (!chatAssignmentSettings.isEmpty()) {
            this.setState({
                unassignOnReply: chatAssignmentSettings.getIn(['data', 'unassign_on_reply'])
            })
        }
    }

    _onSubmit = (evt: SyntheticEvent<*>) => {
        evt.preventDefault()
        this.setState({isLoading: true})

        const {chatAssignmentSettings, submitSetting} = this.props
        const {unassignOnReply} = this.state

        submitSetting({
            id: chatAssignmentSettings.get('id'),
            type: currentAccountConstants.SETTING_TYPE_CHAT_ASSIGNMENT,
            data: {
                unassign_on_reply: unassignOnReply
            }
        })
            // $FlowFixMe
            .finally(() => this.setState({isLoading: false}))
    }

    render() {
        const {unassignOnReply, isLoading} = this.state

        return (
            <div className="full-width">
                <PageHeader title="Ticket assignment"/>

                <Container
                    fluid
                    className="page-container"
                >
                    <Form onSubmit={this._onSubmit}>
                        <Row className="mb-2">
                            <Col md="9">
                                <div className="mb-2">
                                    <Label className="control-label">Un-assign on reply</Label>
                                    <BooleanField
                                        name="unassign_on_reply"
                                        type="checkbox"
                                        label="When there is a new reply in a Chat or Messenger ticket, if the user assigned to it is not available for chat, un-assign the ticket"
                                        value={unassignOnReply}
                                        onChange={(value) => this.setState({unassignOnReply: value})}
                                    />
                                </div>
                                <div className="text-faded">
                                    Users are considered as not available for chat when any of those conditions is true:
                                    <ul>
                                        <li>the user turned off its "Available for chat" setting</li>
                                        <li>the user has been inactive on Gorgias for more than{' '}
                                            {UserActivityManager.unavailabilityTimeout / 1000 / 60} minutes</li>
                                        <li>the user is not on Gorgias on any device</li>
                                    </ul>
                                </div>
                            </Col>
                        </Row>

                        <Button
                            type="submit"
                            color="success"
                            className={classnames({
                                'btn-loading': isLoading,
                            })}
                            disabled={isLoading}
                        >
                            Save changes
                        </Button>
                    </Form>
                </Container>

            </div>
        )
    }
}

export default connect((state) => {
    return {
        chatAssignmentSettings: currentAccountSelectors.getChatAssignmentSettings(state)
    }
}, {
    submitSetting: currentAccountActions.submitSetting
})(TicketAssignment)
