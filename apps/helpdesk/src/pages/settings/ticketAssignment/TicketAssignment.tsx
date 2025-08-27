import React, { SyntheticEvent, useMemo, useState } from 'react'

import classNames from 'classnames'
import { List } from 'immutable'
import _isEqual from 'lodash/isEqual'
import { Col, Row } from 'reactstrap'

import { Button, CheckBoxField, Label, Tooltip } from '@gorgias/axiom'

import { TicketChannel } from 'business/types/ticket'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Alert from 'pages/common/components/Alert/Alert'
import HeaderTitle from 'pages/common/components/HeaderTitle'
import PageHeader from 'pages/common/components/PageHeader'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import NumberInput from 'pages/common/forms/input/NumberInput'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import settingsCss from 'pages/settings/settings.less'
import TeamCreationModal from 'pages/settings/teams/TeamCreationModal'
import { fetchChats } from 'state/chats/actions'
import { submitSetting } from 'state/currentAccount/actions'
import { getTicketAssignmentSettings } from 'state/currentAccount/selectors'
import {
    AccountSettingTicketAssignment,
    AccountSettingType,
} from 'state/currentAccount/types'
import { getCurrentUser } from 'state/currentUser/selectors'
import { getTeams } from 'state/teams/selectors'
import { isAdmin } from 'utils'

import css from './TicketAssignment.less'

const channelsToOptions = (channels: TicketChannel[]): Option[] =>
    channels.map((channel) => ({
        value: channel,
        label: channel,
    }))

const isNumber = (value?: number): value is number => typeof value === 'number'

