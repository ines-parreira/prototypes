import React, { Component, SyntheticEvent } from 'react'

import classNames from 'classnames'
import { List } from 'immutable'
import _isEqual from 'lodash/isEqual'
import { connect, ConnectedProps } from 'react-redux'
import { Col, Form, FormGroup, Row } from 'reactstrap'

import { Label, Tooltip } from '@gorgias/merchant-ui-kit'

import { TicketChannel } from 'business/types/ticket'
import Alert from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import CheckBox from 'pages/common/forms/CheckBox'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import NumberInput from 'pages/common/forms/input/NumberInput'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import settingsCss from 'pages/settings/settings.less'
import TeamCreationModal from 'pages/settings/teams/TeamCreationModal'
import { fetchChats } from 'state/chats/actions'
import { submitSetting } from 'state/currentAccount/actions'
import { getTicketAssignmentSettings } from 'state/currentAccount/selectors'
import { AccountSettingType } from 'state/currentAccount/types'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getTeams } from 'state/teams/selectors'
import { RootState } from 'state/types'
import { isAdmin } from 'utils'

import css from './TicketAssignment.less'

type Props = ConnectedProps<typeof connector>

type State = {
    isLoading: boolean
    isTeamCreationModalOpen: boolean
    unassignOnReply: boolean
    unassignOnUserUnavailability: boolean
    autoAssignToTeams: boolean
    assignmentChannels: TicketChannel[]
    chatTicketsLimit?: number
    nonChatTicketsLimit?: number
}

export class TicketAssignmentContainer extends Component<Props, State> {
    static channelsToOptions(channels: TicketChannel[]): Option[] {
        return channels.map((channel) => ({
            value: channel,
            label: channel,
        }))
    }

    private initialFormState: Omit<
        State,
        'isLoading' | 'isTeamCreationModalOpen'
    >

    constructor(props: Props) {
        super(props)

        const formState = this._getFormState()

        this.state = {
            isLoading: false,
            isTeamCreationModalOpen: false,
            ...formState,
        }

        this.initialFormState = formState
    }

    componentDidUpdate(prevProps: Props) {
        if (
            !_isEqual(
                prevProps.ticketAssignmentSettings,
                this.props.ticketAssignmentSettings,
            )
        ) {
            const formState = this._getFormState()
            this.initialFormState = formState
            this.setState({
                ...formState,
            })
        }
    }

    _getFormState = () => {
        const { ticketAssignmentSettings } = this.props
        const assignmentChannels = ticketAssignmentSettings.getIn([
            'data',
            'assignment_channels',
        ]) as List<any>

        return {
            unassignOnReply: ticketAssignmentSettings.getIn(
                ['data', 'unassign_on_reply'],
                true,
            ),
            unassignOnUserUnavailability: !!ticketAssignmentSettings
                .getIn(['data', 'unassign_on_user_unavailability'], [])
                .includes(TicketChannel.Chat),
            autoAssignToTeams: ticketAssignmentSettings.getIn(
                ['data', 'auto_assign_to_teams'],
                false,
            ),
            assignmentChannels: assignmentChannels
                ? assignmentChannels.toJS()
                : [TicketChannel.Chat, TicketChannel.FacebookMessenger],
            chatTicketsLimit: ticketAssignmentSettings.getIn(
                ['data', 'max_user_chat_ticket'],
                3,
            ),
            nonChatTicketsLimit: ticketAssignmentSettings.getIn(
                ['data', 'max_user_non_chat_ticket'],
                4,
            ),
        }
    }

    private _isStateValid(): this is {
        state: Required<State>
    } {
        const { chatTicketsLimit, nonChatTicketsLimit } = this.state
        return chatTicketsLimit != null && nonChatTicketsLimit != null
    }

