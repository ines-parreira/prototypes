import React, {Component, SyntheticEvent} from 'react'
import {List} from 'immutable'
import classnames from 'classnames'
import {connect, ConnectedProps} from 'react-redux'
import {Button, Col, Container, Form, FormGroup, Label, Row} from 'reactstrap'
import _isEqual from 'lodash/isEqual'

import {TicketChannel} from '../../../business/types/ticket'
import UserActivityManager from '../../../services/userActivityManager'
import {fetchChats} from '../../../state/chats/actions'
import {submitSetting} from '../../../state/currentAccount/actions'
import {getTicketAssignmentSettings} from '../../../state/currentAccount/selectors'
import PageHeader from '../../common/components/PageHeader'
import BooleanField from '../../common/forms/BooleanField.js'
import MultiSelectOptionsField from '../../common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from '../../common/forms/MultiSelectOptionsField/types'
import {AccountSettingType} from '../../../state/currentAccount/types'
import {RootState} from '../../../state/types'
import css from '../settings.less'

type Props = ConnectedProps<typeof connector>

type State = {
    isLoading: boolean
    unassignOnReply: boolean
    autoAssignToTeams: boolean
    assignmentChannels: TicketChannel[]
}

export class TicketAssignmentContainer extends Component<Props, State> {
    state = {
        isLoading: false,
        unassignOnReply: true,
        autoAssignToTeams: false,
        assignmentChannels: [
            TicketChannel.Chat,
            TicketChannel.FacebookMessenger,
        ],
    }

    static channelsToOptions(channels: TicketChannel[]): Option[] {
        return channels.map((channel) => ({
            value: channel,
            label: channel,
        }))
    }

    componentDidMount() {
        const {ticketAssignmentSettings} = this.props
        const assignmentChannels = ticketAssignmentSettings.getIn([
            'data',
            'assignment_channels',
        ]) as List<any>

        if (!ticketAssignmentSettings.isEmpty()) {
            this.setState({
                unassignOnReply: ticketAssignmentSettings.getIn([
                    'data',
                    'unassign_on_reply',
                ]),
                autoAssignToTeams: ticketAssignmentSettings.getIn([
                    'data',
                    'auto_assign_to_teams',
                ]),
                assignmentChannels: assignmentChannels
                    ? assignmentChannels.toJS()
                    : [TicketChannel.Chat, TicketChannel.FacebookMessenger],
            })
        }
    }

    _onSubmit = async (evt: SyntheticEvent) => {
        evt.preventDefault()
        this.setState({isLoading: true})

        const {ticketAssignmentSettings, submitSetting, fetchChats} = this.props
        const {unassignOnReply, autoAssignToTeams, assignmentChannels} =
            this.state

        let shouldFetchChats = true

        if (!ticketAssignmentSettings.isEmpty()) {
            const assignToTeamsHasChanged =
                autoAssignToTeams !==
                ticketAssignmentSettings.getIn(['data', 'auto_assign_to_teams'])

            const assignmentChannelsHaveChanged = !_isEqual(
                assignmentChannels,
                (
                    ticketAssignmentSettings.getIn([
                        'data',
                        'assignment_channels',
                    ]) as List<any>
                ).toJS()
            )

            shouldFetchChats =
                assignToTeamsHasChanged ||
                (autoAssignToTeams && assignmentChannelsHaveChanged)
        }

        await submitSetting({
            id: ticketAssignmentSettings.get('id'),
            type: AccountSettingType.TicketAssignment,
            data: {
                unassign_on_reply: unassignOnReply,
                auto_assign_to_teams: autoAssignToTeams,
                assignment_channels: assignmentChannels,
            },
        })

        if (shouldFetchChats) {
            void fetchChats()
        }

        this.setState({isLoading: false})
    }

    _onChannelsChange = (options: Option[]) => {
        this.setState({
            assignmentChannels: options.map(
                (option) => option.value as TicketChannel
            ),
        })
    }

    render() {
        const {
            unassignOnReply,
            assignmentChannels,
            autoAssignToTeams,
            isLoading,
        } = this.state

        return (
            <div className="full-width">
                <PageHeader title="Ticket assignment" />

                <Container fluid className={css.pageContainer}>
                    <Form onSubmit={this._onSubmit}>
                        <Row className={css.contentWrapper}>
                            <Col>
                                <FormGroup className={css.inputField}>
                                    <Label className="control-label">
                                        Auto-assign tickets
                                    </Label>
                                    <BooleanField
                                        name="auto_assign_to_teams"
                                        type="checkbox"
                                        label="Auto-assign tickets that are assigned to a team, to an available agent of
                                            this team, as soon as an agent of the team is available"
                                        value={autoAssignToTeams}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                autoAssignToTeams: value,
                                            })
                                        }
                                    />
                                </FormGroup>
                                <FormGroup className={css.inputField}>
                                    <Label className="control-label">
                                        Un-assign on reply
                                    </Label>
                                    <BooleanField
                                        name="unassign_on_reply"
                                        type="checkbox"
                                        label="When there is a new reply in a ticket of the following channels, if the
                                            user assigned to it is not available, un-assign the ticket"
                                        value={unassignOnReply}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                unassignOnReply: value,
                                            })
                                        }
                                    />
                                </FormGroup>
                                <div className="text-faded">
                                    Users are considered as not available when
                                    any of those conditions is true:
                                    <ul>
                                        <li>
                                            the user turned off its "Available"
                                            setting
                                        </li>
                                        <li>
                                            the user has been inactive on
                                            Gorgias for more than{' '}
                                            {UserActivityManager.unavailabilityTimeout /
                                                1000 /
                                                60}{' '}
                                            minutes
                                        </li>
                                        <li>
                                            the user is not on Gorgias on any
                                            device
                                        </li>
                                    </ul>
                                </div>
                                <FormGroup className={css.inputField}>
                                    <Label className="control-label">
                                        Channels
                                    </Label>
                                    <p>
                                        Apply ticket assignment settings to the
                                        following channels:
                                    </p>
                                    <MultiSelectOptionsField
                                        options={TicketAssignmentContainer.channelsToOptions(
                                            Object.values(TicketChannel)
                                        )}
                                        selectedOptions={TicketAssignmentContainer.channelsToOptions(
                                            assignmentChannels
                                        )}
                                        plural="channels"
                                        singular="channel"
                                        onChange={this._onChannelsChange}
                                        matchInput
                                        caseInsensitive
                                    />
                                </FormGroup>
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

const connector = connect(
    (state: RootState) => ({
        ticketAssignmentSettings: getTicketAssignmentSettings(state),
    }),
    {
        submitSetting,
        fetchChats,
    }
)

export default connector(TicketAssignmentContainer)