const TicketAssignment = () => {
    const dispatch = useAppDispatch()

    const teams = useAppSelector(getTeams)
    const ticketAssignmentSettings = useAppSelector(getTicketAssignmentSettings)
    const currentUser = useAppSelector(getCurrentUser)

    const [isLoading, setIsLoading] = useState(false)
    const [isTeamCreationModalOpen, setIsTeamCreationModalOpen] =
        useState(false)
    const [unassignOnReply, setUnassignOnReply] = useState(
        ticketAssignmentSettings.getIn(
            ['data', 'unassign_on_reply'],
            true,
        ) as boolean,
    )
    const [unassignOnUserUnavailability, setUnassignOnUserUnavailability] =
        useState(
            !!ticketAssignmentSettings
                .getIn(['data', 'unassign_on_user_unavailability'], [])
                .includes(TicketChannel.Chat) as boolean,
        )
    const [autoAssignToTeams, setAutoAssignToTeams] = useState(
        ticketAssignmentSettings.getIn(
            ['data', 'auto_assign_to_teams'],
            false,
        ) as boolean,
    )
    const [canExceedMaxAgentCapacity, setCanExceedMaxAgentCapacity] = useState(
        ticketAssignmentSettings.getIn(
            ['data', 'can_exceed_max_agent_capacity'],
            true,
        ) as boolean,
    )
    const [assignTicketToLastAgent, setAssignTicketToLastAgent] = useState(
        ticketAssignmentSettings.getIn(
            ['data', 'auto_assign_ticket_to_responding_agent'],
            false,
        ) as boolean,
    )
    const [assignmentChannels, setAssignmentChannels] = useState(() => {
        const assignmentChannels = ticketAssignmentSettings.getIn([
            'data',
            'assignment_channels',
        ]) as List<any>

        return assignmentChannels
            ? (assignmentChannels.toJS() as TicketChannel[])
            : [TicketChannel.Chat, TicketChannel.FacebookMessenger]
    })
    const [chatTicketsLimit, setChatTicketsLimit] = useState<
        number | undefined
    >(
        ticketAssignmentSettings.getIn(
            ['data', 'max_user_chat_ticket'],
            3,
        ) as number,
    )
    const [nonChatTicketsLimit, setNonChatTicketsLimit] = useState<
        number | undefined
    >(
        ticketAssignmentSettings.getIn(
            ['data', 'max_user_non_chat_ticket'],
            4,
        ) as number,
    )

    const initialFormState = useMemo(() => {
        const assignmentChannels = ticketAssignmentSettings.getIn([
            'data',
            'assignment_channels',
        ]) as List<any>

        return {
            unassignOnReply: ticketAssignmentSettings.getIn(
                ['data', 'unassign_on_reply'],
                true,
            ) as boolean,
            unassignOnUserUnavailability: !!ticketAssignmentSettings
                .getIn(['data', 'unassign_on_user_unavailability'], [])
                .includes(TicketChannel.Chat) as boolean,
            autoAssignToTeams: ticketAssignmentSettings.getIn(
                ['data', 'auto_assign_to_teams'],
                false,
            ) as boolean,
            assignmentChannels: (assignmentChannels
                ? assignmentChannels.toJS()
                : [
                      TicketChannel.Chat,
                      TicketChannel.FacebookMessenger,
                  ]) as TicketChannel[],
            chatTicketsLimit: ticketAssignmentSettings.getIn(
                ['data', 'max_user_chat_ticket'],
                3,
            ) as number,
            nonChatTicketsLimit: ticketAssignmentSettings.getIn(
                ['data', 'max_user_non_chat_ticket'],
                4,
            ) as number,
        }
    }, [ticketAssignmentSettings])

    const onSubmit = async (evt?: SyntheticEvent) => {
        evt?.preventDefault()
        if (!isNumber(chatTicketsLimit) || !isNumber(nonChatTicketsLimit)) {
            return
        }

        setIsLoading(true)

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

        await dispatch(
            submitSetting({
                id: ticketAssignmentSettings.get('id') as number,
                type: AccountSettingType.TicketAssignment,
                data: {
                    unassign_on_reply: unassignOnReply,
                    unassign_on_user_unavailability:
                        unassignOnUserUnavailability
                            ? [TicketChannel.Chat]
                            : [],
                    auto_assign_to_teams: autoAssignToTeams,
                    assignment_channels: assignmentChannels,
                    max_user_chat_ticket: chatTicketsLimit,
                    max_user_non_chat_ticket: nonChatTicketsLimit,
                    can_exceed_max_agent_capacity: canExceedMaxAgentCapacity,
                    auto_assign_ticket_to_responding_agent:
                        assignTicketToLastAgent,
                } as AccountSettingTicketAssignment['data'],
            }),
        )

        if (shouldFetchChats) {
            void fetchChats()
        }

        setIsLoading(false)
    }

    const onChannelsChange = (options: Option[]) => {
        setAssignmentChannels(
            options.map((option) => option.value as TicketChannel),
        )
    }

    const isDirty = !_isEqual(initialFormState, {
        unassignOnReply,
        unassignOnUserUnavailability,
        autoAssignToTeams,
        assignmentChannels,
        chatTicketsLimit,
        nonChatTicketsLimit,
    })

    return (
        <div className="full-width">
            <UnsavedChangesPrompt onSave={onSubmit} when={isDirty} />
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
                <form onSubmit={onSubmit}>
                    <Row className={settingsCss.contentWrapper}>
                        <Col>
                            <h3
                                className={classNames(
                                    'heading-section-semibold',
                                    settingsCss.mb16,
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
                                                setIsTeamCreationModalOpen(true)
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
                                    <div className={settingsCss.mb16}>
                                        <CheckBoxField
                                            label=" Auto-assign tickets"
                                            name="auto_assign_to_teams"
                                            value={autoAssignToTeams}
                                            onChange={(value: boolean) =>
                                                setAutoAssignToTeams(value)
                                            }
                                            caption={
                                                <span>
                                                    When a ticket is assigned to
                                                    a team, it will
                                                    automatically be assigned to
                                                    an{' '}
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
                                        />
                                    </div>
                                    <div className={settingsCss.mb16}>
                                        <CheckBoxField
                                            label=" Allow reopened tickets to exceed agent's max capacity"
                                            name="can_exceed_max_agent_capacity"
                                            value={canExceedMaxAgentCapacity}
                                            onChange={(value: boolean) =>
                                                setCanExceedMaxAgentCapacity(
                                                    value,
                                                )
                                            }
                                            caption={
                                                <span>
                                                    Reopened tickets will exceed
                                                    an agent&apos;s max capacity
                                                    as defined in{' '}
                                                    <i>
                                                        Auto-assignment limits
                                                    </i>{' '}
                                                    settings below
                                                </span>
                                            }
                                        />
                                    </div>
                                    <div className={settingsCss.mb16}>
                                        <CheckBoxField
                                            label=" Assign ticket to last responding agent"
                                            name="auto_assign_ticket_to_responding_agent"
                                            value={assignTicketToLastAgent}
                                            onChange={(value: boolean) =>
                                                setAssignTicketToLastAgent(
                                                    value,
                                                )
                                            }
                                            caption={
                                                <span>
                                                    Tickets will be
                                                    automatically assigned to
                                                    the agent that last
                                                    responded to that ticket
                                                </span>
                                            }
                                        />
                                    </div>
                                    <div className={settingsCss.mb32}>
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
                                            <div className={css.limitsSection}>
                                                <label
                                                    className={css.limitLabel}
                                                >
                                                    <NumberInput
                                                        className={
                                                            css.limitInput
                                                        }
                                                        min={0}
                                                        max={500}
                                                        isRequired
                                                        value={chatTicketsLimit}
                                                        onChange={(
                                                            chatTicketsLimit,
                                                        ) => {
                                                            setChatTicketsLimit(
                                                                chatTicketsLimit,
                                                            )
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
                                                    messenger, Instagram DM or
                                                    any 1-1 instant messaging
                                                    channels
                                                </Tooltip>
                                            </div>
                                            <div className={css.limitsSection}>
                                                <label
                                                    className={css.limitLabel}
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
                                                            setNonChatTicketsLimit(
                                                                nonChatTicketsLimit,
                                                            )
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
                                                    Includes email, Facebook and
                                                    Instagram comments or any
                                                    other asynchronous channels.
                                                    Does not include Phone
                                                </Tooltip>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className={settingsCss.mb40}>
                                <h3
                                    className={classNames(
                                        'heading-section-semibold',
                                        settingsCss.mb16,
                                    )}
                                >
                                    Unassignment settings
                                </h3>
                                <CheckBoxField
                                    label={
                                        <>
                                            Unassign on reply
                                            <IconTooltip>
                                                Unassigns a ticket if the
                                                customer replies but the ticket
                                                is assigned to agent that is
                                                “offline” or “unavailable”
                                            </IconTooltip>
                                        </>
                                    }
                                    name="unassign_on_reply"
                                    className={settingsCss.mb16}
                                    value={unassignOnReply}
                                    onChange={(value: boolean) =>
                                        setUnassignOnReply(value)
                                    }
                                />
                                <CheckBoxField
                                    label={
                                        <>
                                            Unassign chat tickets when assigned
                                            agent is unavailable
                                            <IconTooltip>
                                                When the assigned agent for chat
                                                tickets becomes unavailable, the
                                                ticket will get unassigned and
                                                reassigned to an available
                                                agent.
                                            </IconTooltip>
                                        </>
                                    }
                                    name="unassign_on_user_unavailability"
                                    value={unassignOnUserUnavailability}
                                    onChange={(value: boolean) =>
                                        setUnassignOnUserUnavailability(value)
                                    }
                                />
                            </div>

                            <div className={settingsCss.mb40}>
                                <h3
                                    className={classNames(
                                        'heading-section-semibold',
                                        settingsCss.mb16,
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
                                    options={channelsToOptions(
                                        Object.values(TicketChannel).filter(
                                            (channel) =>
                                                channel !== TicketChannel.Phone,
                                        ),
                                    )}
                                    selectedOptions={channelsToOptions(
                                        assignmentChannels ?? [],
                                    )}
                                    plural="channels"
                                    singular="channel"
                                    onChange={onChannelsChange}
                                    matchInput
                                    caseInsensitive
                                />
                            </div>
                        </Col>
                    </Row>

                    <Button
                        type="submit"
                        isLoading={isLoading}
                        isDisabled={!isAdmin(currentUser)}
                    >
                        Save changes
                    </Button>
                </form>

                <TeamCreationModal
                    isOpen={isTeamCreationModalOpen}
                    onClose={() => setIsTeamCreationModalOpen(false)}
                />
            </div>
        </div>
    )
}

export default TicketAssignment
