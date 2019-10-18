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
import {CHANNELS, CHAT_CHANNEL, FACEBOOK_MESSENGER_CHANNEL} from '../../../config/ticket'
import type {Option} from '../../common/forms/MultiSelectOptionsField'
import MultiSelectOptionsField from '../../common/forms/MultiSelectOptionsField'


type Props = {
    ticketAssignmentSettings: Map<*, *>,
    submitSetting: (Object) => Promise<*>
}

type State = {
    isLoading: boolean,
    unassignOnReply: boolean,
    autoAssignToTeams: boolean,
    assignmentChannels: string[]
}

export class TicketAssignment extends React.Component<Props, State> {
    state = {
        isLoading: false,
        unassignOnReply: true,
        autoAssignToTeams: false,
        // todo(@samy): remove when existing chat-assignment settings have been migrated
        assignmentChannels: [CHAT_CHANNEL, FACEBOOK_MESSENGER_CHANNEL],
    }

    static channelsToOptions(channels: string[]): Option[] {
        return channels.map((channel) => ({
            value: channel,
            label: channel,
        }))
    }

    componentDidMount() {
        const {ticketAssignmentSettings} = this.props
        const assignmentChannels = ticketAssignmentSettings.getIn(['data', 'assignment_channels'])

        if (!ticketAssignmentSettings.isEmpty()) {
            this.setState({
                unassignOnReply: ticketAssignmentSettings.getIn(['data', 'unassign_on_reply']),
                autoAssignToTeams: ticketAssignmentSettings.getIn(['data', 'auto_assign_to_teams']),
                assignmentChannels: assignmentChannels
                    ? assignmentChannels.toJS()
                    : [CHAT_CHANNEL, FACEBOOK_MESSENGER_CHANNEL],
            })
        }
    }

    _onSubmit = (evt: SyntheticEvent<*>) => {
        evt.preventDefault()
        this.setState({isLoading: true})

        const {ticketAssignmentSettings, submitSetting} = this.props
        const {unassignOnReply, autoAssignToTeams, assignmentChannels} = this.state

        submitSetting({
            id: ticketAssignmentSettings.get('id'),
            type: currentAccountConstants.SETTING_TYPE_TICKET_ASSIGNMENT,
            data: {
                unassign_on_reply: unassignOnReply,
                auto_assign_to_teams: autoAssignToTeams,
                assignment_channels: assignmentChannels,
            }
        })
            // $FlowFixMe
            .finally(() => this.setState({isLoading: false}))
    }

    _onChannelsChange = (options: Option[]) => {
        this.setState({
            assignmentChannels: options.map((option) => option.value)
        })
    }

    render() {
        const {unassignOnReply, assignmentChannels, autoAssignToTeams, isLoading} = this.state

        return (
            <div className="full-width">
                <PageHeader title="Ticket assignment"/>

                <Container
                    fluid
                    className="page-container"
                >
                    <Form onSubmit={this._onSubmit}>
                        <Row className="mb-2">
                            <Col md="5">
                                <div className="mb-2">
                                    <Label className="control-label">Auto-assign tickets</Label>
                                    <BooleanField
                                        name="auto_assign_to_teams"
                                        type="checkbox"
                                        label="Auto-assign tickets that are assigned to a team, to an available agent of
                                            this team, as soon as an agent of the team is available"
                                        value={autoAssignToTeams}
                                        onChange={(value) => this.setState({autoAssignToTeams: value})}
                                    />
                                </div>
                                <div className="mb-2">
                                    <Label className="control-label">Un-assign on reply</Label>
                                    <BooleanField
                                        name="unassign_on_reply"
                                        type="checkbox"
                                        label="When there is a new reply in a ticket of the following channels, if the
                                            user assigned to it is not available, un-assign the ticket"
                                        value={unassignOnReply}
                                        onChange={(value) => this.setState({unassignOnReply: value})}
                                    />
                                </div>
                                <div className="text-faded">
                                    Users are considered as not available when any of those conditions is true:
                                    <ul>
                                        <li>the user turned off its "Available" setting</li>
                                        <li>the user has been inactive on Gorgias for more than{' '}
                                            {UserActivityManager.unavailabilityTimeout / 1000 / 60} minutes
                                        </li>
                                        <li>the user is not on Gorgias on any device</li>
                                    </ul>
                                </div>
                                <div className="mb-2">
                                    <Label className="control-label">Channels</Label>
                                    <p>Apply ticket assignment settings to the following channels:</p>
                                    <MultiSelectOptionsField
                                        options={TicketAssignment.channelsToOptions(CHANNELS)}
                                        selectedOptions={TicketAssignment.channelsToOptions(assignmentChannels)}
                                        plural="channels"
                                        singular="channel"
                                        onChange={this._onChannelsChange}
                                        matchInput
                                        caseInsensitive
                                    />
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
        ticketAssignmentSettings: currentAccountSelectors.getTicketAssignmentSettings(state)
    }
}, {
    submitSetting: currentAccountActions.submitSetting
})(TicketAssignment)