    _onSubmit = async (evt?: SyntheticEvent) => {
        evt?.preventDefault()
        if (!this._isStateValid()) {
            return
        }

        this.setState({ isLoading: true })

        const { ticketAssignmentSettings, submitSetting, fetchChats } =
            this.props
        const {
            unassignOnReply,
            unassignOnUserUnavailability,
            autoAssignToTeams,
            assignmentChannels,
            chatTicketsLimit,
            nonChatTicketsLimit,
        } = this.state

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
                ).toJS(),
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
                unassign_on_user_unavailability: unassignOnUserUnavailability
                    ? [TicketChannel.Chat]
                    : [],
                auto_assign_to_teams: autoAssignToTeams,
                assignment_channels: assignmentChannels,
                max_user_chat_ticket: chatTicketsLimit,
                max_user_non_chat_ticket: nonChatTicketsLimit,
            },
        })

        if (shouldFetchChats) {
            void fetchChats()
        }

        this.setState({ isLoading: false })
    }

    _onChannelsChange = (options: Option[]) => {
        this.setState({
            assignmentChannels: options.map(
                (option) => option.value as TicketChannel,
            ),
        })
    }

    _isDirty = () => {
        const {
            unassignOnReply,
            unassignOnUserUnavailability,
            autoAssignToTeams,
            assignmentChannels,
            chatTicketsLimit,
            nonChatTicketsLimit,
        } = this.state

        const currentFormState = {
            unassignOnReply,
            unassignOnUserUnavailability,
            autoAssignToTeams,
            assignmentChannels,
            chatTicketsLimit,
            nonChatTicketsLimit,
        }

        return !_isEqual(this.initialFormState, currentFormState)
    }

    render() {
        const { teams, currentUser } = this.props
        const {
            unassignOnReply,
            unassignOnUserUnavailability,
            assignmentChannels,
            autoAssignToTeams,
            isLoading,
            isTeamCreationModalOpen,
            chatTicketsLimit,
            nonChatTicketsLimit,
        } = this.state

        return (
            <div className="full-width">
                <UnsavedChangesPrompt
                    onSave={this._onSubmit}
                    when={this._isDirty()}
                />
                <PageHeader
                    title={
                        <HeaderTitle
                            title="Ticket assignment"
                            description="Automate the assignment of tickets among your team members or the unassignment when your
                    agents are not available to respond. You can use both at the same time!"
                            helpUrl="https://docs.gorgias.com/ticket/auto-assign-tickets"
                        />
                    }
                />

                <div className={settingsCss.pageContainer}>
                    <Form onSubmit={this._onSubmit}>
                        <Row className={settingsCss.contentWrapper}>
                            <Col>
                                <h3
                                    className={classNames(
                                        'heading-section-semibold',
                                        settingsCss.mb8,
                                    )}
                                >
                                    Team auto-assignment settings
                                </h3>

                                {teams.size === 0 && isAdmin(currentUser) ? (
                                    <Alert
                                        className={css.missingTeamAlert}
                                        customActions={
                                            <Button
                                                fillStyle="ghost"
                                                onClick={() =>
                                                    this.setState({
                                                        isTeamCreationModalOpen:
                                                            true,
                                                    })
                                                }
                                            >
                                                Create team
                                            </Button>
                                        }
                                        icon
                                    >
                                        {`You haven't set up any teams yet. Create your first team to configure auto assignment.`}
                                    </Alert>
                                ) : (
                                    <>
                                        <FormGroup className={settingsCss.mb16}>
                                            <CheckBox
                                                name="auto_assign_to_teams"
                                                isChecked={autoAssignToTeams}
                                                onChange={(value: boolean) =>
                                                    this.setState({
                                                        autoAssignToTeams:
                                                            value,
                                                    })
                                                }
                                                caption={
                                                    <span>
                                                        When a ticket is
                                                        assigned to a team, it
                                                        will automatically be
                                                        assigned to an{' '}
                                                        <strong
                                                            className={
                                                                css.labelBoldText
                                                            }
                                                        >
                                                            eligible member
                                                        </strong>{' '}
                                                        of that team
                                                    </span>
                                                }
                                            >
                                                Auto-assign tickets
                                            </CheckBox>
                                        </FormGroup>
                                        <FormGroup className={settingsCss.mb32}>
                                            <Label
                                                className={classNames(
                                                    'body-semibold',
                                                    css.limitsHeader,
                                                )}
                                            >
                                                Auto-assignment limits
                                                <IconTooltip>
                                                    {`An agent is eligible for
                                                    auto-assignment if they are
                                                    “online”, set to "available"
                                                    and have fewer open tickets
                                                    assigned to them than the
                                                    limits defined below`}
                                                </IconTooltip>
                                            </Label>
                                            <div className={css.limits}>
                                                <div
                                                    className={
                                                        css.limitsSection
                                                    }
                                                >
                                                    <label
                                                        className={
                                                            css.limitLabel
                                                        }
                                                    >
                                                        <NumberInput
                                                            className={
                                                                css.limitInput
                                                            }
                                                            min={0}
                                                            max={500}
                                                            isRequired
                                                            value={
                                                                chatTicketsLimit
                                                            }
                                                            onChange={(
                                                                chatTicketsLimit,
                                                            ) => {
                                                                this.setState({
                                                                    chatTicketsLimit,
                                                                })
                                                            }}
                                                        />
                                                        <strong
                                                            id="chat-messaging-tooltip"
                                                            className={
                                                                css.limitsTooltip
                                                            }
                                                        >
                                                            Chat & Messaging
                                                        </strong>{' '}
                                                        tickets
                                                    </label>
                                                    <Tooltip target="chat-messaging-tooltip">
                                                        Includes chat, Facebook
                                                        messenger, Instagram DM
                                                        or any 1-1 instant
                                                        messaging channels
                                                    </Tooltip>
                                                </div>
                                                <div
                                                    className={
                                                        css.limitsSection
                                                    }
                                                >
                                                    <label
                                                        className={
                                                            css.limitLabel
                                                        }
                                                    >
                                                        <NumberInput
                                                            className={
                                                                css.limitInput
                                                            }
                                                            min={0}
                                                            max={500}
                                                            isRequired
                                                            value={
                                                                nonChatTicketsLimit
                                                            }
                                                            onChange={(
                                                                nonChatTicketsLimit,
                                                            ) => {
                                                                this.setState({
                                                                    nonChatTicketsLimit,
                                                                })
                                                            }}
                                                        />
                                                        <strong
                                                            id="other-text-tooltip"
                                                            className={
                                                                css.limitsTooltip
                                                            }
                                                        >
                                                            Other text
                                                        </strong>{' '}
                                                        tickets
                                                    </label>
                                                    <Tooltip target="other-text-tooltip">
                                                        Includes email, Facebook
                                                        and Instagram comments
                                                        or any other
                                                        asynchronous channels.
                                                        Does not include Phone
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </>
                                )}

                                <FormGroup className={settingsCss.mb40}>
                                    <h3 className="heading-section-semibold">
                                        Unassignment settings
                                    </h3>
                                    <CheckBox
                                        name="unassign_on_reply"
                                        className={settingsCss.mb16}
                                        isChecked={unassignOnReply}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                unassignOnReply: value,
                                            })
                                        }
                                    >
                                        Unassign on reply
                                        <IconTooltip>
                                            Unassigns a ticket if the customer
                                            replies but the ticket is assigned
                                            to agent that is “offline” or
                                            “unavailable”
                                        </IconTooltip>
                                    </CheckBox>
                                    <CheckBox
                                        name="unassign_on_user_unavailability"
                                        isChecked={unassignOnUserUnavailability}
                                        onChange={(value: boolean) =>
                                            this.setState({
                                                unassignOnUserUnavailability:
                                                    value,
                                            })
                                        }
                                    >
                                        Unassign chat tickets when assigned
                                        agent is unavailable
                                        <IconTooltip>
                                            When the assigned agent for chat
                                            tickets becomes unavailable, the
                                            ticket will get unassigned and
                                            reassigned to an available agent.
                                        </IconTooltip>
                                    </CheckBox>
                                </FormGroup>

                                <FormGroup className={settingsCss.mb40}>
                                    <h3
                                        className={classNames(
                                            'heading-section-semibold',
                                            settingsCss.mb8,
                                        )}
                                    >
                                        Channels
                                    </h3>
                                    <p
                                        className={classNames(
                                            'body-regular',
                                            css.description,
                                            settingsCss.mb8,
                                        )}
                                    >
                                        Apply ticket assignment settings to the
                                        following channels
                                    </p>
                                    <MultiSelectOptionsField
                                        options={TicketAssignmentContainer.channelsToOptions(
                                            Object.values(TicketChannel).filter(
                                                (channel) =>
                                                    channel !==
                                                    TicketChannel.Phone,
                                            ),
                                        )}
                                        selectedOptions={TicketAssignmentContainer.channelsToOptions(
                                            assignmentChannels,
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
                            isLoading={isLoading}
                            isDisabled={!isAdmin(currentUser)}
                        >
                            Save changes
                        </Button>
                    </Form>

                    <TeamCreationModal
                        isOpen={isTeamCreationModalOpen}
                        onClose={() =>
                            this.setState({ isTeamCreationModalOpen: false })
                        }
                    />
                </div>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        teams: getTeams(state),
        ticketAssignmentSettings: getTicketAssignmentSettings(state),
        currentUser: getCurrentUser(state),
    }),
    {
        submitSetting,
        fetchChats,
    },
)

export default connector(TicketAssignmentContainer)
